"""Candidate model for MongoDB"""
from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr, Field, field_validator


class Candidate(Document):
    """Candidate document model"""
    candidate_name: Optional[str] = Field(None, alias="candidateName")
    phone_number: str = Field(default="unknown", alias="phoneNumber")  # Default for missing values
    email: Optional[EmailStr] = None
    
    # Professional details
    current_company: Optional[str] = Field(None, alias="currentCompany")
    current_role: Optional[str] = Field(None, alias="currentRole")
    desired_role: Optional[str] = Field(None, alias="desiredRole")
    experience_years: Optional[float] = Field(None, alias="experienceYears")
    domain: Optional[str] = None
    current_ctc_lpa: Optional[float] = Field(None, alias="currentCtcLpa")
    expected_ctc_lpa: Optional[float] = Field(None, alias="expectedCtcLpa")
    notice_period: Optional[str] = Field(None, alias="noticePeriod")
    current_location: Optional[str] = Field(None, alias="currentLocation")
    relocation_willing: Optional[str] = Field(None, alias="relocationWilling")
    
    # Screening results
    interested: Optional[str] = None  # "yes" or "no" as string in MongoDB
    call_status: Optional[str] = Field(None, alias="callStatus")
    disconnection_reason: Optional[str] = Field(None, alias="disconnectionReason")
    next_round_availability: Optional[str] = Field(None, alias="nextRoundAvailability")
    communication_score: Optional[float] = Field(None, alias="communicationScore")
    technical_score: Optional[float] = Field(None, alias="technicalScore")
    overall_score: Optional[float] = Field(None, alias="overallScore")
    screening_score: Optional[float] = Field(None, alias="screeningScore")
    
    # Status and tracking
    status: Optional[str] = None
    last_call_id: Optional[str] = Field(None, alias="lastCallId")
    
    # Additional info
    notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")
    
    @field_validator('interested', mode='before')
    @classmethod
    def convert_interested_to_str(cls, v):
        """Convert boolean interested to string"""
        if v is None:
            return None
        if isinstance(v, bool):
            return "yes" if v else "no"
        if isinstance(v, str):
            return v.lower()
        return None
    
    @field_validator('phone_number', mode='before')
    @classmethod
    def validate_phone_number(cls, v):
        """Ensure phone number exists"""
        if v is None or v == '':
            return "unknown"
        return v
    
    @field_validator('last_call_id', mode='before')
    @classmethod
    def convert_last_call_id_to_str(cls, v):
        """Convert ObjectId to string if needed"""
        if v is None:
            return None
        from beanie import PydanticObjectId
        if isinstance(v, PydanticObjectId):
            return str(v)
        if hasattr(v, '__class__') and v.__class__.__name__ == 'ObjectId':
            return str(v)
        if isinstance(v, str):
            return v
        return str(v)
    
    @field_validator('experience_years', 'current_ctc_lpa', 'expected_ctc_lpa', 
                     'communication_score', 'technical_score', 'overall_score', 'screening_score', mode='before')
    @classmethod
    def convert_numeric_fields(cls, v):
        """Convert string numbers to float, handle ranges"""
        if v is None or v == '' or v == 'N/A':
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            # Handle ranges like "3.5-4" - take the first value
            if '-' in v:
                try:
                    return float(v.split('-')[0].strip())
                except (ValueError, IndexError):
                    return None
            # Handle regular string numbers
            try:
                return float(v)
            except ValueError:
                return None
        return None
    
    class Settings:
        name = "candidates"
        use_state_management = True
        # Allow population by field name or alias
        populate_by_name = True
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "candidate_name": "John Doe",
                "phone_number": "+919876543210",
                "email": "john@example.com",
                "current_company": "Tech Corp",
                "experience_years": 5.5,
                "current_ctc_lpa": 12.0,
                "expected_ctc_lpa": 18.0
            }
        }
