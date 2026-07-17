import os
from typing import List
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "AI-CHD-CDSS"

    # PostgreSQL Configuration
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_chd_secure_pwd"
    POSTGRES_DB: str = "chd_cdss"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql://postgres:postgres_chd_secure_pwd@localhost:5432/chd_cdss"

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security Configuration
    JWT_SECRET_KEY: str = "generate_a_very_secure_random_key_here_for_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    # MIMIC Dataset Paths
    MIMIC_DATA_PATH: str = "d:/mimic-iv-clinical-database-demo-2.2/mimic-iv-clinical-database-demo-2.2"
    PROCESSED_DATA_PATH: str = "d:/Bio-Tech Project/etl/processed_chd_data.csv"

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
