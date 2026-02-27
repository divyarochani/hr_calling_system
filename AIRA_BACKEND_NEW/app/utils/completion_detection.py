"""
Utility for detecting call completion phrases
"""

# Phrases that indicate the interview/screening is complete
# Updated to match ElevenLabs HR agent closing statements
COMPLETION_PHRASES = [
    # Main closing statement from prompt - EXACT MATCH
    "your screening interview is now completed",
    "screening interview is now completed",
    "interview is now completed",
    "your screening interview is completed",
    "screening interview is completed",
    "interview is completed",
    
    # Parts of the main closing statement
    "thank you for your time",
    "our team will review your profile",
    "if shortlisted, we will contact you",
    "we will contact you for the next round",
    "have a great day ahead",
    "great day ahead",  # Shorter version
    
    # Call back phrases - IMPORTANT FOR YOUR CASE
    "i will call you tomorrow",
    "i'll call you tomorrow",
    "will call you tomorrow",
    "call you tomorrow",
    "i will call you back",
    "i'll call you back",
    "will call you back",
    "call you back",
    "i will contact you",
    "i'll contact you",
    "will contact you",
    
    # Generic goodbye phrases
    "goodbye and have a great day",
    "goodbye and take care",
    "goodbye and all the best",
    "thank you for your time and goodbye",
    "thanks for your time and goodbye",
    "thank you and goodbye",
    "goodbye",
    "bye",
    
    # Interview/screening completion phrases
    "screening is complete",
    "interview is complete",
    "that concludes our interview",
    "that concludes our screening",
    "that concludes the interview",
    "that concludes the screening",
    "this concludes our interview",
    "this concludes our screening",
    "this concludes the interview",
    "this concludes the screening",
    
    # Contact phrases with goodbye
    "we'll be in touch. goodbye",
    "we will be in touch. goodbye",
    "we'll get back to you. goodbye",
    "we will get back to you. goodbye",
    "we'll contact you. goodbye",
    "we will contact you. goodbye",
    "we will contact you for the next round",
    "we'll reach out to you",
    "we will reach out to you",
    
    # End phrases
    "end of interview",
    "end of screening",
    "end of the interview",
    "end of the screening",
    "have a great day ahead",
    "have a nice day ahead",
    "have a wonderful day",
    "have a good day",
    "take care",
    
    # Specific to your prompt
    "we will stay in touch for future opportunities",
    "thank you so much for your time",
    "thanks so much for your time",
    
    # Closing with next steps
    "we'll be in touch soon",
    "we will be in touch soon",
    "talk to you soon",
    "speak to you soon",
    "we'll call you back",
    "we will call you back",
]


def should_end_call(agent_text: str) -> bool:
    """
    Check if the agent's response indicates the call should end
    Only triggers when AI gives a clear closing statement
    
    Args:
        agent_text: The text spoken by the AI agent
        
    Returns:
        bool: True if the call should end, False otherwise
    """
    if not agent_text:
        return False
    
    # Convert to lowercase for case-insensitive matching
    text_lower = agent_text.lower().strip()
    
    # Remove extra whitespace and normalize
    text_lower = ' '.join(text_lower.split())
    
    # Check for completion phrases
    for phrase in COMPLETION_PHRASES:
        if phrase in text_lower:
            return True
    
    # Check for the main closing pattern from your prompt:
    # "Thank you for your time. Your screening interview is now completed..."
    if "thank you for your time" in text_lower and ("screening" in text_lower or "interview" in text_lower):
        return True
    
    # IMPORTANT: Check for "call you tomorrow" or "call you back" patterns
    if ("call you" in text_lower or "contact you" in text_lower) and ("tomorrow" in text_lower or "back" in text_lower or "soon" in text_lower or "later" in text_lower):
        return True
    
    # Check for "great day ahead" - strong closing indicator
    if "great day ahead" in text_lower or "good day ahead" in text_lower or "nice day ahead" in text_lower:
        return True
    
    # Check for pattern: screening/interview + completed/complete + have a great day
    has_screening = "screening" in text_lower or "interview" in text_lower
    has_completed = "completed" in text_lower or "complete" in text_lower or "concludes" in text_lower
    has_closing = "have a great day" in text_lower or "have a nice day" in text_lower or "take care" in text_lower or "goodbye" in text_lower or "great day ahead" in text_lower
    
    if has_screening and has_completed:
        return True
    
    if has_screening and has_closing:
        return True
    
    if has_completed and has_closing:
        return True
    
    # Check for pattern: "thank you" + "next round" + "have a great day"
    has_thank_you = "thank you" in text_lower or "thanks" in text_lower
    has_next_round = "next round" in text_lower or "get back to you" in text_lower or "be in touch" in text_lower or "contact you" in text_lower
    has_goodbye = "goodbye" in text_lower or "have a great day" in text_lower or "have a nice day" in text_lower or "great day ahead" in text_lower
    
    if has_thank_you and has_next_round:
        return True
    
    if has_next_round and has_goodbye:
        return True
    
    # Check for "thank you" + "great day ahead" - common closing
    if has_thank_you and "great day ahead" in text_lower:
        return True
    
    # Check for "thank you" + "call you" - indicates ending
    if has_thank_you and ("call you" in text_lower or "contact you" in text_lower):
        return True
    
    # Check for "review your profile" + closing
    has_review = "review your profile" in text_lower or "review your application" in text_lower
    if has_review and (has_closing or has_goodbye):
        return True
    
    # Check for strong closing indicators
    strong_closings = [
        "that's all for today",
        "that is all for today",
        "this is the end",
        "we are done",
        "we're done",
        "call is complete",
        "call is over",
        "end of call",
    ]
    
    for closing in strong_closings:
        if closing in text_lower:
            return True
    
    return False
