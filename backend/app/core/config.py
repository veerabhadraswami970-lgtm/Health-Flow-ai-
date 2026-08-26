"""
HealthFlow AI - Application Configuration
Modular, production-oriented configuration using Pydantic Settings.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthFlow AI"
    PROJECT_VERSION: str = "1.0.0"
    TAGLINE: str = "Healthcare Without Barriers"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = Field(default="development", description="development | staging | production")
    DEBUG: bool = True
    SECRET_KEY: str = Field(default="healthflow-ai-super-secret-key-change-in-production-2026", description="JWT Secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    QR_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived secure prescription token
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]
    
    # Storage & Persistence
    PERSISTENCE_MODE: str = Field(default="local", description="local | firestore")
    LOCAL_STORAGE_DIR: str = str(BASE_DIR / "data_store")
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    
    # Telephony Integrations (Twilio / Exotel / Mock)
    TELEPHONY_PROVIDER: str = Field(default="mock", description="mock | twilio | exotel")
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    EXOTEL_API_KEY: Optional[str] = None
    EXOTEL_API_TOKEN: Optional[str] = None
    
    # ABDM & Government Sandbox Integrations
    ABDM_CLIENT_ID: Optional[str] = None
    ABDM_CLIENT_SECRET: Optional[str] = None
    ABDM_SANDBOX_BASE_URL: str = "https://dev.abdm.gov.in/gateway/v0.5"
    USE_MOCK_INTEGRATIONS: bool = True  # True for local zero-dependency execution
    
    # AI & Speech Configuration
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: List[str] = ["en", "te", "hi", "ta", "kn", "ml", "mr", "bn", "gu", "pa", "or"]
    
    # National Emergency Numbers
    EMERGENCY_AMBULANCE_NUMBER: str = "108"
    EMERGENCY_NATIONAL_NUMBER: str = "112"
    EMERGENCY_MATERNAL_NUMBER: str = "102"
    
    # Accident Detection Engine Parameters
    ACCIDENT_IMPACT_WEIGHT: float = 35.0
    ACCIDENT_ROTATION_WEIGHT: float = 20.0
    ACCIDENT_STOP_WEIGHT: float = 20.0
    ACCIDENT_INACTIVITY_WEIGHT: float = 15.0
    ACCIDENT_ORIENTATION_WEIGHT: float = 10.0
    ACCIDENT_CONFIRMATION_TIMEOUT_SEC: int = 20
    ACCIDENT_AUTO_ESCALATE_ENABLED: bool = True
    ACCIDENT_POSSIBLE_THRESHOLD: float = 40.0
    ACCIDENT_HIGH_RISK_THRESHOLD: float = 70.0
    ACCIDENT_CRITICAL_THRESHOLD: float = 85.0
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
