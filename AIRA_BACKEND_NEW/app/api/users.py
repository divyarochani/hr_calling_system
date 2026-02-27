"""User management endpoints"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInDB
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/", response_model=List[UserInDB])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """Get all users"""
    users = await User.find_all().skip(skip).limit(limit).to_list()
    return [UserInDB(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    ) for user in users]


@router.post("/", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create new user"""
    # Check if user exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        role=user_data.role
    )
    
    await user.insert()
    
    return UserInDB(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.get("/{user_id}", response_model=UserInDB)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get user by ID"""
    from beanie import PydanticObjectId
    
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserInDB(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update user"""
    from beanie import PydanticObjectId
    from datetime import datetime
    
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["password_hash"] = pwd_context.hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return UserInDB(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete user"""
    from beanie import PydanticObjectId
    
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await user.delete()
    return None


@router.post("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Toggle user active status"""
    from beanie import PydanticObjectId
    from datetime import datetime
    
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Toggle status
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "is_active": user.is_active
    }


@router.get("/permissions/defaults/{role}")
async def get_default_permissions(
    role: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get default permissions for a role"""
    # Define default permissions for each role
    default_permissions = {
        "admin": {
            "User Management": ["View Users", "Add Users", "Edit Users", "Delete Users"],
            "Call Management": ["Make Calls", "View Call History", "Access Recordings", "Transfer Calls"],
            "AI Features": ["View AI Logs", "Configure AI", "Monitor AI Performance"],
            "Candidate Management": ["View Candidates", "Screen Candidates", "Schedule Interviews"],
            "System Settings": ["View Settings", "Modify Settings", "System Monitoring", "Deployment"],
        },
        "hr_manager": {
            "User Management": ["View Users", "Add Users", "Edit Users"],
            "Call Management": ["Make Calls", "View Call History", "Access Recordings", "Transfer Calls"],
            "AI Features": ["View AI Logs", "Monitor AI Performance"],
            "Candidate Management": ["View Candidates", "Screen Candidates", "Schedule Interviews"],
            "System Settings": ["View Settings"],
        },
        "recruiter": {
            "User Management": ["View Users"],
            "Call Management": ["Make Calls", "View Call History", "Access Recordings"],
            "AI Features": ["View AI Logs"],
            "Candidate Management": ["View Candidates", "Screen Candidates", "Schedule Interviews"],
            "System Settings": [],
        }
    }
    
    permissions = default_permissions.get(role, {})
    
    return {
        "permissions": permissions,
        "role": role
    }


@router.put("/{user_id}/permissions")
async def update_user_permissions(
    user_id: str,
    permissions: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Update user permissions"""
    from beanie import PydanticObjectId
    from datetime import datetime
    
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update permissions
    user.permissions = permissions
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {
        "message": "Permissions updated successfully",
        "permissions": user.permissions
    }

