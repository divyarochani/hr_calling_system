"""Candidate schemas"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class CandidateBase(BaseModel):
    """Base candidate schema"""
    candidate_name: Optional[str] = None
    phone_number: str
    email: Optional[EmailStr] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    desired_role: Optional[str] = None
    experience_years: Optional[float] = None
    domain: Optional[str] = None
    current_ctc_lpa: Optional[float] = None
    expected_ctc_lpa: Optional[float] = None
    notice_period: Optional[str] = None
    current_location: Optional[str] = None
    relocation_willing: Optional[str] = None
    interested: Optional[str] = None  # "yes" or "no" as string
    call_status: Optional[str] = None
    disconnection_reason: Optional[str] = None
    next_round_availability: Optional[str] = None
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    overall_score: Optional[float] = None
    screening_score: Optional[float] = None
    status: Optional[str] = None
    last_call_id: Optional[str] = None
    notes: Optional[str] = None
    notes: Optional[str] = None


class CandidateCreate(CandidateBase):
    """Schema for creating candidate"""
    pass


class CandidateUpdate(BaseModel):
    """Schema for updating candidate"""
    candidate_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    desired_role: Optional[str] = None
    experience_years: Optional[float] = None
    domain: Optional[str] = None
    current_ctc_lpa: Optional[float] = None
    expected_ctc_lpa: Optional[float] = None
    notice_period: Optional[str] = None
    current_location: Optional[str] = None
    relocation_willing: Optional[str] = None
    interested: Optional[str] = None
    call_status: Optional[str] = None
    disconnection_reason: Optional[str] = None
    next_round_availability: Optional[str] = None
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    overall_score: Optional[float] = None
    screening_score: Optional[float] = None
    status: Optional[str] = None
    last_call_id: Optional[str] = None
    notes: Optional[str] = None


class CandidateInDB(CandidateBase):
    """Schema for candidate in database"""
    id: str  # MongoDB ObjectId as string
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class CandidateWithCalls(CandidateInDB):
    """Candidate with call history"""
    total_calls: int = 0
    last_call_date: Optional[datetime] = None


class CandidateList(BaseModel):
    """List of candidates with pagination"""
    candidates: list[CandidateInDB]
    total: int


class CandidateStats(BaseModel):
    """Dashboard statistics for candidates"""
    total_candidates: int
    candidates_today: int
    screenings_completed: int
    screenings_today: int
    interested_candidates: int
    not_interested_candidates: int
    avg_screening_score: float
    avg_experience_years: float
    avg_current_ctc: float
    avg_expected_ctc: float
