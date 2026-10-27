"""
Multimodal Construction Intelligence Platform — FastAPI Backend
"""
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.db import init_db
from app.routers import safety, cracks, valuation, planning, assistant, history, settings as settings_router

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🏗️  Starting Construction Intelligence Platform...")
    # Create uploads directory
    try:
        uploads_path = Path(settings.uploads_dir)
        uploads_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"✅ Uploads directory: {settings.uploads_dir}")
    except Exception as e:
        logger.warning(f"⚠️ Could not create uploads directory ({settings.uploads_dir}): {e}")

    # Initialize database
    try:
        await init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.warning(f"⚠️ Database initialization error: {e}")

    logger.info(f"✅ Gemini model: {settings.gemini_model}")
    logger.info(f"✅ AI API key configured: {settings.has_valid_api_key}")
    yield
    logger.info("🛑 Shutting down...")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Multimodal Construction Intelligence Platform",
    description="AI-powered decision-support system for construction professionals",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Vercel export aliases ────────────────────────────────────────────────────
# Vercel's Python runtime looks for 'app', 'application', or 'handler'
application = app
handler = app

# ── Static Uploads Mount ──────────────────────────────────────────────────────
# Wrapped in try/except: on Vercel's serverless runtime the filesystem may be
# read-only, so we degrade gracefully instead of crashing at import time.
uploads_dir_path = Path(settings.uploads_dir)
try:
    uploads_dir_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir_path)), name="uploads")
except Exception:  # noqa: BLE001
    pass

# ── CORS ──────────────────────────────────────────────────────────────────────
# On Vercel, set ALLOWED_ORIGINS="*" in environment variables for open access.
_raw_origins = settings.allowed_origins.strip()
_origins: list[str] | str = (
    "*" if _raw_origins == "*"
    else settings.allowed_origins_list + ["http://localhost:5173", "http://127.0.0.1:5173"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=(_raw_origins != "*"),  # credentials not allowed with wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(safety.router)
app.include_router(cracks.router)
app.include_router(valuation.router)
app.include_router(planning.router)
app.include_router(assistant.router)
app.include_router(history.router)
app.include_router(settings_router.router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    current_settings = get_settings()
    is_valid = current_settings.has_valid_api_key
    return {
        "status": "healthy",
        "version": "1.0.0",
        "platform": "Multimodal Construction Intelligence Platform",
        "gemini_model": current_settings.gemini_model,
        "ai_key_configured": is_valid,
        "mode": "live" if is_valid else "demo_simulation",
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Multimodal Construction Intelligence Platform API",
        "docs": "/docs",
        "health": "/api/health",
        "mode": "live" if get_settings().has_valid_api_key else "demo_simulation",
    }
