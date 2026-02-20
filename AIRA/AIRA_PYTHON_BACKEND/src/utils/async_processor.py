"""
Async processor for handling call data processing without blocking
"""
import asyncio
import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)


async def process_call_data_async(
    conversation: List[Dict[str, str]],
    user_audio_chunks: List[bytes],
    agent_audio_chunks: List[bytes],
    call_sid: str,
    to_number: str,
    call_start_time: datetime,
    call_end_time: datetime,
    transfer_requested: bool,
    settings,
    extract_structured_data,
    save_recording,
    save_transcript,
    save_user_data,
    nodejs_integration
):
    """
    Process call data asynchronously without blocking the main thread
    """
    try:
        call_duration = (call_end_time - call_start_time).total_seconds()
        
        # Save audio recording
        recording_path = None
        if user_audio_chunks or agent_audio_chunks:
            try:
                recording_path = save_recording(
                    user_audio_chunks,
                    agent_audio_chunks,
                    to_number,
                    call_start_time,
                    settings.RECORDINGS_DIR
                )
                print(f"\n💾 Recording saved: {recording_path}")
                logger.info(f"Recording saved: {recording_path}")
            except Exception as e:
                logger.error(f"Recording save failed: {e}")
                print(f"❌ Recording save failed: {e}")
        
        # Extract structured data
        structured_data = {}
        if conversation:
            print("\n🔄 Extracting structured data using Azure OpenAI...")
            structured_data = extract_structured_data(
                conversation,
                settings.AZURE_OPENAI_API_KEY,
                settings.AZURE_OPENAI_ENDPOINT,
                settings.AZURE_OPENAI_API_VERSION,
                settings.AZURE_OPENAI_MODEL_NAME
            )
            
            # Print summary
            print("\n" + "="*60)
            print("📊 CALL SUMMARY")
            print("="*60)
            print(f"📞 Phone: {to_number}")
            print(f"🆔 Call SID: {call_sid}")
            print(f"⏱️  Duration: {call_duration:.1f}s")
            print(f"💬 Messages: {len(conversation)}")
            if transfer_requested:
                print(f"🔄 Transfer: YES")
            
            # Display structured data
            print("\n" + "="*60)
            print("📋 EXTRACTED CANDIDATE DATA")
            print("="*60)
            import json
            print(json.dumps(structured_data, indent=2, ensure_ascii=False))
            print("="*60)
        
        # Save files
        try:
            summary_data = {
                "phone_number": to_number,
                "call_sid": call_sid,
                "start_time": call_start_time.isoformat(),
                "end_time": call_end_time.isoformat(),
                "duration_seconds": call_duration,
                "transfer_requested": transfer_requested,
                "transfer_number": settings.HUMAN_AGENT_NUMBER if transfer_requested else None,
                "structured_data": structured_data,
                "conversation": conversation,
                "recording_path": recording_path
            }
            
            transcript_path = save_transcript(
                summary_data,
                to_number,
                call_start_time,
                settings.RECORDINGS_DIR
            )
            
            userData_path = save_user_data(
                structured_data,
                to_number,
                call_start_time,
                settings.RECORDINGS_DIR
            )
            
            print(f"\n💾 Transcript: {transcript_path}")
            print(f"💾 UserData: {userData_path}\n")
            
            # Send data to Node.js backend
            nodejs_integration.save_call_data(summary_data)
            
            logger.info(f"Call data processed successfully: {call_sid}")
            
        except Exception as e:
            logger.error(f"Failed to save files: {e}")
            print(f"❌ Failed to save files: {e}")
            
    except Exception as e:
        logger.error(f"Error processing call data: {e}")
        print(f"❌ Error processing call data: {e}")
