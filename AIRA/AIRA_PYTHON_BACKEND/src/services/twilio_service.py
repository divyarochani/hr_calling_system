"""
Service for Twilio operations
"""
import logging
from twilio.rest import Client

logger = logging.getLogger(__name__)


class TwilioService:
    """Handle Twilio operations"""
    
    def __init__(self, account_sid: str, auth_token: str, phone_number: str):
        self.client = Client(account_sid, auth_token)
        self.phone_number = phone_number
    
    def make_outbound_call(self, to_number: str, server_url: str) -> str:
        """
        Initiate outbound call
        
        Returns: call_sid
        """
        try:
            call = self.client.calls.create(
                to=to_number,
                from_=self.phone_number,
                url=f"{server_url}/voice",
                status_callback=f"{server_url}/status",
                status_callback_event=['initiated', 'ringing', 'answered', 'completed']
            )
            
            logger.info(f"Call initiated: {call.sid}")
            print(f"\n✅ Call initiated")
            print(f"📞 Calling: {to_number}")
            print(f"🆔 SID: {call.sid}\n")
            
            return call.sid
            
        except Exception as e:
            logger.error(f"Failed to initiate call: {e}")
            print(f"\n❌ Error: {e}\n")
            raise
    
    def transfer_call(self, call_sid: str, transfer_url: str):
        """Transfer call to another endpoint"""
        try:
            call = self.client.calls(call_sid).update(
                url=transfer_url,
                method="POST"
            )
            logger.info(f"Call transfer initiated: {call.status}")
            return call
        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            raise
