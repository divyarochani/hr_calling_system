"""
Service for extracting structured data from conversations using Azure OpenAI
"""
import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

try:
    from openai import AzureOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def extract_structured_data(
    conversation: List[Dict[str, str]], 
    azure_api_key: str = None,
    azure_endpoint: str = None,
    azure_api_version: str = None,
    azure_model_name: str = None
) -> Dict:
    """
    Extract structured userData from conversation transcript using Azure OpenAI
    """
    # Default structure with null values
    default_structure = {
        "candidate_name": None,
        "current_company": None,
        "current_role": None,
        "desired_role": None,
        "domain": None,
        "notice_period": None,
        "current_location": None,
        "relocation_willing": None,
        "experience_years": None,
        "current_ctc_lpa": None,
        "expected_ctc_lpa": None,
        "email": None,
        "next_round_availability": None,
        "communication_score": None,
        "technical_score": None,
        "overall_score": None,
        "interested": None,
        "call_status": None,
        "disconnection_reason": None
    }
    
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI package not installed")
        print("⚠️  OpenAI not installed - returning empty structure")
        return default_structure
    
    if not azure_api_key or not azure_endpoint:
        logger.warning("Azure OpenAI credentials not configured")
        print("⚠️  Azure OpenAI not configured - returning empty structure")
        return default_structure
    
    try:
        # Build conversation text
        transcript_text = "\n".join([
            f"{'Candidate' if msg['role'] == 'user' else 'AIRA'}: {msg['text']}"
            for msg in conversation
        ])
        
        print(f"📤 Sending transcript to Azure OpenAI for extraction...")
        
        # Initialize Azure OpenAI client
        client = AzureOpenAI(
            api_key=azure_api_key,
            api_version=azure_api_version or "2024-02-15-preview",
            azure_endpoint=azure_endpoint
        )
        
        # Extraction prompt
        system_prompt = """You are a data extraction assistant. Extract structured information from HR interview transcripts.

Extract the following fields into JSON format. Use null for fields not mentioned:
{
  "candidate_name": null,
  "current_company": null,
  "current_role": null,
  "desired_role": null,
  "domain": null,
  "notice_period": null,
  "current_location": null,
  "relocation_willing": null,
  "experience_years": null,
  "current_ctc_lpa": null,
  "expected_ctc_lpa": null,
  "email": null,
  "next_round_availability": null,
  "communication_score": null,
  "technical_score": null,
  "overall_score": null,
  "interested": null,
  "call_status": null,
  "disconnection_reason": null
}

Rules:
- Use null (not empty string) if field not mentioned
- For scores (1-10): evaluate based on responses, use null if can't determine
- communication_score: clarity, grammar, confidence
- technical_score: technical knowledge demonstrated
- overall_score: average of communication and technical
- interested: "yes" if candidate engaged, "no" if declined/not interested, null if unclear
- relocation_willing: "yes", "no", or null
- notice_period: extract as mentioned (e.g., "immediate", "30 days", "2 months")
- experience_years: extract as number string (e.g., "5", "3.5")
- CTC values: extract as number string in LPA (e.g., "12", "15.5")
- next_round_availability: extract date/time mentioned for next round (e.g., "Monday 10 AM", "Tomorrow 3 PM")
- call_status: "Completed", "Rescheduled", "Not Interested", "Screen Rejected", or "Disconnected"
- disconnection_reason: reason for call ending (e.g., "Candidate not looking for opportunity", "Domain not eligible", "Notice period exceeds requirement", "Location constraint", "Requested callback", "Candidate busy", "Call disconnected unexpectedly", "N/A" if completed normally)

Return ONLY valid JSON, no explanation."""

        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=azure_model_name or "gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract data from this interview:\n\n{transcript_text}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        extracted_data = json.loads(response.choices[0].message.content)
        print(f"✅ Data extracted successfully using Azure OpenAI")
        logger.info("Structured data extracted successfully using Azure OpenAI")
        
        # Ensure all expected fields exist
        for key in default_structure.keys():
            if key not in extracted_data:
                extracted_data[key] = None
        
        return extracted_data
        
    except Exception as e:
        logger.error(f"Failed to extract structured data: {e}")
        print(f"❌ Extraction failed: {e}")
        return default_structure
