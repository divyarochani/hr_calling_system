"""ElevenLabs service for call management"""
import httpx
import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class ElevenLabsService:
    """ElevenLabs API service"""
    
    def __init__(self):
        self.api_key = settings.elevenlabs_api_key
        self.agent_id = settings.elevenlabs_agent_id
        self.agent_phone_number_id = settings.elevenlabs_agent_phone_number_id
        self.base_url = "https://api.elevenlabs.io/v1"
        
        logger.info(f"ElevenLabs Service initialized:")
        logger.info(f"  Agent ID: {self.agent_id}")
        logger.info(f"  Phone Number ID: {self.agent_phone_number_id}")
        logger.info(f"  API Key: {self.api_key[:20]}...")
    
    async def initiate_call(self, phone_number: str, call_sid: str) -> Dict[str, Any]:
        """
        Initiate outbound call via ElevenLabs Conversational AI
        
        Args:
            phone_number: Phone number to call
            call_sid: Unique call identifier
            
        Returns:
            Response from ElevenLabs API
        """
        url = f"{self.base_url}/convai/twilio/outbound-call"
        
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "agent_id": self.agent_id,
            "agent_phone_number_id": self.agent_phone_number_id,
            "to_number": phone_number,
            "conversation_initiation_client_data": {
                "type": "conversation_initiation_client_data",
                "dynamic_variables": {
                    "call_sid": call_sid,
                    "external_call_id": call_sid,
                }
            }
        }
        
        logger.info(f"Initiating call to {phone_number}")
        logger.info(f"  URL: {url}")
        logger.info(f"  Payload: {payload}")
        
        timeout = httpx.Timeout(10.0, connect=5.0)
        
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                logger.info(f"ElevenLabs Response Status: {response.status_code}")
                logger.info(f"ElevenLabs Response Body: {response.text}")
                
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"ElevenLabs API Error: {e.response.status_code}")
            logger.error(f"Error Response: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Failed to initiate call: {str(e)}")
            raise


# Singleton instance
elevenlabs_service = ElevenLabsService()
