from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional,ClassVar,Dict,Any


class Settings(BaseSettings):
    """Application settings"""

    # App
    PROJECT_NAME: str = "DafLegal"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # OpenAI
    OPENAI_API_KEY: str

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_STARTER_PRICE_ID: str
    STRIPE_PRO_PRICE_ID: str
    STRIPE_TEAM_PRICE_ID: str

    # Sentry
    SENTRY_DSN: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Plans Configuration
    PLANS: ClassVar[Dict[str, Any]] = {
        "free_trial": {
            "name": "Free Trial",
            "price": 0,
            "pages_per_month": 30,
            "files_per_month": 3,
            "stripe_price_id": None
        },
        "starter": {
            "name": "Starter",
            "price": 19,
            "pages_per_month": 50,
            "files_per_month": 20,
            "stripe_price_id": "STRIPE_STARTER_PRICE_ID"
        },
        "pro": {
            "name": "Pro",
            "price": 49,
            "pages_per_month": 300,
            "files_per_month": 120,
            "stripe_price_id": "STRIPE_PRO_PRICE_ID"
        },
        "team": {
            "name": "Team",
            "price": 99,
            "pages_per_month": 1000,
            "files_per_month": 400,
            "stripe_price_id": "STRIPE_TEAM_PRICE_ID"
        }
    }

    # Document Processing
    MAX_FILE_SIZE_MB: int = 25
    WORDS_PER_PAGE: int = 800  # Average for page counting

    # ClamAV Virus Scanning (Optional - gracefully degrades if not available)
    CLAMAV_ENABLED: bool = False  # Disabled by default until ClamAV service is configured
    CLAMAV_USE_TCP: bool = True  # Use TCP connection (True) or Unix socket (False)
    CLAMAV_HOST: str = "clamav"  # Hostname/IP of ClamAV daemon
    CLAMAV_PORT: int = 3310  # ClamAV daemon port
    CLAMAV_SOCKET_PATH: str = "/var/run/clamav/clamd.sock"  # Unix socket path (if USE_TCP=False)
    CLAMAV_TIMEOUT: int = 30  # Timeout in seconds for scan operations

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
