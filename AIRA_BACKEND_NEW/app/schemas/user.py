"""User schemas"""
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """User base schema"""
    name: str
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    """User create schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    """User in database schema"""
    id: str  # MongoDB ObjectId as string
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserList(BaseModel):
    """User list response"""
    users: list[UserInDB]
    total: int
