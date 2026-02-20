"""
Data models for call information
"""
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel


class Message(BaseModel):
    """Conversation message"""
    role: str  # 'user' or 'agent'
    text: str
    timestamp: str


class UserData(BaseModel):
    """Structured candidate data"""
    candidate_name: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    desired_role: Optional[str] = None
    domain: Optional[str] = None
    notice_period: Optional[str] = None
    current_location: Optional[str] = None
    relocation_willing: Optional[str] = None
    experience_years: Optional[str] = None
    current_ctc_lpa: Optional[str] = None
    expected_ctc_lpa: Optional[str] = None
    email: Optional[str] = None
    communication_score: Optional[str] = None
    technical_score: Optional[str] = None
    overall_score: Optional[str] = None
    interested: Optional[str] = None


class CallSummary(BaseModel):
    """Complete call summary"""
    phone_number: str
    call_sid: str
    start_time: str
    end_time: str
    duration_seconds: float
    transfer_requested: bool
    transfer_number: Optional[str] = None
    structured_data: UserData
    conversation: List[Message]
