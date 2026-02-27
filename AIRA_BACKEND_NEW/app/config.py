"""Application configuration"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "AIRA - AI HR Agent"
    app_version: str = "2.0.0"
    debug: bool = False
    base_url: str = "http://localhost:8000"
    timezone: str = "Asia/Kolkata"  # India timezone
    
    # Database
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "aira"
    
    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Twilio
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str
    
    # ElevenLabs
    elevenlabs_api_key: str
    elevenlabs_agent_id: str
    elevenlabs_agent_phone_number_id: str
    elevenlabs_tools_api_key: str
    elevenlabs_webhook_secret: str
    
    # Azure OpenAI (optional - not used, ElevenLabs handles transcripts/summaries)
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_api_version: str = "2024-02-15-preview"
    azure_openai_deployment: str = "gpt-4"
    
    # Azure Blob Storage (optional)
    azure_storage_connection_string: str = ""
    azure_storage_container_name: str = "aira-recordings"
    
    # Human Agent
    human_agent_number: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
