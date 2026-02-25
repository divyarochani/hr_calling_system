# """
# AI Calling Agent - Main Application
# Backend API for Twilio + ElevenLabs Integration
# """
# import asyncio
# import json
# import logging
# import sys
# import base64
# from typing import List, Dict
# from datetime import datetime

# import websockets
# from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
# from fastapi.responses import Response
# from fastapi.middleware.cors import CORSMiddleware
# from twilio.twiml.voice_response import VoiceResponse, Connect, Stream

# # Import configuration
# from .config import settings
# from .config.settings import validate_config

# # Import services
# from .services import extract_structured_data, save_recording, TwilioService, NodeJSIntegration

# # Import utilities
# from .utils import should_transfer, save_transcript, save_user_data, process_call_data_async, should_end_call

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # Validate configuration
# try:
#     validate_config()
# except ValueError as e:
#     logger.error(str(e))
#     sys.exit(1)

# # Initialize services
# twilio_service = TwilioService(
#     settings.TWILIO_ACCOUNT_SID,
#     settings.TWILIO_AUTH_TOKEN,
#     settings.TWILIO_PHONE_NUMBER
# )

# nodejs_integration = NodeJSIntegration(settings.NODEJS_BACKEND_URL)

# # Store active call information (callSid -> phone_number mapping)
# active_calls = {}

# # Initialize FastAPI
# app = FastAPI(
#     title="AI Calling Agent API",
#     description="Backend API for AI-powered calling agent with Twilio and ElevenLabs",
#     version="1.0.0"
# )

# # Add CORS middleware for frontend integration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Configure this for production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Log optional features status
# if settings.HUMAN_AGENT_NUMBER:
#     logger.info(f"Human agent transfers enabled: {settings.HUMAN_AGENT_NUMBER}")
#     print(f"✅ Human transfers enabled: {settings.HUMAN_AGENT_NUMBER}")
# else:
#     logger.warning("HUMAN_AGENT_NUMBER not set - transfers disabled")
#     print(f"⚠️  Human transfers DISABLED")

# if settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT:
#     logger.info(f"Azure OpenAI data extraction enabled: {settings.AZURE_OPENAI_ENDPOINT}")
#     print(f"✅ Azure OpenAI enabled: {settings.AZURE_OPENAI_MODEL_NAME}")
# else:
#     logger.warning("Azure OpenAI not configured - data extraction disabled")
#     print(f"⚠️  Azure OpenAI DISABLED")


# @app.get("/")
# async def root():
#     """API root endpoint"""
#     return {
#         "service": "AI Calling Agent API",
#         "version": "1.0.0",
#         "status": "running"
#     }


# @app.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "healthy",
#         "service": "AI Calling Agent",
#         "features": {
#             "human_transfer": bool(settings.HUMAN_AGENT_NUMBER),
#             "data_extraction": bool(settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT),
#             "extraction_service": "Azure OpenAI" if settings.AZURE_OPENAI_ENDPOINT else "Not configured"
#         }
#     }


# @app.post("/voice")
# async def voice_webhook(request: Request):
#     """Twilio Voice Webhook - Returns TwiML"""
#     logger.info("Voice webhook called")
    
#     response = VoiceResponse()
#     connect = Connect()
    
#     domain = settings.SERVER_URL.replace('https://', '').replace('http://', '').rstrip('/')
#     stream = Stream(url=f"wss://{domain}/media")
#     connect.append(stream)
#     response.append(connect)
    
#     logger.info(f"TwiML response with Stream URL: wss://{domain}/media")
#     return Response(content=str(response), media_type="application/xml")


# @app.post("/transfer")
# async def transfer_to_human(request: Request):
#     """Transfer call to human agent"""
#     logger.info("Transfer endpoint called")
    
#     response = VoiceResponse()
    
#     if settings.HUMAN_AGENT_NUMBER:
#         response.say("Transferring you to a human agent. Please hold.")
        
#         # Dial with error handling
#         dial = response.dial(
#             settings.HUMAN_AGENT_NUMBER,
#             timeout=30,  # Wait 30 seconds for answer
#             action=f"{settings.SERVER_URL}/transfer-status",  # Callback for dial status
#             method="POST"
#         )
        
#         logger.info(f"Transferring to human: {settings.HUMAN_AGENT_NUMBER}")
#     else:
#         response.say("I apologize, but human transfer is not available at the moment.")
#         logger.warning("Transfer requested but HUMAN_AGENT_NUMBER not configured")
    
#     return Response(content=str(response), media_type="application/xml")


# @app.post("/transfer-status")
# async def transfer_status_callback(request: Request):
#     """Handle transfer dial status (success/failure)"""
#     form_data = await request.form()
#     dial_call_status = form_data.get("DialCallStatus")
#     call_sid = form_data.get("CallSid")
    
#     logger.info(f"Transfer status for {call_sid}: {dial_call_status}")
#     print(f"📞 Transfer Status: {dial_call_status}")
    
#     response = VoiceResponse()
    
#     # Handle different dial outcomes
#     if dial_call_status in ["completed", "answered"]:
#         # Transfer successful - call will continue with human
#         logger.info(f"Transfer successful: {call_sid}")
#         print(f"✅ Transfer successful")
#     elif dial_call_status == "busy":
#         response.say("I'm sorry, but the agent is currently busy. Let me continue to assist you.")
#         logger.warning(f"Transfer failed - busy: {call_sid}")
#         print(f"⚠️  Agent busy")
#     elif dial_call_status == "no-answer":
#         response.say("I'm sorry, but no one is available to take your call right now. Let me continue to help you.")
#         logger.warning(f"Transfer failed - no answer: {call_sid}")
#         print(f"⚠️  No answer")
#     elif dial_call_status == "failed":
#         response.say("I'm sorry, but I'm unable to transfer your call at this time. Let me continue to assist you.")
#         logger.error(f"Transfer failed: {call_sid}")
#         print(f"❌ Transfer failed")
#     else:
#         # Unknown status
#         response.say("Let me continue to help you.")
#         logger.warning(f"Unknown transfer status: {dial_call_status}")
    
#     # If transfer failed, redirect back to AI conversation
#     if dial_call_status not in ["completed", "answered"]:
#         # Reconnect to media stream
#         connect = response.connect()
#         domain = settings.SERVER_URL.replace('https://', '').replace('http://', '').rstrip('/')
#         stream = connect.stream(url=f"wss://{domain}/media")
    
#     return Response(content=str(response), media_type="application/xml")

# @app.websocket("/media")
# async def media_websocket(websocket: WebSocket):
#     """WebSocket endpoint for Twilio Media Streams"""
#     await websocket.accept()
#     print("\n✅ Twilio connected")
    
#     elevenlabs_ws = None
#     stream_sid = None
#     call_sid = None
#     to_number = None
#     transfer_requested = False
    
#     # Track conversation and audio
#     conversation: List[Dict[str, str]] = []
#     user_audio_chunks: List[bytes] = []
#     agent_audio_chunks: List[bytes] = []
#     call_start_time = datetime.now()
    
#     async def transfer_call():
#         """Transfer the call to human agent"""
#         nonlocal transfer_requested
#         if not settings.HUMAN_AGENT_NUMBER or not call_sid:
#             logger.warning("Cannot transfer - missing config or call_sid")
#             # Notify user via AI that transfer is not available
#             if elevenlabs_ws:
#                 try:
#                     await elevenlabs_ws.send(json.dumps({
#                         "type": "agent_response",
#                         "agent_response": "I apologize, but I'm unable to transfer you to a human agent at this moment. How else can I assist you?"
#                     }))
#                 except:
#                     pass
#             return False
        
#         try:
#             transfer_requested = True
#             logger.info(f"Transferring call {call_sid}")
#             print(f"\n🔄 Transferring to: {settings.HUMAN_AGENT_NUMBER}")
            
#             twilio_service.transfer_call(
#                 call_sid,
#                 f"{settings.SERVER_URL}/transfer"
#             )
            
#             print(f"✅ Transfer initiated\n")
#             return True
            
#         except Exception as e:
#             logger.error(f"Transfer failed: {e}")
#             print(f"❌ Transfer failed: {e}\n")
            
#             # Reset transfer flag so AI can continue
#             transfer_requested = False
            
#             # Notify user that transfer failed
#             if elevenlabs_ws:
#                 try:
#                     await elevenlabs_ws.send(json.dumps({
#                         "type": "agent_response",
#                         "agent_response": "I apologize, but I'm having trouble transferring your call right now. Let me continue to help you. What would you like to know?"
#                     }))
#                 except:
#                     pass
            
#             return False
    
#     try:
#         # Connect to ElevenLabs
#         elevenlabs_ws = await websockets.connect(
#             settings.ELEVENLABS_WS_URL,
#             extra_headers={"xi-api-key": settings.ELEVENLABS_API_KEY}
#         )
#         print("✅ ElevenLabs connected")
        
#         # Send initialization
#         await elevenlabs_ws.send(json.dumps({
#             "type": "conversation_initiation_client_data",
#             "conversation_config_override": {
#                 "asr": {
#                     "quality": "high",
#                     "user_input_audio_format": "ulaw_8000"
#                 },
#                 "tts": {
#                     "output_format": "ulaw_8000"
#                 }
#             }
#         }))
#         print("📤 Init sent\n")
        
#         async def twilio_to_elevenlabs():
#             """Forward Twilio audio to ElevenLabs"""
#             nonlocal stream_sid, call_sid, to_number
            
#             try:
#                 async for message in websocket.iter_text():
#                     data = json.loads(message)
#                     event = data.get("event")
                    
#                     if event == "start":
#                         stream_sid = data.get("streamSid")
#                         start_data = data.get("start", {})
#                         call_sid = start_data.get("callSid")
                        
#                         # DEBUG: Log all Twilio data to understand what we're receiving
#                         print("\n" + "="*60)
#                         print("🔍 DEBUG: Twilio Start Event Data")
#                         print("="*60)
#                         print(f"CallSid: {call_sid}")
#                         print(f"From: {start_data.get('from')}")
#                         print(f"To: {start_data.get('to')}")
#                         print(f"Custom Params: {start_data.get('customParameters')}")
#                         print("="*60 + "\n")
                        
#                         # First, try to get phone number from our stored active_calls
#                         to_number = active_calls.get(call_sid)
                        
#                         if to_number:
#                             print(f"✅ Found phone number in active_calls: {to_number}")
#                             logger.info(f"Retrieved phone number from active_calls: {to_number}")
#                         else:
#                             # Fallback: Extract phone number from Twilio data
#                             print("⚠️  Phone number not in active_calls, trying Twilio data...")
#                             custom_params = start_data.get("customParameters", {})
#                             to_number = custom_params.get("to_number")
                            
#                             if not to_number:
#                                 # Try to get from call parameters
#                                 to_number = start_data.get("to")  # Outbound: the number we're calling
#                                 if not to_number:
#                                     to_number = start_data.get("from")  # Inbound: caller's number
                            
#                             # Clean phone number (remove 'client:' prefix if present)
#                             if to_number and to_number.startswith("client:"):
#                                 to_number = to_number.replace("client:", "")
                            
#                             # If still no number, use unknown
#                             if not to_number:
#                                 to_number = "unknown"
#                                 logger.warning(f"Could not extract phone number for call {call_sid}!")
#                                 print(f"❌ Could not find phone number for {call_sid}")
                        
#                         print(f"📞 Call started: {call_sid}")
#                         print(f"📱 Phone: {to_number}")
#                         logger.info(f"Call started - SID: {call_sid}, Phone: {to_number}")
                        
#                         # Update Node.js: call connected
#                         nodejs_integration.update_call_status(call_sid, 'connected', to_number)
                        
#                     elif event == "media":
#                         payload = data.get("media", {}).get("payload")
#                         if payload and elevenlabs_ws:
#                             # Save user audio
#                             try:
#                                 audio_data = base64.b64decode(payload)
#                                 user_audio_chunks.append(audio_data)
#                             except:
#                                 pass
                            
#                             # Forward to ElevenLabs
#                             await elevenlabs_ws.send(json.dumps({
#                                 "user_audio_chunk": payload
#                             }))
                    
#                     elif event == "stop":
#                         logger.info("Call ended")
#                         print("\n📞 Call ended")
                        
#                         # Update Node.js: call completed
#                         if call_sid and to_number:
#                             nodejs_integration.update_call_status(call_sid, 'completed', to_number)
                        
#                         # Clean up active_calls
#                         if call_sid in active_calls:
#                             del active_calls[call_sid]
#                             print(f"🗑️  Removed {call_sid} from active_calls")
                        
#                         # Trigger async processing (don't wait for it)
#                         if conversation and call_sid and to_number:
#                             asyncio.create_task(
#                                 process_call_data_async(
#                                     conversation,
#                                     user_audio_chunks,
#                                     agent_audio_chunks,
#                                     call_sid,
#                                     to_number,
#                                     call_start_time,
#                                     datetime.now(),
#                                     transfer_requested,
#                                     settings,
#                                     extract_structured_data,
#                                     save_recording,
#                                     save_transcript,
#                                     save_user_data,
#                                     nodejs_integration
#                                 )
#                             )
#                             print("🔄 Processing call data in background...")
                        
#                         break
                        
#             except Exception as e:
#                 logger.error(f"Twilio error: {e}")
        
#         async def elevenlabs_to_twilio():
#             """Forward ElevenLabs audio to Twilio"""
#             try:
#                 async for message in elevenlabs_ws:
#                     data = json.loads(message)
#                     msg_type = data.get("type")
                    
#                     if msg_type == "conversation_initiation_metadata":
#                         metadata = data.get("conversation_initiation_metadata_event", {})
#                         print(f"✅ ElevenLabs initialized\n")
#                         logger.info("ElevenLabs initialized")
                    
#                     elif msg_type == "audio":
#                         audio_data = data.get("audio_event", {}).get("audio_base_64")
#                         if audio_data and stream_sid:
#                             # Save agent audio
#                             try:
#                                 agent_audio = base64.b64decode(audio_data)
#                                 agent_audio_chunks.append(agent_audio)
#                             except:
#                                 pass
                            
#                             # Send to Twilio
#                             await websocket.send_text(json.dumps({
#                                 "event": "media",
#                                 "streamSid": stream_sid,
#                                 "media": {"payload": audio_data}
#                             }))
                    
#                     elif msg_type == "user_transcript":
#                         user_event = data.get("user_transcription_event", {})
#                         text = user_event.get("user_transcript", "")
                        
#                         if text:
#                             print(f"👤 Candidate: {text}")
#                             logger.info(f"User: {text}")
#                             conversation.append({
#                                 "role": "user",
#                                 "text": text,
#                                 "timestamp": datetime.now().isoformat()
#                             })
                            
#                             # Check for transfer request
#                             if not transfer_requested and should_transfer(text, settings.TRANSFER_KEYWORDS):
#                                 print(f"🔔 Transfer request detected!")
#                                 await transfer_call()
                    
#                     elif msg_type == "agent_response":
#                         agent_event = data.get("agent_response_event", {})
#                         text = agent_event.get("agent_response", "")
#                         if text:
#                             print(f"🤖 AIRA: {text}")
#                             logger.info(f"Agent: {text}")
#                             conversation.append({
#                                 "role": "agent",
#                                 "text": text,
#                                 "timestamp": datetime.now().isoformat()
#                             })
                            
#                             # Check if AI is ending the call
#                             if should_end_call(text):
#                                 print(f"\n🔔 Call completion detected! AI said goodbye.")
#                                 logger.info("Call completion detected - ending call")
                                
#                                 # Give enough time for the complete message to be delivered
#                                 # Increased from 2 to 5 seconds to ensure full statement is heard
#                                 await asyncio.sleep(5)
                                
#                                 # End the call gracefully
#                                 if call_sid:
#                                     try:
#                                         twilio_service.client.calls(call_sid).update(status='completed')
#                                         print("✅ Call ended automatically")
#                                     except Exception as e:
#                                         logger.error(f"Failed to end call: {e}")
                                
#                                 # Break the loop to trigger cleanup
#                                 break
                    
#                     elif msg_type == "ping":
#                         event_id = data.get("ping_event", {}).get("event_id")
#                         await elevenlabs_ws.send(json.dumps({
#                             "type": "pong",
#                             "event_id": event_id
#                         }))
                    
#             except Exception as e:
#                 logger.error(f"ElevenLabs error: {e}")
        
#         # Run both directions
#         await asyncio.gather(
#             twilio_to_elevenlabs(),
#             elevenlabs_to_twilio()
#         )
        
#     except Exception as e:
#         logger.error(f"WebSocket error: {e}")
#         print(f"❌ Error: {e}")
    
#     finally:
#         # Cleanup
#         if elevenlabs_ws:
#             await elevenlabs_ws.close()
#         await websocket.close()
#         print("🔌 WebSocket connections closed\n")


# @app.post("/call/outbound")
# async def initiate_outbound_call(phone_number: str):
#     """
#     API endpoint to initiate outbound call
#     For frontend integration
#     """
#     try:
#         call_sid = twilio_service.make_outbound_call(
#             phone_number,
#             settings.SERVER_URL
#         )
        
#         # Store phone number for this call
#         active_calls[call_sid] = phone_number
#         logger.info(f"Stored phone number for call {call_sid}: {phone_number}")
#         print(f"📝 Stored: {call_sid} -> {phone_number}")
        
#         # Notify Node.js backend
#         nodejs_integration.update_call_status(call_sid, 'initiated', phone_number)
        
#         return {
#             "success": True,
#             "call_sid": call_sid,
#             "phone_number": phone_number
#         }
#     except Exception as e:
#         logger.error(f"Outbound call failed: {e}")
#         return {
#             "success": False,
#             "error": str(e)
#         }


# @app.post("/status")
# async def call_status(request: Request):
#     """Twilio status callback - handles call status updates"""
#     form_data = await request.form()
#     call_sid = form_data.get("CallSid")
#     call_status_value = form_data.get("CallStatus")
#     to_number = form_data.get("To")
    
#     logger.info(f"Call status update: {call_sid} - {call_status_value}")
#     print(f"📞 Call Status: {call_sid} -> {call_status_value}")
    
#     # Map Twilio statuses to our system
#     status_map = {
#         'initiated': 'initiated',
#         'ringing': 'ringing',
#         'in-progress': 'connected',
#         'completed': 'completed',
#         'busy': 'missed',
#         'no-answer': 'missed',
#         'failed': 'failed',
#         'canceled': 'failed'
#     }
    
#     mapped_status = status_map.get(call_status_value, call_status_value)
    
#     # Notify Node.js backend
#     try:
#         nodejs_integration.update_call_status(call_sid, mapped_status, to_number)
#         print(f"✅ Notified Node.js: {call_sid} -> {mapped_status}")
#     except Exception as e:
#         logger.error(f"Failed to notify Node.js: {e}")
#         print(f"❌ Node.js notification failed: {e}")
    
#     return {"status": "received"}


# if __name__ == "__main__":
#     import uvicorn
    
#     # Note: Use run.py in project root for easier execution
#     print("\n" + "="*60)
#     print("🚀 Starting AI Calling Agent API")
#     print("="*60)
#     print(f"Server: {settings.SERVER_URL}")
#     print(f"Twilio: {settings.TWILIO_PHONE_NUMBER}")
#     print("="*60 + "\n")
#     print("💡 TIP: Use 'python run.py' from project root for easier execution\n")
    
#     uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

"""
AI Calling Agent - Main Application
Backend API for Twilio + ElevenLabs Integration
"""
import asyncio
import json
import logging
import sys
import base64
from typing import List, Dict
from datetime import datetime

import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream

# Import configuration
from .config import settings
from .config.settings import validate_config

# Import services
from .services import extract_structured_data, save_recording, TwilioService, NodeJSIntegration

# Import utilities
from .utils import should_transfer, save_transcript, save_user_data, process_call_data_async, should_end_call

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate configuration
try:
    validate_config()
except ValueError as e:
    logger.error(str(e))
    sys.exit(1)

# Initialize services
twilio_service = TwilioService(
    settings.TWILIO_ACCOUNT_SID,
    settings.TWILIO_AUTH_TOKEN,
    settings.TWILIO_PHONE_NUMBER
)

nodejs_integration = NodeJSIntegration(settings.NODEJS_BACKEND_URL)

# Store active call information (callSid -> phone_number mapping)
active_calls = {}
# Store call transcripts/summaries prior to transfer
call_summaries = {}

# Initialize FastAPI
app = FastAPI(
    title="AI Calling Agent API",
    description="Backend API for AI-powered calling agent with Twilio and ElevenLabs",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log optional features status
if settings.HUMAN_AGENT_NUMBER:
    logger.info(f"Human agent transfers enabled: {settings.HUMAN_AGENT_NUMBER}")
    print(f"✅ Human transfers enabled: {settings.HUMAN_AGENT_NUMBER}")
else:
    logger.warning("HUMAN_AGENT_NUMBER not set - transfers disabled")
    print(f"⚠️  Human transfers DISABLED")

if settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT:
    logger.info(f"Azure OpenAI data extraction enabled: {settings.AZURE_OPENAI_ENDPOINT}")
    print(f"✅ Azure OpenAI enabled: {settings.AZURE_OPENAI_MODEL_NAME}")
else:
    logger.warning("Azure OpenAI not configured - data extraction disabled")
    print(f"⚠️  Azure OpenAI DISABLED")


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "service": "AI Calling Agent API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Calling Agent",
        "features": {
            "human_transfer": bool(settings.HUMAN_AGENT_NUMBER),
            "data_extraction": bool(settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_ENDPOINT),
            "extraction_service": "Azure OpenAI" if settings.AZURE_OPENAI_ENDPOINT else "Not configured"
        }
    }


@app.post("/voice")
async def voice_webhook(request: Request):
    """Twilio Voice Webhook - Returns TwiML"""
    logger.info("Voice webhook called")

    response = VoiceResponse()
    connect = Connect()

    domain = settings.SERVER_URL.replace('https://', '').replace('http://', '').rstrip('/')
    stream = Stream(url=f"wss://{domain}/media")
    connect.append(stream)
    response.append(connect)

    logger.info(f"TwiML response with Stream URL: wss://{domain}/media")
    return Response(content=str(response), media_type="application/xml")


@app.post("/transfer")
async def transfer_to_human(request: Request):
    """Transfer call to human agent"""
    logger.info("Transfer endpoint called")

    response = VoiceResponse()
    form_data = await request.form()
    call_sid = form_data.get("CallSid", "")

    if settings.HUMAN_AGENT_NUMBER:
        response.say("Transferring you to a human agent. Please hold.")
        from twilio.twiml.voice_response import Dial
        dial = Dial()
        # When human agent answers, Twilio will hit the /whisper endpoint first
        dial.number(settings.HUMAN_AGENT_NUMBER, url=f"{settings.SERVER_URL}/whisper?original_call_sid={call_sid}")
        response.append(dial)
        logger.info(f"Transferring to human: {settings.HUMAN_AGENT_NUMBER}")
    else:
        response.say("I apologize, but human transfer is not available at the moment.")
        logger.warning("Transfer requested but HUMAN_AGENT_NUMBER not configured")

    return Response(content=str(response), media_type="application/xml")

@app.post("/whisper")
async def whisper_to_hr(request: Request, original_call_sid: str = ""):
    """Whisper context to HR before bridging the connection"""
    response = VoiceResponse()
    logger.info(f"Whisper endpoint called for call {original_call_sid}")
    print(f"\n🗣️ Playing whisper for HR agent...")

    # Use pop to retrieve and remove the summary to prevent memory leaks over time
    summary = call_summaries.pop(original_call_sid, None)
    if not summary:
        summary = "Incoming transfer from Divya HR executive from Kainskep Solutions. Context not available."

    print(f"🔊 Whisper Content: {summary}\n")
    response.say(summary)
    return Response(content=str(response), media_type="application/xml")


@app.websocket("/media")
async def media_websocket(websocket: WebSocket):
    """WebSocket endpoint for Twilio Media Streams"""
    await websocket.accept()
    print("\n✅ Twilio connected")

    elevenlabs_ws = None
    stream_sid = None
    call_sid = None
    to_number = None
    transfer_requested = False

    # Track conversation and audio
    conversation: List[Dict[str, str]] = []
    user_audio_chunks: List[bytes] = []
    agent_audio_chunks: List[bytes] = []
    call_start_time = datetime.now()

    async def transfer_call():
        """Transfer the call to human agent"""
        nonlocal transfer_requested
        if not settings.HUMAN_AGENT_NUMBER or not call_sid:
            logger.warning("Cannot transfer - missing config or call_sid")
            return

        try:
            transfer_requested = True

            # Extract structured data to pass to the HR agent
            print("🔄 Extracting candidate details before transfer...")

            # Run extraction in a separate thread to avoid blocking the async event loop
            try:
                extracted = await asyncio.to_thread(
                    extract_structured_data,
                    conversation,
                    settings.AZURE_OPENAI_API_KEY,
                    settings.AZURE_OPENAI_ENDPOINT,
                    settings.AZURE_OPENAI_API_VERSION,
                    settings.AZURE_OPENAI_MODEL_NAME
                )

                parts = []
                if extracted.get("candidate_name"): parts.append(f"Name is {extracted['candidate_name']}")
                if extracted.get("current_ctc_lpa"): parts.append(f"CTC is {extracted['current_ctc_lpa']} LPA")
                if extracted.get("expected_ctc_lpa"): parts.append(f"Expected CTC is {extracted['expected_ctc_lpa']} LPA")
                if extracted.get("experience_years"): parts.append(f"Experience is {extracted['experience_years']} years")
                if extracted.get("domain"): parts.append(f"Domain is {extracted['domain']}")
                if extracted.get("notice_period"): parts.append(f"Notice period is {extracted['notice_period']}")

                if parts:
                    call_summaries[call_sid] = f"Incoming transfer from Divya HR executive from Kainskep Solutions. Candidate details: {', '.join(parts)}."
                else:
                    call_summaries[call_sid] = "Incoming transfer. Details could not be extracted."
            except Exception as e:
                logger.error(f"Failed to extract details for transfer: {e}")
                call_summaries[call_sid] = "Incoming transfer from Divya HR executive from Kainskep Solutions."

            logger.info(f"Transferring call {call_sid}")
            print(f"\n🔄 Transferring to: {settings.HUMAN_AGENT_NUMBER}")

            twilio_service.transfer_call(
                call_sid,
                f"{settings.SERVER_URL}/transfer"
            )

            print(f"✅ Transfer initiated\n")

        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            print(f"❌ Transfer failed: {e}\n")

    try:
        # Connect to ElevenLabs
        elevenlabs_ws = await websockets.connect(
            settings.ELEVENLABS_WS_URL,
            extra_headers={"xi-api-key": settings.ELEVENLABS_API_KEY}
        )
        print("✅ ElevenLabs connected")

        # Send initialization
        await elevenlabs_ws.send(json.dumps({
            "type": "conversation_initiation_client_data",
            "conversation_config_override": {
                "asr": {
                    "quality": "high",
                    "user_input_audio_format": "ulaw_8000"
                },
                "tts": {
                    "output_format": "ulaw_8000"
                }
            }
        }))
        print("📤 Init sent\n")

        async def twilio_to_elevenlabs():
            """Forward Twilio audio to ElevenLabs"""
            nonlocal stream_sid, call_sid, to_number

            try:
                async for message in websocket.iter_text():
                    data = json.loads(message)
                    event = data.get("event")

                    if event == "start":
                        stream_sid = data.get("streamSid")
                        start_data = data.get("start", {})
                        call_sid = start_data.get("callSid")

                        # DEBUG: Log all Twilio data to understand what we're receiving
                        print("\n" + "="*60)
                        print("🔍 DEBUG: Twilio Start Event Data")
                        print("="*60)
                        print(f"CallSid: {call_sid}")
                        print(f"From: {start_data.get('from')}")
                        print(f"To: {start_data.get('to')}")
                        print(f"Custom Params: {start_data.get('customParameters')}")
                        print("="*60 + "\n")

                        # First, try to get phone number from our stored active_calls
                        to_number = active_calls.get(call_sid)

                        if to_number:
                            print(f"✅ Found phone number in active_calls: {to_number}")
                            logger.info(f"Retrieved phone number from active_calls: {to_number}")
                        else:
                            # Fallback: Extract phone number from Twilio data
                            print("⚠️  Phone number not in active_calls, trying Twilio data...")
                            custom_params = start_data.get("customParameters", {})
                            to_number = custom_params.get("to_number")

                            if not to_number:
                                # Try to get from call parameters
                                to_number = start_data.get("to")  # Outbound: the number we're calling
                                if not to_number:
                                    to_number = start_data.get("from")  # Inbound: caller's number

                            # Clean phone number (remove 'client:' prefix if present)
                            if to_number and to_number.startswith("client:"):
                                to_number = to_number.replace("client:", "")

                            # If still no number, use unknown
                            if not to_number:
                                to_number = "unknown"
                                logger.warning(f"Could not extract phone number for call {call_sid}!")
                                print(f"❌ Could not find phone number for {call_sid}")

                        print(f"📞 Call started: {call_sid}")
                        print(f"📱 Phone: {to_number}")
                        logger.info(f"Call started - SID: {call_sid}, Phone: {to_number}")

                        # Update Node.js: call connected
                        nodejs_integration.update_call_status(call_sid, 'connected', to_number)

                    elif event == "media":
                        payload = data.get("media", {}).get("payload")
                        if payload and elevenlabs_ws:
                            # Save user audio
                            try:
                                audio_data = base64.b64decode(payload)
                                user_audio_chunks.append(audio_data)
                            except:
                                pass

                            # Forward to ElevenLabs
                            await elevenlabs_ws.send(json.dumps({
                                "user_audio_chunk": payload
                            }))

                    elif event == "stop":
                        logger.info("Call ended")
                        print("\n📞 Call ended")

                        # Update Node.js: call completed
                        if call_sid and to_number:
                            nodejs_integration.update_call_status(call_sid, 'completed', to_number)

                        # Clean up active_calls
                        if call_sid in active_calls:
                            del active_calls[call_sid]
                            print(f"🗑️  Removed {call_sid} from active_calls")

                        # Trigger async processing (don't wait for it)
                        if conversation and call_sid and to_number:
                            asyncio.create_task(
                                process_call_data_async(
                                    conversation,
                                    user_audio_chunks,
                                    agent_audio_chunks,
                                    call_sid,
                                    to_number,
                                    call_start_time,
                                    datetime.now(),
                                    transfer_requested,
                                    settings,
                                    extract_structured_data,
                                    save_recording,
                                    save_transcript,
                                    save_user_data,
                                    nodejs_integration
                                )
                            )
                            print("🔄 Processing call data in background...")

                        break

            except Exception as e:
                logger.error(f"Twilio error: {e}")

        async def elevenlabs_to_twilio():
            """Forward ElevenLabs audio to Twilio"""
            try:
                async for message in elevenlabs_ws:
                    data = json.loads(message)
                    msg_type = data.get("type")

                    if msg_type == "conversation_initiation_metadata":
                        metadata = data.get("conversation_initiation_metadata_event", {})
                        print(f"✅ ElevenLabs initialized\n")
                        logger.info("ElevenLabs initialized")

                    elif msg_type == "audio":
                        audio_data = data.get("audio_event", {}).get("audio_base_64")
                        if audio_data and stream_sid:
                            # Save agent audio
                            try:
                                agent_audio = base64.b64decode(audio_data)
                                agent_audio_chunks.append(agent_audio)
                            except:
                                pass

                            # Send to Twilio
                            await websocket.send_text(json.dumps({
                                "event": "media",
                                "streamSid": stream_sid,
                                "media": {"payload": audio_data}
                            }))

                    elif msg_type == "user_transcript":
                        user_event = data.get("user_transcription_event", {})
                        text = user_event.get("user_transcript", "")

                        if text:
                            print(f"👤 Candidate: {text}")
                            logger.info(f"User: {text}")
                            conversation.append({
                                "role": "user",
                                "text": text,
                                "timestamp": datetime.now().isoformat()
                            })

                            # Check for transfer request
                            if not transfer_requested and should_transfer(text, settings.TRANSFER_KEYWORDS):
                                print(f"🔔 Transfer request detected!")
                                await transfer_call()

                    elif msg_type == "agent_response":
                        agent_event = data.get("agent_response_event", {})
                        text = agent_event.get("agent_response", "")
                        if text:
                            print(f"🤖 AIRA: {text}")
                            logger.info(f"Agent: {text}")
                            conversation.append({
                                "role": "agent",
                                "text": text,
                                "timestamp": datetime.now().isoformat()
                            })

                            # Check if AI is ending the call
                            if should_end_call(text):
                                print(f"\n🔔 Call completion detected! AI said goodbye.")
                                logger.info("Call completion detected - ending call")

                                # Give enough time for the complete message to be delivered
                                # Increased from 2 to 5 seconds to ensure full statement is heard
                                await asyncio.sleep(5)

                                # End the call gracefully
                                if call_sid:
                                    try:
                                        twilio_service.client.calls(call_sid).update(status='completed')
                                        print("✅ Call ended automatically")
                                    except Exception as e:
                                        logger.error(f"Failed to end call: {e}")

                                # Break the loop to trigger cleanup
                                break

                    elif msg_type == "ping":
                        event_id = data.get("ping_event", {}).get("event_id")
                        await elevenlabs_ws.send(json.dumps({
                            "type": "pong",
                            "event_id": event_id
                        }))

            except Exception as e:
                logger.error(f"ElevenLabs error: {e}")

        # Run both directions
        await asyncio.gather(
            twilio_to_elevenlabs(),
            elevenlabs_to_twilio()
        )

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        print(f"❌ Error: {e}")

    finally:
        # Cleanup
        if elevenlabs_ws:
            await elevenlabs_ws.close()
        await websocket.close()
        print("🔌 WebSocket connections closed\n")


@app.post("/call/outbound")
async def initiate_outbound_call(phone_number: str):
    """
    API endpoint to initiate outbound call
    For frontend integration
    """
    try:
        call_sid = twilio_service.make_outbound_call(
            phone_number,
            settings.SERVER_URL
        )

        # Store phone number for this call
        active_calls[call_sid] = phone_number
        logger.info(f"Stored phone number for call {call_sid}: {phone_number}")
        print(f"📝 Stored: {call_sid} -> {phone_number}")

        # Notify Node.js backend
        nodejs_integration.update_call_status(call_sid, 'initiated', phone_number)

        return {
            "success": True,
            "call_sid": call_sid,
            "phone_number": phone_number
        }
    except Exception as e:
        logger.error(f"Outbound call failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/status")
async def call_status(request: Request):
    """Twilio status callback - handles call status updates"""
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status_value = form_data.get("CallStatus")
    to_number = form_data.get("To")

    logger.info(f"Call status update: {call_sid} - {call_status_value}")
    print(f"📞 Call Status: {call_sid} -> {call_status_value}")

    # Map Twilio statuses to our system
    status_map = {
        'initiated': 'initiated',
        'ringing': 'ringing',
        'in-progress': 'connected',
        'completed': 'completed',
        'busy': 'missed',
        'no-answer': 'missed',
        'failed': 'failed',
        'canceled': 'failed'
    }

    mapped_status = status_map.get(call_status_value, call_status_value)

    # Notify Node.js backend
    try:
        nodejs_integration.update_call_status(call_sid, mapped_status, to_number)
        print(f"✅ Notified Node.js: {call_sid} -> {mapped_status}")
    except Exception as e:
        logger.error(f"Failed to notify Node.js: {e}")
        print(f"❌ Node.js notification failed: {e}")

    return {"status": "received"}


if __name__ == "__main__":
    import uvicorn

    # Note: Use run.py in project root for easier execution
    print("\n" + "="*60)
    print("🚀 Starting AI Calling Agent API")
    print("="*60)
    print(f"Server: {settings.SERVER_URL}")
    print(f"Twilio: {settings.TWILIO_PHONE_NUMBER}")
    print("="*60 + "\n")
    print("💡 TIP: Use 'python run.py' from project root for easier execution\n")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
 