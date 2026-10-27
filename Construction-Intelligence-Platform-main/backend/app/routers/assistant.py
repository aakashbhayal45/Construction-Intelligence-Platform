"""Daily Assistant & Chat Router — POST /api/assistant/daily, POST /api/assistant/chat"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import (
    DailyAssistantRequest, DailyAssistantResponse,
    ChatRequest, ChatResponse,
)
from app.services.gemini_service import call_gemini_text
from app.services.weather_service import get_weather
from app.prompts.assistant_prompt import DAILY_ASSISTANT_PROMPT
from app.prompts.chat_prompt import CHAT_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/assistant", tags=["Assistant"])


@router.post("/daily", response_model=DailyAssistantResponse)
async def daily_advisory(
    request: DailyAssistantRequest,
    db: AsyncSession = Depends(get_db),
):
    """Get weather-aware daily site advisory."""
    # Fetch live weather
    try:
        weather = await get_weather(request.location)
    except Exception as e:
        logger.warning(f"Weather fetch failed: {e}. Using defaults.")
        from app.schemas.schemas import WeatherInfo
        weather = WeatherInfo(
            temperature_c=30.0,
            wind_speed_kmh=15.0,
            precipitation_mm=0.0,
            humidity_percent=65.0,
            condition="Unknown (weather service unavailable)",
        )

    activities_str = "\n".join(f"- {a}" for a in request.activities)

    prompt = DAILY_ASSISTANT_PROMPT.format(
        location=request.location,
        activities=activities_str,
        workforce_count=request.workforce_count,
        notes=request.notes or "None",
        temperature=weather.temperature_c,
        wind_speed=weather.wind_speed_kmh,
        precipitation=weather.precipitation_mm,
        humidity=weather.humidity_percent,
        condition=weather.condition,
    )

    try:
        result: DailyAssistantResponse = await call_gemini_text(
            prompt=prompt,
            response_model=DailyAssistantResponse,
        )
        # Override weather with live data
        result.weather = weather
    except Exception as e:
        logger.error(f"Daily advisory failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    record = Analysis(
        module="daily_assistant",
        input_summary=f"Location: {request.location}, Activities: {len(request.activities)}",
        result_json=result.model_dump_json(),
    )
    db.add(record)
    await db.commit()

    return result


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Construction knowledge assistant chat."""
    history_str = ""
    for msg in request.history[-10:]:  # Last 10 messages
        role = "User" if msg.role == "user" else "Assistant"
        history_str += f"{role}: {msg.content}\n"

    prompt = CHAT_PROMPT.format(
        history=history_str or "No previous messages.",
        message=request.message,
    )

    try:
        result: ChatResponse = await call_gemini_text(
            prompt=prompt,
            response_model=ChatResponse,
        )
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    record = Analysis(
        module="chat",
        input_summary=f"Q: {request.message[:100]}",
        result_json=result.model_dump_json(),
    )
    db.add(record)
    await db.commit()

    return result
