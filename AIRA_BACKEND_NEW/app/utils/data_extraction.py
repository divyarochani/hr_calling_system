"""
Service for extracting structured data from conversations for transfer briefing
"""
import json
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


def build_transfer_summary(candidate_data: Dict, reason: str = "") -> str:
    """
    Build a concise summary to brief the human agent before transfer.
    This is spoken to the human agent when they answer the transferred call.
    
    Args:
        candidate_data: Dictionary with candidate information
        reason: Reason for transfer
        
    Returns:
        str: Summary text to be spoken to human agent
    """
    parts = []
    
    # Start with greeting
    parts.append("Incoming transfer from AIRA HR assistant.")
    
    # Add reason if provided
    if reason:
        parts.append(f"Transfer reason: {reason}.")
    
    # Add candidate details
    details = []
    
    if candidate_data.get("candidate_name"):
        details.append(f"Candidate name is {candidate_data['candidate_name']}")
    
    if candidate_data.get("domain"):
        details.append(f"Domain is {candidate_data['domain']}")
    
    if candidate_data.get("experience_years"):
        details.append(f"Experience is {candidate_data['experience_years']} years")
    
    if candidate_data.get("current_ctc_lpa"):
        details.append(f"Current CTC is {candidate_data['current_ctc_lpa']} LPA")
    
    if candidate_data.get("expected_ctc_lpa"):
        details.append(f"Expected CTC is {candidate_data['expected_ctc_lpa']} LPA")
    
    if candidate_data.get("notice_period"):
        details.append(f"Notice period is {candidate_data['notice_period']}")
    
    if candidate_data.get("current_location"):
        details.append(f"Location is {candidate_data['current_location']}")
    
    if details:
        parts.append(f"Candidate details: {', '.join(details)}.")
    else:
        parts.append("Candidate details not available.")
    
    # Join all parts
    summary = " ".join(parts)
    
    logger.info(f"Built transfer summary: {summary[:100]}...")
    return summary


def extract_candidate_info_from_transcript(transcript_text: str) -> Dict:
    """
    Extract candidate information from transcript text.
    This is a simple keyword-based extraction for quick transfer briefing.
    
    For more advanced extraction, integrate with Azure OpenAI (see old code).
    
    Args:
        transcript_text: Full conversation transcript
        
    Returns:
        Dict with extracted candidate information
    """
    # Default structure
    extracted = {
        "candidate_name": None,
        "domain": None,
        "experience_years": None,
        "current_ctc_lpa": None,
        "expected_ctc_lpa": None,
        "notice_period": None,
        "current_location": None,
        "current_company": None,
        "current_role": None,
    }
    
    if not transcript_text:
        return extracted
    
    # Convert to lowercase for matching
    text_lower = transcript_text.lower()
    lines = transcript_text.split('\n')
    
    # Simple keyword-based extraction
    # This is basic - for production, use Azure OpenAI or similar
    
    # Extract name (look for "my name is" or "I am")
    for line in lines:
        if 'candidate:' in line.lower():
            if 'my name is' in line.lower():
                # Extract name after "my name is"
                parts = line.lower().split('my name is')
                if len(parts) > 1:
                    name_part = parts[1].strip().split()[0:3]  # Get first 3 words
                    extracted["candidate_name"] = ' '.join(name_part).strip('.,!?')
            elif 'i am' in line.lower() and not extracted["candidate_name"]:
                parts = line.lower().split('i am')
                if len(parts) > 1:
                    name_part = parts[1].strip().split()[0:3]
                    extracted["candidate_name"] = ' '.join(name_part).strip('.,!?')
    
    # Extract domain/technology
    domains = ['python', 'java', 'javascript', 'react', 'angular', 'node', 'dotnet', '.net', 
               'data science', 'machine learning', 'devops', 'cloud', 'aws', 'azure', 
               'full stack', 'frontend', 'backend', 'mobile', 'android', 'ios']
    
    for domain in domains:
        if domain in text_lower:
            extracted["domain"] = domain.title()
            break
    
    # Extract experience (look for "X years")
    import re
    exp_patterns = [
        r'(\d+\.?\d*)\s*years?\s+(?:of\s+)?experience',
        r'experience\s+(?:of\s+)?(\d+\.?\d*)\s*years?',
        r'(\d+\.?\d*)\s*years?\s+in',
    ]
    
    for pattern in exp_patterns:
        match = re.search(pattern, text_lower)
        if match:
            extracted["experience_years"] = match.group(1)
            break
    
    # Extract CTC (look for "lakh" or "LPA")
    ctc_patterns = [
        r'current\s+(?:ctc|salary|package).*?(\d+\.?\d*)\s*(?:lakh|lpa)',
        r'(\d+\.?\d*)\s*(?:lakh|lpa).*?current',
        r'earning\s+(\d+\.?\d*)\s*(?:lakh|lpa)',
    ]
    
    for pattern in ctc_patterns:
        match = re.search(pattern, text_lower)
        if match:
            extracted["current_ctc_lpa"] = match.group(1)
            break
    
    # Extract expected CTC
    exp_ctc_patterns = [
        r'expect(?:ed|ing)?\s+(?:ctc|salary|package).*?(\d+\.?\d*)\s*(?:lakh|lpa)',
        r'(\d+\.?\d*)\s*(?:lakh|lpa).*?expect',
        r'looking\s+for\s+(\d+\.?\d*)\s*(?:lakh|lpa)',
    ]
    
    for pattern in exp_ctc_patterns:
        match = re.search(pattern, text_lower)
        if match:
            extracted["expected_ctc_lpa"] = match.group(1)
            break
    
    # Extract notice period
    notice_patterns = [
        r'notice\s+period.*?(\d+)\s*(?:days?|months?|weeks?)',
        r'(\d+)\s*(?:days?|months?|weeks?)\s+notice',
        r'immediate\s+joiner',
        r'can\s+join\s+immediately',
    ]
    
    for pattern in notice_patterns:
        match = re.search(pattern, text_lower)
        if match:
            if 'immediate' in pattern:
                extracted["notice_period"] = "Immediate"
            else:
                extracted["notice_period"] = match.group(0)
            break
    
    logger.info(f"Extracted candidate info: {extracted}")
    return extracted


def extract_from_candidate_model(candidate) -> Dict:
    """
    Extract candidate information from Candidate model for transfer briefing.
    
    Args:
        candidate: Candidate model instance
        
    Returns:
        Dict with candidate information
    """
    return {
        "candidate_name": candidate.candidate_name,
        "domain": candidate.domain,
        "experience_years": str(candidate.experience_years) if candidate.experience_years else None,
        "current_ctc_lpa": str(candidate.current_ctc_lpa) if candidate.current_ctc_lpa else None,
        "expected_ctc_lpa": str(candidate.expected_ctc_lpa) if candidate.expected_ctc_lpa else None,
        "notice_period": candidate.notice_period,
        "current_location": candidate.current_location,
        "current_company": candidate.current_company,
        "current_role": candidate.current_role,
    }
