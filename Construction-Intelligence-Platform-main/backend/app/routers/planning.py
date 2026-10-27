"""Project Planning Router — POST /api/planning/generate"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import PlanningRequest, PlanningResponse
from app.services.gemini_service import call_gemini_text
from app.prompts.planning_prompt import PLANNING_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/planning", tags=["Planning"])


@router.post("/generate", response_model=PlanningResponse)
async def generate_plan(
    request: PlanningRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate a comprehensive construction project plan."""
    special_reqs = ", ".join(request.special_requirements) if request.special_requirements else "None"

    prompt = PLANNING_PROMPT.format(
        project_type=request.project_type,
        size_sqft=request.size_sqft,
        budget_inr=request.budget_inr,
        deadline_months=request.deadline_months,
        workforce_count=request.workforce_count,
        location=request.location or "Not specified",
        special_requirements=special_reqs,
        notes=request.notes or "None",
    )

    try:
        result: PlanningResponse = await call_gemini_text(
            prompt=prompt,
            response_model=PlanningResponse,
        )
    except Exception as e:
        logger.error(f"Planning generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    record = Analysis(
        module="planning",
        input_summary=f"{request.project_type}, {request.size_sqft} sqft, ₹{request.budget_inr:,.0f}",
        result_json=result.model_dump_json(),
    )
    db.add(record)
    await db.commit()

    return result
