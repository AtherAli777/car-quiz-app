from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App Configuration
    app_name: str = "Car Quiz API"
    debug: bool = True
    version: str = "1.0.0"
    
    # API Keys (from environment variables - SECURE!)
    airtable_api_key: str = os.getenv("AIRTABLE_API_KEY", "")
    airtable_base_id: str = os.getenv("AIRTABLE_BASE_ID", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    
    # Email Settings (from environment variables - SECURE!)
    lead_email: str = os.getenv("LEAD_EMAIL", "sourcing@bookatestdrive.com.au")
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_username: str = os.getenv("SMTP_USERNAME", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"  # Allow all origins for production
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()