"""Pydantic schemas"""
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, UserResponse
from app.schemas.user import UserCreate, UserUpdate, UserInDB
from app.schemas.call import CallCreate, CallUpdate, CallInDB, CallList, CallInitiateRequest, CallInitiateResponse
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateInDB, CandidateList, CandidateStats

__all__ = [
    "LoginRequest",
    "LoginResponse", 
    "RegisterRequest",
    "UserResponse",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "CallCreate",
    "CallUpdate",
    "CallInDB",
    "CallList",
    "CallInitiateRequest",
    "CallInitiateResponse",
    "CandidateCreate",
    "CandidateUpdate",
    "CandidateInDB",
    "CandidateList",
    "CandidateStats",
]
