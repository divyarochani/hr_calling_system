"""ElevenLabs event log model for deduplication"""
from datetime import datetime
from beanie import Document
from pydantic import Field


class ElevenLabsEventLog(Document):
    """Log of processed ElevenLabs webhook events to prevent duplicates"""
    call_sid: str = Field(..., alias="callSid")
    event_type: str = Field(..., alias="eventType")
    event_timestamp: int = Field(..., alias="eventTimestamp")
    status: str = "processed"
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    
    class Settings:
        name = "elevenlabs_event_logs"
        # Create unique index on call_sid + event_type + event_timestamp
        indexes = [
            [
                ("callSid", 1),
                ("eventType", 1),
                ("eventTimestamp", 1),
            ],
        ]
    
    class Config:
        populate_by_name = True
