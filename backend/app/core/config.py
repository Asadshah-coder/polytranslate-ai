"""Application configuration via environment variables (pydantic-settings).

Every tunable in the system reads from here. No secrets are hard-coded;
copy `.env.example` to `.env` and fill in real values.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    APP_ENV: str = "development"  # development | production
    APP_NAME: str = "PolyTranslate AI"
    APP_VERSION: str = "1.0.0"

    # Database / cache
    DATABASE_URL: str = "sqlite:///./polytranslate.db"
    REDIS_URL: str = ""  # empty -> in-memory rate-limit storage

    # AI providers
    AI_PROVIDER: str = "auto"  # auto | gemini | openai
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS / frontend
    CORS_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Documents
    MAX_FILE_SIZE_MB: int = 10
    MAX_DOCUMENT_CHARS: int = 50000

    # Speech
    MAX_AUDIO_MB: int = 25

    # Rate limits (slowapi syntax, e.g. "30/minute")
    RATE_LIMIT_ANON: str = "30/minute"
    RATE_LIMIT_AUTH: str = "120/minute"

    # Usage caps (characters per calendar month)
    FREE_MONTHLY_CHARACTERS: int = 50000
    PRO_MONTHLY_CHARACTERS: int = 2000000
    BUSINESS_MONTHLY_CHARACTERS: int = 10000000

    @property
    def cors_origins(self) -> list[str]:
        origins = []
        for o in self.CORS_ORIGINS.split(","):
            o = o.strip().rstrip("/")
            if not o:
                continue
            # Render Blueprint wires bare hostnames (no scheme); assume https.
            if "://" not in o:
                o = f"https://{o}"
            origins.append(o)
        return origins

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


settings = Settings()
