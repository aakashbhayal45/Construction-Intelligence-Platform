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
    uploads_path = Path(settings.uploads_dir)
    uploads_path.mkdir(parents=True, exist_ok=True)
    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")
    logger.info(f"✅ Uploads directory: {settings.uploads_dir}")
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

# ── Static Uploads Mount ──────────────────────────────────────────────────────
uploads_dir_path = Path(settings.uploads_dir)
uploads_dir_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir_path)), name="uploads")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list + ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
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
