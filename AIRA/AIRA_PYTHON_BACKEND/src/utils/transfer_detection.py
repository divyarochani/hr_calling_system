"""
Utility for detecting transfer requests
"""
from typing import List


def should_transfer(text: str, keywords: List[str]) -> bool:
    """
    Check if user is requesting transfer to human
    
    Args:
        text: User's message
        keywords: List of transfer keywords
    
    Returns:
        True if transfer requested, False otherwise
    """
    if not text:
        return False
    
    text_lower = text.lower().strip()
    
    # Check each keyword
    for keyword in keywords:
        if keyword in text_lower:
            return True
    
    return False
