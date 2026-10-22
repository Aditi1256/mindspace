import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "Student Stress Check-In API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stress_checkin.db")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "saved_models/cnn-v1.0.onnx")
    METADATA_PATH: str = os.getenv("METADATA_PATH", "saved_models/metadata.json")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-student-wellness-jwt-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24


settings = Settings()
