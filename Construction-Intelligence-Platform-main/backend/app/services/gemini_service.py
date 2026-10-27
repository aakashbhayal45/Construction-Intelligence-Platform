"""
Gemini AI service — wraps google-genai SDK.
Handles text-only and multimodal (image + text) calls with Pydantic validation,
retry-once logic, structured JSON output, and intelligent simulated demo fallback.
"""
import json
import logging
from pathlib import Path
from typing import Any, Type

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.config import get_settings
from app.services.fallback_service import (
    generate_fallback_safety,
    generate_fallback_crack,
    generate_fallback_valuation,
    generate_fallback_planning,
    generate_fallback_daily,
    generate_fallback_chat,
)

logger = logging.getLogger(__name__)


def _get_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


def _generate_fallback(model_cls: Type[BaseModel], prompt: str = "") -> BaseModel:
    name = model_cls.__name__
    if "Safety" in name:
        return generate_fallback_safety(prompt)
    elif "Crack" in name:
        return generate_fallback_crack(prompt)
    elif "Valuation" in name:
        return generate_fallback_valuation(prompt)
    elif "Planning" in name:
        return generate_fallback_planning(prompt)
    elif "Daily" in name:
        return generate_fallback_daily(prompt)
    elif "Chat" in name:
        return generate_fallback_chat(prompt)
    raise ValueError(f"Unknown response model class: {name}")


async def call_gemini_text(
    prompt: str,
    response_model: Type[BaseModel],
    retries: int = 1,
) -> BaseModel:
    """Call Gemini with a text-only prompt and parse the JSON response."""
    settings = get_settings()

    if not settings.has_valid_api_key:
        logger.info(f"Using simulated AI response for {response_model.__name__} (no API key configured)")
        return _generate_fallback(response_model, prompt)

    client = _get_client()

    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                    max_output_tokens=4096,
                ),
            )
            raw_text = response.text.strip()
            # Strip markdown code fences if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            data = json.loads(raw_text)
            return response_model.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Attempt {attempt + 1} failed validation: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated response after validation failure")
                return _generate_fallback(response_model, prompt)
        except Exception as e:
            logger.error(f"Gemini API error on attempt {attempt + 1}: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated response after API error")
                return _generate_fallback(response_model, prompt)


async def call_gemini_vision(
    prompt: str,
    image_path: str,
    response_model: Type[BaseModel],
    retries: int = 1,
) -> BaseModel:
    """Call Gemini with an image + text prompt."""
    settings = get_settings()

    if not settings.has_valid_api_key:
        logger.info(f"Using simulated AI vision response for {response_model.__name__} (no API key configured)")
        return _generate_fallback(response_model, prompt)

    client = _get_client()

    img_bytes = Path(image_path).read_bytes()
    suffix = Path(image_path).suffix.lower()
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
    mime_type = mime_map.get(suffix, "image/jpeg")

    image_part = types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
    text_part = types.Part.from_text(text=prompt)

    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=[types.Content(role="user", parts=[image_part, text_part])],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                    max_output_tokens=4096,
                ),
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            data = json.loads(raw_text)
            return response_model.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Vision attempt {attempt + 1} failed: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated vision response after validation failure")
                return _generate_fallback(response_model, prompt)
        except Exception as e:
            logger.error(f"Gemini Vision API error attempt {attempt + 1}: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated vision response after API error")
                return _generate_fallback(response_model, prompt)


async def call_gemini_vision_bytes(
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    response_model: Type[BaseModel],
    retries: int = 1,
) -> BaseModel:
    """Call Gemini with raw image bytes."""
    settings = get_settings()

    if not settings.has_valid_api_key:
        logger.info(f"Using simulated AI vision response for {response_model.__name__} (no API key configured)")
        return _generate_fallback(response_model, prompt)

    client = _get_client()
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    text_part = types.Part.from_text(text=prompt)

    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=[types.Content(role="user", parts=[image_part, text_part])],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                    max_output_tokens=4096,
                ),
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            data = json.loads(raw_text)
            return response_model.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Bytes vision attempt {attempt + 1} failed: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated vision response after validation failure")
                return _generate_fallback(response_model, prompt)
        except Exception as e:
            logger.error(f"Gemini Vision bytes error attempt {attempt + 1}: {e}")
            if attempt == retries:
                logger.warning("Falling back to simulated vision response after API error")
                return _generate_fallback(response_model, prompt)
