import os
from typing import List

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

    @property
    def cors_origins(self) -> List[str]:
        if not self.CORS_ORIGINS_RAW or self.CORS_ORIGINS_RAW.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

settings = Settings()
