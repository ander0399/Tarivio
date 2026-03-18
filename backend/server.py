from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from documents_database import OFFICIAL_DOCUMENTS, DOCUMENT_CATEGORIES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = "HS256"

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

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

# ============== AI SEARCH FUNCTION ==============

async def analyze_product_with_ai(
    product_description: str, 
    origin_country: str,
    destination_country: str = "ES",
    trade_agreements: Optional[List[str]] = None
) -> dict:
    """Use GPT-5.2 to analyze product and suggest TARIC code with compliance checks"""
    
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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"taric-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        import json
        import re
        clean_response = response.strip()
        
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
        return {
            "taric_code": "0000000000",
            "description": f"Error en análisis: {str(e)}",
            "chapter": "00",
            "heading": "00",
            "subheading": "00",
            "confidence": "baja",
            "needs_clarification": False,
            "clarification_questions": [],
            "tariffs": [{"duty_type": "No disponible", "rate": "N/A", "description": "Error en consulta", "legal_base": None}],
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
        request.trade_agreements
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
    
    # Get user names for each search
    result = []
    for s in searches:
        user = await db.users.find_one({"id": s.get("user_id")}, {"_id": 0, "name": 1})
        result.append(SearchHistoryItem(
            id=s["id"],
            product_description=s["product_description"],
            taric_code=s["taric_code"],
            client_reference=s.get("client_reference"),
            created_at=s["created_at"],
            user_name=user.get("name") if user else None
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

class ImageAnalysisResult(BaseModel):
    product_description: str
    components: List[str]
    suggested_category: Optional[str] = None
    confidence: str
    details: Optional[str] = None

@api_router.post("/image/analyze", response_model=ImageAnalysisResult)
async def analyze_image(request: ImageAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Analyze product image using AI vision to identify and describe it"""
    
    try:
        from emergentintegrations.llm.chat import ImageContent
        import base64
        import re
        
        # Extract and validate base64 data
        image_data = request.image_base64
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if image_data.startswith("data:"):
            # Extract the base64 part after the comma
            match = re.match(r'data:image/[^;]+;base64,(.+)', image_data)
            if match:
                image_data = match.group(1)
            else:
                # Try simple split
                parts = image_data.split(",")
                if len(parts) > 1:
                    image_data = parts[1]
        
        # Validate base64
        try:
            # Try to decode to verify it's valid base64
            decoded = base64.b64decode(image_data)
            if len(decoded) < 100:
                raise ValueError("Image too small")
            logger.info(f"Image validated: {len(decoded)} bytes")
        except Exception as e:
            logger.error(f"Invalid base64 image: {e}")
            raise HTTPException(status_code=400, detail="Imagen inválida. Por favor sube una imagen JPG, PNG o WebP válida.")
        
        system_message = """Eres un experto en identificación de productos para clasificación arancelaria TARIC.

Analiza la imagen y proporciona una descripción DETALLADA del producto incluyendo:
- Qué es el producto exactamente
- Material principal aparente (metal, plástico, tela, vidrio, etc.)
- Características físicas visibles
- Posible uso o función
- Categoría general para clasificación

Responde SIEMPRE en formato JSON válido:
{
    "product_description": "Descripción completa y detallada del producto para clasificación arancelaria",
    "components": ["material1", "componente2"],
    "suggested_category": "Categoría para TARIC",
    "confidence": "alta|media|baja",
    "details": "Observaciones adicionales"
}"""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"image-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        # Create image content
        image_content = ImageContent(image_base64=image_data)
        
        user_message = UserMessage(
            text="Analiza esta imagen y describe el producto para clasificación arancelaria TARIC. Responde en JSON.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        logger.info(f"Image analysis response: {response[:200]}...")
        
        # Parse response
        import json
        clean_response = response.strip()
        
        # Remove markdown code blocks if present
        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1].split("```")[0]
        elif "```" in clean_response:
            clean_response = clean_response.split("```")[1].split("```")[0]
        
        clean_response = clean_response.strip()
        
        try:
            result = json.loads(clean_response)
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            json_match = re.search(r'\{[^{}]*\}', clean_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {
                    "product_description": clean_response,
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
        logger.error(f"Image analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen: {str(e)}")

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
    """Generate a professional market study with PESTEL analysis"""
    
    try:
        lang_instructions = {
            "es": "Responde completamente en español.",
            "en": "Respond completely in English.",
            "pt": "Responda completamente em português.",
            "fr": "Répondez entièrement en français.",
            "de": "Antworten Sie vollständig auf Deutsch."
        }
        
        system_message = f"""Eres un analista de mercado profesional especializado en comercio internacional y estudios de viabilidad.

{lang_instructions.get(request.language, lang_instructions['es'])}

Tu trabajo es generar estudios de mercado completos y profesionales que incluyan:
1. Resumen ejecutivo conciso
2. Análisis PESTEL detallado (Político, Económico, Social, Tecnológico, Ambiental, Legal)
3. Estimación del tamaño del mercado
4. Análisis de competencia
5. Tendencias actuales del sector
6. Oportunidades de mercado
7. Amenazas y riesgos
8. Recomendaciones estratégicas

Responde SIEMPRE en formato JSON con esta estructura:
{{
    "product_name": "Nombre corto del producto",
    "executive_summary": "Resumen ejecutivo de 2-3 párrafos sobre el potencial del mercado",
    "pestel": {{
        "political": "Análisis de factores políticos que afectan la importación/exportación de este producto entre los países",
        "economic": "Análisis económico: aranceles, tipo de cambio, demanda, poder adquisitivo",
        "social": "Factores sociales: tendencias de consumo, preferencias del mercado objetivo",
        "technological": "Aspectos tecnológicos del sector y su evolución",
        "environmental": "Regulaciones ambientales, sostenibilidad, huella de carbono",
        "legal": "Marco legal, certificaciones requeridas, normativas de importación"
    }},
    "market_size": {{
        "description": "Descripción del tamaño y estructura del mercado",
        "value": "€X millones/billones (estimación)",
        "growth_rate": "X% CAGR"
    }},
    "competitors": [
        {{"name": "Competidor 1", "description": "Breve descripción", "market_share": "X%"}},
        {{"name": "Competidor 2", "description": "Breve descripción", "market_share": "X%"}}
    ],
    "trends": [
        "Tendencia 1 del mercado",
        "Tendencia 2 del mercado"
    ],
    "opportunities": [
        "Oportunidad 1",
        "Oportunidad 2"
    ],
    "threats": [
        "Amenaza 1",
        "Amenaza 2"
    ],
    "recommendations": [
        "Recomendación estratégica 1",
        "Recomendación estratégica 2"
    ]
}}

Sé específico y proporciona datos realistas basados en conocimiento de mercado actual."""

        user_prompt = f"""Genera un estudio de mercado profesional para el siguiente producto y ruta comercial:

PRODUCTO: {request.product_description}
{f"CÓDIGO TARIC: {request.taric_code}" if request.taric_code else ""}
PAÍS DE ORIGEN: {request.origin_country}
PAÍS DE DESTINO: {request.destination_country}

Por favor proporciona un análisis completo incluyendo PESTEL, tamaño de mercado, competencia, tendencias, oportunidades, amenazas y recomendaciones estratégicas."""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"market-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        logger.info(f"Market study response received, length: {len(response)}")
        
        # Parse response
        import json
        import re
        clean_response = response.strip()
        
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
        except json.JSONDecodeError as je:
            logger.error(f"JSON parse error: {je}, trying regex extraction")
            # Try to extract JSON object
            json_match = re.search(r'\{.*\}', clean_response, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                except:
                    raise HTTPException(status_code=500, detail="Error al procesar respuesta del estudio de mercado")
            else:
                raise HTTPException(status_code=500, detail="Error al generar el estudio de mercado")
        
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
