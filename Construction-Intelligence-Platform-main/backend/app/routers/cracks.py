"""Crack Detection Router — POST /api/cracks/analyze"""
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import CrackAnalysisResponse
from app.services.gemini_service import call_gemini_vision_bytes
from app.prompts.crack_prompt import CRACK_ANALYSIS_PROMPT

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api/cracks", tags=["Crack Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/analyze", response_model=CrackAnalysisResponse)
async def analyze_crack(
    image: UploadFile = File(..., description="Photo of the crack"),
    notes: str = Form(default="", description="Optional notes (element type, location)"),
    db: AsyncSession = Depends(get_db),
):
    """Analyze a crack in a structural element."""
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: jpg, png, webp")

    image_bytes = await image.read()
    if len(image_bytes) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.max_upload_size_mb} MB")

    # Save image
    uploads_dir = Path(settings.uploads_dir)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(image.filename or "image.jpg").suffix or ".jpg"
    filename = f"crack_{uuid.uuid4().hex}{ext}"
    file_path = uploads_dir / filename
    file_path.write_bytes(image_bytes)

    notes_section = f"\nAdditional context: {notes}" if notes else ""
    prompt = CRACK_ANALYSIS_PROMPT.replace("{additional_notes}", notes_section)

    try:
        result: CrackAnalysisResponse = await call_gemini_vision_bytes(
            prompt=prompt,
            image_bytes=image_bytes,
            mime_type=image.content_type,
            response_model=CrackAnalysisResponse,
        )
    except Exception as e:
        logger.error(f"Crack analysis failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    record = Analysis(
        module="crack_detection",
        input_summary=f"Image: {image.filename}, Notes: {notes[:100]}",
        result_json=result.model_dump_json(),
        image_path=str(file_path),
    )
    db.add(record)
    await db.commit()

    return result
