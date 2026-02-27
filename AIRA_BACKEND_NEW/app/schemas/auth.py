"""Authentication schemas"""
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserResponse(BaseModel):
    """User response"""
    id: str  # MongoDB uses string IDs
    name: str
    email: str
    role: UserRole
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterRequest(BaseModel):
    """Register request"""
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.RECRUITER
