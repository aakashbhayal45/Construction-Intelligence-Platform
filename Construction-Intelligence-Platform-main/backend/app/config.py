from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")

    gemini_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./construction.db"
    uploads_dir: str = "./uploads"
    max_upload_size_mb: int = 5
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    gemini_model: str = "gemini-2.0-flash"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


    @property
    def has_valid_api_key(self) -> bool:
        k = (self.gemini_api_key or "").strip()
        return bool(k and k != "your_gemini_api_key_here" and len(k) > 10)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def update_api_key(new_key: str) -> None:
    """Update API key at runtime and persist to .env file."""
    settings = get_settings()
    settings.gemini_api_key = new_key.strip()
    env_path = ".env"
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        key_found = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f"GEMINI_API_KEY={new_key.strip()}\n")
                key_found = True
            else:
                new_lines.append(line)
        if not key_found:
            new_lines.append(f"GEMINI_API_KEY={new_key.strip()}\n")
        
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Could not persist API key to .env: {e}")

