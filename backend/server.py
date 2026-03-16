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

app = FastAPI(title="TARIC AI - Consulta Arancelaria Inteligente")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

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
    created_at: str

class TaricSearchRequest(BaseModel):
    product_description: str
    origin_country: Optional[str] = None

class DocumentRequirement(BaseModel):
    name: str
    type: str  # "fitosanitario", "no_fitosanitario", "aduanero"
    required: bool
    description: str
    official_link: Optional[str] = None

class TariffDetail(BaseModel):
    duty_type: str
    rate: str
    description: str

class TaricResult(BaseModel):
    id: str
    user_id: str
    product_description: str
    origin_country: Optional[str]
    taric_code: str
    taric_description: str
    chapter: str
    heading: str
    subheading: str
    tariffs: List[TariffDetail]
    documents: List[DocumentRequirement]
    total_duty_estimate: str
    vat_rate: str
    official_sources: List[dict]
    ai_explanation: str
    created_at: str

class SearchHistoryItem(BaseModel):
    id: str
    product_description: str
    taric_code: str
    created_at: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
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
    """Use GPT-5.2 to analyze product and suggest TARIC code"""
    
    system_message = """Eres un experto en clasificación arancelaria del TARIC (Arancel Integrado de las Comunidades Europeas).
Tu trabajo es analizar descripciones de productos y proporcionar:
1. El código TARIC de 10 dígitos más apropiado
2. Descripción oficial del código
3. Aranceles aplicables
4. Documentos requeridos para importación (fitosanitarios y no fitosanitarios)

IMPORTANTE: Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
    "taric_code": "1234567890",
    "description": "Descripción oficial del código TARIC",
    "chapter": "12",
    "heading": "34",
    "subheading": "56",
    "tariffs": [
        {"duty_type": "Arancel convencional", "rate": "5.0%", "description": "Derechos de terceros países"},
        {"duty_type": "IVA", "rate": "21%", "description": "Impuesto sobre el valor añadido"}
    ],
    "documents": [
        {"name": "Certificado fitosanitario", "type": "fitosanitario", "required": true, "description": "Requerido para productos vegetales"},
        {"name": "Documento de vigilancia", "type": "aduanero", "required": false, "description": "Para ciertos productos textiles"}
    ],
    "total_duty_estimate": "26%",
    "vat_rate": "21%",
    "explanation": "Explicación detallada de por qué se eligió este código y qué considerar"
}

Usa información oficial del TARIC de la Unión Europea y la Agencia Tributaria de España.
Si no estás seguro del código exacto, proporciona el más probable y explica las alternativas."""

    origin_info = f" País de origen: {origin_country}." if origin_country else ""
    user_prompt = f"Clasifica el siguiente producto en el TARIC y proporciona todos los detalles de importación:{origin_info}\n\nProducto: {product_description}"
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"taric-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Clean response - remove markdown code blocks if present
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
        # Return a fallback result
        return {
            "taric_code": "0000000000",
            "description": f"Error en análisis: {str(e)}",
            "chapter": "00",
            "heading": "00",
            "subheading": "00",
            "tariffs": [{"duty_type": "No disponible", "rate": "N/A", "description": "Error en consulta"}],
            "documents": [],
            "total_duty_estimate": "N/A",
            "vat_rate": "21%",
            "explanation": f"No se pudo completar el análisis: {str(e)}"
        }

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "company": user_data.company,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "company": user_data.company
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token = create_token(user["id"], user["email"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "company": user.get("company")
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        company=current_user.get("company"),
        created_at=current_user["created_at"]
    )

# ============== TARIC ROUTES ==============

@api_router.post("/taric/search", response_model=TaricResult)
async def search_taric(request: TaricSearchRequest, current_user: dict = Depends(get_current_user)):
    """Search TARIC code using AI analysis"""
    
    # Analyze with AI
    ai_result = await analyze_product_with_ai(request.product_description, request.origin_country)
    
    # Create result document
    result_id = str(uuid.uuid4())
    
    # Build tariffs list
    tariffs = []
    for t in ai_result.get("tariffs", []):
        tariffs.append(TariffDetail(
            duty_type=t.get("duty_type", ""),
            rate=t.get("rate", ""),
            description=t.get("description", "")
        ))
    
    # Build documents list
    documents = []
    for d in ai_result.get("documents", []):
        documents.append(DocumentRequirement(
            name=d.get("name", ""),
            type=d.get("type", "aduanero"),
            required=d.get("required", False),
            description=d.get("description", ""),
            official_link=d.get("official_link")
        ))
    
    # Official sources
    official_sources = [
        {
            "name": "TARIC - Comisión Europea",
            "url": f"https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=es&Taric={ai_result.get('taric_code', '')[:8]}",
            "description": "Consulta oficial del TARIC de la Unión Europea"
        },
        {
            "name": "Agencia Tributaria - Arancel",
            "url": "https://www2.agenciatributaria.gob.es/ADUA/internet/es/aeat/dit/adu/adws/certificados/Taric.html",
            "description": "Consulta arancelaria de la Agencia Tributaria de España"
        },
        {
            "name": "CITES - Comercio de especies",
            "url": "https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/comercio-internacional-cites/",
            "description": "Información sobre permisos CITES"
        }
    ]
    
    result = TaricResult(
        id=result_id,
        user_id=current_user["id"],
        product_description=request.product_description,
        origin_country=request.origin_country,
        taric_code=ai_result.get("taric_code", "0000000000"),
        taric_description=ai_result.get("description", ""),
        chapter=ai_result.get("chapter", "00"),
        heading=ai_result.get("heading", "00"),
        subheading=ai_result.get("subheading", "00"),
        tariffs=tariffs,
        documents=documents,
        total_duty_estimate=ai_result.get("total_duty_estimate", "N/A"),
        vat_rate=ai_result.get("vat_rate", "21%"),
        official_sources=official_sources,
        ai_explanation=ai_result.get("explanation", ""),
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Save to database
    result_doc = result.model_dump()
    result_doc["tariffs"] = [t.model_dump() for t in tariffs]
    result_doc["documents"] = [d.model_dump() for d in documents]
    await db.taric_searches.insert_one(result_doc)
    
    return result

@api_router.get("/taric/history", response_model=List[SearchHistoryItem])
async def get_search_history(current_user: dict = Depends(get_current_user)):
    """Get user's search history"""
    searches = await db.taric_searches.find(
        {"user_id": current_user["id"]},
        {"_id": 0, "id": 1, "product_description": 1, "taric_code": 1, "created_at": 1}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return [SearchHistoryItem(**s) for s in searches]

@api_router.get("/taric/result/{result_id}", response_model=TaricResult)
async def get_result(result_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific search result"""
    result = await db.taric_searches.find_one(
        {"id": result_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    return TaricResult(**result)

@api_router.delete("/taric/history/{result_id}")
async def delete_search(result_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a search from history"""
    result = await db.taric_searches.delete_one(
        {"id": result_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    return {"message": "Búsqueda eliminada"}

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "TARIC AI API - Consulta Arancelaria Inteligente", "status": "online"}

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
