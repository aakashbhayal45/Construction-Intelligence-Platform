"""Safety Monitoring Router — POST /api/safety/analyze"""
import json
import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import SafetyAnalysisResponse, ErrorResponse
from app.services.gemini_service import call_gemini_vision_bytes
from app.prompts.safety_prompt import SAFETY_ANALYSIS_PROMPT

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/safety", tags=["Safety"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/analyze", response_model=SafetyAnalysisResponse)
async def analyze_safety(
    image: UploadFile = File(..., description="Construction site photo"),
    notes: str = Form(default="", description="Optional inspector notes"),
    db: AsyncSession = Depends(get_db),
):
    """Analyze a construction site image for safety violations."""
    # Validate file type
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: jpg, png, webp")

    # Read and validate size
    image_bytes = await image.read()
    if len(image_bytes) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.max_upload_size_mb} MB")

    # Save image
    uploads_dir = Path(settings.uploads_dir)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(image.filename or "image.jpg").suffix or ".jpg"
    filename = f"safety_{uuid.uuid4().hex}{ext}"
    file_path = uploads_dir / filename
    file_path.write_bytes(image_bytes)

    # Build prompt
    notes_section = f"\nInspector Notes: {notes}" if notes else ""
    prompt = SAFETY_ANALYSIS_PROMPT.replace("{additional_notes}", notes_section)

    try:
        result: SafetyAnalysisResponse = await call_gemini_vision_bytes(
            prompt=prompt,
            image_bytes=image_bytes,
            mime_type=image.content_type,
            response_model=SafetyAnalysisResponse,
        )
    except Exception as e:
        logger.error(f"Safety analysis failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    # Persist to DB
    record = Analysis(
        module="safety",
        input_summary=f"Image: {image.filename}, Notes: {notes[:100]}",
        result_json=result.model_dump_json(),
        image_path=str(file_path),
    )
    db.add(record)
    await db.commit()

    return result
