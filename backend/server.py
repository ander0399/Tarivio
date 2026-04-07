from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
#from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from documents_database import OFFICIAL_DOCUMENTS, DOCUMENT_CATEGORIES
from customs_database import WORLDWIDE_CUSTOMS_DATABASE, TRADE_AGREEMENTS_INFO, GLOBAL_RESOURCES, TYPICAL_TARIFFS
from notifications import (
    send_tariff_alert, 
    send_subscription_confirmation, 
    TariffAlert, 
    NotificationSubscription,
    EmailNotification,
    send_email_notification
)
from assistant_prompt import (
    get_assistant_system_prompt,
    get_country_risk,
    get_all_country_risks,
    COUNTRY_RISK_DATA
)
from ports_database import (
    get_ports_by_country,
    get_port_info,
    get_all_ports,
    compare_ports,
    get_recommended_port,
    PORTS_DATABASE
)
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

#openAI
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

async def ask_ai(system_message, user_prompt):
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()
######


print("API KEY:", os.getenv("OPENAI_API_KEY"))

# MongoDB connection
mongo_url = os.getenv('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = "HS256"

# LLM Config — Emergent proxy key (GPT-5.2)
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# ──────────────────────────────────────────────────────────────────
# SMART MODEL ROUTER
# Criteria: use GPT-5.2 for all queries via Emergent proxy
# ──────────────────────────────────────────────────────────────────
SONNET_MODEL = "gpt-5.2"
HAIKU_MODEL  = "gpt-5.2"

# Keywords/patterns that signal a COMPLEX query → use Sonnet
_COMPLEX_KEYWORDS = [
    # Classification
    "clasifica", "classify", "classif", "código taric", "taric code", "hs code",
    "partida", "subpartida", "heading", "subheading", "nomenclatura",
    # Trade operations
    "importar", "exportar", "import", "export", "llevar", "enviar", "mandar",
    "traer", "mover", "ship", "send", "transport",
    # Finance & tariffs
    "arancel", "tariff", "duty", "impuesto", "iva", "vat", "tax", "derechos",
    "derecho", "tasa", "gravamen", "costo", "cost", "precio",
    # Trade agreements & regulations
    "tratado", "agreement", "acuerdo", "tlc", "fta", "mfn", "spg",
    "regla de origen", "rules of origin", "preferencia",
    "antidumping", "sanción", "sanction", "embargo", "reach", "cites",
    "fitosanitario", "phytosanitary", "zoosanitario", "certificado",
    # Advanced topics
    "comparativa", "bilateral", "landed cost", "cif", "fob", "incoterm",
    "estudio de mercado", "market study", "valoración aduanera",
    "customs valuation", "aduana", "customs", "despacho",
    # Products / contexts that always imply a trade query
    "producto", "product", "mercancía", "merchandise", "carga", "cargo",
]

def select_model(message: str, history_length: int, has_route: bool = False) -> str:
    """Route to Haiku for simple queries, Sonnet for complex trade/classification ones."""
    msg_lower = message.lower()
    # Always Sonnet when message contains known trade/classification terms
    if any(kw in msg_lower for kw in _COMPLEX_KEYWORDS):
        return SONNET_MODEL
    # Always Sonnet once origin+destination are set (mid-conversation analysis)
    if has_route:
        return SONNET_MODEL
    # Sonnet for deep conversations (context coherence matters)
    if history_length >= 3:
        return SONNET_MODEL
    # Long messages imply complexity
    if len(message) > 200:
        return SONNET_MODEL
    # Short greetings, confirmations, simple follow-ups → Haiku
    return HAIKU_MODEL


# ──────────────────────────────────────────────────────────────────
# RESPONSE CACHE
# Stores AI answers for identical (message_hash, origin, destination) tuples.
# TTL: 48h — trade data changes slowly.
# Only caches NON-clarification responses (full answers).
# ──────────────────────────────────────────────────────────────────
import hashlib

CACHE_TTL_HOURS = 168  # 7 días - clasificaciones arancelarias cambian poco

def _cache_key(message: str, origin: str, destination: str, language: str) -> str:
    """Stable hash for a request. Normalises whitespace and lowercases the message."""
    normalised = " ".join(message.lower().split())
    raw = f"{normalised}|{origin or ''}|{destination or ''}|{language}"
    return hashlib.sha256(raw.encode()).hexdigest()

async def get_cached_response(cache_key: str) -> Optional[dict]:
    """Return cached response if still fresh, else None."""
    doc = await db.ai_response_cache.find_one({"_id": cache_key})
    if not doc:
        return None
    age_hours = (datetime.now(timezone.utc) - datetime.fromisoformat(doc["cached_at"])).total_seconds() / 3600
    if age_hours > CACHE_TTL_HOURS:
        await db.ai_response_cache.delete_one({"_id": cache_key})
        return None
    return doc["payload"]

async def set_cached_response(cache_key: str, payload: dict) -> None:
    """Store a response in cache."""
    await db.ai_response_cache.update_one(
        {"_id": cache_key},
        {"$set": {"payload": payload, "cached_at": datetime.now(timezone.utc).isoformat(), "hits": 0}},
        upsert=True
    )

async def increment_cache_hit(cache_key: str) -> None:
    await db.ai_response_cache.update_one({"_id": cache_key}, {"$inc": {"hits": 1}})


# ──────────────────────────────────────────────────────────────────
# USAGE TRACKING — per company/user, per day
# ──────────────────────────────────────────────────────────────────
async def track_usage(user_id: str, org_id: str, model: str, input_tokens_est: int, output_tokens_est: int, cache_hit: bool) -> None:
    """Append a usage record for billing and monitoring."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # Approximate cost in USD
    if "haiku" in model:
        cost = (input_tokens_est * 0.80 + output_tokens_est * 4.0) / 1_000_000
    else:
        cost = (input_tokens_est * 3.0 + output_tokens_est * 15.0) / 1_000_000
    if cache_hit:
        cost = 0.0

    await db.usage_stats.update_one(
        {"org_id": org_id, "date": today},
        {
            "$inc": {
                "messages": 1,
                "cache_hits": 1 if cache_hit else 0,
                "input_tokens": 0 if cache_hit else input_tokens_est,
                "output_tokens": 0 if cache_hit else output_tokens_est,
                "cost_usd": cost,
            },
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )

async def get_org_usage(org_id: str, days: int = 30) -> list:
    """Return daily usage records for an organisation."""
    from_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    cursor = db.usage_stats.find(
        {"org_id": org_id, "date": {"$gte": from_date}},
        {"_id": 0}
    ).sort("date", -1)
    return await cursor.to_list(days)

app = FastAPI(title="TaricAI - Clasificación Arancelaria Inteligente para Empresas")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

# User & Organization Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    company: Optional[str] = None
    role: str = "admin"
    organization_id: Optional[str] = None
    created_at: str

class TeamMemberCreate(BaseModel):
    email: EmailStr
    name: str
    role: str = "operator"  # admin, operator, viewer

class TeamMemberResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    member_status: str = "active"
    created_at: str
    last_active: Optional[str] = None

class OrganizationStats(BaseModel):
    total_searches: int
    searches_this_month: int
    team_members: int
    saved_operations: int

# TARIC Models
class TaricSearchRequest(BaseModel):
    product_description: str
    origin_country: str  # Now required
    destination_country: str = "ES"  # Default to Spain
    client_reference: Optional[str] = None  # For B2B tracking
    trade_agreements: Optional[List[str]] = None  # Applicable trade agreements

class DocumentRequirement(BaseModel):
    name: str
    type: str
    required: bool
    description: str
    official_link: Optional[str] = None
    issuing_authority: Optional[str] = None
    pdf_form: Optional[str] = None
    pdf_guide: Optional[str] = None
    online_portal: Optional[str] = None
    validity_days: Optional[int] = None
    processing_time: Optional[str] = None

class TariffDetail(BaseModel):
    duty_type: str
    rate: str
    description: str
    legal_base: Optional[str] = None

class ComplianceAlert(BaseModel):
    type: str  # anti_dumping, sanction, restriction, cites
    severity: str  # high, medium, low
    message: str
    official_reference: Optional[str] = None

# Clarification question model
class ClarificationQuestion(BaseModel):
    question: str
    options: List[str]
    impacts: Optional[str] = None

class TaricResult(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str]
    product_description: str
    origin_country: str
    destination_country: str
    client_reference: Optional[str]
    taric_code: str
    taric_description: str
    chapter: str
    heading: str
    subheading: str
    tariffs: List[TariffDetail]
    documents: List[DocumentRequirement]
    compliance_alerts: List[ComplianceAlert]
    total_duty_estimate: str
    vat_rate: str
    preferential_duties: Optional[str]
    trade_agreements_applied: Optional[List[str]]
    official_sources: List[dict]
    ai_explanation: str
    ai_confidence: str
    needs_clarification: bool = False
    clarification_questions: List[ClarificationQuestion] = []
    created_at: str

class SearchHistoryItem(BaseModel):
    id: str
    product_description: str
    taric_code: str
    client_reference: Optional[str]
    created_at: str
    user_name: Optional[str] = None

class RegulatoryAlert(BaseModel):
    id: str
    type: str
    title: str
    description: str
    affected_codes: List[str]
    effective_date: str
    source: str
    created_at: str

# Chat Conversacional Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    sources: Optional[List[dict]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    origin_country: Optional[str] = None
    destination_country: Optional[str] = None
    product_description: Optional[str] = None
    language: str = "es"
    selected_option: Optional[str] = None  # Para respuestas de selección múltiple

class ChatOption(BaseModel):
    id: str
    label: str
    value: str

class ChatClarificationRequest(BaseModel):
    question: str
    options: List[ChatOption]
    allow_custom: bool = True
    custom_placeholder: str = "Escribe tu respuesta..."

class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: List[dict]
    suggested_questions: List[str]
    context: Optional[dict] = None
    needs_clarification: bool = False
    clarification_request: Optional[ChatClarificationRequest] = None

class CountryTradeInfo(BaseModel):
    origin_country: str
    destination_country: str
    language: str = "es"

# Simulador de Costos de Importación Models
class ImportCostRequest(BaseModel):
    hs_code: str
    product_description: str
    origin_country: str
    destination_country: str
    fob_value: float  # Valor FOB en USD
    currency: str = "USD"
    weight_kg: float
    quantity: int = 1
    unit: str = "unidades"  # unidades, kg, litros, etc.
    incoterm: str = "FOB"  # FOB, CIF, EXW, etc.
    freight_cost: Optional[float] = None  # Si se conoce
    insurance_cost: Optional[float] = None  # Si se conoce
    language: str = "es"

class ImportCostResponse(BaseModel):
    summary: dict
    breakdown: dict
    documents_required: List[str]
    warnings: List[str]
    sources: List[dict]
    ai_analysis: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, org_id: str = None) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "organization_id": org_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ============== AI CLARIFICATION CHECK ==============

class ClarificationCheckRequest(BaseModel):
    product_description: str

class ClarificationCheckResponse(BaseModel):
    needs_clarification: bool
    clarification_questions: List[ClarificationQuestion] = []
    enhanced_description: Optional[str] = None

async def check_clarification_needed(product_description: str) -> dict:
    """Pre-check if product description needs clarification before full classification"""
    
    system_message = """Eres un experto en clasificación arancelaria TARIC.

Tu trabajo es analizar si una descripción de producto necesita información adicional para una clasificación precisa.

REGLAS:
1. Si la descripción es VAGA o AMBIGUA, genera preguntas de clarificación
2. Si la descripción ya es ESPECÍFICA y DETALLADA, indica que NO necesita clarificación
3. Máximo 3 preguntas, cada una con 3-5 opciones

Ejemplos de descripciones que NECESITAN clarificación:
- "camisas" → Falta: género, material, tipo de tejido
- "zapatos" → Falta: tipo (deportivo/vestir), material, género  
- "aceite" → Falta: tipo (oliva/girasol/motor), presentación
- "cable" → Falta: tipo (eléctrico/datos/acero), uso

Ejemplos de descripciones que NO necesitan clarificación:
- "Aceite de oliva virgen extra en botella de vidrio de 500ml"
- "Camisetas de algodón 100% para hombre talla M"
- "Cable HDMI 2.1 de 2 metros para conexión de video"

Responde SIEMPRE en JSON:
{
    "needs_clarification": true/false,
    "clarification_questions": [
        {"question": "¿...?", "options": ["Op1", "Op2", "Op3"], "impacts": "Afecta al código..."}
    ],
    "enhanced_description": "Si no necesita clarificación, devuelve la descripción mejorada o null"
}"""

    user_prompt = f"""Analiza si esta descripción de producto necesita clarificación para clasificación TARIC:

PRODUCTO: {product_description}

Si es ambigua, genera preguntas. Si es suficientemente específica, indica que no necesita clarificación."""

    try:
        # chat = LlmChat(
        #     api_key=EMERGENT_LLM_KEY,
        #     session_id=f"clarify-{uuid.uuid4()}",
        #     system_message=system_message
        # ).with_model("openai", "gpt-5.2")
        
        # user_message = UserMessage(text=user_prompt)
        # response = await chat.send_message(user_message)
        
        # clean_response = response.strip()
        clean_response = await ask_ai(system_message, user_prompt)

        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1].split("```")[0]
        elif "```" in clean_response:
            parts = clean_response.split("```")
            if len(parts) > 1:
                clean_response = parts[1]

        clean_response = clean_response.strip()

        try:
            result = json.loads(clean_response)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', clean_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                return {"needs_clarification": False, "clarification_questions": [], "enhanced_description": None}
        
        return result
        
    except Exception as e:
        logger.error(f"Clarification check error: {e}")
        return {"needs_clarification": False, "clarification_questions": [], "enhanced_description": None}

# ============== AI SEARCH FUNCTION ==============

async def analyze_product_with_ai(
    product_description: str, 
    origin_country: str,
    destination_country: str = "ES",
    trade_agreements: Optional[List[str]] = None,
    skip_clarification: bool = False
) -> dict:
    """Use Claude claude-sonnet-4-6 to analyze product and suggest TARIC code with compliance checks"""
    
    agreements_info = ""
    if trade_agreements and len(trade_agreements) > 0:
        agreements_info = f"\n\nTRATADOS COMERCIALES APLICABLES entre {origin_country} y {destination_country}:\n"
        for agreement in trade_agreements:
            agreements_info += f"- {agreement}\n"
        agreements_info += "\nSi alguno de estos acuerdos aplica al producto, indica las tasas preferenciales correspondientes."
    
    system_message = """Eres un experto en clasificación arancelaria del TARIC (Arancel Integrado de las Comunidades Europeas) y compliance aduanero.

Tu trabajo es analizar descripciones de productos y proporcionar:
1. El código TARIC de 10 dígitos más apropiado según la Nomenclatura Combinada oficial
2. Descripción oficial del código según el TARIC de la UE
3. Aranceles aplicables según el país de ORIGEN y DESTINO especificados
4. Aranceles PREFERENCIALES si existe un tratado comercial vigente entre origen y destino
5. Documentos requeridos para importación según la ruta comercial
6. Alertas de compliance (anti-dumping, sanciones, restricciones fitosanitarias, CITES)
7. Nivel de confianza de tu clasificación
8. PREGUNTAS DE CLARIFICACIÓN si la descripción es ambigua o incompleta

IMPORTANTE SOBRE PREGUNTAS DE CLARIFICACIÓN:
- Si el producto puede clasificarse en diferentes códigos dependiendo de detalles específicos, INCLUYE preguntas de clarificación
- Ejemplos de preguntas necesarias:
  * Ropa: ¿Es para hombre, mujer o niño? ¿Tejido de punto o plano?
  * Calzado: ¿Es deportivo, de vestir o de trabajo? ¿Material de la suela?
  * Alimentos: ¿Fresco o procesado? ¿Orgánico? ¿Presentación (granel, envasado)?
  * Maquinaria: ¿Nueva o usada? ¿Capacidad/potencia específica?
  * Productos químicos: ¿Pureza? ¿Uso industrial o consumo?

Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
    "taric_code": "1234567890",
    "description": "Descripción oficial del código TARIC según nomenclatura combinada",
    "chapter": "12",
    "heading": "34",
    "subheading": "56",
    "confidence": "alta|media|baja",
    "needs_clarification": true|false,
    "clarification_questions": [
        {"question": "¿El producto es para hombre, mujer o niño?", "options": ["Hombre", "Mujer", "Niño/Niña", "Unisex"], "impacts": "Afecta los dígitos 7-8 del código TARIC"},
        {"question": "¿De qué material está fabricado principalmente?", "options": ["Algodón 100%", "Poliéster", "Mezcla", "Otro"], "impacts": "Determina el capítulo y arancel aplicable"}
    ],
    "tariffs": [
        {"duty_type": "Derecho de terceros países (NMF)", "rate": "5.0%", "description": "Arancel convencional sin preferencia", "legal_base": "Reglamento (CEE) nº 2658/87"},
        {"duty_type": "Derecho preferencial", "rate": "0%", "description": "Tasa aplicable por acuerdo comercial vigente", "legal_base": "Acuerdo UE-[País]"},
        {"duty_type": "IVA importación", "rate": "21%", "description": "Tipo general España", "legal_base": "Ley 37/1992"}
    ],
    "preferential_duties": "0% con certificado EUR.1 por Acuerdo UE-Chile",
    "trade_agreement_applied": "Acuerdo de Asociación UE-Chile",
    "documents": [
        {"name": "Certificado fitosanitario", "type": "fitosanitario", "required": true, "description": "Expedido por SENASA del país de origen", "official_link": "https://www.mapa.gob.es/", "issuing_authority": "Ministerio de Agricultura"},
        {"name": "DUA (Documento Único Administrativo)", "type": "aduanero", "required": true, "description": "Declaración de importación obligatoria", "official_link": "https://www.agenciatributaria.es/", "issuing_authority": "AEAT"}
    ],
    "compliance_alerts": [
        {"type": "restriction", "severity": "medium", "message": "Producto sujeto a control fitosanitario en frontera", "official_reference": "Reglamento (UE) 2017/625"}
    ],
    "total_duty_estimate": "21% (preferencial + IVA)",
    "vat_rate": "21%",
    "explanation": "Explicación detallada de la clasificación, incluyendo por qué se aplican o no tasas preferenciales según el tratado comercial entre los países de origen y destino"
}

FUENTES OFICIALES que debes referenciar:
- TARIC de la Comisión Europea (ec.europa.eu/taxation_customs)
- Access2Markets (trade.ec.europa.eu/access-to-markets) para acuerdos comerciales
- Agencia Tributaria de España (agenciatributaria.es)
- Ministerio de Agricultura, Pesca y Alimentación (mapa.gob.es)

Si detectas posibles problemas de compliance (anti-dumping, sanciones, CITES, etc.), SIEMPRE inclúyelos en compliance_alerts."""

    user_prompt = f"""Clasifica el siguiente producto en el TARIC de la Unión Europea.

RUTA COMERCIAL:
- País de ORIGEN: {origin_country}
- País de DESTINO: {destination_country}
{agreements_info}

Proporciona todos los detalles de importación incluyendo:
1. Aranceles NMF (Nación Más Favorecida) estándar
2. Aranceles PREFERENCIALES si existe acuerdo comercial entre origen y destino
3. Documentos necesarios para esta ruta específica
4. Alertas de compliance relevantes
5. SI LA DESCRIPCIÓN ES AMBIGUA O INCOMPLETA, incluye preguntas de clarificación para afinar el código TARIC

Producto a clasificar: {product_description}"""
    
    try:
        # chat = LlmChat(
        #     api_key=EMERGENT_LLM_KEY,
        #     session_id=f"taric-{uuid.uuid4()}",
        #     system_message=system_message
        # ).with_model("openai", "gpt-5.2")
        
        # user_message = UserMessage(text=user_prompt)
        # response = await chat.send_message(user_message)
        
        # clean_response = response.strip()
        clean_response = await ask_ai(system_message, user_prompt)

        # Remove markdown code blocks
        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1].split("```")[0]
        elif "```" in clean_response:
            parts = clean_response.split("```")
            if len(parts) > 1:
                clean_response = parts[1]

        clean_response = clean_response.strip()

        try:
            result = json.loads(clean_response)
        except json.JSONDecodeError:
            # Try regex extraction
            json_match = re.search(r'\{.*\}', clean_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON response")
        
        return result
        
    except Exception as e:
        logger.error(f"AI Analysis error: {e}")
        error_str = str(e)
        if "Budget" in error_str and "exceeded" in error_str:
            raise HTTPException(status_code=503, detail="BUDGET_EXCEEDED")
        return {
            "taric_code": "0000000000",
            "description": "El servicio de IA no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.",
            "chapter": "00",
            "heading": "00",
            "subheading": "00",
            "confidence": "baja",
            "needs_clarification": False,
            "clarification_questions": [],
            "tariffs": [{"duty_type": "No disponible", "rate": "N/A", "description": "Servicio temporalmente no disponible", "legal_base": None}],
            "preferential_duties": None,
            "trade_agreement_applied": None,
            "documents": [],
            "compliance_alerts": [],
            "total_duty_estimate": "N/A",
            "vat_rate": "21%",
            "explanation": f"No se pudo completar el análisis: {str(e)}"
        }

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    
    # Create organization for the user
    org_doc = {
        "id": org_id,
        "name": user_data.company or f"Organización de {user_data.name}",
        "owner_id": user_id,
        "plan": "starter",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.organizations.insert_one(org_doc)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "company": user_data.company,
        "role": "admin",
        "organization_id": org_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email, org_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "company": user_data.company,
            "role": "admin",
            "organization_id": org_id
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Update last active
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_token(user["id"], user["email"], user.get("organization_id"))
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "company": user.get("company"),
            "role": user.get("role", "admin"),
            "organization_id": user.get("organization_id")
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        company=current_user.get("company"),
        role=current_user.get("role", "admin"),
        organization_id=current_user.get("organization_id"),
        created_at=current_user["created_at"]
    )

# ============== TEAM MANAGEMENT ROUTES ==============

@api_router.get("/team/members", response_model=List[TeamMemberResponse])
async def get_team_members(current_user: dict = Depends(get_current_user)):
    """Get all team members in the organization"""
    org_id = current_user.get("organization_id")
    if not org_id:
        return []
    
    members = await db.users.find(
        {"organization_id": org_id},
        {"_id": 0, "password": 0}
    ).to_list(100)
    
    return [TeamMemberResponse(
        id=m["id"],
        email=m["email"],
        name=m["name"],
        role=m.get("role", "operator"),
        member_status="active",
        created_at=m["created_at"],
        last_active=m.get("last_active")
    ) for m in members]

@api_router.post("/team/invite", response_model=TeamMemberResponse)
async def invite_team_member(member: TeamMemberCreate, current_user: dict = Depends(get_current_user)):
    """Invite a new team member"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden invitar miembros")
    
    org_id = current_user.get("organization_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="No perteneces a una organización")
    
    # Check if user already exists
    existing = await db.users.find_one({"email": member.email})
    if existing:
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    
    member_id = str(uuid.uuid4())
    temp_password = str(uuid.uuid4())[:8]  # Temporary password
    
    member_doc = {
        "id": member_id,
        "email": member.email,
        "password": hash_password(temp_password),
        "name": member.name,
        "role": member.role,
        "organization_id": org_id,
        "invited_by": current_user["id"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(member_doc)
    
    # In production, send email with temp_password
    logger.info(f"Team member invited: {member.email} with temp password: {temp_password}")
    
    return TeamMemberResponse(
        id=member_id,
        email=member.email,
        name=member.name,
        role=member.role,
        member_status="pending",
        created_at=member_doc["created_at"]
    )

@api_router.delete("/team/members/{member_id}")
async def remove_team_member(member_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a team member"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar miembros")
    
    if member_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    result = await db.users.delete_one({
        "id": member_id,
        "organization_id": current_user.get("organization_id")
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    
    return {"message": "Miembro eliminado"}

@api_router.get("/team/stats", response_model=OrganizationStats)
async def get_organization_stats(current_user: dict = Depends(get_current_user)):
    """Get organization statistics"""
    org_id = current_user.get("organization_id")
    
    total_searches = await db.taric_searches.count_documents({"organization_id": org_id})
    
    # Searches this month
    first_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    searches_this_month = await db.taric_searches.count_documents({
        "organization_id": org_id,
        "created_at": {"$gte": first_of_month.isoformat()}
    })
    
    team_members = await db.users.count_documents({"organization_id": org_id})
    saved_operations = await db.saved_operations.count_documents({"organization_id": org_id})
    
    return OrganizationStats(
        total_searches=total_searches,
        searches_this_month=searches_this_month,
        team_members=team_members,
        saved_operations=saved_operations
    )

# ============== TARIC ROUTES ==============

@api_router.post("/taric/check-clarification", response_model=ClarificationCheckResponse)
async def check_clarification(request: ClarificationCheckRequest, current_user: dict = Depends(get_current_user)):
    """Pre-check if product description needs clarification before classification"""
    
    result = await check_clarification_needed(request.product_description)
    
    questions = []
    if result.get("needs_clarification", False) and result.get("clarification_questions"):
        for q in result.get("clarification_questions", []):
            questions.append(ClarificationQuestion(
                question=q.get("question", ""),
                options=q.get("options", []),
                impacts=q.get("impacts")
            ))
    
    return ClarificationCheckResponse(
        needs_clarification=result.get("needs_clarification", False),
        clarification_questions=questions,
        enhanced_description=result.get("enhanced_description")
    )

@api_router.post("/taric/search", response_model=TaricResult)
async def search_taric(request: TaricSearchRequest, current_user: dict = Depends(get_current_user)):
    """Search TARIC code using AI analysis with compliance checks"""
    
    # Validate required fields
    if not request.origin_country:
        raise HTTPException(status_code=400, detail="País de origen es obligatorio")
    if not request.destination_country:
        raise HTTPException(status_code=400, detail="País de destino es obligatorio")
    
    ai_result = await analyze_product_with_ai(
        request.product_description, 
        request.origin_country,
        request.destination_country,
        request.trade_agreements,
        skip_clarification=True  # Skip clarification in search since we have a separate endpoint
    )
    
    result_id = str(uuid.uuid4())
    
    # Build tariffs list
    tariffs = []
    for t in ai_result.get("tariffs", []):
        tariffs.append(TariffDetail(
            duty_type=t.get("duty_type", ""),
            rate=t.get("rate", ""),
            description=t.get("description", ""),
            legal_base=t.get("legal_base")
        ))
    
    # Build documents list with PDF links from official database
    documents = []
    for d in ai_result.get("documents", []):
        doc_name = d.get("name", "").lower()
        
        # Defensive parsing for 'required' field - AI sometimes returns non-boolean
        required_val = d.get("required", False)
        if isinstance(required_val, str):
            required_val = required_val.lower() in ("true", "yes", "sí", "si", "1", "obligatorio")
        
        # Try to match with official documents database
        pdf_form = None
        pdf_guide = None
        online_portal = None
        validity_days = None
        processing_time = None
        official_link = d.get("official_link")
        issuing_authority = d.get("issuing_authority")
        
        # Match document names with our database
        for doc_id, doc_data in OFFICIAL_DOCUMENTS.items():
            if any(keyword in doc_name for keyword in doc_data["name"].lower().split()):
                pdf_form = doc_data.get("pdf_form")
                pdf_guide = doc_data.get("pdf_guide")
                online_portal = doc_data.get("online_portal")
                validity_days = doc_data.get("validity_days")
                processing_time = doc_data.get("processing_time")
                if not official_link:
                    official_link = doc_data.get("official_link")
                if not issuing_authority:
                    issuing_authority = doc_data.get("issuing_authority")
                break
        
        documents.append(DocumentRequirement(
            name=d.get("name", ""),
            type=d.get("type", "aduanero"),
            required=bool(required_val),
            description=d.get("description", ""),
            official_link=official_link,
            issuing_authority=issuing_authority,
            pdf_form=pdf_form,
            pdf_guide=pdf_guide,
            online_portal=online_portal,
            validity_days=validity_days,
            processing_time=processing_time
        ))
    
    # Always add DUA as required document with PDF
    dua_exists = any("dua" in d.name.lower() for d in documents)
    if not dua_exists:
        dua_doc = OFFICIAL_DOCUMENTS.get("dua_import", {})
        documents.insert(0, DocumentRequirement(
            name="DUA - Documento Único Administrativo",
            type="aduanero",
            required=True,
            description="Declaración aduanera obligatoria para importaciones de terceros países",
            official_link=dua_doc.get("official_link"),
            issuing_authority="AEAT - Agencia Tributaria",
            pdf_form=dua_doc.get("pdf_form"),
            pdf_guide=dua_doc.get("pdf_guide"),
            online_portal=dua_doc.get("online_portal"),
            validity_days=0,
            processing_time="Inmediato (electrónico)"
        ))
    
    # Build compliance alerts
    compliance_alerts = []
    for c in ai_result.get("compliance_alerts", []):
        compliance_alerts.append(ComplianceAlert(
            type=c.get("type", "info"),
            severity=c.get("severity", "low"),
            message=c.get("message", ""),
            official_reference=c.get("official_reference")
        ))
    
    # Official sources - always include official EU and Spanish sources
    official_sources = [
        {
            "name": "TARIC - Comisión Europea",
            "url": f"https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=es&Taric={ai_result.get('taric_code', '')[:8]}",
            "description": "Base de datos oficial del arancel integrado de la UE",
            "authority": "Comisión Europea - DG TAXUD"
        },
        {
            "name": "Access2Markets",
            "url": f"https://trade.ec.europa.eu/access-to-markets/es/search?product={ai_result.get('taric_code', '')[:6]}&origin={request.origin_country}&destination={request.destination_country}",
            "description": "Portal oficial de la UE para requisitos de importación/exportación",
            "authority": "Comisión Europea - DG TRADE"
        },
        {
            "name": "Agencia Tributaria - AEAT",
            "url": "https://www2.agenciatributaria.gob.es/ADUA/internet/es/aeat/dit/adu/adws/certificados/Taric.html",
            "description": "Consulta arancelaria oficial de España",
            "authority": "Agencia Estatal de Administración Tributaria"
        },
        {
            "name": "EUR-Lex - Legislación UE",
            "url": "https://eur-lex.europa.eu/",
            "description": "Acceso al Diario Oficial de la Unión Europea",
            "authority": "Oficina de Publicaciones de la UE"
        },
        {
            "name": "MAPA - Control Fitosanitario",
            "url": "https://www.mapa.gob.es/es/agricultura/temas/sanidad-vegetal/",
            "description": "Requisitos fitosanitarios para importación",
            "authority": "Ministerio de Agricultura, Pesca y Alimentación"
        }
    ]
    
    # Map confidence
    confidence_map = {"alta": "95%", "media": "80%", "baja": "60%"}
    ai_confidence = confidence_map.get(ai_result.get("confidence", "media"), "80%")
    
    # Build clarification questions if needed
    clarification_questions = []
    if ai_result.get("needs_clarification", False) and ai_result.get("clarification_questions"):
        for q in ai_result.get("clarification_questions", []):
            clarification_questions.append(ClarificationQuestion(
                question=q.get("question", ""),
                options=q.get("options", []),
                impacts=q.get("impacts")
            ))
    
    result = TaricResult(
        id=result_id,
        user_id=current_user["id"],
        organization_id=current_user.get("organization_id"),
        product_description=request.product_description,
        origin_country=request.origin_country,
        destination_country=request.destination_country,
        client_reference=request.client_reference,
        taric_code=ai_result.get("taric_code", "0000000000"),
        taric_description=ai_result.get("description", ""),
        chapter=ai_result.get("chapter", "00"),
        heading=ai_result.get("heading", "00"),
        subheading=ai_result.get("subheading", "00"),
        tariffs=tariffs,
        documents=documents,
        compliance_alerts=compliance_alerts,
        total_duty_estimate=ai_result.get("total_duty_estimate", "N/A"),
        vat_rate=ai_result.get("vat_rate", "21%"),
        preferential_duties=ai_result.get("preferential_duties"),
        trade_agreements_applied=request.trade_agreements,
        official_sources=official_sources,
        ai_explanation=ai_result.get("explanation", ""),
        ai_confidence=ai_confidence,
        needs_clarification=ai_result.get("needs_clarification", False),
        clarification_questions=clarification_questions,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Save to database
    result_doc = result.model_dump()
    result_doc["tariffs"] = [t.model_dump() for t in tariffs]
    result_doc["documents"] = [d.model_dump() for d in documents]
    result_doc["compliance_alerts"] = [c.model_dump() for c in compliance_alerts]
    await db.taric_searches.insert_one(result_doc)
    
    return result

@api_router.get("/taric/history", response_model=List[SearchHistoryItem])
async def get_search_history(current_user: dict = Depends(get_current_user)):
    """Get organization's search history"""
    org_id = current_user.get("organization_id")
    
    query = {"organization_id": org_id} if org_id else {"user_id": current_user["id"]}
    
    searches = await db.taric_searches.find(
        query,
        {"_id": 0, "id": 1, "product_description": 1, "taric_code": 1, "client_reference": 1, "created_at": 1, "user_id": 1}
    ).sort("created_at", -1).limit(100).to_list(100)
    
    # Batch fetch all user names in ONE query (optimized - no N+1 problem)
    user_ids = list(set(s.get("user_id") for s in searches if s.get("user_id")))
    users_dict = {}
    if user_ids:
        users_cursor = db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "name": 1})
        users_list = await users_cursor.to_list(None)
        users_dict = {u["id"]: u.get("name") for u in users_list}
    
    # Build result with cached user names
    result = []
    for s in searches:
        result.append(SearchHistoryItem(
            id=s["id"],
            product_description=s["product_description"],
            taric_code=s["taric_code"],
            client_reference=s.get("client_reference"),
            created_at=s["created_at"],
            user_name=users_dict.get(s.get("user_id"))
        ))
    
    return result

@api_router.get("/taric/result/{result_id}", response_model=TaricResult)
async def get_result(result_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific search result"""
    org_id = current_user.get("organization_id")
    
    query = {"id": result_id}
    if org_id:
        query["organization_id"] = org_id
    else:
        query["user_id"] = current_user["id"]
    
    result = await db.taric_searches.find_one(query, {"_id": 0})
    
    if not result:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    return TaricResult(**result)

@api_router.delete("/taric/history/{result_id}")
async def delete_search(result_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a search from history"""
    org_id = current_user.get("organization_id")
    
    query = {"id": result_id}
    if org_id:
        query["organization_id"] = org_id
    else:
        query["user_id"] = current_user["id"]
    
    result = await db.taric_searches.delete_one(query)
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    return {"message": "Búsqueda eliminada"}

# ============== REGULATORY ALERTS ==============

@api_router.get("/alerts/regulatory", response_model=List[RegulatoryAlert])
async def get_regulatory_alerts(current_user: dict = Depends(get_current_user)):
    """Get recent regulatory alerts affecting TARIC classifications"""
    # In production, this would fetch from official sources via scheduled jobs
    # For now, return sample alerts based on real regulatory changes
    alerts = [
        RegulatoryAlert(
            id="alert-1",
            type="anti_dumping",
            title="Derechos antidumping sobre productos de acero de China",
            description="La Comisión Europea ha impuesto derechos antidumping definitivos sobre determinados productos planos de acero inoxidable laminados en frío procedentes de la República Popular China. Tipos de derecho entre 10.9% y 17.2% según productor.",
            affected_codes=["7219", "7220", "7304"],
            effective_date="2024-01-15",
            source="DOUE L 15/2024",
            created_at=datetime.now(timezone.utc).isoformat()
        ),
        RegulatoryAlert(
            id="alert-2",
            type="restriction",
            title="Nuevos controles fitosanitarios vegetales",
            description="Refuerzo de los controles fitosanitarios para productos vegetales de terceros países según el Reglamento (UE) 2023/2890. Afecta especialmente a frutas y hortalizas de alto riesgo.",
            affected_codes=["0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708"],
            effective_date="2024-02-01",
            source="MAPA - Sanidad Vegetal",
            created_at=datetime.now(timezone.utc).isoformat()
        ),
        RegulatoryAlert(
            id="alert-3",
            type="anti_dumping",
            title="Revisión derechos sobre biodiésel de Argentina",
            description="Apertura de revisión de los derechos antidumping aplicables a las importaciones de biodiésel originario de Argentina. Los operadores deben verificar los tipos aplicables actualizados.",
            affected_codes=["3826", "2710"],
            effective_date="2024-01-20",
            source="DOUE C 28/2024",
            created_at=datetime.now(timezone.utc).isoformat()
        ),
        RegulatoryAlert(
            id="alert-4",
            type="sanction",
            title="Actualización sanciones comerciales",
            description="Nuevas restricciones a la importación de determinados productos relacionados con componentes electrónicos de uso dual. Verificar lista de control antes de operar.",
            affected_codes=["8541", "8542", "8543"],
            effective_date="2024-02-15",
            source="BOE - Ministerio de Comercio",
            created_at=datetime.now(timezone.utc).isoformat()
        ),
        RegulatoryAlert(
            id="alert-5",
            type="restriction",
            title="CITES - Actualización de anexos",
            description="Actualización de los anexos del Reglamento CITES con nuevas especies protegidas. Verificar permisos de importación para productos derivados de madera y pieles.",
            affected_codes=["4403", "4407", "4101", "4102", "4103"],
            effective_date="2024-03-01",
            source="MITECO - CITES España",
            created_at=datetime.now(timezone.utc).isoformat()
        )
    ]
    return alerts

# ============== DOCUMENTS LIBRARY ==============

@api_router.get("/documents/library")
async def get_documents_library(current_user: dict = Depends(get_current_user)):
    """Get all official documents available with PDF links"""
    documents_list = []
    for doc_id, doc_data in OFFICIAL_DOCUMENTS.items():
        documents_list.append({
            "id": doc_id,
            **doc_data
        })
    return {
        "documents": documents_list,
        "categories": DOCUMENT_CATEGORIES
    }

@api_router.get("/documents/{doc_id}")
async def get_document_detail(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information about a specific document"""
    if doc_id not in OFFICIAL_DOCUMENTS:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return {
        "id": doc_id,
        **OFFICIAL_DOCUMENTS[doc_id]
    }

# ============== IMAGE ANALYSIS ==============

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    language: Optional[str] = "es"  # Default to Spanish

class ImageAnalysisResult(BaseModel):
    product_description: str
    components: List[str]
    suggested_category: Optional[str] = None
    confidence: str
    details: Optional[str] = None

# Language names for AI prompts
LANGUAGE_NAMES = {
    "es": "español",
    "en": "English",
    "pt": "português",
    "fr": "français",
    "de": "Deutsch",
    "it": "italiano",
    "nl": "Nederlands",
    "pl": "polski",
    "ro": "română",
    "el": "ελληνικά",
    "cs": "čeština",
    "hu": "magyar",
    "sv": "svenska",
    "da": "dansk",
    "fi": "suomi",
    "sk": "slovenčina",
    "bg": "български",
    "hr": "hrvatski",
    "sl": "slovenščina",
    "et": "eesti",
    "lv": "latviešu",
    "lt": "lietuvių",
    "mt": "Malti",
    "ga": "Gaeilge",
    "ru": "русский",
    "uk": "українська",
    "tr": "Türkçe",
    "ar": "العربية",
    "zh": "中文",
    "ja": "日本語",
    "ko": "한국어",
}

@api_router.post("/image/analyze", response_model=ImageAnalysisResult)
async def analyze_image(request: ImageAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Analyze product image using AI vision to identify and describe it"""
    
    try:
        # Get language name for the prompt
        lang_code = request.language or "es"
        lang_name = LANGUAGE_NAMES.get(lang_code, "español")
        
        # Extract and validate base64 data
        image_data = request.image_base64
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No se proporcionó imagen")
        
        logger.info(f"Received image data length: {len(image_data)}, language: {lang_code}")
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if image_data.startswith("data:"):
            # Extract the base64 part after the comma
            match = re.match(r'data:image/[^;]+;base64,(.+)', image_data, re.DOTALL)
            if match:
                image_data = match.group(1)
                logger.info("Extracted base64 from data URL prefix")
            else:
                # Try simple split
                parts = image_data.split(",")
                if len(parts) > 1:
                    image_data = parts[1]
                    logger.info("Extracted base64 using comma split")
        
        # Clean up any whitespace or newlines that might be in the base64
        image_data = image_data.strip().replace('\n', '').replace('\r', '').replace(' ', '')
        
        # Validate base64
        try:
            # Try to decode to verify it's valid base64
            decoded = base64.b64decode(image_data)
            if len(decoded) < 100:
                logger.error(f"Image too small: {len(decoded)} bytes")
                raise HTTPException(status_code=400, detail="La imagen es demasiado pequeña o está corrupta")
            logger.info(f"Image validated: {len(decoded)} bytes")
        except base64.binascii.Error as e:
            logger.error(f"Invalid base64 encoding: {e}")
            raise HTTPException(status_code=400, detail="Imagen con codificación inválida. Por favor intenta con otra imagen.")
        except Exception as e:
            logger.error(f"Image validation error: {e}")
            raise HTTPException(status_code=400, detail="Error al validar la imagen. Por favor intenta con otra imagen.")
        
        system_message = f"""You are an expert in product identification for TARIC customs classification.

Analyze the image and provide a DETAILED description of the product including:
- What the product is exactly
- Main apparent material (metal, plastic, fabric, glass, etc.)
- Visible physical characteristics
- Possible use or function
- General category for classification

IMPORTANT:
- If the image shows a clearly identifiable product, describe it in detail
- If the image is blurry, too dark, or doesn't show a clear product, indicate that
- Be specific about materials and visible characteristics

RESPOND ENTIRELY IN {lang_name.upper()} LANGUAGE.

Always respond in valid JSON format:
{{
    "product_description": "Complete and detailed product description for customs classification IN {lang_name.upper()}",
    "components": ["material1", "component2"],
    "suggested_category": "Category for TARIC",
    "confidence": "high|medium|low",
    "details": "Additional observations IN {lang_name.upper()}"
}}"""

        # chat = LlmChat(
        #     api_key=EMERGENT_LLM_KEY,
        #     session_id=f"image-{uuid.uuid4()}",
        #     system_message=system_message
        # ).with_model("openai", "gpt-5.2")
        
        # # Create image content
        # image_content = ImageContent(image_base64=image_data)
        
        # user_message = UserMessage(
        #     text=f"Analyze this image and describe the product for TARIC customs classification. Respond in {lang_name} language. Respond in JSON.",
        #     file_contents=[image_content]
        # )
        
        # logger.info("Sending image to AI for analysis...")
        # response = await chat.send_message(user_message)
        # logger.info(f"Image analysis response received, length: {len(response)}")
        # logger.info(f"Image analysis response preview: {response[:300]}...")
        
        # # Parse response
        # clean_response = response.strip()
        clean_response = await ask_ai(system_message, user_prompt)
        # Remove markdown code blocks if present
        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1].split("```")[0]
        elif "```" in clean_response:
            parts = clean_response.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("{"):
                    clean_response = part
                    break
        
        clean_response = clean_response.strip()
        
        try:
            result = json.loads(clean_response)
        except json.JSONDecodeError as je:
            logger.warning(f"JSON parse error: {je}, trying regex extraction")
            # Try to extract JSON from the response
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', clean_response, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                except Exception:
                    # If all parsing fails, create a result from the raw response
                    result = {
                        "product_description": clean_response[:500] if clean_response else "Producto identificado en la imagen",
                        "components": [],
                        "confidence": "media"
                    }
            else:
                result = {
                    "product_description": clean_response[:500] if clean_response else "Producto identificado en la imagen",
                    "components": [],
                    "confidence": "media"
                }
        
        return ImageAnalysisResult(
            product_description=result.get("product_description", "Producto identificado"),
            components=result.get("components", []),
            suggested_category=result.get("suggested_category"),
            confidence=result.get("confidence", "media"),
            details=result.get("details")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {type(e).__name__}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen. Por favor intenta con otra imagen o describe el producto manualmente.")

# ============== MARKET STUDY ==============

class MarketStudyRequest(BaseModel):
    product_description: str
    taric_code: Optional[str] = None
    origin_country: str
    destination_country: str
    language: str = "es"

class PestelAnalysis(BaseModel):
    political: str
    economic: str
    social: str
    technological: str
    environmental: str
    legal: str

class MarketSize(BaseModel):
    description: str
    value: Optional[str] = None
    growth_rate: Optional[str] = None

class Competitor(BaseModel):
    name: str
    description: Optional[str] = None
    market_share: Optional[str] = None

class MarketStudyResult(BaseModel):
    id: str
    product_name: str
    origin_country: str
    destination_country: str
    executive_summary: str
    pestel: PestelAnalysis
    market_size: MarketSize
    competitors: List[Competitor]
    trends: List[str]
    opportunities: List[str]
    threats: List[str]
    recommendations: List[str]
    created_at: str

@api_router.post("/market/study", response_model=MarketStudyResult)
async def generate_market_study(request: MarketStudyRequest, current_user: dict = Depends(get_current_user)):
    """Generate a professional market study with PESTEL analysis - Enhanced with official trade data sources"""
    
    try:
        # Get language name for the prompt
        lang_name = LANGUAGE_NAMES.get(request.language, "español")
        
        # Build trade context from official sources
        trade_agreements = get_trade_agreements_between(request.origin_country, request.destination_country)
        origin_info = get_country_info(request.origin_country)
        dest_info = get_country_info(request.destination_country)
        
        trade_context = ""
        if trade_agreements:
            trade_context = "ACUERDOS COMERCIALES VIGENTES:\n"
            for agreement in trade_agreements:
                trade_context += f"- {agreement['name']} ({agreement['type']}): Eliminación arancelaria {agreement.get('tariff_elimination', 'variable')}\n"
        
        if origin_info:
            trade_context += f"\nFUENTES OFICIALES PAÍS ORIGEN ({origin_info.get('name', request.origin_country)}):\n"
            trade_context += f"- Aduanas: {origin_info.get('customs_website', 'N/A')}\n"
            trade_context += f"- Fitosanitario: {origin_info.get('phytosanitary_website', 'N/A')}\n"
        
        if dest_info:
            trade_context += f"\nFUENTES OFICIALES PAÍS DESTINO ({dest_info.get('name', request.destination_country)}):\n"
            trade_context += f"- Aduanas: {dest_info.get('customs_website', 'N/A')}\n"
            trade_context += f"- IVA estándar: {dest_info.get('vat_rate', 'N/A')}\n"
        
        system_message = f"""Eres un analista de mercado profesional de nivel consultor senior, especializado en comercio internacional y estudios de viabilidad de exportación/importación.

IDIOMA: Responde EXCLUSIVAMENTE en {lang_name.upper()}.

## TU ROL
Generas estudios de mercado de ALTA CALIDAD usando datos de fuentes oficiales de comercio internacional:

### FUENTES DE DATOS OFICIALES QUE DEBES REFERENCIAR:
1. **UN Comtrade** (comtrade.un.org): Estadísticas de comercio bilateral, volúmenes de importación/exportación
2. **Trade Map** (trademap.org): Análisis de flujos comerciales por producto y país
3. **DataComex** (datacomex.comercio.es): Estadísticas de comercio exterior de España y UE
4. **ICEX** (icex.es): Informes de mercado, tendencias y oportunidades de exportación
5. **World Bank** (data.worldbank.org): Indicadores económicos, facilidad para hacer negocios
6. **WTO** (wto.org): Aranceles MFN, barreras comerciales, disputas
7. **Access2Markets** (trade.ec.europa.eu/access-to-markets): Condiciones de acceso al mercado UE
8. **ITC** (intracen.org): Centro de Comercio Internacional - análisis de competitividad

### ESTRUCTURA DEL ESTUDIO:
1. **Resumen Ejecutivo**: 2-3 párrafos con hallazgos clave y recomendación principal
2. **Análisis PESTEL Detallado**: Cada factor con datos concretos y fuentes
3. **Tamaño de Mercado**: Con valor estimado, CAGR y fuente del dato
4. **Análisis de Competencia**: Principales players con cuotas de mercado
5. **Tendencias**: Mínimo 4 tendencias actuales del sector
6. **Oportunidades**: Mínimo 4 oportunidades específicas para esta ruta
7. **Amenazas**: Mínimo 3 riesgos con su probabilidad e impacto
8. **Recomendaciones Estratégicas**: Mínimo 5 recomendaciones accionables

{trade_context}

### FORMATO DE RESPUESTA JSON:
{{
    "product_name": "Nombre corto del producto",
    "executive_summary": "Resumen ejecutivo profesional de 2-3 párrafos. Incluye: potencial del mercado, volumen comercial estimado (referencia a fuente), principales barreras de entrada, y recomendación principal. Cita las fuentes consultadas.",
    "pestel": {{
        "political": "Análisis político: estabilidad, relaciones bilaterales, acuerdos comerciales vigentes entre ambos países, aranceles aplicables. Citar fuente: WTO, Access2Markets.",
        "economic": "Análisis económico: PIB destino, poder adquisitivo, tipo de cambio, inflación, costes logísticos. Citar fuente: World Bank, IMF.",
        "social": "Factores sociales: demografía, hábitos de consumo, tendencias culturales, penetración de e-commerce. Citar fuente: Eurostat, censos nacionales.",
        "technological": "Aspectos tecnológicos: digitalización del sector, tecnologías disruptivas, adopción de nuevas tecnologías. Citar fuente: informes sectoriales.",
        "environmental": "Regulaciones ambientales: huella de carbono, economía circular, certificaciones verdes exigidas, ESG. Citar fuente: regulaciones locales.",
        "legal": "Marco legal: certificaciones requeridas, homologaciones, registros sanitarios, normas técnicas obligatorias. Citar fuente: organismos reguladores del destino."
    }},
    "market_size": {{
        "description": "Descripción detallada del tamaño del mercado con datos de importaciones/exportaciones del producto entre ambos países según UN Comtrade o Trade Map.",
        "value": "€X millones/billones (Fuente: [nombre fuente], año)",
        "growth_rate": "X% CAGR (periodo y fuente)"
    }},
    "competitors": [
        {{"name": "Competidor 1", "description": "País de origen y ventaja competitiva", "market_share": "X% (estimado según flujos comerciales)"}},
        {{"name": "Competidor 2", "description": "País de origen y ventaja competitiva", "market_share": "X%"}},
        {{"name": "Competidor 3", "description": "País de origen y ventaja competitiva", "market_share": "X%"}}
    ],
    "trends": [
        "Tendencia 1 con dato de soporte",
        "Tendencia 2 con dato de soporte",
        "Tendencia 3 con dato de soporte",
        "Tendencia 4 con dato de soporte"
    ],
    "opportunities": [
        "Oportunidad 1 específica para esta ruta comercial",
        "Oportunidad 2",
        "Oportunidad 3",
        "Oportunidad 4"
    ],
    "threats": [
        "Amenaza 1 (probabilidad: alta/media/baja, impacto: alto/medio/bajo)",
        "Amenaza 2",
        "Amenaza 3"
    ],
    "recommendations": [
        "Recomendación estratégica 1 con acción concreta",
        "Recomendación estratégica 2",
        "Recomendación estratégica 3",
        "Recomendación estratégica 4",
        "Recomendación estratégica 5"
    ]
}}

IMPORTANTE: 
- Usa datos reales y actualizados basados en tu conocimiento de las fuentes oficiales.
- Siempre cita la fuente de los datos principales.
- Sé específico para el par de países indicados, no generalices.
- Todo el contenido en {lang_name.upper()}."""

        user_prompt = f"""Genera un estudio de mercado PROFESIONAL para la siguiente operación comercial internacional.

📦 PRODUCTO: {request.product_description}
{f"📋 CÓDIGO TARIC: {request.taric_code}" if request.taric_code else ""}
🌍 PAÍS ORIGEN (Exportador): {request.origin_country}
🎯 PAÍS DESTINO (Importador): {request.destination_country}

Realiza un análisis exhaustivo consultando mentalmente las fuentes oficiales de comercio internacional.
Incluye:
- Volumen comercial bilateral real del producto (según UN Comtrade/Trade Map)
- Aranceles aplicables y preferencias según acuerdos vigentes
- Principales competidores (otros países exportadores al destino)
- Requisitos de entrada específicos del país destino
- Recomendaciones estratégicas accionables

El estudio debe ser de calidad consultoría profesional. Idioma: {lang_name}."""

        # chat = LlmChat(
        #     api_key=EMERGENT_LLM_KEY,
        #     session_id=f"market-{uuid.uuid4()}",
        #     system_message=system_message
        # ).with_model("openai", "gpt-5.2")
        
        # user_message = UserMessage(text=user_prompt)
        # response = await chat.send_message(user_message)
        # logger.info(f"Market study response received, length: {len(response)}")
        
        # # Parse response with robust error handling
        # clean_response = response.strip()
        clean_response = await ask_ai(system_message, user_prompt)
        
        # Remove markdown code blocks
        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1].split("```")[0]
        elif "```" in clean_response:
            parts = clean_response.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("{"):
                    clean_response = part
                    break
        
        clean_response = clean_response.strip()
        
        # Remove any trailing text after the JSON object
        brace_count = 0
        json_end = 0
        in_string = False
        escape_next = False
        
        for i, char in enumerate(clean_response):
            if escape_next:
                escape_next = False
                continue
            if char == '\\':
                escape_next = True
                continue
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
            if not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end = i + 1
                        break
        
        if json_end > 0:
            clean_response = clean_response[:json_end]
        
        result = None
        parse_error = None
        
        # Try multiple parsing strategies
        try:
            result = json.loads(clean_response)
        except json.JSONDecodeError as je:
            parse_error = je
            logger.warning(f"First JSON parse attempt failed: {je}")
            
            # Strategy 2: Try to find JSON object with regex
            try:
                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', clean_response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
            except Exception as e2:
                logger.warning(f"Regex JSON extraction failed: {e2}")
            
            # Strategy 3: Try to fix common JSON issues
            if result is None:
                try:
                    # Replace single quotes with double quotes
                    fixed = clean_response.replace("'", '"')
                    # Fix trailing commas
                    fixed = re.sub(r',\s*}', '}', fixed)
                    fixed = re.sub(r',\s*]', ']', fixed)
                    result = json.loads(fixed)
                except Exception as e3:
                    logger.warning(f"Fixed JSON parse failed: {e3}")
        
        if result is None:
            logger.error(f"All JSON parsing attempts failed. Raw response: {clean_response[:500]}")
            raise HTTPException(status_code=500, detail="Error al procesar la respuesta de IA. Por favor intenta de nuevo.")
        
        study_id = str(uuid.uuid4())
        
        # Build response model
        study_result = MarketStudyResult(
            id=study_id,
            product_name=result.get("product_name", request.product_description[:50]),
            origin_country=request.origin_country,
            destination_country=request.destination_country,
            executive_summary=result.get("executive_summary", ""),
            pestel=PestelAnalysis(
                political=result.get("pestel", {}).get("political", ""),
                economic=result.get("pestel", {}).get("economic", ""),
                social=result.get("pestel", {}).get("social", ""),
                technological=result.get("pestel", {}).get("technological", ""),
                environmental=result.get("pestel", {}).get("environmental", ""),
                legal=result.get("pestel", {}).get("legal", "")
            ),
            market_size=MarketSize(
                description=result.get("market_size", {}).get("description", ""),
                value=result.get("market_size", {}).get("value"),
                growth_rate=result.get("market_size", {}).get("growth_rate")
            ),
            competitors=[
                Competitor(
                    name=c.get("name", ""),
                    description=c.get("description"),
                    market_share=c.get("market_share")
                ) for c in result.get("competitors", [])
            ],
            trends=result.get("trends", []),
            opportunities=result.get("opportunities", []),
            threats=result.get("threats", []),
            recommendations=result.get("recommendations", []),
            created_at=datetime.now(timezone.utc).isoformat()
        )
        
        # Save to database
        study_doc = study_result.model_dump()
        study_doc["user_id"] = current_user["id"]
        study_doc["organization_id"] = current_user.get("organization_id")
        await db.market_studies.insert_one(study_doc)
        
        return study_result
        
    except Exception as e:
        logger.error(f"Market study error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar el estudio de mercado: {str(e)}")

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {
        "message": "TaricAI API - Clasificación Arancelaria Inteligente",
        "status": "online",
        "version": "2.0.0",
        "features": ["TARIC AI Classification", "Compliance Monitoring", "Team Management", "Official Sources Integration"]
    }

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ============== CHAT CONVERSACIONAL INTERNACIONAL ==============

def get_country_info(country_code: str) -> dict:
    """Obtiene información de un país de la base de datos"""
    return WORLDWIDE_CUSTOMS_DATABASE.get(country_code.upper(), None)

def get_trade_agreements_between(origin: str, destination: str) -> List[dict]:
    """Encuentra tratados comerciales entre dos países"""
    agreements = []
    origin_upper = origin.upper()
    dest_upper = destination.upper()
    
    for agreement_key, agreement_info in TRADE_AGREEMENTS_INFO.items():
        members = agreement_info.get("members", [])
        associates = agreement_info.get("associates", [])
        all_members = members + associates if isinstance(associates, list) else members
        
        # Verificar si ambos países son miembros
        origin_in = origin_upper in all_members
        dest_in = dest_upper in all_members
        
        if origin_in and dest_in:
            agreements.append({
                "name": agreement_info.get("name", agreement_key),
                "key": agreement_key,
                "type": agreement_info.get("type", "FTA"),
                "tariff_elimination": agreement_info.get("tariff_elimination", "Variable"),
                "website": agreement_info.get("website", "")
            })
    
    return agreements

def build_country_context(origin_code: str, destination_code: str, language: str = "es") -> str:
    """Construye el contexto de país para el prompt de IA"""
    origin_info = get_country_info(origin_code)
    dest_info = get_country_info(destination_code)
    trade_agreements = get_trade_agreements_between(origin_code, destination_code)
    
    context = ""
    
    if origin_info:
        context += f"""
**PAÍS DE ORIGEN: {origin_info.get('name', origin_code)}**
- Autoridad Aduanera: {origin_info.get('customs_authority', 'N/A')}
- Web Aduanas: {origin_info.get('customs_website', 'N/A')}
- Autoridad Fitosanitaria: {origin_info.get('phytosanitary_authority', 'N/A')}
- Web Fitosanitaria: {origin_info.get('phytosanitary_website', 'N/A')}
- Sistema HS: {origin_info.get('hs_system', 'N/A')}
- Moneda: {origin_info.get('currency', 'N/A')}
"""
    
    if dest_info:
        context += f"""
**PAÍS DE DESTINO: {dest_info.get('name', destination_code)}**
- Autoridad Aduanera: {dest_info.get('customs_authority', 'N/A')}
- Web Aduanas: {dest_info.get('customs_website', 'N/A')}
- Base de Datos Arancelaria: {dest_info.get('tariff_database', 'N/A')}
- Autoridad Fitosanitaria: {dest_info.get('phytosanitary_authority', 'N/A')}
- Web Fitosanitaria: {dest_info.get('phytosanitary_website', 'N/A')}
- IVA/VAT: {dest_info.get('vat_rate', 'N/A')}%
- Miembro UE: {'Sí' if dest_info.get('eu_member', False) else 'No'}
- Requisitos de Importación: {', '.join(dest_info.get('import_requirements', []))}
- Notas Especiales: {dest_info.get('special_notes', 'N/A')}
"""
    
    if trade_agreements:
        context += "\n**TRATADOS COMERCIALES APLICABLES:**\n"
        for agreement in trade_agreements:
            context += f"- {agreement['name']} ({agreement['type']}): Eliminación arancelaria {agreement.get('tariff_elimination', 'Variable')}\n"
            if agreement.get('website'):
                context += f"  Fuente: {agreement['website']}\n"
    else:
        context += "\n**TRATADOS COMERCIALES:** No se encontraron tratados bilaterales directos entre estos países.\n"
    
    return context

# Mapa de nombres de país a código ISO para detección automática en texto
COUNTRY_NAME_TO_CODE = {
    # Español
    "china": "CN", "japón": "JP", "japon": "JP", "corea del sur": "KR", "corea": "KR",
    "india": "IN", "tailandia": "TH", "vietnam": "VN", "indonesia": "ID", "malasia": "MY",
    "filipinas": "PH", "singapur": "SG", "taiwan": "TW", "hong kong": "HK",
    "estados unidos": "US", "eeuu": "US", "usa": "US",
    "canadá": "CA", "canada": "CA", "méxico": "MX", "mexico": "MX",
    "brasil": "BR", "brazil": "BR", "argentina": "AR", "chile": "CL", "perú": "PE", "peru": "PE",
    "colombia": "CO", "ecuador": "EC", "venezuela": "VE", "bolivia": "BO",
    "uruguay": "UY", "paraguay": "PY",
    "españa": "ES", "espana": "ES", "alemania": "DE", "francia": "FR", "italia": "IT",
    "reino unido": "GB", "uk": "GB", "países bajos": "NL", "paises bajos": "NL", "holanda": "NL",
    "bélgica": "BE", "belgica": "BE", "portugal": "PT", "suecia": "SE", "noruega": "NO",
    "suiza": "CH", "austria": "AT", "polonia": "PL", "turquía": "TR", "turquia": "TR",
    "rusia": "RU", "ucrania": "UA",
    "emiratos árabes": "AE", "emiratos arabes": "AE", "uae": "AE", "dubái": "AE", "dubai": "AE",
    "arabia saudita": "SA", "arabia saudí": "SA", "qatar": "QA", "kuwait": "KW",
    "israel": "IL", "irán": "IR", "iran": "IR", "irak": "IQ",
    "marruecos": "MA", "argelia": "DZ", "túnez": "TN", "tunez": "TN", "egipto": "EG",
    "nigeria": "NG", "sudáfrica": "ZA", "sudafrica": "ZA", "kenia": "KE", "ghana": "GH",
    "bangladesh": "BD", "pakistán": "PK", "pakistan": "PK", "sri lanka": "LK",
    "australia": "AU", "nueva zelanda": "NZ",
    # English
    "china": "CN", "japan": "JP", "south korea": "KR", "thailand": "TH",
    "united states": "US", "united kingdom": "GB", "germany": "DE", "france": "FR",
    "italy": "IT", "spain": "ES", "netherlands": "NL", "belgium": "BE",
    "switzerland": "CH", "austria": "AT", "poland": "PL", "turkey": "TR",
    "russia": "RU", "ukraine": "UA", "morocco": "MA", "egypt": "EG",
    "south africa": "ZA", "kenya": "KE", "nigeria": "NG",
    "australia": "AU", "new zealand": "NZ", "brazil": "BR", "colombia": "CO",
    "mexico": "MX", "argentina": "AR", "chile": "CL", "peru": "PE",
}


def extract_countries_from_text(message: str) -> dict:
    """Extrae códigos de país origen/destino mencionados en el texto del mensaje"""
    msg_lower = message.lower().rstrip('.,!?')
    found = {}
    sorted_countries = sorted(COUNTRY_NAME_TO_CODE.keys(), key=len, reverse=True)

    # Buscar origen: texto entre "de/desde" y la siguiente preposición destino
    origin_match = re.search(
        r'(?:de|desde)\s+(.+?)\s+(?:\ba\b|hacia\b|para\b|al\b)',
        msg_lower
    )
    # Buscar destino: texto después de "a/para/hacia/al" hasta el final
    dest_match = re.search(
        r'(?:\ba\b|hacia\b|para\b|al\b)\s+(.+)$',
        msg_lower
    )

    if origin_match:
        origin_text = origin_match.group(1).strip()
        for country in sorted_countries:
            if country in origin_text:
                found["origin_country"] = COUNTRY_NAME_TO_CODE[country]
                break

    if dest_match:
        dest_text = dest_match.group(1).strip()
        for country in sorted_countries:
            if country in dest_text:
                found["destination_country"] = COUNTRY_NAME_TO_CODE[country]
                break

    # Fallback: buscar en inglés "from X to Y"
    if not found:
        en_match = re.search(r'from\s+(.+?)\s+to\s+(.+)$', msg_lower)
        if en_match:
            for country in sorted_countries:
                if country in en_match.group(1) and "origin_country" not in found:
                    found["origin_country"] = COUNTRY_NAME_TO_CODE[country]
                if country in en_match.group(2) and "destination_country" not in found:
                    found["destination_country"] = COUNTRY_NAME_TO_CODE[country]

    return found


def parse_claude_question(response_text: str) -> Optional[dict]:
    """
    Detecta si Claude generó una pregunta interactiva con opciones en su respuesta.
    Busca el bloque <<PREGUNTA_OPCIONES>>...</<<PREGUNTA_OPCIONES>> y extrae el JSON.
    Retorna dict con 'text_before', 'question', 'info_type', 'options', 'allow_custom', 'custom_placeholder'
    o None si no hay pregunta estructurada.
    """
    pattern = r'<<PREGUNTA_OPCIONES>>\s*([\s\S]*?)\s*<<\/PREGUNTA_OPCIONES>>'
    match = re.search(pattern, response_text)
    if not match:
        return None

    try:
        raw_json = match.group(1).strip()
        # Limpiar backticks de markdown (```json ... ```) si los hay
        raw_json = re.sub(r'^```(?:json)?\s*', '', raw_json)
        raw_json = re.sub(r'\s*```$', '', raw_json).strip()

        data = json.loads(raw_json)

        # Validar que tiene la estructura mínima
        if not data.get("question") or not data.get("options"):
            return None

        # Texto antes del bloque (explicación de Claude antes de la pregunta)
        text_before = response_text[:match.start()].strip()

        return {
            "text_before": text_before,
            "question": data.get("question", ""),
            "info_type": data.get("info_type", "product_detail"),
            "options": data.get("options", []),
            "allow_custom": data.get("allow_custom", True),
            "custom_placeholder": data.get("custom_placeholder", "Escribe tu respuesta...")
        }
    except (json.JSONDecodeError, KeyError, TypeError):
        logger.warning(f"parse_claude_question: JSON inválido en bloque PREGUNTA_OPCIONES")
        return None


def detect_missing_info_for_clarification(message: str, context: dict, has_prior_messages: bool = False) -> Optional[dict]:
    """
    DESHABILITADA — Claude maneja todas las preguntas directamente usando <<PREGUNTA_OPCIONES>>.
    """
    return None

@api_router.post("/chat/message")
async def chat_message(request: ChatRequest, user: dict = Depends(get_current_user)):
    """Endpoint principal del chat conversacional internacional con clarificación interactiva"""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Obtener historial de la sesión
        chat_history = await db.chat_sessions.find_one({"session_id": session_id, "user_id": user["id"]})
        if not chat_history:
            chat_history = {
                "session_id": session_id,
                "user_id": user["id"],
                "messages": [],
                "context": {},
                "pending_clarification": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        
        # Actualizar contexto si se proporcionan países
        if request.origin_country:
            chat_history["context"]["origin_country"] = request.origin_country
        if request.destination_country:
            chat_history["context"]["destination_country"] = request.destination_country
        if request.product_description:
            chat_history["context"]["product_description"] = request.product_description

        # Auto-extraer países del texto libre si aún no están en el contexto
        if not chat_history["context"].get("origin_country") or not chat_history["context"].get("destination_country"):
            extracted = extract_countries_from_text(request.message)
            if extracted.get("origin_country") and not chat_history["context"].get("origin_country"):
                chat_history["context"]["origin_country"] = extracted["origin_country"]
            if extracted.get("destination_country") and not chat_history["context"].get("destination_country"):
                chat_history["context"]["destination_country"] = extracted["destination_country"]
        
        # Manejar respuesta de clarificación si viene de una opción seleccionada
        if request.selected_option and chat_history.get("pending_clarification"):
            pending = chat_history["pending_clarification"]
            info_type = pending.get("info_type")
            
            # Actualizar contexto según el tipo de información
            # Normalizar a código ISO si el usuario escribió el nombre del país (opción personalizada)
            def normalize_country(value: str) -> str:
                if len(value) == 2 and value.upper() == value:
                    return value  # Ya es código ISO
                return COUNTRY_NAME_TO_CODE.get(value.lower().strip(), value)

            if info_type == "origin_country":
                chat_history["context"]["origin_country"] = normalize_country(request.selected_option)
            elif info_type == "destination_country":
                chat_history["context"]["destination_country"] = normalize_country(request.selected_option)
            elif info_type in ["product_type", "product_category"]:
                # Combinar con descripción existente o crear nueva
                existing = chat_history["context"].get("product_description", "")
                chat_history["context"]["product_description"] = f"{existing} {request.message}".strip()
            
            chat_history["pending_clarification"] = None
        
        # Detectar si necesitamos clarificación
        has_prior_messages = len(chat_history.get("messages", [])) > 0
        clarification_needed = detect_missing_info_for_clarification(request.message, chat_history["context"], has_prior_messages)
        
        if clarification_needed and not request.selected_option:
            # Guardar mensaje del usuario
            chat_history["messages"].append({
                "role": "user",
                "content": request.message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            # Guardar pregunta de clarificación como respuesta
            chat_history["messages"].append({
                "role": "assistant",
                "content": clarification_needed["question"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "is_clarification": True
            })
            
            chat_history["pending_clarification"] = clarification_needed
            chat_history["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            await db.chat_sessions.update_one(
                {"session_id": session_id},
                {"$set": chat_history},
                upsert=True
            )
            
            return {
                "response": "",
                "session_id": session_id,
                "sources": [],
                "suggested_questions": [],
                "context": chat_history["context"],
                "needs_clarification": True,
                "clarification_request": {
                    "question": clarification_needed["question"],
                    "options": clarification_needed["options"],
                    "allow_custom": clarification_needed["allow_custom"],
                    "custom_placeholder": clarification_needed["custom_placeholder"]
                }
            }
        
        # Construir contexto de países
        country_context = ""
        origin = chat_history["context"].get("origin_country")
        destination = chat_history["context"].get("destination_country")
        if origin and destination:
            country_context = build_country_context(origin, destination, request.language)
        
        # Usar el nuevo prompt del Asistente IA Pro
        system_prompt = get_assistant_system_prompt(
            language=request.language,
            country_context=country_context,
            chat_history_text=""
        )

        # Construir historial de mensajes para LlmChat (últimos 20, excluyendo clarificaciones)
        # initial_messages reemplaza el system message, así que debemos incluirlo primero
        history_messages = [
            m for m in chat_history.get("messages", [])
            if not m.get("is_clarification")
        ][-20:]

        initial_messages = [{"role": "system", "content": system_prompt}]
        for m in history_messages:
            role = "user" if m["role"] == "user" else "assistant"
            # LlmChat usa formato de lista para contenido de usuario
            if role == "user":
                initial_messages.append({"role": "user", "content": [{"type": "text", "text": m["content"]}]})
            else:
                initial_messages.append({"role": "assistant", "content": m["content"]})

        user_message_text = request.message

        # ── RESPONSE CACHE CHECK ──────────────────────────────────
        # Only cache full answers (not clarification responses), and only
        # when there is no pending_clarification (i.e., fresh classification queries).
        cache_key = _cache_key(user_message_text, origin or "", destination or "", request.language)
        cached = None
        if not chat_history.get("pending_clarification") and not request.selected_option:
            cached = await get_cached_response(cache_key)

        if cached:
            # Return cached payload and skip the LLM call
            await increment_cache_hit(cache_key)
            await track_usage(user["id"], user.get("organization_id", user["id"]), "cache", 0, 0, cache_hit=True)
            # Still save the user message in session history
            chat_history["messages"].append({
                "role": "user",
                "content": request.message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            chat_history["messages"].append({
                "role": "assistant",
                "content": cached.get("response", ""),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "sources": cached.get("sources", []),
                "is_clarification": cached.get("needs_clarification", False),
                "from_cache": True
            })
            chat_history["updated_at"] = datetime.now(timezone.utc).isoformat()
            await db.chat_sessions.update_one(
                {"session_id": session_id}, {"$set": chat_history}, upsert=True
            )
            return {**cached, "session_id": session_id, "from_cache": True}

        # ── SMART MODEL ROUTER ────────────────────────────────────
        selected_model = select_model(user_message_text, len(history_messages), has_route=bool(origin and destination))
        logger.info(f"Model selected: {selected_model} for message len={len(user_message_text)}")

        # ── LLM CALL ─────────────────────────────────────────────
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"chat-{session_id}",
            system_message=system_prompt,
            initial_messages=initial_messages
        ).with_model("openai", "gpt-5.2")

        ai_response = await chat.send_message(UserMessage(text=user_message_text))

        # La respuesta es un string directamente
        response_text = ai_response if isinstance(ai_response, str) else str(ai_response)

        # Detectar si Claude generó una pregunta interactiva con opciones
        claude_question = parse_claude_question(response_text)

        # Extraer fuentes de la respuesta
        sources = []
        origin_info = get_country_info(origin) if origin else None
        dest_info = get_country_info(destination) if destination else None
        
        if origin_info:
            sources.append({
                "name": f"Aduanas {origin_info.get('name', origin)}",
                "url": origin_info.get('customs_website', ''),
                "type": "customs_authority"
            })
        if dest_info:
            sources.append({
                "name": f"Aduanas {dest_info.get('name', destination)}",
                "url": dest_info.get('customs_website', ''),
                "type": "customs_authority"
            })
            if dest_info.get('tariff_database'):
                sources.append({
                    "name": f"Base Arancelaria {dest_info.get('name', destination)}",
                    "url": dest_info.get('tariff_database', ''),
                    "type": "tariff_database"
                })
            if dest_info.get('phytosanitary_website'):
                sources.append({
                    "name": f"Autoridad Fitosanitaria {dest_info.get('name', destination)}",
                    "url": dest_info.get('phytosanitary_website', ''),
                    "type": "phytosanitary"
                })
        
        # Agregar fuentes globales
        sources.extend([
            {"name": "WTO - Organización Mundial del Comercio", "url": "https://www.wto.org/", "type": "global"},
            {"name": "WCO - Organización Mundial de Aduanas", "url": "http://www.wcoomd.org/", "type": "global"}
        ])
        
        # Generar preguntas sugeridas
        suggested_questions = []
        if not origin or not destination:
            suggested_questions.append("¿Cuál es el país de origen y destino de tu operación?")
        else:
            suggested_questions = [
                f"¿Cuáles son los aranceles para exportar de {origin_info.get('name', origin) if origin_info else origin} a {dest_info.get('name', destination) if dest_info else destination}?",
                "¿Qué documentos necesito para esta importación?",
                "¿Existen tratados comerciales que reduzcan los aranceles?",
                "¿Cuáles son los requisitos fitosanitarios?",
                "¿Hay restricciones o prohibiciones para este producto?"
            ]
        
        # Determinar texto visible (sin el bloque de opciones si Claude generó pregunta)
        display_text = claude_question["text_before"] if claude_question else response_text

        # Guardar mensaje del usuario
        chat_history["messages"].append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # Guardar respuesta del asistente (solo el texto visible)
        chat_history["messages"].append({
            "role": "assistant",
            "content": display_text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sources": sources,
            "is_clarification": bool(claude_question)
        })

        chat_history["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Si Claude generó una pregunta, guardar su pending_clarification con info_type
        # Esto permite actualizar el contexto (origin_country, destination_country) cuando el usuario responda
        if claude_question:
            chat_history["pending_clarification"] = {
                "info_type": claude_question.get("info_type", "product_detail"),
                "question": claude_question["question"],
                "options": claude_question["options"]
            }
        else:
            chat_history["pending_clarification"] = None

        # Actualizar en base de datos
        await db.chat_sessions.update_one(
            {"session_id": session_id},
            {"$set": chat_history},
            upsert=True
        )

        # ── USAGE TRACKING ───────────────────────────────────────
        input_est  = len(system_prompt) // 4 + sum(len(m.get("content","")) // 4 for m in history_messages) + len(user_message_text) // 4
        output_est = len(response_text) // 4
        await track_usage(
            user["id"], user.get("organization_id", user["id"]),
            selected_model, input_est, output_est, cache_hit=False
        )

        # ── CACHE STORE (only full answers without clarification) ─
        if not claude_question and display_text:
            final_payload = {
                "response": display_text,
                "sources": sources,
                "suggested_questions": suggested_questions,
                "context": chat_history["context"],
                "needs_clarification": False,
                "clarification_request": None
            }
            await set_cached_response(cache_key, final_payload)

        # Si Claude hizo una pregunta con opciones, devolver como clarification_request
        if claude_question:
            return {
                "response": display_text,
                "session_id": session_id,
                "sources": sources,
                "suggested_questions": [],
                "context": chat_history["context"],
                "needs_clarification": True,
                "clarification_request": {
                    "question": claude_question["question"],
                    "options": claude_question["options"],
                    "allow_custom": claude_question["allow_custom"],
                    "custom_placeholder": claude_question["custom_placeholder"]
                }
            }

        return {
            "response": display_text,
            "session_id": session_id,
            "sources": sources,
            "suggested_questions": suggested_questions,
            "context": chat_history["context"],
            "needs_clarification": False,
            "clarification_request": None
        }
        
    except Exception as e:
        error_str = str(e)
        logger.error(f"Error en chat: {error_str}")
        # Provide user-friendly error messages
        if "Budget" in error_str and "exceeded" in error_str:
            raise HTTPException(status_code=503, detail="BUDGET_EXCEEDED")
        if "rate_limit" in error_str.lower() or "rate limit" in error_str.lower():
            raise HTTPException(status_code=429, detail="Demasiadas solicitudes. Por favor, espera unos segundos e intenta de nuevo.")
        if "timeout" in error_str.lower() or "timed out" in error_str.lower():
            raise HTTPException(status_code=504, detail="La consulta tardó demasiado. Intenta con una pregunta más corta.")
        raise HTTPException(status_code=500, detail="Error procesando tu mensaje. Por favor, inténtalo de nuevo.")

@api_router.get("/chat/sessions")
async def get_chat_sessions(user: dict = Depends(get_current_user)):
    """Obtiene las sesiones de chat del usuario"""
    sessions = await db.chat_sessions.find(
        {"user_id": user["id"]},
        {"_id": 0, "session_id": 1, "context": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).limit(20).to_list(20)
    return {"sessions": sessions}

@api_router.get("/chat/session/{session_id}")
async def get_chat_session(session_id: str, user: dict = Depends(get_current_user)):
    """Obtiene una sesión de chat específica"""
    session = await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return session

@api_router.delete("/chat/session/{session_id}")
async def delete_chat_session(session_id: str, user: dict = Depends(get_current_user)):
    """Elimina una sesión de chat"""
    result = await db.chat_sessions.delete_one({"session_id": session_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {"message": "Sesión eliminada"}

@api_router.post("/trade/country-info")
async def get_country_trade_info(request: CountryTradeInfo, user: dict = Depends(get_current_user)):
    """Obtiene información comercial completa entre dos países"""
    origin_info = get_country_info(request.origin_country)
    dest_info = get_country_info(request.destination_country)
    trade_agreements = get_trade_agreements_between(request.origin_country, request.destination_country)
    
    if not origin_info:
        raise HTTPException(status_code=404, detail=f"País de origen no encontrado: {request.origin_country}")
    if not dest_info:
        raise HTTPException(status_code=404, detail=f"País de destino no encontrado: {request.destination_country}")
    
    return {
        "origin": origin_info,
        "destination": dest_info,
        "trade_agreements": trade_agreements,
        "has_preferential_access": len(trade_agreements) > 0,
        "global_resources": GLOBAL_RESOURCES
    }

@api_router.get("/countries/list")
async def list_countries():
    """Lista todos los países disponibles en la base de datos"""
    countries = []
    for code, info in WORLDWIDE_CUSTOMS_DATABASE.items():
        countries.append({
            "code": code,
            "name": info.get("name", code),
            "name_en": info.get("name_en", code),
            "region": info.get("region", ""),
            "subregion": info.get("subregion", ""),
            "eu_member": info.get("eu_member", False),
            "currency": info.get("currency", "")
        })
    return {"countries": sorted(countries, key=lambda x: x["name"])}

@api_router.get("/country/{country_code}")
async def get_country_details(country_code: str):
    """Obtiene información detallada de un país"""
    country_info = get_country_info(country_code)
    if not country_info:
        raise HTTPException(status_code=404, detail=f"País no encontrado: {country_code}")
    return country_info

@api_router.get("/trade-agreements/list")
async def list_trade_agreements():
    """Lista todos los tratados comerciales"""
    agreements = []
    for key, info in TRADE_AGREEMENTS_INFO.items():
        agreements.append({
            "key": key,
            "name": info.get("name", key),
            "name_es": info.get("name_es", info.get("name", key)),
            "type": info.get("type", "FTA"),
            "members": info.get("members", []),
            "tariff_elimination": info.get("tariff_elimination", ""),
            "website": info.get("website", "")
        })
    return {"agreements": agreements}

# ============== SIMULADOR DE COSTOS DE IMPORTACIÓN ==============

@api_router.post("/import-cost/calculate")
async def calculate_import_costs(request: ImportCostRequest, user: dict = Depends(get_current_user)):
    """Calcula los costos totales de importación incluyendo aranceles, impuestos y otros cargos"""
    try:
        origin_info = get_country_info(request.origin_country)
        dest_info = get_country_info(request.destination_country)
        trade_agreements = get_trade_agreements_between(request.origin_country, request.destination_country)
        
        if not dest_info:
            raise HTTPException(status_code=404, detail=f"País de destino no encontrado: {request.destination_country}")
        
        # Construir contexto para IA
        country_context = build_country_context(request.origin_country, request.destination_country, request.language)
        
        # Sistema de prompt para el cálculo
        system_prompt = f"""Eres un experto en comercio internacional y cálculo de costos de importación. 
Debes calcular los costos totales de importación de manera precisa.

DATOS DE LA OPERACIÓN:
- Código HS: {request.hs_code}
- Producto: {request.product_description}
- País de origen: {origin_info.get('name', request.origin_country) if origin_info else request.origin_country}
- País de destino: {dest_info.get('name', request.destination_country)}
- Valor FOB: ${request.fob_value:,.2f} {request.currency}
- Peso: {request.weight_kg} kg
- Cantidad: {request.quantity} {request.unit}
- Incoterm: {request.incoterm}
- Flete: {'$' + str(request.freight_cost) if request.freight_cost else 'Por calcular (estimar 10-15% del FOB)'}
- Seguro: {'$' + str(request.insurance_cost) if request.insurance_cost else 'Por calcular (estimar 0.5-1% del CIF)'}

{country_context}

TRATADOS COMERCIALES APLICABLES:
{chr(10).join([f"- {a['name']}: {a.get('tariff_elimination', 'Variable')}" for a in trade_agreements]) if trade_agreements else "No se encontraron tratados bilaterales directos. Aplica arancel NMF (Nación Más Favorecida)."}

INFORMACIÓN FISCAL DEL DESTINO:
- IVA/VAT: {dest_info.get('vat_rate', 'N/A')}%
- Moneda: {dest_info.get('currency', 'N/A')}

INSTRUCCIONES:
1. Calcula el valor CIF (Cost, Insurance, Freight) si no se proporciona
2. Determina el arancel aplicable según el código HS y origen
3. Calcula el IVA/impuestos sobre la base imponible (CIF + Arancel)
4. Estima otros costos (agente aduanal, almacenaje, etc.)
5. Proporciona un desglose detallado y el costo total

FORMATO DE RESPUESTA (JSON):
{{
  "valor_fob": {request.fob_value},
  "flete_estimado": <valor>,
  "seguro_estimado": <valor>,
  "valor_cif": <valor>,
  "arancel_porcentaje": <porcentaje>,
  "arancel_monto": <valor>,
  "base_imponible_iva": <valor>,
  "iva_porcentaje": {dest_info.get('vat_rate', 0)},
  "iva_monto": <valor>,
  "otros_costos": {{
    "agente_aduanal": <valor>,
    "almacenaje_estimado": <valor>,
    "documentacion": <valor>
  }},
  "total_impuestos": <valor>,
  "costo_total_importacion": <valor>,
  "precio_unitario_final": <valor>,
  "notas": ["nota1", "nota2"],
  "fuentes": ["fuente1", "fuente2"]
}}

Responde SOLO con el JSON válido, sin explicaciones adicionales.
"""
        
        # Llamar a la IA para calcular
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"import-cost-{uuid.uuid4()}",
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        user_prompt = f"""Calcula los costos de importación para:
- {request.product_description} (HS: {request.hs_code})
- De: {origin_info.get('name', request.origin_country) if origin_info else request.origin_country}
- A: {dest_info.get('name', request.destination_country)}
- Valor FOB: ${request.fob_value:,.2f}
- Peso: {request.weight_kg} kg

Proporciona el JSON con todos los cálculos."""
        
        ai_response = await chat.send_message(UserMessage(text=user_prompt))
        response_text = ai_response if isinstance(ai_response, str) else str(ai_response)
        
        # Intentar parsear el JSON de la respuesta
        # Extraer JSON de la respuesta
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            try:
                cost_breakdown = json.loads(json_match.group())
            except json.JSONDecodeError:
                # Si falla el parsing, crear estructura básica
                cost_breakdown = {
                    "valor_fob": request.fob_value,
                    "error": "No se pudo calcular automáticamente",
                    "raw_response": response_text[:500]
                }
        else:
            cost_breakdown = {
                "valor_fob": request.fob_value,
                "error": "No se pudo calcular automáticamente",
                "raw_response": response_text[:500]
            }
        
        # Documentos requeridos según el país de destino
        documents = dest_info.get('import_requirements', []) if dest_info else []
        
        # Advertencias
        warnings = []
        if not trade_agreements:
            warnings.append(f"No hay tratado de libre comercio entre {request.origin_country} y {request.destination_country}. Se aplica arancel NMF.")
        if dest_info and dest_info.get('special_notes'):
            warnings.append(dest_info['special_notes'])
        
        # Fuentes
        sources = []
        if dest_info:
            sources.append({
                "name": f"Aduanas {dest_info.get('name', request.destination_country)}",
                "url": dest_info.get('customs_website', '')
            })
            if dest_info.get('tariff_database'):
                sources.append({
                    "name": "Base de datos arancelaria",
                    "url": dest_info.get('tariff_database')
                })
        sources.append({
            "name": "WTO Tariff Database",
            "url": "https://ttd.wto.org/"
        })
        sources.append({
            "name": "ITC Market Access Map",
            "url": "https://www.macmap.org/"
        })
        
        return {
            "summary": {
                "origin": origin_info.get('name', request.origin_country) if origin_info else request.origin_country,
                "destination": dest_info.get('name', request.destination_country),
                "hs_code": request.hs_code,
                "product": request.product_description,
                "has_fta": len(trade_agreements) > 0,
                "trade_agreements": [a['name'] for a in trade_agreements]
            },
            "breakdown": cost_breakdown,
            "documents_required": documents,
            "warnings": warnings,
            "sources": sources,
            "ai_analysis": response_text
        }
        
    except Exception as e:
        logger.error(f"Error en cálculo de costos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculando costos: {str(e)}")

@api_router.post("/import-cost/questions")
async def get_import_cost_questions(
    hs_code: str,
    product_description: str,
    origin_country: str,
    destination_country: str,
    user: dict = Depends(get_current_user)
):
    """Obtiene las preguntas necesarias para calcular los costos de importación"""
    
    dest_info = get_country_info(destination_country)
    
    questions = [
        {
            "id": "fob_value",
            "question": "¿Cuál es el valor FOB de la mercancía?",
            "type": "number",
            "required": True,
            "unit": "USD",
            "hint": "Valor de la mercancía en el puerto de origen, sin incluir flete ni seguro"
        },
        {
            "id": "weight_kg",
            "question": "¿Cuál es el peso total de la mercancía?",
            "type": "number",
            "required": True,
            "unit": "kg",
            "hint": "Peso bruto incluyendo embalaje"
        },
        {
            "id": "quantity",
            "question": "¿Cuál es la cantidad total?",
            "type": "number",
            "required": True,
            "hint": "Número de unidades, bultos o contenedores"
        },
        {
            "id": "unit",
            "question": "¿Cuál es la unidad de medida?",
            "type": "select",
            "required": True,
            "options": ["unidades", "kg", "litros", "metros", "pares", "docenas", "cajas", "contenedores"],
            "default": "unidades"
        },
        {
            "id": "incoterm",
            "question": "¿Qué Incoterm aplica a la operación?",
            "type": "select",
            "required": True,
            "options": ["EXW", "FOB", "FCA", "CFR", "CIF", "CIP", "DAP", "DDP"],
            "default": "FOB",
            "hint": "El Incoterm determina quién paga el flete y el seguro"
        },
        {
            "id": "freight_cost",
            "question": "¿Conoces el costo del flete internacional?",
            "type": "number",
            "required": False,
            "unit": "USD",
            "hint": "Si no lo conoces, lo estimaremos (dejar vacío)"
        },
        {
            "id": "insurance_cost",
            "question": "¿Conoces el costo del seguro de transporte?",
            "type": "number",
            "required": False,
            "unit": "USD",
            "hint": "Si no lo conoces, lo estimaremos (dejar vacío)"
        }
    ]
    
    # Añadir preguntas específicas según el tipo de producto
    if hs_code.startswith("18") or hs_code.startswith("09"):  # Cacao o café
        questions.append({
            "id": "is_organic",
            "question": "¿El producto tiene certificación orgánica?",
            "type": "boolean",
            "required": False,
            "hint": "Puede afectar requisitos de documentación"
        })
        questions.append({
            "id": "has_phytosanitary",
            "question": "¿Ya tienes el certificado fitosanitario del país de origen?",
            "type": "boolean",
            "required": False,
            "hint": "Obligatorio para productos vegetales"
        })
    
    return {
        "questions": questions,
        "destination_info": {
            "country": dest_info.get('name', destination_country) if dest_info else destination_country,
            "vat_rate": dest_info.get('vat_rate', 'N/A') if dest_info else 'N/A',
            "currency": dest_info.get('currency', 'N/A') if dest_info else 'N/A',
            "customs_authority": dest_info.get('customs_authority', '') if dest_info else ''
        }
    }

# ============== DOCUMENTOS PARA DESCARGAR ==============

DOWNLOADABLE_FILES = {
    "pitch_deck_pdf": {
        "path": "/app/TaricAI_PitchDeck_Inversores.pdf",
        "filename": "TaricAI_PitchDeck_Inversores.pdf",
        "media_type": "application/pdf"
    },
    "pitch_deck_docx": {
        "path": "/app/TaricAI_PitchDeck_Inversores.docx",
        "filename": "TaricAI_PitchDeck_Inversores.docx",
        "media_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    "plan_financiero": {
        "path": "/app/TaricAI_Plan_Financiero_Profesional.md",
        "filename": "TaricAI_Plan_Financiero_Profesional.md",
        "media_type": "text/markdown"
    },
    "resumen_inversores": {
        "path": "/app/TaricAI_Resumen_Financiero_Inversores.txt",
        "filename": "TaricAI_Resumen_Financiero_Inversores.txt",
        "media_type": "text/plain"
    },
    "analisis_costos": {
        "path": "/app/TaricAI_Analisis_Costos_Operativos.md",
        "filename": "TaricAI_Analisis_Costos_Operativos.md",
        "media_type": "text/markdown"
    }
}

@app.get("/api/documents/list")
async def list_downloadable_documents():
    """Lista todos los documentos disponibles para descargar (público)"""
    documents = []
    for key, info in DOWNLOADABLE_FILES.items():
        if os.path.exists(info["path"]):
            file_size = os.path.getsize(info["path"])
            documents.append({
                "id": key,
                "filename": info["filename"],
                "size_bytes": file_size,
                "size_kb": round(file_size / 1024, 2)
            })
    return {"documents": documents}

@app.get("/api/documents/download/{doc_id}")
async def download_document(doc_id: str):
    """Descarga un documento específico (público)"""
    if doc_id not in DOWNLOADABLE_FILES:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    file_info = DOWNLOADABLE_FILES[doc_id]
    if not os.path.exists(file_info["path"]):
        raise HTTPException(status_code=404, detail="Archivo no disponible")
    
    return FileResponse(
        path=file_info["path"],
        filename=file_info["filename"],
        media_type=file_info["media_type"]
    )

# ============== NOTIFICACIONES Y ALERTAS ==============

class AlertSubscriptionCreate(BaseModel):
    hs_codes: List[str]
    countries: List[str]
    email_notifications: bool = True

class BatchClassificationRequest(BaseModel):
    products: List[dict]  # Lista de productos con description, origin, destination
    notify_on_complete: bool = False

class UsageStatsRequest(BaseModel):
    period: str = "monthly"  # daily, weekly, monthly, yearly

@api_router.post("/alerts/subscribe")
async def subscribe_to_alerts(
    subscription: AlertSubscriptionCreate, 
    user: dict = Depends(get_current_user)
):
    """Suscribirse a alertas de cambios arancelarios"""
    try:
        subscription_doc = {
            "user_id": user["id"],
            "email": user["email"],
            "hs_codes": subscription.hs_codes,
            "countries": subscription.countries,
            "email_notifications": subscription.email_notifications,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Upsert - actualizar si existe o crear nuevo
        await db.alert_subscriptions.update_one(
            {"user_id": user["id"]},
            {"$set": subscription_doc},
            upsert=True
        )
        
        # Enviar email de confirmación
        if subscription.email_notifications:
            await send_subscription_confirmation(
                recipient_email=user["email"],
                user_name=user.get("name", "Usuario"),
                hs_codes=subscription.hs_codes,
                countries=subscription.countries
            )
        
        return {
            "status": "success",
            "message": "Suscripción a alertas creada correctamente",
            "monitored_codes": len(subscription.hs_codes),
            "monitored_countries": len(subscription.countries)
        }
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/alerts/subscription")
async def get_alert_subscription(user: dict = Depends(get_current_user)):
    """Obtener la suscripción actual del usuario"""
    subscription = await db.alert_subscriptions.find_one(
        {"user_id": user["id"]},
        {"_id": 0}
    )
    if not subscription:
        return {"subscription": None, "active": False}
    return {"subscription": subscription, "active": subscription.get("active", False)}

@api_router.delete("/alerts/unsubscribe")
async def unsubscribe_from_alerts(user: dict = Depends(get_current_user)):
    """Cancelar suscripción a alertas"""
    await db.alert_subscriptions.update_one(
        {"user_id": user["id"]},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "success", "message": "Suscripción cancelada"}

@api_router.post("/alerts/test-email")
async def send_test_alert(user: dict = Depends(get_current_user)):
    """Enviar un email de prueba para verificar la configuración"""
    test_alert = TariffAlert(
        hs_code="1801.00.00",
        product_description="Cacao en grano, entero o partido, crudo o tostado",
        old_rate="6.1%",
        new_rate="4.0%",
        country="España (UE)",
        effective_date=datetime.now(timezone.utc).strftime("%d/%m/%Y"),
        source_url="https://ec.europa.eu/taxation_customs/dds2/taric/"
    )
    
    result = await send_tariff_alert(
        recipient_email=user["email"],
        user_name=user.get("name", "Usuario"),
        alert=test_alert
    )
    
    return result

# ============== CLASIFICACIÓN POR LOTES ==============

@api_router.post("/taric/batch-classify")
async def batch_classify_products(
    request: BatchClassificationRequest,
    user: dict = Depends(get_current_user)
):
    """Clasificación de productos por lotes (batch)"""
    if len(request.products) > 50:
        raise HTTPException(status_code=400, detail="Máximo 50 productos por lote")
    
    results = []
    successful = 0
    failed = 0
    
    for idx, product in enumerate(request.products):
        try:
            description = product.get("description", "")
            origin = product.get("origin_country", "")
            destination = product.get("destination_country", "ES")
            
            if not description:
                results.append({
                    "index": idx,
                    "status": "error",
                    "error": "Descripción vacía"
                })
                failed += 1
                continue
            
            # Realizar clasificación
            classification_prompt = f"""Clasifica el siguiente producto en el Sistema Armonizado (HS):

Producto: {description}
País de Origen: {origin}
País de Destino: {destination}

Responde SOLO con un JSON válido con esta estructura exacta:
{{
    "taric_code": "XXXXXXXX",
    "description": "Descripción oficial del código",
    "chapter": "XX",
    "heading": "XXXX",
    "confidence": "Alta/Media/Baja"
}}"""
            
            # chat = LlmChat(
            #     api_key=EMERGENT_LLM_KEY,
            #     session_id=f"batch-{user['id']}-{idx}",
            #     system_message="Eres un experto en clasificación arancelaria del Sistema Armonizado. Responde solo con JSON válido."
            # ).with_model("openai", "gpt-5.2")
            
            # ai_response = await chat.send_message(UserMessage(text=classification_prompt))
            # response_text = ai_response if isinstance(ai_response, str) else str(ai_response)
            
            # Parse response
            try:
                # Limpiar la respuesta para obtener solo el JSON
                # clean_response = response_text.strip()
                clean_response = await ask_ai(system_message, user_prompt)
                
                # Si tiene bloques de código markdown, extraer el contenido
                if "```json" in clean_response:
                    clean_response = clean_response.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_response:
                    parts = clean_response.split("```")
                    if len(parts) >= 2:
                        clean_response = parts[1].strip()
                
                # Intentar parsear directamente
                classification = json.loads(clean_response)
                
                results.append({
                    "index": idx,
                    "status": "success",
                    "product_description": description,
                    "taric_code": classification.get("taric_code", ""),
                    "taric_description": classification.get("description", ""),
                    "confidence": classification.get("confidence", "Media")
                })
                successful += 1
            except Exception as parse_error:
                logger.error(f"Batch parse error: {str(parse_error)} - Response: {response_text[:100]}")
                results.append({
                    "index": idx,
                    "status": "partial",
                    "product_description": description,
                    "raw_response": response_text[:200],
                    "parse_error": str(parse_error)
                })
                failed += 1
                
        except Exception as e:
            results.append({
                "index": idx,
                "status": "error",
                "error": str(e)
            })
            failed += 1
    
    # Guardar resultados del lote
    batch_doc = {
        "batch_id": str(uuid.uuid4()),
        "user_id": user["id"],
        "organization_id": user.get("organization_id"),
        "total_products": len(request.products),
        "successful": successful,
        "failed": failed,
        "results": results,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.batch_classifications.insert_one(batch_doc)
    
    return {
        "batch_id": batch_doc["batch_id"],
        "total": len(request.products),
        "successful": successful,
        "failed": failed,
        "results": results
    }

# ============== ESTADÍSTICAS Y DASHBOARD ==============

@api_router.get("/stats/usage")
async def get_usage_statistics(
    period: str = "monthly",
    user: dict = Depends(get_current_user)
):
    """Obtener estadísticas de uso para gráficos del dashboard"""
    try:
        org_id = user.get("organization_id")
        
        # Determinar rango de fechas
        now = datetime.now(timezone.utc)
        if period == "daily":
            days_back = 30
        elif period == "weekly":
            days_back = 84  # 12 semanas
        elif period == "yearly":
            days_back = 365
        else:  # monthly
            days_back = 365
        
        start_date = now - timedelta(days=days_back)
        
        # Búsquedas por período
        pipeline_searches = [
            {
                "$match": {
                    "organization_id": org_id,
                    "created_at": {"$gte": start_date.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d" if period == "daily" else "%Y-%m" if period == "monthly" else "%Y-W%V",
                            "date": {"$dateFromString": {"dateString": "$created_at"}}
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        searches_data = await db.taric_results.aggregate(pipeline_searches).to_list(100)
        
        # Productos más clasificados
        pipeline_products = [
            {
                "$match": {
                    "organization_id": org_id,
                    "created_at": {"$gte": start_date.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": "$taric_code",
                    "count": {"$sum": 1},
                    "description": {"$first": "$product_description"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        top_products = await db.taric_results.aggregate(pipeline_products).to_list(10)
        
        # Países más consultados
        pipeline_countries_origin = [
            {
                "$match": {
                    "organization_id": org_id,
                    "created_at": {"$gte": start_date.isoformat()},
                    "origin_country": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$origin_country",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        pipeline_countries_dest = [
            {
                "$match": {
                    "organization_id": org_id,
                    "created_at": {"$gte": start_date.isoformat()},
                    "destination_country": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$destination_country",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        origin_countries = await db.taric_results.aggregate(pipeline_countries_origin).to_list(10)
        dest_countries = await db.taric_results.aggregate(pipeline_countries_dest).to_list(10)
        
        # Actividad por usuario (solo admin)
        user_activity = []
        if user.get("role") == "admin":
            pipeline_users = [
                {
                    "$match": {
                        "organization_id": org_id,
                        "created_at": {"$gte": start_date.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": "$user_id",
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            user_activity = await db.taric_results.aggregate(pipeline_users).to_list(10)
        
        return {
            "period": period,
            "searches_timeline": [{"date": s["_id"], "count": s["count"]} for s in searches_data],
            "top_products": [{"code": p["_id"], "count": p["count"], "description": p.get("description", "")[:50]} for p in top_products],
            "origin_countries": [{"country": c["_id"], "count": c["count"]} for c in origin_countries],
            "destination_countries": [{"country": c["_id"], "count": c["count"]} for c in dest_countries],
            "user_activity": user_activity if user.get("role") == "admin" else []
        }
        
    except Exception as e:
        logger.error(f"Error fetching usage stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/stats/summary")
async def get_stats_summary(user: dict = Depends(get_current_user)):
    """Resumen de estadísticas para el dashboard"""
    try:
        org_id = user.get("organization_id")
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Total histórico
        total_searches = await db.taric_results.count_documents({"organization_id": org_id})
        
        # Este mes
        month_searches = await db.taric_results.count_documents({
            "organization_id": org_id,
            "created_at": {"$gte": month_start.isoformat()}
        })
        
        # Estudios de mercado
        total_studies = await db.market_studies.count_documents({"organization_id": org_id})
        
        # Sesiones de chat
        total_chats = await db.chat_sessions.count_documents({"user_id": user["id"]})
        
        # Lotes procesados
        total_batches = await db.batch_classifications.count_documents({"organization_id": org_id})
        
        # Códigos únicos clasificados
        unique_codes = await db.taric_results.distinct("taric_code", {"organization_id": org_id})
        
        return {
            "total_searches": total_searches,
            "month_searches": month_searches,
            "total_studies": total_studies,
            "total_chats": total_chats,
            "total_batches": total_batches,
            "unique_codes": len(unique_codes),
            "period": "current_month"
        }
        
    except Exception as e:
        logger.error(f"Error fetching stats summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============== RIESGO PAÍS (estilo CESCE) ==============

@api_router.get("/risk/country/{country_code}")
async def get_country_risk_endpoint(country_code: str):
    """Obtiene el riesgo de un país específico"""
    risk = get_country_risk(country_code)
    return risk

@api_router.get("/risk/all-countries")
async def get_all_countries_risk():
    """Obtiene los datos de riesgo de todos los países para el mapa"""
    return get_all_country_risks()

@api_router.get("/risk/compare/{origin}/{destination}")
async def compare_country_risk(origin: str, destination: str):
    """Compara el riesgo entre país de origen y destino"""
    origin_risk = get_country_risk(origin)
    dest_risk = get_country_risk(destination)
    
    # Calcular riesgo combinado de la operación
    combined_level = max(origin_risk["risk_level"], dest_risk["risk_level"])
    
    # Alertas especiales
    alerts = []
    if origin_risk.get("has_sanctions"):
        alerts.append(f"⚠️ ALERTA: {origin} tiene sanciones internacionales activas")
    if dest_risk.get("has_sanctions"):
        alerts.append(f"⚠️ ALERTA: {destination} tiene sanciones internacionales activas")
    if origin_risk.get("has_conflict"):
        alerts.append(f"⚠️ ALERTA: {origin} tiene conflicto activo")
    if dest_risk.get("has_conflict"):
        alerts.append(f"⚠️ ALERTA: {destination} tiene conflicto activo")
    
    return {
        "origin": origin_risk,
        "destination": dest_risk,
        "combined_risk_level": combined_level,
        "operation_viable": combined_level < 7,
        "alerts": alerts,
        "recommendation": get_risk_recommendation(combined_level)
    }

def get_risk_recommendation(level: int) -> str:
    """Genera recomendación basada en el nivel de riesgo"""
    recommendations = {
        1: "Operación con riesgo mínimo. Proceder con procedimientos estándar.",
        2: "Operación de bajo riesgo. Verificar documentación estándar.",
        3: "Riesgo moderado. Verificar requisitos específicos y seguros.",
        4: "Riesgo alto. Considerar seguros de crédito y verificar solvencia.",
        5: "Riesgo muy alto. Evaluar cuidadosamente. Recomendable seguro de CESCE.",
        6: "Riesgo extremo. Operación no recomendable sin garantías especiales.",
        7: "PROHIBIDO: País bajo sanciones. Operación no permitida."
    }
    return recommendations.get(level, "Sin recomendación disponible")

@api_router.get("/chat/usage")
async def get_chat_usage(days: int = 30, user: dict = Depends(get_current_user)):
    """Devuelve el consumo de IA (mensajes, tokens, costo estimado, cache hits) de la organización."""
    org_id = user.get("organization_id", user["id"])
    records = await get_org_usage(org_id, days)
    totals = {"messages": 0, "cache_hits": 0, "input_tokens": 0, "output_tokens": 0, "cost_usd": 0.0}
    for r in records:
        for k in totals:
            totals[k] += r.get(k, 0)
    cache_rate = round(totals["cache_hits"] / totals["messages"] * 100, 1) if totals["messages"] else 0
    return {
        "period_days": days,
        "daily": records,
        "totals": totals,
        "cache_hit_rate_pct": cache_rate,
        "avg_cost_per_message_usd": round(totals["cost_usd"] / max(totals["messages"] - totals["cache_hits"], 1), 5)
    }

# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE PUERTOS Y COSTOS PORTUARIOS
# ═══════════════════════════════════════════════════════════════════════════════

@api_router.get("/ports/all")
async def get_all_ports_endpoint():
    """Retorna todos los puertos disponibles"""
    return get_all_ports()

@api_router.get("/ports/country/{country_code}")
async def get_ports_by_country_endpoint(country_code: str):
    """Retorna todos los puertos de un país específico"""
    ports = get_ports_by_country(country_code)
    if not ports:
        return {"ports": [], "message": f"No se encontraron puertos para {country_code}"}
    return {"country": country_code, "ports": ports, "count": len(ports)}

@api_router.get("/ports/{port_code}")
async def get_port_info_endpoint(port_code: str):
    """Retorna información detallada de un puerto"""
    port = get_port_info(port_code)
    if not port:
        raise HTTPException(status_code=404, detail=f"Puerto {port_code} no encontrado")
    return port

@api_router.post("/ports/compare")
async def compare_ports_endpoint(port_codes: List[str]):
    """Compara múltiples puertos - retorna ordenados por costo"""
    if len(port_codes) < 2:
        raise HTTPException(status_code=400, detail="Se necesitan al menos 2 puertos para comparar")
    
    result = compare_ports(port_codes)
    if not result:
        raise HTTPException(status_code=404, detail="No se encontraron los puertos especificados")
    
    return {
        "ports_compared": len(result),
        "comparison": result,
        "cheapest": result[0]["name"] if result else None,
        "most_expensive": result[-1]["name"] if result else None
    }

@api_router.get("/ports/recommend/{country_code}")
async def recommend_port_endpoint(country_code: str, cargo_type: str = "general"):
    """Recomienda el mejor puerto para un país y tipo de carga"""
    port = get_recommended_port(country_code, cargo_type)
    if not port:
        raise HTTPException(status_code=404, detail=f"No hay puertos disponibles para {country_code}")
    
    return {
        "recommended_port": port,
        "cargo_type": cargo_type,
        "reason": f"Puerto recomendado basado en balance costo/eficiencia para carga {cargo_type}"
    }

@api_router.get("/ports/route/{origin_country}/{destination_country}")
async def get_route_ports(origin_country: str, destination_country: str, cargo_type: str = "general"):
    """Retorna los puertos recomendados para una ruta comercial completa"""
    origin_ports = get_ports_by_country(origin_country)
    dest_ports = get_ports_by_country(destination_country)
    
    recommended_origin = get_recommended_port(origin_country, cargo_type)
    recommended_dest = get_recommended_port(destination_country, cargo_type)
    
    # Calcular costos totales estimados
    total_20ft = 0
    total_40ft = 0
    if recommended_origin:
        total_20ft += recommended_origin["costs_20ft"]["total_estimated"]
        total_40ft += recommended_origin["costs_40ft"]["total_estimated"]
    if recommended_dest:
        total_20ft += recommended_dest["costs_20ft"]["total_estimated"]
        total_40ft += recommended_dest["costs_40ft"]["total_estimated"]
    
    return {
        "route": f"{origin_country} → {destination_country}",
        "cargo_type": cargo_type,
        "origin": {
            "country": origin_country,
            "available_ports": origin_ports,
            "recommended": recommended_origin
        },
        "destination": {
            "country": destination_country,
            "available_ports": dest_ports,
            "recommended": recommended_dest
        },
        "estimated_port_costs": {
            "container_20ft_usd": total_20ft,
            "container_40ft_usd": total_40ft,
            "note": "Costos portuarios estimados (origen + destino). No incluye flete marítimo."
        },
        "free_zones": {
            "origin": recommended_origin.get("free_zone_name") if recommended_origin else None,
            "destination": recommended_dest.get("free_zone_name") if recommended_dest else None
        }
    }

# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINT DE APRENDIZAJE - GUARDAR CLASIFICACIONES
# ═══════════════════════════════════════════════════════════════════════════════

class ClassificationLearningData(BaseModel):
    producto: str
    origen_pais: str
    origen_subpartida: str
    destino_pais: str
    destino_subpartida: str
    arancel_mfn: Optional[str] = None
    arancel_preferencial: Optional[str] = None
    tlc_aplicado: Optional[str] = None
    impuestos_totales: Optional[str] = None
    requisitos_clave: List[str] = []
    documentos_obligatorios: List[str] = []
    alerta_riesgo: str = "verde"  # verde, amarillo, rojo
    alerta_multa: Optional[str] = None
    observaciones: Optional[str] = None

@api_router.post("/classifications/learn")
async def save_classification_learning(
    data: ClassificationLearningData,
    user: dict = Depends(get_current_user)
):
    """Guarda una clasificación para aprendizaje continuo del sistema"""
    
    classification_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "organization_id": user.get("organization_id"),
        "producto": data.producto,
        "origen": {
            "pais": data.origen_pais,
            "subpartida": data.origen_subpartida
        },
        "destino": {
            "pais": data.destino_pais,
            "subpartida": data.destino_subpartida,
            "arancel_mfn": data.arancel_mfn,
            "arancel_preferencial": data.arancel_preferencial,
            "tlc_aplicado": data.tlc_aplicado
        },
        "impuestos_totales": data.impuestos_totales,
        "requisitos_clave": data.requisitos_clave,
        "documentos_obligatorios": data.documentos_obligatorios,
        "alerta_riesgo": data.alerta_riesgo,
        "alerta_multa": data.alerta_multa,
        "observaciones": data.observaciones,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.classification_learning.insert_one(classification_doc)
    
    return {
        "message": "Clasificación guardada para aprendizaje",
        "id": classification_doc["id"],
        "alerta_riesgo": data.alerta_riesgo
    }

@api_router.get("/classifications/patterns")
async def get_classification_patterns(
    origen: Optional[str] = None,
    destino: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Obtiene patrones de clasificaciones anteriores para sugerir alertas"""
    
    query = {"organization_id": user.get("organization_id")}
    
    if origen:
        query["origen.pais"] = origen.upper()
    if destino:
        query["destino.pais"] = destino.upper()
    
    # Obtener clasificaciones previas
    classifications = await db.classification_learning.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # Analizar patrones de riesgo
    risk_counts = {"verde": 0, "amarillo": 0, "rojo": 0}
    common_issues = {}
    
    for c in classifications:
        risk_counts[c.get("alerta_riesgo", "verde")] += 1
        if c.get("alerta_multa"):
            issue = c["alerta_multa"]
            common_issues[issue] = common_issues.get(issue, 0) + 1
    
    return {
        "total_classifications": len(classifications),
        "risk_distribution": risk_counts,
        "common_issues": sorted(common_issues.items(), key=lambda x: -x[1])[:5],
        "recent_classifications": classifications[:10]
    }

@api_router.get("/classifications/alerts/{ruta}")
async def get_route_alerts(
    ruta: str,  # formato: "CO-ES" 
    user: dict = Depends(get_current_user)
):
    """Obtiene alertas históricas para una ruta específica"""
    
    parts = ruta.upper().split("-")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Formato de ruta inválido. Usar: ORIGEN-DESTINO (ej: CO-ES)")
    
    origen, destino = parts
    
    # Buscar clasificaciones con alertas para esta ruta
    alerts = await db.classification_learning.find(
        {
            "origen.pais": origen,
            "destino.pais": destino,
            "alerta_riesgo": {"$in": ["amarillo", "rojo"]}
        },
        {"_id": 0, "alerta_multa": 1, "requisitos_clave": 1, "alerta_riesgo": 1, "producto": 1}
    ).limit(20).to_list(20)
    
    return {
        "ruta": f"{origen} → {destino}",
        "total_alerts": len(alerts),
        "alerts": alerts,
        "recommendation": "Verifica estos requisitos antes de embarcar" if alerts else "Sin alertas históricas para esta ruta"
    }

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
