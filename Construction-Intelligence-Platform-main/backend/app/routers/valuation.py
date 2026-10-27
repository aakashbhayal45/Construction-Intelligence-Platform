"""Real Estate Valuation Router — POST /api/valuation/estimate"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import ValuationRequest, ValuationResponse
from app.services.gemini_service import call_gemini_text
from app.prompts.valuation_prompt import VALUATION_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/valuation", tags=["Valuation"])


@router.post("/estimate", response_model=ValuationResponse)
async def estimate_valuation(
    request: ValuationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Estimate real estate market value using AI."""
    amenities_str = ", ".join(request.amenities) if request.amenities else "None specified"

    prompt = VALUATION_PROMPT.format(
        location=request.location,
        area_sqft=request.area_sqft,
        property_type=request.property_type,
        age_years=request.age_years,
        bedrooms=request.bedrooms,
        bathrooms=request.bathrooms,
        amenities=amenities_str,
        condition=request.condition,
        floor_number=request.floor_number or "N/A",
        total_floors=request.total_floors or "N/A",
        notes=request.notes or "None",
    )

    try:
        result: ValuationResponse = await call_gemini_text(
            prompt=prompt,
            response_model=ValuationResponse,
        )
    except Exception as e:
        logger.error(f"Valuation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    record = Analysis(
        module="valuation",
        input_summary=f"{request.property_type} at {request.location}, {request.area_sqft} sqft",
        result_json=result.model_dump_json(),
    )
    db.add(record)
    await db.commit()

    return result
