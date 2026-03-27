"""
Dependencias y utilidades compartidas para los routers
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
import logging

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-key')
JWT_ALGORITHM = "HS256"

# LLM Config
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Security
security = HTTPBearer()

# Logger
logger = logging.getLogger(__name__)

# Language names mapping
LANGUAGE_NAMES = {
    "es": "español", "en": "English", "fr": "français", "de": "Deutsch",
    "pt": "português", "it": "italiano", "nl": "Nederlands", "pl": "polski",
    "zh": "中文", "ja": "日本語", "ko": "한국어", "ar": "العربية", "ru": "русский"
}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str, org_id: str = None) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "organization_id": org_id,
        "exp": (datetime.now(timezone.utc) + timedelta(days=7)).timestamp()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user data"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
