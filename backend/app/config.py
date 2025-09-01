from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application settings
    app_name: str = "PlanHer API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database settings
    database_url: str = "sqlite:///./planher.db"  # Default to SQLite for development
    database_echo: bool = False
    
    # JWT settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS settings
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:8001"]
    allowed_methods: list = ["GET", "POST", "PUT", "DELETE"]
    allowed_headers: list = ["*"]
    
    # ML Model settings
    ml_retrain_threshold: int = 10  # Retrain after 10 new mood entries
    ml_accuracy_threshold: float = 0.7  # Minimum accuracy for model acceptance
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        protected_namespaces = ('settings_',)


# Create settings instance
settings = Settings()
