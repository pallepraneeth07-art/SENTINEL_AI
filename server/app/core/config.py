import os
from pathlib import Path
from typing import List

# Automatically load .env if present (checks current and project root)
try:
    from dotenv import load_dotenv
    # Root .env is 3 levels up from server/app/core/config.py
    root_env = Path(__file__).resolve().parents[3] / ".env"
    server_env = Path(__file__).resolve().parents[2] / ".env"
    if root_env.exists():
        load_dotenv(root_env)
    elif server_env.exists():
        load_dotenv(server_env)
    else:
        load_dotenv()
except ImportError:
    pass

try:
    from pydantic_settings import BaseSettings
    class BaseConfig(BaseSettings):
        pass
except ImportError:
    from pydantic import BaseModel
    class BaseConfig(BaseModel):
        pass

class Settings(BaseConfig):
    PROJECT_NAME: str = "Sentinel-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_SALT: str = os.getenv("SECRET_SALT", "sentinel-secure-salt-key-9281")
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "*")

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_ANON_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")))

    @property
    def cors_origins(self) -> List[str]:
        if not self.CORS_ORIGINS_RAW or self.CORS_ORIGINS_RAW.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    @property
    def has_supabase(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY)

settings = Settings()
