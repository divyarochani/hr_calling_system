"""ElevenLabs Tools endpoints for AI agent function calling"""
import time
from datetime import datetime
from typing import Dict, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field

from app.models.candidate import Candidate
from app.models.call import Call, CallStatus
from app.config import settings
from app.utils.logging import get_logger

router = APIRouter(prefix="/calls/tools", tags=["ElevenLabs Tools"])
logger = get_logger("api.tools")

# Rate limiting for tools
_tool_rate_state: Dict[str, List[float]] = {}
_RATE_WINDOW_SECONDS = 60.0
_RATE_LIMIT = 100  # 100 requests per minute


async def verify_tools_api_key(x_api_key: str = Header(..., alias="x-api-key")) -> str:
    """Verify ElevenLabs tools API key"""
    if not settings.elevenlabs_tools_api_key:
        logger.warning(f"elevenlabs_tools_api_key_not_configured received_key={x_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ElevenLabs tools API key is not configured.",
        )
    
    if x_api_key != settings.elevenlabs_tools_api_key:
        logger.warning(f"invalid_tools_api_key_attempt received_key={x_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ElevenLabs tools API key.",
        )
    
    # Rate limiting
    now = time.time()
    timestamps = _tool_rate_state.get(x_api_key, [])
    cutoff = now - _RATE_WINDOW_SECONDS
    timestamps = [ts for ts in timestamps if ts >= cutoff]
    
    if len(timestamps) >= _RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for ElevenLabs tools API.",
        )
    
    timestamps.append(now)
    _tool_rate_state[x_api_key] = timestamps
    
    return x_api_key


# ============================================================================
# TOOL 1: Get Candidate Info
# ============================================================================

class GetCandidateInfoRequest(BaseModel):
    phone_number: str = Field(..., description="Candidate phone number")


class GetCandidateInfoResponse(BaseModel):
    found: bool
    candidate_id: Optional[str] = None
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    current_company: Optional[str] = None
    experience_years: Optional[float] = None
    domain: Optional[str] = None
    current_ctc_lpa: Optional[float] = None
    expected_ctc_lpa: Optional[float] = None
    notice_period: Optional[str] = None
    interested: Optional[bool] = None
    call_status: Optional[str] = None
    screening_score: Optional[float] = None
    total_calls: int = 0
    message: str


@router.post("/get_candidate_info", response_model=GetCandidateInfoResponse)
async def get_candidate_info(
    payload: GetCandidateInfoRequest,
    api_key: str = Depends(verify_tools_api_key),
) -> GetCandidateInfoResponse:
    """
    Check if candidate exists in database by phone number.
    Returns candidate details if found.
    """
    logger.info(f"tool_get_candidate_info phone={payload.phone_number}")
    
    # Search for candidate by phone number
    candidate = await Candidate.find_one(Candidate.phone_number == payload.phone_number)
    
    if not candidate:
        return GetCandidateInfoResponse(
            found=False,
            message="Candidate not found in database. This is a new candidate."
        )
    
    # Count total calls for this candidate
    total_calls = await Call.find(Call.candidate_id == str(candidate.id)).count()
    
    logger.info(
        f"tool_get_candidate_info_found candidate_id={candidate.id} name={candidate.candidate_name} total_calls={total_calls}"
    )
    
    return GetCandidateInfoResponse(
        found=True,
        candidate_id=str(candidate.id),
        candidate_name=candidate.candidate_name,
        email=candidate.email,
        current_company=candidate.current_company,
        experience_years=candidate.experience_years,
        domain=candidate.domain,
        current_ctc_lpa=candidate.current_ctc_lpa,
        expected_ctc_lpa=candidate.expected_ctc_lpa,
        notice_period=candidate.notice_period,
        interested=candidate.interested,
        call_status=candidate.call_status,
        screening_score=candidate.screening_score,
        total_calls=total_calls,
        message=f"Candidate found: {candidate.candidate_name or 'Unknown'}. This is call #{total_calls + 1}."
    )


# ============================================================================
# TOOL 2: Save Screening Data
# ============================================================================

class SaveScreeningDataRequest(BaseModel):
    phone_number: str = Field(..., description="Candidate phone number")
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    current_company: Optional[str] = None
    experience_years: Optional[float] = None
    domain: Optional[str] = None
    current_ctc_lpa: Optional[float] = None
    expected_ctc_lpa: Optional[float] = None
    notice_period: Optional[str] = None
    interested: Optional[bool] = None
    notes: Optional[str] = None


class SaveScreeningDataResponse(BaseModel):
    success: bool
    candidate_id: str
    created: bool
    message: str


@router.post("/save_screening_data", response_model=SaveScreeningDataResponse)
async def save_screening_data(
    payload: SaveScreeningDataRequest,
    api_key: str = Depends(verify_tools_api_key),
) -> SaveScreeningDataResponse:
    """
    Save or update candidate screening data during the call.
    Creates candidate if doesn't exist, updates if exists.
    """
    logger.info(f"tool_save_screening_data phone={payload.phone_number}")
    
    # Check if candidate exists
    candidate = await Candidate.find_one(Candidate.phone_number == payload.phone_number)
    
    if candidate:
        # Update existing candidate
        if payload.candidate_name:
            candidate.candidate_name = payload.candidate_name
        if payload.email:
            candidate.email = payload.email
        if payload.current_company:
            candidate.current_company = payload.current_company
        if payload.experience_years is not None:
            candidate.experience_years = payload.experience_years
        if payload.domain:
            candidate.domain = payload.domain
        if payload.current_ctc_lpa is not None:
            candidate.current_ctc_lpa = payload.current_ctc_lpa
        if payload.expected_ctc_lpa is not None:
            candidate.expected_ctc_lpa = payload.expected_ctc_lpa
        if payload.notice_period:
            candidate.notice_period = payload.notice_period
        if payload.interested is not None:
            candidate.interested = payload.interested
        if payload.notes:
            if candidate.notes:
                candidate.notes = f"{candidate.notes}\n\n{payload.notes}"
            else:
                candidate.notes = payload.notes
        
        candidate.updated_at = datetime.utcnow()
        await candidate.save()
        
        logger.info(f"tool_save_screening_data_updated candidate_id={candidate.id}")
        
        return SaveScreeningDataResponse(
            success=True,
            candidate_id=str(candidate.id),
            created=False,
            message="Candidate data updated successfully."
        )
    else:
        # Create new candidate
        new_candidate = Candidate(
            phone_number=payload.phone_number,
            candidate_name=payload.candidate_name,
            email=payload.email,
            current_company=payload.current_company,
            experience_years=payload.experience_years,
            domain=payload.domain,
            current_ctc_lpa=payload.current_ctc_lpa,
            expected_ctc_lpa=payload.expected_ctc_lpa,
            notice_period=payload.notice_period,
            interested=payload.interested,
            notes=payload.notes
        )
        
        await new_candidate.insert()
        
        logger.info(f"tool_save_screening_data_created candidate_id={new_candidate.id}")
        
        return SaveScreeningDataResponse(
            success=True,
            candidate_id=str(new_candidate.id),
            created=True,
            message="New candidate created successfully."
        )


# ============================================================================
# TOOL 3: Request Human Transfer
# ============================================================================

# In-memory store for transfer summaries (call_sid -> summary)
# In production, consider using Redis or database
transfer_summaries: Dict[str, str] = {}


class RequestHumanTransferRequest(BaseModel):
    phone_number: str = Field(..., description="Candidate phone number")
    reason: str = Field(..., description="Reason for transfer")
    candidate_name: Optional[str] = None
    urgency: Optional[str] = None
    call_sid: Optional[str] = None


class RequestHumanTransferResponse(BaseModel):
    """
    Response format for ElevenLabs call transfer.
    
    According to ElevenLabs docs, to transfer a call, return:
    { "transfer": "+1234567890" }
    """
    transfer: str = Field(..., description="Phone number to transfer to in E.164 format")
    
    class Config:
        json_schema_extra = {
            "example": {
                "transfer": "+918340552001"
            }
        }


@router.post("/request_human_transfer")
async def request_human_transfer(
    payload: RequestHumanTransferRequest,
    api_key: str = Depends(verify_tools_api_key),
):
    """
    Request transfer to human agent with summary briefing.
    
    Returns transfer number and stores summary for human agent briefing.
    """
    logger.info(
        f"🔄 tool_request_human_transfer phone={payload.phone_number} reason={payload.reason}"
    )
    
    # Find call record
    call = await Call.find(
        Call.phone_number == payload.phone_number,
        Call.status != CallStatus.COMPLETED
    ).sort(-Call.created_at).first_or_none()
    
    call_sid = payload.call_sid or (call.call_sid if call else None)
    
    # Find candidate
    candidate = await Candidate.find_one(Candidate.phone_number == payload.phone_number)
    
    # Build transfer summary for human agent
    from app.utils.data_extraction import build_transfer_summary, extract_from_candidate_model, extract_candidate_info_from_transcript
    
    candidate_data = {}
    
    if candidate:
        # Extract from candidate model
        candidate_data = extract_from_candidate_model(candidate)
        logger.info(f"📋 Using candidate data from database")
    elif call and call.transcript_text:
        # Extract from transcript if available
        candidate_data = extract_candidate_info_from_transcript(call.transcript_text)
        logger.info(f"📋 Extracted candidate data from transcript")
    else:
        # Use basic info from payload
        candidate_data = {
            "candidate_name": payload.candidate_name,
            "domain": None,
            "experience_years": None,
            "current_ctc_lpa": None,
            "expected_ctc_lpa": None,
            "notice_period": None,
            "current_location": None,
        }
        logger.info(f"📋 Using basic candidate data from payload")
    
    # Build summary
    summary = build_transfer_summary(candidate_data, payload.reason)
    
    # Store summary for whisper endpoint (use call_sid or phone_number as key)
    summary_key = call_sid if call_sid else payload.phone_number
    transfer_summaries[summary_key] = summary
    logger.info(f"💾 Stored transfer summary for key: {summary_key}")
    logger.info(f"📝 Summary: {summary}")
    
    # Update call record
    if call:
        call.transfer_requested = True
        call.transfer_number = settings.human_agent_number
        call.escalation_reason = payload.reason
        await call.save()
        logger.info(f"✅ call_marked_for_transfer call_id={call.id}")
    
    # Check if human agent number is configured
    if not settings.human_agent_number:
        logger.error("❌ human_agent_number_not_configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Human agent number is not configured"
        )
    
    logger.info(
        f"✅ tool_request_human_transfer_approved transfer_to={settings.human_agent_number}"
    )
    
    # Return transfer number for ElevenLabs
    response_dict = {
        "transfer": settings.human_agent_number
    }
    
    logger.info(f"📤 tool_request_human_transfer_response: {response_dict}")
    
    return response_dict


# ============================================================================
# TOOL 4: End Call with Summary
# ============================================================================

class EndCallWithSummaryRequest(BaseModel):
    call_sid: str = Field(..., description="Current call SID")
    phone_number: str = Field(..., description="Candidate phone number")
    summary: str = Field(..., description="Call summary")
    interested: Optional[bool] = None
    call_status: str = Field(default="Completed", description="Call status")
    screening_score: Optional[float] = Field(None, ge=0, le=10, description="Screening score 0-10")
    next_round_availability: Optional[str] = None
    disconnection_reason: Optional[str] = None


class EndCallWithSummaryResponse(BaseModel):
    success: bool
    candidate_id: Optional[str] = None
    call_id: Optional[str] = None
    message: str


@router.post("/end_call_with_summary", response_model=EndCallWithSummaryResponse)
async def end_call_with_summary(
    payload: EndCallWithSummaryRequest,
    api_key: str = Depends(verify_tools_api_key),
) -> EndCallWithSummaryResponse:
    """
    End call and save final summary and screening results.
    Updates both call and candidate records.
    """
    logger.info(
        f"tool_end_call_with_summary call_sid={payload.call_sid} phone={payload.phone_number}"
    )
    
    # Update call record
    call = await Call.find_one(Call.call_sid == payload.call_sid)
    
    if call:
        call.summary = payload.summary
        call.status = CallStatus.COMPLETED
        if not call.end_time:
            call.end_time = datetime.utcnow()
            if call.start_time:
                call.duration = int((call.end_time - call.start_time).total_seconds())
        await call.save()
    
    # Update candidate record
    candidate = await Candidate.find_one(Candidate.phone_number == payload.phone_number)
    
    if candidate:
        if payload.interested is not None:
            candidate.interested = payload.interested
        candidate.call_status = payload.call_status
        if payload.screening_score is not None:
            candidate.screening_score = payload.screening_score
        if payload.next_round_availability:
            candidate.next_round_availability = payload.next_round_availability
        if payload.disconnection_reason:
            candidate.disconnection_reason = payload.disconnection_reason
        
        # Append summary to notes
        if candidate.notes:
            candidate.notes = f"{candidate.notes}\n\n[Call Summary - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}]\n{payload.summary}"
        else:
            candidate.notes = f"[Call Summary - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}]\n{payload.summary}"
        
        candidate.updated_at = datetime.utcnow()
        await candidate.save()
    
    logger.info(
        f"tool_end_call_with_summary_saved call_id={call.id if call else None} candidate_id={candidate.id if candidate else None}"
    )
    
    return EndCallWithSummaryResponse(
        success=True,
        candidate_id=str(candidate.id) if candidate else None,
        call_id=str(call.id) if call else None,
        message="Call ended and summary saved successfully."
    )


# ============================================================================
# TOOL 5: Schedule Callback
# ============================================================================

class ScheduleCallbackRequest(BaseModel):
    phone_number: str = Field(..., description="Candidate phone number")
    callback_datetime: str = Field(..., description="Callback date and time (ISO format)")
    reason: str = Field(..., description="Reason for callback")


class ScheduleCallbackResponse(BaseModel):
    success: bool
    message: str
    scheduled_time: str


@router.post("/schedule_callback", response_model=ScheduleCallbackResponse)
async def schedule_callback(
    payload: ScheduleCallbackRequest,
    api_key: str = Depends(verify_tools_api_key),
) -> ScheduleCallbackResponse:
    """
    Schedule a callback for the candidate.
    Updates candidate record with callback information.
    """
    logger.info(
        f"tool_schedule_callback phone={payload.phone_number} callback_time={payload.callback_datetime}"
    )
    
    # Find or create candidate
    candidate = await Candidate.find_one(Candidate.phone_number == payload.phone_number)
    
    if candidate:
        candidate.call_status = "Rescheduled"
        candidate.next_round_availability = payload.callback_datetime
        
        # Add to notes
        callback_note = f"[Callback Scheduled - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}]\nTime: {payload.callback_datetime}\nReason: {payload.reason}"
        if candidate.notes:
            candidate.notes = f"{candidate.notes}\n\n{callback_note}"
        else:
            candidate.notes = callback_note
        
        candidate.updated_at = datetime.utcnow()
        await candidate.save()
    
    logger.info(f"tool_schedule_callback_saved candidate_id={candidate.id if candidate else None}")
    
    return ScheduleCallbackResponse(
        success=True,
        message=f"Callback scheduled for {payload.callback_datetime}",
        scheduled_time=payload.callback_datetime
    )


# ============================================================================
# TOOL 6: Get System Date
# ============================================================================

class GetSystemDateResponse(BaseModel):
    success: bool
    current_date: str
    current_time: str
    current_datetime: str
    timezone: str


@router.post("/get_system_date", response_model=GetSystemDateResponse)
async def get_system_date(
    api_key: str = Depends(verify_tools_api_key),
) -> GetSystemDateResponse:
    """
    Get current system date and time.
    Useful for AI to know current date when scheduling callbacks.
    """
    now = datetime.utcnow()
    
    logger.info("tool_get_system_date")
    
    return GetSystemDateResponse(
        success=True,
        current_date=now.strftime("%Y-%m-%d"),
        current_time=now.strftime("%H:%M:%S"),
        current_datetime=now.isoformat(),
        timezone="UTC"
    )


# ============================================================================
# TEST ENDPOINT: Verify Transfer Response Format
# ============================================================================

@router.get("/test_transfer_response")
async def test_transfer_response():
    """
    Test endpoint to verify the transfer response format.
    This helps debug what ElevenLabs receives.
    """
    response = RequestHumanTransferResponse(
        transfer=settings.human_agent_number or "+918340552001"
    )
    
    return {
        "response_object": response.model_dump(exclude_none=True),
        "response_json": response.model_dump_json(exclude_none=True),
        "configured_number": settings.human_agent_number,
        "note": "This is what ElevenLabs receives when transfer tool is called"
    }



# ============================================================================
# WHISPER ENDPOINT: Brief Human Agent Before Transfer
# ============================================================================

@router.get("/whisper")
@router.post("/whisper")
async def whisper_to_human_agent(call_sid: Optional[str] = None, phone_number: Optional[str] = None):
    """
    Whisper endpoint to brief human agent before connecting transferred call.
    
    This endpoint is called by ElevenLabs (or Twilio) when a human agent answers
    a transferred call. It speaks a summary of the candidate details to the human
    agent before connecting them to the candidate.
    
    Query params:
    - call_sid: Original call SID
    - phone_number: Candidate phone number
    
    Returns: Plain text summary to be spoken to human agent
    """
    logger.info(f"🎙️ whisper_endpoint_called call_sid={call_sid} phone={phone_number}")
    
    # Try to find summary by call_sid or phone_number
    summary_key = call_sid or phone_number
    summary = None
    
    if summary_key and summary_key in transfer_summaries:
        summary = transfer_summaries.pop(summary_key)  # Remove after use
        logger.info(f"✅ Found transfer summary for key: {summary_key}")
    else:
        # Default summary if not found
        summary = "Incoming transfer from AIRA HR assistant. Candidate details not available."
        logger.warning(f"⚠️ No transfer summary found for key: {summary_key}")
    
    logger.info(f"🔊 Whisper content: {summary}")
    
    # Return plain text (will be spoken by TTS)
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=summary)


@router.get("/transfer_summaries")
async def get_transfer_summaries(api_key: str = Depends(verify_tools_api_key)):
    """
    Debug endpoint to view stored transfer summaries.
    """
    return {
        "count": len(transfer_summaries),
        "summaries": transfer_summaries
    }



# ============================================================================
# TOOL: End Call (for auto-disconnect)
# ============================================================================

class EndCallRequest(BaseModel):
    phone_number: str = Field(..., description="Candidate phone number")
    reason: str = Field(default="Call completed", description="Reason for ending call")
    call_sid: Optional[str] = None


class EndCallResponse(BaseModel):
    success: bool
    message: str
    action: str = "end_call"


@router.post("/end_call", response_model=EndCallResponse)
async def end_call(
    payload: EndCallRequest,
    api_key: str = Depends(verify_tools_api_key),
):
    """
    End the current call.
    
    This tool should be called by the AI agent when the conversation is complete
    and the call should be disconnected.
    
    According to ElevenLabs docs, returning {"action": "end_call"} will end the call.
    """
    logger.info(f"🔚 tool_end_call phone={payload.phone_number} reason={payload.reason}")
    
    # Find and update call record
    call = await Call.find(
        Call.phone_number == payload.phone_number,
        Call.status != CallStatus.COMPLETED
    ).sort(-Call.created_at).first_or_none()
    
    if call:
        call.status = CallStatus.COMPLETED
        call.end_time = datetime.utcnow()
        if call.start_time:
            call.duration = int((call.end_time - call.start_time).total_seconds())
        await call.save()
        logger.info(f"✅ Call marked as completed: {call.id}")
    
    logger.info(f"✅ tool_end_call_success")
    
    # Return action to end call
    return EndCallResponse(
        success=True,
        message="Call will be ended",
        action="end_call"
    )
