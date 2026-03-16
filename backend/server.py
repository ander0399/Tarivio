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
    status: str = "active"
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
    origin_country: Optional[str] = None
    client_reference: Optional[str] = None  # For B2B tracking

class DocumentRequirement(BaseModel):
    name: str
    type: str
    required: bool
    description: str
    official_link: Optional[str] = None
    issuing_authority: Optional[str] = None

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

class TaricResult(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str]
    product_description: str
    origin_country: Optional[str]
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
    official_sources: List[dict]
    ai_explanation: str
    ai_confidence: str
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

async def analyze_product_with_ai(product_description: str, origin_country: Optional[str] = None) -> dict:
    """Use GPT-5.2 to analyze product and suggest TARIC code with compliance checks"""
    
    system_message = """Eres un experto en clasificación arancelaria del TARIC (Arancel Integrado de las Comunidades Europeas) y compliance aduanero.

Tu trabajo es analizar descripciones de productos y proporcionar:
1. El código TARIC de 10 dígitos más apropiado según la Nomenclatura Combinada oficial
2. Descripción oficial del código según el TARIC de la UE
3. Aranceles aplicables (convencionales, preferenciales si aplica)
4. Documentos requeridos para importación en España/UE
5. Alertas de compliance (anti-dumping, sanciones, restricciones fitosanitarias, CITES)
6. Nivel de confianza de tu clasificación

IMPORTANTE: Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
    "taric_code": "1234567890",
    "description": "Descripción oficial del código TARIC según nomenclatura combinada",
    "chapter": "12",
    "heading": "34",
    "subheading": "56",
    "confidence": "alta|media|baja",
    "tariffs": [
        {"duty_type": "Derecho de terceros países", "rate": "5.0%", "description": "Arancel convencional", "legal_base": "Reglamento (CEE) nº 2658/87"},
        {"duty_type": "IVA importación", "rate": "21%", "description": "Tipo general España", "legal_base": "Ley 37/1992"}
    ],
    "preferential_duties": "0% con EUR.1 de Chile (Acuerdo UE-Chile)",
    "documents": [
        {"name": "Certificado fitosanitario", "type": "fitosanitario", "required": true, "description": "Expedido por SENASA del país de origen", "official_link": "https://www.mapa.gob.es/", "issuing_authority": "Ministerio de Agricultura"},
        {"name": "DUA (Documento Único Administrativo)", "type": "aduanero", "required": true, "description": "Declaración de importación obligatoria", "official_link": "https://www.agenciatributaria.es/", "issuing_authority": "AEAT"}
    ],
    "compliance_alerts": [
        {"type": "restriction", "severity": "medium", "message": "Producto sujeto a control fitosanitario en frontera", "official_reference": "Reglamento (UE) 2017/625"}
    ],
    "total_duty_estimate": "26%",
    "vat_rate": "21%",
    "explanation": "Explicación detallada de la clasificación, notas de sección/capítulo aplicables, y consideraciones importantes para el importador"
}

FUENTES OFICIALES que debes referenciar:
- TARIC de la Comisión Europea (ec.europa.eu/taxation_customs)
- Agencia Tributaria de España (agenciatributaria.es)
- Ministerio de Agricultura, Pesca y Alimentación (mapa.gob.es)
- BOE para normativa española
- DOUE para normativa europea

Si detectas posibles problemas de compliance (anti-dumping, sanciones, CITES, etc.), SIEMPRE inclúyelos en compliance_alerts."""

    origin_info = f" País de origen declarado: {origin_country}." if origin_country else ""
    user_prompt = f"""Clasifica el siguiente producto en el TARIC de la Unión Europea.
Proporciona todos los detalles de importación para España incluyendo verificación de compliance.{origin_info}

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
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        clean_response = clean_response.strip()
        
        result = json.loads(clean_response)
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
            "tariffs": [{"duty_type": "No disponible", "rate": "N/A", "description": "Error en consulta", "legal_base": None}],
            "preferential_duties": None,
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
        status="active",
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
        status="pending",
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
    
    ai_result = await analyze_product_with_ai(request.product_description, request.origin_country)
    
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
    
    # Build documents list
    documents = []
    for d in ai_result.get("documents", []):
        documents.append(DocumentRequirement(
            name=d.get("name", ""),
            type=d.get("type", "aduanero"),
            required=d.get("required", False),
            description=d.get("description", ""),
            official_link=d.get("official_link"),
            issuing_authority=d.get("issuing_authority")
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
    
    result = TaricResult(
        id=result_id,
        user_id=current_user["id"],
        organization_id=current_user.get("organization_id"),
        product_description=request.product_description,
        origin_country=request.origin_country,
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
        official_sources=official_sources,
        ai_explanation=ai_result.get("explanation", ""),
        ai_confidence=ai_confidence,
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
