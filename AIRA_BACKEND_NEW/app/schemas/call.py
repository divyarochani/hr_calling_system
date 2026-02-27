"""Call schemas"""
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.call import CallType, CallStatus


class CallBase(BaseModel):
    """Call base schema"""
    phone_number: str


class CallCreate(CallBase):
    """Call create schema"""
    pass


class CallUpdate(BaseModel):
    """Call update schema"""
    status: Optional[CallStatus] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    transfer_requested: Optional[bool] = None
    transfer_number: Optional[str] = None
    recording_url: Optional[str] = None
    transcript_text: Optional[str] = None
    summary: Optional[str] = None


class CallInDB(BaseModel):
    """Call in database schema"""
    id: str  # MongoDB ObjectId as string
    call_sid: str
    phone_number: str
    candidate_id: Optional[str]  # MongoDB ObjectId as string
    call_type: CallType
    status: CallStatus
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[int]  # Can be None or int
    transfer_requested: bool
    transfer_number: Optional[str]
    recording_url: Optional[str]
    transcript_url: Optional[str]
    transcript_text: Optional[str]
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CallList(BaseModel):
    """Call list response"""
    calls: list[CallInDB]
    total: int


class CallInitiateRequest(BaseModel):
    """Call initiation request"""
    phone_number: str


class CallInitiateResponse(BaseModel):
    """Call initiation response"""
    success: bool
    message: str
    call_sid: str
    phone_number: str


class CallStatusUpdate(BaseModel):
    """Call status update from ElevenLabs"""
    call_sid: str
    status: str
    phone_number: Optional[str] = None
