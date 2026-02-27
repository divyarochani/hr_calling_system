"""ElevenLabs webhook endpoints for conversation events"""
import logging
import time
import hmac
import hashlib
import httpx
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, HTTPException, Header

from app.config import settings
from app.models.call import Call, CallStatus
from app.models.candidate import Candidate
from app.models.elevenlabs_event_log import ElevenLabsEventLog
from app.services.blob_service import blob_service
from app.services.socketio_service import emit_call_status, emit_call_completed, emit_candidate_updated

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def verify_elevenlabs_signature(
    payload_str: str,
    signature_header: str,
    secret: str,
    tolerance_seconds: int = 300
) -> bool:
    """
    Verify ElevenLabs webhook signature
    Format: t=<timestamp>,v0=<signature>
    """
    if not secret or not signature_header:
        return True  # Skip verification if not configured
    
    timestamp: Optional[str] = None
    signature: Optional[str] = None
    
    # Parse signature header
    for part in signature_header.split(","):
        part = part.strip()
        if part.startswith("t="):
            timestamp = part[2:].strip()
        elif part.startswith("v0="):
            signature = part[3:].strip()
    
    if not timestamp or not signature:
        return False
    
    # Check timestamp tolerance
    try:
        ts = int(timestamp)
    except ValueError:
        return False
    
    now_ts = int(time.time())
    if abs(now_ts - ts) > tolerance_seconds:
        return False
    
    # Compute expected signature
    signed_payload = f"{timestamp}.{payload_str}".encode("utf-8")
    secret_clean = str(secret).strip()
    
    expected = hmac.new(
        secret_clean.encode("utf-8"),
        signed_payload,
        hashlib.sha256
    ).hexdigest()
    
    provided = signature.strip().lower()
    if provided.startswith("0x"):
        provided = provided[2:]
    
    # Compare signatures
    if hmac.compare_digest(expected, provided):
        return True
    
    # Try without wsec_ prefix if present
    if secret_clean.startswith("wsec_"):
        alt_secret = secret_clean.removeprefix("wsec_")
        alt_expected = hmac.new(
            alt_secret.encode("utf-8"),
            signed_payload,
            hashlib.sha256
        ).hexdigest()
        if hmac.compare_digest(alt_expected, provided):
            return True
    
    return False


@router.post("/elevenlabs/conversation")
async def elevenlabs_conversation_webhook(
    request: Request,
    x_el_signature: Optional[str] = Header(None, alias="X-EL-Signature"),
    x_el_timestamp: Optional[str] = Header(None, alias="X-EL-Timestamp")
):
    """
    Webhook endpoint for ElevenLabs conversation events
    
    Events received:
    - call_started
    - post_call_transcription (contains transcript + summary)
    - conversation.ended
    """
    # Get raw body for signature verification
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")
    
    # Verify signature if configured
    if settings.elevenlabs_webhook_secret and x_el_signature:
        if not verify_elevenlabs_signature(
            body_str,
            x_el_signature,
            settings.elevenlabs_webhook_secret
        ):
            logger.error("elevenlabs_webhook_invalid_signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
    elif settings.elevenlabs_webhook_secret and not x_el_signature:
        logger.warning("elevenlabs_webhook_no_signature_but_configured")
        # Allow webhook to proceed even without signature for testing
        pass
    
    # Parse JSON
    data = await request.json()
    event_type = data.get("type")
    event_data = data.get("data", {})
    
    logger.info(f"elevenlabs_webhook_received event_type={event_type}")
    
    # Extract call_sid
    call_sid = extract_call_sid(event_data)
    if not call_sid:
        logger.warning(f"elevenlabs_webhook_missing_call_sid event_type={event_type}")
        return {"success": True, "message": "No call_sid found"}
    
    # Get event timestamp
    event_timestamp = int(time.time())
    if x_el_timestamp:
        try:
            event_timestamp = int(x_el_timestamp)
        except ValueError:
            pass
    
    # Check for duplicate events
    try:
        existing_log = await ElevenLabsEventLog.find_one(
            ElevenLabsEventLog.call_sid == call_sid,
            ElevenLabsEventLog.event_type == event_type,
            ElevenLabsEventLog.event_timestamp == event_timestamp
        )
        if existing_log:
            logger.info(f"elevenlabs_webhook_duplicate_event call_sid={call_sid} event_type={event_type}")
            return {"success": True, "message": "Duplicate event ignored"}
    except Exception:
        pass
    
    # Log event
    try:
        event_log = ElevenLabsEventLog(
            call_sid=call_sid,
            event_type=event_type,
            event_timestamp=event_timestamp,
            status="processed"
        )
        await event_log.insert()
    except Exception as e:
        logger.warning(f"elevenlabs_event_log_failed: {str(e)}")
    
    # Handle different event types
    if event_type == "call_started":
        await handle_call_started(call_sid, event_data)
    elif event_type == "post_call_transcription":
        await handle_post_call_transcription(call_sid, event_data)
    elif event_type == "conversation.ended":
        await handle_conversation_ended(call_sid, event_data)
    else:
        logger.info(f"elevenlabs_webhook_unknown_event event_type={event_type}")
    
    return {"success": True, "message": "Webhook processed"}


def extract_call_sid(data: Dict[str, Any]) -> Optional[str]:
    """Extract call_sid from various possible locations in webhook data"""
    # Check conversation_initiation_client_data
    cid = data.get("conversation_initiation_client_data", {})
    if isinstance(cid, dict):
        dyn = cid.get("dynamic_variables", {})
        if isinstance(dyn, dict):
            for key in ("call_sid", "external_call_id", "twilio_call_sid"):
                value = dyn.get(key)
                if value:
                    return str(value).strip()
    
    # Check metadata
    metadata = data.get("metadata", {})
    if isinstance(metadata, dict):
        for key in ("call_sid", "external_call_id", "twilio_call_sid"):
            value = metadata.get(key)
            if value:
                return str(value).strip()
    
    # Check top level
    for key in ("call_sid", "call_id", "external_call_id", "conversation_id"):
        value = data.get(key)
        if value:
            return str(value).strip()
    
    return None


async def handle_call_started(call_sid: str, data: Dict[str, Any]):
    """Handle call started event"""
    logger.info(f"call_started call_sid={call_sid}")
    
    # Find or create call
    call = await Call.find_one(Call.call_sid == call_sid)
    if call:
        call.status = CallStatus.CONNECTED
        await call.save()
        logger.info(f"call_status_updated call_sid={call_sid} status=connected")
        
        # Emit Socket.io event
        try:
            call_dict = {
                'id': str(call.id),
                'call_sid': call.call_sid,
                'phone_number': call.phone_number,
                'candidate_id': str(call.candidate_id) if call.candidate_id else None,
                'status': call.status.value,  # Get string value from enum
                'call_type': call.call_type.value,  # Get string value from enum
                'start_time': call.start_time.isoformat() if call.start_time else None,
                'duration': call.duration
            }
            await emit_call_status(call_dict)
            logger.info(f"✅ socketio_call_status_emitted call_sid={call_sid} status={call_dict['status']}")
        except Exception as e:
            logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)


async def handle_post_call_transcription(call_sid: str, data: Dict[str, Any]):
    """
    Handle post_call_transcription event
    This contains the full transcript and summary from ElevenLabs
    """
    logger.info(f"🎯 ========== POST_CALL_TRANSCRIPTION STARTED ==========")
    logger.info(f"🎯 call_sid={call_sid}")
    logger.info(f"📦 Webhook data keys: {list(data.keys())}")
    
    # Extract transcript and summary
    transcript_data = data.get("transcript", [])
    summary = data.get("summary", "") or data.get("analysis", {}).get("transcript_summary", "")
    
    logger.info(f"📝 Transcript type: {type(transcript_data)}, items: {len(transcript_data) if isinstance(transcript_data, list) else 'N/A'}")
    logger.info(f"📝 Summary length: {len(summary) if summary else 0}")
    
    # Build transcript text and check for completion phrases
    transcript_text = ""
    agent_messages = []  # Store agent messages to check for completion
    full_transcript_for_detection = ""  # Full text for completion detection
    
    if isinstance(transcript_data, list):
        parts = []
        for item in transcript_data:
            if isinstance(item, dict):
                role = item.get("role", "unknown")
                # Map 'user' to 'Candidate' and 'agent' to 'Agent'
                role_display = "Candidate" if role.lower() == "user" else "Agent"
                message = item.get("message", "")
                if message:
                    parts.append(f"{role_display}: {message.strip()}")
                    # Collect agent messages for completion detection
                    if role.lower() == "agent":
                        agent_messages.append(message.strip())
                        full_transcript_for_detection += " " + message.strip()
        transcript_text = "\n".join(parts)
    elif isinstance(transcript_data, str):
        transcript_text = transcript_data
        full_transcript_for_detection = transcript_data
    
    # Log transcript for debugging
    logger.info(f"📝 Total agent messages: {len(agent_messages)}")
    if agent_messages:
        logger.info(f"📝 Last agent message: '{agent_messages[-1]}'")
        logger.info(f"📝 All agent messages:")
        for i, msg in enumerate(agent_messages, 1):
            logger.info(f"   {i}. {msg[:150]}")
    
    # Check if call ended naturally with goodbye
    from app.utils.completion_detection import should_end_call
    call_ended_naturally = False
    
    # Method 1: Check individual agent messages (last 5 messages)
    if agent_messages:
        logger.info(f"🔍 Checking last {min(5, len(agent_messages))} agent messages for completion...")
        for i, msg in enumerate(agent_messages[-5:], 1):
            logger.info(f"🔍 Message {i}: '{msg[:100]}'")
            if should_end_call(msg):
                call_ended_naturally = True
                logger.info(f"🔔 ✅✅✅ COMPLETION DETECTED in message {i}: '{msg}'")
                break
            else:
                logger.info(f"   ❌ No completion in message {i}")
    
    # Method 2: Check the full transcript text
    if not call_ended_naturally and full_transcript_for_detection:
        logger.info(f"🔍 Checking full transcript...")
        if should_end_call(full_transcript_for_detection):
            call_ended_naturally = True
            logger.info(f"🔔 ✅✅✅ COMPLETION DETECTED in full transcript")
    
    # Method 3: Check the summary
    if not call_ended_naturally and summary:
        logger.info(f"🔍 Checking summary...")
        if should_end_call(summary):
            call_ended_naturally = True
            logger.info(f"🔔 ✅✅✅ COMPLETION DETECTED in summary")
    
    if not call_ended_naturally:
        logger.warning(f"⚠️ NO COMPLETION DETECTED - Call will NOT auto-disconnect")
    
    # Get recording URL
    recording_url = data.get("recording_url") or data.get("audio_url")
    
    if not recording_url:
        # Try other possible keys
        recording_url = data.get("recording") or data.get("audio") or data.get("call_recording_url")
        logger.warning(f"⚠️ Recording URL not in standard keys, trying alternatives: {recording_url}")
    
    logger.info(f"📊 SUMMARY: transcript_len={len(transcript_text)}, summary_len={len(summary)}, recording={bool(recording_url)}, auto_disconnect={call_ended_naturally}")
    
    if recording_url:
        logger.info(f"🎵 Recording URL found: {recording_url}")
    else:
        logger.error(f"❌ NO RECORDING URL in webhook data!")
        logger.error(f"📦 Available keys in webhook: {list(data.keys())}")
        logger.error(f"📦 Full webhook data: {data}")
    
    # Find call
    call = await Call.find_one(Call.call_sid == call_sid)
    if not call:
        logger.error(f"❌ CALL NOT FOUND IN DATABASE: call_sid={call_sid}")
        return
    
    logger.info(f"✅ Call found in database: id={call.id}")
    
    # Update call with transcript and summary
    if transcript_text:
        call.transcript_text = transcript_text
    if summary:
        call.summary = summary
    
    # Add note if call ended naturally with goodbye
    if call_ended_naturally:
        if call.summary:
            call.summary = f"[✅ Call ended naturally with completion phrase]\n\n{call.summary}"
        else:
            call.summary = "[✅ Call ended naturally with completion phrase]"
        logger.info(f"✅ Call {call_sid} marked as naturally completed")
    
    # Download and save recording locally + upload to Azure Blob if available
    if recording_url:
        try:
            logger.info(f"downloading_recording url={recording_url}")
            
            # Download recording from ElevenLabs
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(recording_url)
                response.raise_for_status()
                audio_bytes = response.content
            
            logger.info(f"recording_downloaded size={len(audio_bytes)}")
            
            # Save locally in WAV format
            try:
                import os
                from pathlib import Path
                
                # Create recordings directory if not exists - use absolute path
                # Get the project root directory (where app folder is)
                project_root = Path(__file__).parent.parent.parent  # Go up from api -> app -> project root
                recordings_dir = project_root / "recordings"
                recordings_dir.mkdir(exist_ok=True)
                
                logger.info(f"📁 Recordings directory: {recordings_dir.absolute()}")
                
                # Generate filename: phone_number_YYYYMMDD_HHMMSS.wav
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                phone_clean = call.phone_number.replace("+", "").replace(" ", "").replace("-", "")
                local_filename = f"{phone_clean}_{timestamp}"
                
                logger.info(f"💾 Saving recording as: {local_filename}")
                
                # Save original MP3 first
                mp3_path = recordings_dir / f"{local_filename}.mp3"
                with open(mp3_path, "wb") as f:
                    f.write(audio_bytes)
                logger.info(f"✅ recording_saved_locally_mp3 path={mp3_path}")
                
                # Convert MP3 to WAV using pydub
                try:
                    from pydub import AudioSegment
                    
                    logger.info(f"🔄 Converting MP3 to WAV...")
                    # Load MP3 and convert to WAV
                    audio = AudioSegment.from_mp3(str(mp3_path))
                    wav_path = recordings_dir / f"{local_filename}.wav"
                    audio.export(str(wav_path), format="wav")
                    
                    logger.info(f"✅ recording_converted_to_wav path={wav_path}")
                    
                    # Delete MP3 after successful conversion
                    os.remove(mp3_path)
                    logger.info(f"🗑️ mp3_file_deleted path={mp3_path}")
                    
                except ImportError:
                    logger.warning("⚠️ pydub not installed, keeping MP3 format. Install with: pip install pydub")
                    logger.info(f"💾 recording_saved_as_mp3 path={mp3_path}")
                except Exception as conv_error:
                    logger.error(f"❌ wav_conversion_failed: {str(conv_error)}, keeping MP3")
                    logger.info(f"💾 recording_saved_as_mp3 path={mp3_path}")
                
                # Save transcript and user data as JSON files
                import json
                
                # Save transcript
                if transcript_text:
                    transcript_path = recordings_dir / f"{local_filename}_transcript.json"
                    transcript_data_json = {
                        "call_sid": call_sid,
                        "phone_number": call.phone_number,
                        "timestamp": datetime.utcnow().isoformat(),
                        "transcript": transcript_text,
                        "summary": summary
                    }
                    with open(transcript_path, "w", encoding="utf-8") as f:
                        json.dump(transcript_data_json, f, indent=2, ensure_ascii=False)
                    logger.info(f"✅ transcript_saved path={transcript_path}")
                
                # Save user data
                user_data_path = recordings_dir / f"{local_filename}_userData.json"
                user_data = {
                    "call_sid": call_sid,
                    "phone_number": call.phone_number,
                    "call_type": call.call_type.value if call.call_type else "outbound",
                    "status": call.status.value if call.status else "completed",
                    "start_time": call.start_time.isoformat() if call.start_time else None,
                    "end_time": call.end_time.isoformat() if call.end_time else None,
                    "duration": call.duration,
                    "candidate_id": str(call.candidate_id) if call.candidate_id else None,
                    "naturally_completed": call_ended_naturally
                }
                with open(user_data_path, "w", encoding="utf-8") as f:
                    json.dump(user_data, f, indent=2, ensure_ascii=False)
                logger.info(f"✅ user_data_saved path={user_data_path}")
                
                logger.info(f"🎉 All recording files saved successfully for call {call_sid}")
                
            except Exception as local_save_error:
                logger.error(f"❌ local_save_failed: {str(local_save_error)}", exc_info=True)
            
            # Upload to Azure Blob if configured
            if blob_service.client:
                try:
                    # Generate organized filename: YYYYMMDD/call_sid_timestamp.mp3
                    date_prefix = datetime.utcnow().strftime("%Y-%m-%d")
                    timestamp = int(time.time())
                    file_name = f"elevenlabs/{date_prefix}/{call_sid}_{timestamp}.mp3"
                    
                    # Upload to Azure Blob
                    blob_url = await blob_service.upload_file(
                        file_data=audio_bytes,
                        file_name=file_name,
                        content_type="audio/mpeg",
                        metadata={
                            "source": "elevenlabs",
                            "event_type": "post_call_transcription",
                            "call_sid": call_sid,
                            "phone_number": call.phone_number,
                            "uploaded_at": datetime.utcnow().isoformat(),
                        }
                    )
                    
                    if blob_url:
                        call.recording_url = blob_url
                        logger.info(f"recording_uploaded_to_blob call_sid={call_sid} url={blob_url}")
                    else:
                        # Fallback to ElevenLabs URL if upload fails
                        call.recording_url = recording_url
                        logger.warning(f"blob_upload_failed_using_elevenlabs_url call_sid={call_sid}")
                except Exception as blob_error:
                    logger.error(f"blob_upload_failed: {str(blob_error)}")
                    call.recording_url = recording_url
            else:
                # No blob service configured, use ElevenLabs URL directly
                call.recording_url = recording_url
                
        except Exception as e:
            logger.error(f"recording_processing_failed call_sid={call_sid} error={str(e)}")
            # Fallback to ElevenLabs URL
            if recording_url:
                call.recording_url = recording_url
    
    # Mark as completed
    if call.status != CallStatus.COMPLETED:
        call.status = CallStatus.COMPLETED
    if not call.end_time:
        call.end_time = datetime.utcnow()
    
    # Calculate duration if not set
    if not call.duration and call.start_time and call.end_time:
        call.duration = int((call.end_time - call.start_time).total_seconds())
    
    await call.save()
    logger.info(f"call_transcript_saved call_sid={call_sid}")
    
    # Emit Socket.io events
    try:
        # Convert call to dict properly
        call_dict = {
            'id': str(call.id),
            'call_sid': call.call_sid,
            'phone_number': call.phone_number,
            'candidate_id': str(call.candidate_id) if call.candidate_id else None,
            'status': call.status.value,  # Get string value from enum
            'call_type': call.call_type.value,  # Get string value from enum
            'start_time': call.start_time.isoformat() if call.start_time else None,
            'end_time': call.end_time.isoformat() if call.end_time else None,
            'duration': call.duration,
            'recording_url': call.recording_url,
            'transcript_text': call.transcript_text,
            'summary': call.summary
        }
        await emit_call_completed(call_dict)
        logger.info(f"✅ socketio_call_completed_emitted call_sid={call_sid} status={call_dict['status']}")
        
        # Also emit candidate updated if candidate exists
        if call.candidate_id:
            try:
                from beanie import PydanticObjectId
                candidate = await Candidate.get(PydanticObjectId(call.candidate_id))
                if candidate:
                    candidate_dict = {
                        'id': str(candidate.id),
                        'candidate_name': candidate.candidate_name,
                        'phone_number': candidate.phone_number,
                        'email': candidate.email,
                        'domain': candidate.domain,
                        'overall_score': candidate.overall_score,
                        'screening_score': candidate.screening_score,
                        'call_status': candidate.call_status,
                        'interested': candidate.interested,
                        'created_at': candidate.created_at.isoformat() if candidate.created_at else None,
                        'updated_at': candidate.updated_at.isoformat() if candidate.updated_at else None
                    }
                    await emit_candidate_updated(candidate_dict)
                    logger.info(f"socketio_candidate_updated_emitted candidate_id={candidate.id}")
            except Exception as e:
                logger.error(f"candidate_emit_failed: {str(e)}")
    except Exception as e:
        logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)


async def handle_conversation_ended(call_sid: str, data: Dict[str, Any]):
    """Handle conversation ended event"""
    logger.info(f"conversation_ended call_sid={call_sid}")
    
    # Get duration
    duration = data.get("duration_seconds") or data.get("duration")
    
    # Find call
    call = await Call.find_one(Call.call_sid == call_sid)
    if not call:
        logger.warning(f"call_not_found call_sid={call_sid}")
        return
    
    # Update call
    call.status = CallStatus.COMPLETED
    call.end_time = datetime.utcnow()
    if duration:
        call.duration = int(duration)
    
    await call.save()
    logger.info(f"call_completed call_sid={call_sid} duration={duration}")
    
    # Emit Socket.io event
    try:
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
        await emit_call_completed(call_dict)
        logger.info(f"✅ socketio_call_completed_emitted call_sid={call_sid} status={call_dict['status']}")
    except Exception as e:
        logger.error(f"socketio_emit_failed: {str(e)}", exc_info=True)



@router.post("/test_completion_detection")
async def test_completion_detection(request: Request):
    """
    Test endpoint to manually test completion detection with sample agent messages.
    Useful for debugging auto-disconnect feature.
    """
    data = await request.json()
    agent_message = data.get("agent_message", "")
    
    from app.utils.completion_detection import should_end_call
    
    result = should_end_call(agent_message)
    
    logger.info(f"🧪 Test completion detection: '{agent_message[:100]}' -> {result}")
    
    return {
        "agent_message": agent_message,
        "should_disconnect": result,
        "message": "Completion detected" if result else "No completion detected"
    }
