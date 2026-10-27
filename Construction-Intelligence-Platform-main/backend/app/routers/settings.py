"""Settings Router — GET /api/settings, POST /api/settings/apikey, POST /api/settings/test-key"""
import logging
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.config import get_settings, update_api_key

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settings", tags=["Settings"])


class ApiKeyUpdateRequest(BaseModel):
    api_key: str


class SettingsResponse(BaseModel):
    ai_key_configured: bool
    masked_key: str
    gemini_model: str
    max_upload_size_mb: int
    is_demo_mode: bool


def _mask_key(key: str) -> str:
    k = (key or "").strip()
    if not k or k == "your_gemini_api_key_here":
        return "Not Configured (Demo Simulation Mode)"
    if len(k) <= 8:
        return "****"
    return f"{k[:4]}...{k[-4:]}"


@router.get("", response_model=SettingsResponse)
async def get_system_settings():
    """Retrieve system configuration status."""
    settings = get_settings()
    is_valid = settings.has_valid_api_key
    return SettingsResponse(
        ai_key_configured=is_valid,
        masked_key=_mask_key(settings.gemini_api_key),
        gemini_model=settings.gemini_model,
        max_upload_size_mb=settings.max_upload_size_mb,
        is_demo_mode=not is_valid,
    )


@router.post("/apikey")
async def set_api_key(request: ApiKeyUpdateRequest):
    """Update Google Gemini API key at runtime."""
    new_key = request.api_key.strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    update_api_key(new_key)
    settings = get_settings()
    return {
        "status": "success",
        "message": "Gemini API key updated successfully",
        "ai_key_configured": settings.has_valid_api_key,
        "masked_key": _mask_key(settings.gemini_api_key),
    }


@router.post("/test-key")
async def test_api_key():
    """Test currently configured Gemini API key with Google AI Studio."""
    settings = get_settings()
    if not settings.has_valid_api_key:
        return {
            "status": "demo",
            "connected": False,
            "message": "Platform is running in Demo Mode with built-in simulation engine. Configure a Gemini API key for live AI calls.",
        }

    try:
        from google import genai
        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents="Respond with the single word: OK",
        )
        return {
            "status": "live",
            "connected": True,
            "message": f"Successfully connected to Google Gemini ({settings.gemini_model})!",
            "response": response.text.strip() if response.text else "OK",
        }
    except Exception as e:
        logger.warning(f"Gemini API connection test failed: {e}")
        return {
            "status": "error",
            "connected": False,
            "message": f"Connection test failed: {str(e)}",
        }
