"""Call model for MongoDB"""
from datetime import datetime
from typing import Optional, Any
from enum import Enum
from beanie import Document, Link, PydanticObjectId
from pydantic import Field, field_validator


class CallStatus(str, Enum):
    """Call status enum"""
    INITIATED = "initiated"
    RINGING = "ringing"
    CONNECTED = "connected"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    MISSED = "missed"
    FAILED = "failed"


class CallType(str, Enum):
    """Call type enum"""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class Call(Document):
    """Call document model"""
    call_sid: str = Field(..., alias="callSid")
    phone_number: str = Field(..., alias="phoneNumber")
    candidate_id: Optional[str] = Field(None, alias="candidateId")
    call_type: CallType = Field(CallType.OUTBOUND, alias="callType")
    status: CallStatus = CallStatus.INITIATED
    start_time: datetime = Field(default_factory=datetime.utcnow, alias="startTime")
    end_time: Optional[datetime] = Field(None, alias="endTime")
    duration: Optional[int] = None  # in seconds
    
    @field_validator('duration', mode='before')
    @classmethod
    def convert_duration_to_int(cls, v: Any) -> Optional[int]:
        """Convert duration to integer if it's a float"""
        if v is None:
            return None
        if isinstance(v, float):
            return int(v)
        if isinstance(v, int):
            return v
        try:
            return int(float(v))
        except (ValueError, TypeError):
            return None
    transfer_requested: bool = Field(False, alias="transferRequested")
    transfer_number: Optional[str] = Field(None, alias="transferNumber")
    escalation_reason: Optional[str] = Field(None, alias="escalationReason")
    recording_url: Optional[str] = Field(None, alias="recordingUrl")
    transcript_url: Optional[str] = Field(None, alias="transcriptUrl")
    transcript_text: Optional[str] = Field(None, alias="transcriptText")
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")
    
    @field_validator('candidate_id', mode='before')
    @classmethod
    def convert_objectid_to_str(cls, v: Any) -> Optional[str]:
        """Convert ObjectId to string if needed"""
        if v is None:
            return None
        # Handle Beanie PydanticObjectId
        if isinstance(v, PydanticObjectId):
            return str(v)
        # Handle raw bson ObjectId
        if hasattr(v, '__class__') and v.__class__.__name__ == 'ObjectId':
            return str(v)
        # Already a string
        if isinstance(v, str):
            return v
        # Try to convert to string
        return str(v)
    
    class Settings:
        name = "calls"
        # Don't create indexes automatically - use existing ones from Node backend
        use_state_management = True
        # Allow population by field name or alias
        populate_by_name = True
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "call_sid": "convai_abc123",
                "phone_number": "+919876543210",
                "call_type": "outbound",
                "status": "completed",
                "duration": 180
            }
        }
