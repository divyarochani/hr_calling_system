"""Notification model for MongoDB"""
from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Notification(Document):
    """Notification document model"""
    type: str  # missed_call, system, alert
    title: str
    message: str
    call_id: Optional[str] = None
    candidate_id: Optional[str] = None
    priority: str = "normal"  # low, normal, high
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notifications"
        # Don't create indexes automatically - use existing ones from Node backend
        use_state_management = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "missed_call",
                "title": "Missed Call",
                "message": "Missed call from +919876543210",
                "priority": "high",
                "read": False
            }
        }
