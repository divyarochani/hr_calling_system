"""
Service for integrating with Node.js backend
"""
import logging
import requests
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class NodeJSIntegration:
    """Handle communication with Node.js backend"""
    
    def __init__(self, nodejs_url: str):
        self.nodejs_url = nodejs_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def update_call_status(self, call_sid: str, status: str, phone_number: str, call_type: str = 'outbound') -> bool:
        """
        Update call status in Node.js backend
        
        Statuses: initiated, ringing, connected, ongoing, completed, missed, failed
        """
        try:
            url = f"{self.nodejs_url}/api/calls/status"
            data = {
                'callSid': call_sid,
                'status': status,
                'phoneNumber': phone_number,
                'callType': call_type,
            }
            
            response = self.session.post(url, json=data, timeout=5)
            response.raise_for_status()
            
            logger.info(f"Call status updated: {call_sid} -> {status}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to update call status: {e}")
            return False
    
    def save_call_data(self, call_summary: Dict) -> bool:
        """
        Save complete call data including extracted userData
        """
        try:
            url = f"{self.nodejs_url}/api/calls/data"
            
            # Transform data to match Node.js schema
            data = {
                'callSid': call_summary.get('call_sid'),
                'phoneNumber': call_summary.get('phone_number'),
                'startTime': call_summary.get('start_time'),
                'endTime': call_summary.get('end_time'),
                'duration': call_summary.get('duration_seconds'),
                'transferRequested': call_summary.get('transfer_requested', False),
                'transferNumber': call_summary.get('transfer_number'),
                'structuredData': call_summary.get('structured_data', {}),
                'conversation': call_summary.get('conversation', []),
                'recordingPath': call_summary.get('recording_path'),  # Add recording path
            }
            
            response = self.session.post(url, json=data, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Call data saved successfully: {call_summary.get('call_sid')}")
            print(f"✅ Data sent to Node.js backend")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to save call data: {e}")
            print(f"❌ Failed to send data to Node.js: {e}")
            return False
