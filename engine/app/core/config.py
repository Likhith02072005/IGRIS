import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IGRIS Engine"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/igris_quant?schema=public")
    
    # Redis & Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    # Security
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "b'XW45T-qV_nZ4j9v8e3r2k-6q1w5e_r8y2u3i4o5p6a='")
    
    # API Secret Key
    JWT_SECRET: str = os.getenv("JWT_SECRET", "igris-quant-secret-key-institutional-grade")

    class Config:
        case_sensitive = True

settings = Settings()
