"""
Router de Autenticación y Equipo
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
import uuid

from .dependencies import (
    db, hash_password, verify_password, create_token, 
    get_current_user, logger
)
from .models import (
    UserCreate, UserLogin, UserResponse, 
    TeamMemberCreate, TeamMemberResponse, OrganizationStats
)
from typing import List

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    org_id = str(uuid.uuid4())
    await db.organizations.insert_one({
        "id": org_id,
        "name": user_data.company or f"{user_data.name}'s Organization",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "plan": "free"
    })
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "company": user_data.company,
        "organization_id": org_id,
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, user_data.email, org_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "company": user_data.company,
            "role": "admin",
            "organization_id": org_id,
            "created_at": user["created_at"]
        }
    }

@router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user.get("organization_id"))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "company": user.get("company"),
            "role": user.get("role", "admin"),
            "organization_id": user.get("organization_id"),
            "created_at": user["created_at"]
        }
    }

@router.get("/auth/me", response_model=UserResponse)
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

@router.get("/team/members", response_model=List[TeamMemberResponse])
async def get_team_members(current_user: dict = Depends(get_current_user)):
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

@router.post("/team/invite", response_model=TeamMemberResponse)
async def invite_team_member(member: TeamMemberCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can invite team members")
    
    existing = await db.users.find_one({"email": member.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    member_id = str(uuid.uuid4())
    temp_password = str(uuid.uuid4())[:8]
    
    new_member = {
        "id": member_id,
        "email": member.email,
        "password": hash_password(temp_password),
        "name": member.name,
        "role": member.role,
        "organization_id": current_user.get("organization_id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "invited_by": current_user["id"]
    }
    await db.users.insert_one(new_member)
    
    return TeamMemberResponse(
        id=member_id,
        email=member.email,
        name=member.name,
        role=member.role,
        member_status="pending",
        created_at=new_member["created_at"]
    )

@router.delete("/team/members/{member_id}")
async def remove_team_member(member_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can remove team members")
    
    if member_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    
    result = await db.users.delete_one({
        "id": member_id,
        "organization_id": current_user.get("organization_id")
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"message": "Team member removed"}

@router.get("/team/stats", response_model=OrganizationStats)
async def get_organization_stats(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("organization_id")
    
    total_searches = await db.taric_searches.count_documents({"organization_id": org_id})
    
    from datetime import datetime
    first_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    searches_this_month = await db.taric_searches.count_documents({
        "organization_id": org_id,
        "created_at": {"$gte": first_of_month.isoformat()}
    })
    
    team_count = await db.users.count_documents({"organization_id": org_id})
    
    return OrganizationStats(
        total_searches=total_searches,
        searches_this_month=searches_this_month,
        team_members=team_count,
        saved_operations=total_searches
    )
