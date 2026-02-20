"""
Run script for AI Calling Agent
Ensures proper Python path setup
"""
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import and run
if __name__ == "__main__":
    import uvicorn
    from src.main import app
    from src.config import settings
    
    print("\n" + "="*60)
    print("🚀 Starting AI Calling Agent API")
    print("="*60)
    print(f"Server: {settings.SERVER_URL}")
    print(f"Twilio: {settings.TWILIO_PHONE_NUMBER}")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
