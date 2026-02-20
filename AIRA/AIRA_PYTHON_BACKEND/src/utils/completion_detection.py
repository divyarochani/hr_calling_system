"""
Utility for detecting call completion phrases
"""
import re

# Phrases that indicate the interview/screening is complete
# Made more specific to avoid premature call ending
COMPLETION_PHRASES = [
    "goodbye and have a great day",
    "goodbye and take care",
    "goodbye and all the best",
    "thank you for your time and goodbye",
    "thanks for your time and goodbye",
    "thank you and goodbye",
    "screening is complete",
    "interview is complete",
    "that concludes our interview",
    "that concludes our screening",
    "we'll be in touch. goodbye",
    "we will be in touch. goodbye",
    "we'll get back to you. goodbye",
    "we will get back to you. goodbye",
    "we'll contact you. goodbye",
    "we will contact you. goodbye",
    "end of interview",
    "end of screening",
]


def should_end_call(agent_text: str) -> bool:
    """
    Check if the agent's response indicates the call should end
    Only triggers when AI gives a clear closing statement with goodbye
    
    Args:
        agent_text: The text spoken by the AI agent
        
    Returns:
        bool: True if the call should end, False otherwise
    """
    if not agent_text:
        return False
    
    # Convert to lowercase for case-insensitive matching
    text_lower = agent_text.lower().strip()
    
    # Check for completion phrases (more specific now)
    for phrase in COMPLETION_PHRASES:
        if phrase in text_lower:
            return True
    
    # Check for patterns: "thank you" + "goodbye" + ("have a" OR "take care" OR "all the best")
    has_thank_you = "thank you" in text_lower or "thanks" in text_lower
    has_goodbye = "goodbye" in text_lower or "good bye" in text_lower
    has_closing = any(word in text_lower for word in ["have a great", "have a nice", "take care", "all the best", "best of luck"])
    
    # Only end if we have all three elements (more complete closing)
    if has_thank_you and has_goodbye and has_closing:
        return True
    
    return False
