"""
Utility for file storage operations
"""
import json
import logging
from pathlib import Path
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)


def save_transcript(
    summary_data: Dict,
    phone_number: str,
    timestamp: datetime,
    recordings_dir: Path
) -> str:
    """
    Save conversation transcript to JSON file
    
    Returns: filepath of saved transcript
    """
    try:
        filename = f"{phone_number}_{timestamp.strftime('%Y%m%d_%H%M%S')}_transcript.json"
        filepath = recordings_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Transcript saved: {filepath}")
        return str(filepath)
        
    except Exception as e:
        logger.error(f"Failed to save transcript: {e}")
        raise


def save_user_data(
    structured_data: Dict,
    phone_number: str,
    timestamp: datetime,
    recordings_dir: Path
) -> str:
    """
    Save structured userData to separate JSON file
    
    Returns: filepath of saved userData
    """
    try:
        filename = f"{phone_number}_{timestamp.strftime('%Y%m%d_%H%M%S')}_userData.json"
        filepath = recordings_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(structured_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"UserData saved: {filepath}")
        return str(filepath)
        
    except Exception as e:
        logger.error(f"Failed to save userData: {e}")
        raise
