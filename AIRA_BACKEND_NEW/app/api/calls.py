"""Call management endpoints"""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.models.call import Call, CallStatus, CallType
from app.models.user import User
from app.schemas.call import (
    CallCreate, CallUpdate, CallInDB, CallList,
    CallInitiateRequest, CallInitiateResponse, CallStatusUpdate
)
from app.utils.auth import get_current_active_user
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter(prefix="/calls", tags=["Calls"])


def call_to_dict(call: Call) -> dict:
    """Convert Call model to CallInDB dict with proper enum serialization"""
    return {
        "id": str(call.id),
        "call_sid": call.call_sid,
        "phone_number": call.phone_number,
        "candidate_id": str(call.candidate_id) if call.candidate_id else None,
        "call_type": call.call_type.value if call.call_type else None,  # Convert enum to string
        "status": call.status.value if call.status else None,  # Convert enum to string
        "start_time": call.start_time,
        "end_time": call.end_time,
        "duration": call.duration,
        "transfer_requested": call.transfer_requested,
        "transfer_number": call.transfer_number,
        "recording_url": call.recording_url,
        "transcript_url": call.transcript_url,
        "transcript_text": call.transcript_text,
        "summary": call.summary,
        "created_at": call.created_at,
        "updated_at": call.updated_at
    }


@router.post("/initiate", response_model=CallInitiateResponse)
async def initiate_call(
    request: CallInitiateRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Initiate outbound call via ElevenLabs"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"📞 Initiating call to {request.phone_number}")
    
    # Generate unique call SID
    call_sid = f"convai_{uuid.uuid4().hex}"
    logger.info(f"Generated call_sid: {call_sid}")
    
    # Create call record
    new_call = Call(
        call_sid=call_sid,
        phone_number=request.phone_number,
        call_type=CallType.OUTBOUND,
        status=CallStatus.INITIATED,
        start_time=datetime.utcnow()
    )
    
    try:
        await new_call.insert()
        logger.info(f"✅ Call record saved to MongoDB: {new_call.id}")
    except Exception as e:
        logger.error(f"❌ Failed to save call to MongoDB: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save call record: {str(e)}"
        )
    
    # Emit Socket.IO event for call initiated
    try:
        from app.services.socketio_service import emit_call_status
        call_dict = {
            'id': str(new_call.id),
            'call_sid': new_call.call_sid,
            'phone_number': new_call.phone_number,
            'candidate_id': None,
            'status': new_call.status.value,  # Get string value from enum
            'call_type': new_call.call_type.value,  # Get string value from enum
            'start_time': new_call.start_time.isoformat() if new_call.start_time else None,
            'duration': None
        }
        await emit_call_status(call_dict)
        logger.info(f"✅ socketio_call_initiated_emitted call_sid={call_sid} status={call_dict['status']}")
    except Exception as e:
        logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)
    
    try:
        # Initiate call via ElevenLabs
        logger.info(f"Calling ElevenLabs API...")
        response = await elevenlabs_service.initiate_call(
            phone_number=request.phone_number,
            call_sid=call_sid
        )
        logger.info(f"✅ ElevenLabs call initiated successfully")
        
        # Update status to ringing
        new_call.status = CallStatus.RINGING
        await new_call.save()
        
        # Emit ringing status
        try:
            call_dict['status'] = CallStatus.RINGING.value  # Get string value from enum
            await emit_call_status(call_dict)
            logger.info(f"✅ socketio_call_ringing_emitted call_sid={call_sid} status={call_dict['status']}")
        except Exception as e:
            logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)
        
        return CallInitiateResponse(
            success=True,
            message="Call initiated successfully",
            call_sid=call_sid,
            phone_number=request.phone_number
        )
    except Exception as e:
        logger.error(f"❌ ElevenLabs API error: {str(e)}", exc_info=True)
        # Update call status to failed
        new_call.status = CallStatus.FAILED
        await new_call.save()
        
        # Emit failed status
        try:
            call_dict['status'] = CallStatus.FAILED.value  # Get string value from enum
            await emit_call_status(call_dict)
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate call: {str(e)}"
        )


@router.get("/", response_model=CallList)
async def get_calls(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[CallStatus] = Query(None, alias="status"),
    phone_number: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get all calls with optional filters"""
    # Build query
    query_filters = []
    
    if status_filter:
        query_filters.append(Call.status == status_filter)
    if phone_number:
        query_filters.append(Call.phone_number == phone_number)
    
    # Cap limit at 10000 to prevent excessive queries
    limit = min(limit, 10000)
    
    # Get total count
    if query_filters:
        total = await Call.find(*query_filters).count()
        calls = await Call.find(*query_filters).skip(skip).limit(limit).sort(-Call.start_time).to_list()
    else:
        total = await Call.find_all().count()
        calls = await Call.find_all().skip(skip).limit(limit).sort(-Call.start_time).to_list()
    
    return CallList(
        calls=[CallInDB(**call_to_dict(call)) for call in calls],
        total=total
    )


@router.get("/active", response_model=CallList)
async def get_active_calls(
    current_user: User = Depends(get_current_active_user)
):
    """Get active calls"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Query for active call statuses
        active_statuses = [
            CallStatus.INITIATED.value,
            CallStatus.RINGING.value,
            CallStatus.CONNECTED.value,
            CallStatus.ONGOING.value
        ]
        
        calls = await Call.find(
            {"status": {"$in": active_statuses}}
        ).sort(-Call.start_time).to_list()
        
        logger.info(f"Found {len(calls)} active calls")
        
        return CallList(
            calls=[CallInDB(**call_to_dict(call)) for call in calls],
            total=len(calls)
        )
    except Exception as e:
        logger.error(f"Error fetching active calls: {str(e)}", exc_info=True)
        # Return empty list instead of crashing
        return CallList(calls=[], total=0)


@router.get("/{call_id}", response_model=CallInDB)
async def get_call(
    call_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get call by ID"""
    from beanie import PydanticObjectId
    
    try:
        call = await Call.get(PydanticObjectId(call_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    return CallInDB(**call_to_dict(call))


@router.post("/status", status_code=status.HTTP_200_OK)
async def update_call_status(
    status_update: CallStatusUpdate
):
    """
    Update call status (called by ElevenLabs webhooks or internal services)
    No authentication required for webhooks
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Find call by call_sid
    call = await Call.find_one(Call.call_sid == status_update.call_sid)
    
    if not call:
        # Create new call record if doesn't exist
        call = Call(
            call_sid=status_update.call_sid,
            phone_number=status_update.phone_number or "unknown",
            call_type=CallType.OUTBOUND,
            status=CallStatus.INITIATED,
            start_time=datetime.utcnow()
        )
        await call.insert()
    
    # Map status string to enum
    status_map = {
        'initiated': CallStatus.INITIATED,
        'ringing': CallStatus.RINGING,
        'connected': CallStatus.CONNECTED,
        'in-progress': CallStatus.CONNECTED,
        'ongoing': CallStatus.ONGOING,
        'completed': CallStatus.COMPLETED,
        'busy': CallStatus.MISSED,
        'no-answer': CallStatus.MISSED,
        'failed': CallStatus.FAILED,
        'canceled': CallStatus.FAILED
    }
    
    new_status = status_map.get(status_update.status.lower(), CallStatus.ONGOING)
    call.status = new_status
    
    # Update end time and duration for completed calls
    if new_status in [CallStatus.COMPLETED, CallStatus.MISSED, CallStatus.FAILED]:
        if not call.end_time:
            call.end_time = datetime.utcnow()
            if call.start_time:
                call.duration = int((call.end_time - call.start_time).total_seconds())
    
    await call.save()
    
    # Emit Socket.IO event
    try:
        from app.services.socketio_service import emit_call_status
        call_dict = {
            'id': str(call.id),
            'call_sid': call.call_sid,
            'phone_number': call.phone_number,
            'candidate_id': str(call.candidate_id) if call.candidate_id else None,
            'status': call.status.value,  # Get string value from enum
            'call_type': call.call_type.value,  # Get string value from enum
            'start_time': call.start_time.isoformat() if call.start_time else None,
            'end_time': call.end_time.isoformat() if call.end_time else None,
            'duration': call.duration
        }
        await emit_call_status(call_dict)
        logger.info(f"✅ socketio_call_status_emitted call_sid={call.call_sid} status={call_dict['status']}")
    except Exception as e:
        logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)
    
    return {"success": True, "message": "Call status updated"}


@router.post("/check-completion", status_code=status.HTTP_200_OK)
async def check_call_completion(
    request: dict
):
    """
    Check if agent's message indicates call should end
    Used by ElevenLabs webhook to detect completion phrases
    """
    import logging
    from app.utils.completion_detection import should_end_call
    
    logger = logging.getLogger(__name__)
    
    agent_text = request.get("agent_text", "")
    call_sid = request.get("call_sid", "")
    
    if should_end_call(agent_text):
        logger.info(f"🔔 Call completion detected for {call_sid}: {agent_text[:100]}")
        
        # Update call status to completed
        if call_sid:
            call = await Call.find_one(Call.call_sid == call_sid)
            if call:
                call.status = CallStatus.COMPLETED
                call.end_time = datetime.utcnow()
                if call.start_time:
                    call.duration = int((call.end_time - call.start_time).total_seconds())
                await call.save()
                
                # Emit Socket.IO event
                try:
                    from app.services.socketio_service import emit_call_completed
                    call_dict = {
                        'id': str(call.id),
                        'call_sid': call.call_sid,
                        'phone_number': call.phone_number,
                        'candidate_id': str(call.candidate_id) if call.candidate_id else None,
                        'status': call.status.value,
                        'call_type': call.call_type.value,
                        'start_time': call.start_time.isoformat() if call.start_time else None,
                        'end_time': call.end_time.isoformat() if call.end_time else None,
                        'duration': call.duration
                    }
                    await emit_call_completed(call_dict)
                    logger.info(f"✅ Call auto-completed: {call_sid}")
                except Exception as e:
                    logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)
        
        return {
            "success": True,
            "should_end": True,
            "message": "Call completion detected"
        }
    
    return {
        "success": True,
        "should_end": False,
        "message": "Call continues"
    }


@router.get("/{call_id}/recording-url")
async def get_call_recording_url(
    call_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get SAS URL for call recording with time-limited access
    Returns a temporary URL that expires in 15 minutes
    """
    import logging
    from beanie import PydanticObjectId
    from app.services.blob_service import blob_service
    
    logger = logging.getLogger(__name__)
    logger.info(f"get_call_recording_url call_id={call_id} user={current_user.email}")
    
    try:
        call = await Call.get(PydanticObjectId(call_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    if not call or not call.recording_url:
        logger.warning(f"get_call_recording_url_not_found call_id={call_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    # If blob service is configured, generate SAS URL
    if blob_service.client:
        try:
            sas_url = blob_service.generate_sas_from_blob_url(
                call.recording_url,
                expiry_minutes=15
            )
            
            if sas_url:
                logger.info(f"get_call_recording_url_success call_id={call_id}")
                return {"recording_url": sas_url}
            else:
                logger.warning(f"sas_generation_failed call_id={call_id}, returning direct URL")
                return {"recording_url": call.recording_url}
        except Exception as e:
            logger.error(f"sas_generation_error: {str(e)}")
            return {"recording_url": call.recording_url}
    else:
        # No blob service, return direct URL
        return {"recording_url": call.recording_url}


@router.put("/{call_id}", response_model=CallInDB)
async def update_call(
    call_id: str,
    call_update: CallUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update call details"""
    from beanie import PydanticObjectId
    
    try:
        call = await Call.get(PydanticObjectId(call_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    # Update fields
    update_data = call_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call, field, value)
    
    call.updated_at = datetime.utcnow()
    await call.save()
    
    return CallInDB(**call_to_dict(call))
