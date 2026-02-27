"""User model for MongoDB"""
from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    """User role enum"""
    ADMIN = "admin"
    HR_MANAGER = "hr_manager"
    RECRUITER = "recruiter"


class User(Document):
    """User document model"""
    name: str
    email: EmailStr
    password_hash: Optional[str] = None  # Optional for compatibility with Node backend users
    role: UserRole = UserRole.RECRUITER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        # Don't create indexes automatically - use existing ones from Node backend
        use_state_management = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "role": "recruiter",
                "is_active": True
            }
        }
