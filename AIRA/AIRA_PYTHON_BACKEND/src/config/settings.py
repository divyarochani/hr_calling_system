"""
Configuration settings for AI Calling Agent
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
ELEVENLABS_WS_URL = f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={ELEVENLABS_AGENT_ID}"

# Server Configuration
SERVER_URL = os.getenv("SERVER_URL")
NODEJS_BACKEND_URL = os.getenv("NODEJS_BACKEND_URL", "http://localhost:5000")

# Optional Features
HUMAN_AGENT_NUMBER = os.getenv("HUMAN_AGENT_NUMBER")

# Azure OpenAI Configuration (for data extraction)
AZURE_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Using OPENAI_API_KEY for Azure key
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_URL")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
AZURE_OPENAI_MODEL_NAME = os.getenv("AZURE_OPENAI_MODELNAME", "gpt-4")

# Recordings Directory
RECORDINGS_DIR = BASE_DIR / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)

# Transfer Keywords
TRANSFER_KEYWORDS = [
    "human", "agent","senior", "representative", "operator",
    "transfer", "speak to someone", "talk to someone", 
    "real person", "live agent", "customer service",
    "speak with", "talk with", "connect me", "real human",
    "actual person", "someone else", "supervisor", "manager"
]

# Validate required environment variables
REQUIRED_VARS = {
    "TWILIO_ACCOUNT_SID": TWILIO_ACCOUNT_SID,
    "TWILIO_AUTH_TOKEN": TWILIO_AUTH_TOKEN,
    "TWILIO_PHONE_NUMBER": TWILIO_PHONE_NUMBER,
    "ELEVENLABS_API_KEY": ELEVENLABS_API_KEY,
    "ELEVENLABS_AGENT_ID": ELEVENLABS_AGENT_ID,
    "SERVER_URL": SERVER_URL
}

def validate_config():
    """Validate required configuration"""
    missing = [k for k, v in REQUIRED_VARS.items() if not v]
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
