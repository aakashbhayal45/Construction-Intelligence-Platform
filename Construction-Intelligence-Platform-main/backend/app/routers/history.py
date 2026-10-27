"""History Router — GET /api/history, DELETE /api/history/{id}, DELETE /api/history"""
import os
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.analysis import Analysis
from app.schemas.schemas import HistoryItem

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["History"])


def _normalize_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    # Extract filename from path (supports Windows and POSIX separators)
    clean_name = Path(image_path).name
    return f"/uploads/{clean_name}"


@router.get("/history", response_model=list[HistoryItem])
async def get_history(
    module: str | None = Query(default=None, description="Filter by module name"),
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve past analyses from the database."""
    stmt = select(Analysis).order_by(desc(Analysis.created_at)).limit(limit)
    if module:
        stmt = stmt.where(Analysis.module == module)

    result = await db.execute(stmt)
    records = result.scalars().all()

    return [
        HistoryItem(
            id=r.id,
            module=r.module,
            input_summary=r.input_summary,
            result_json=r.result_json,
            image_path=_normalize_image_url(r.image_path),
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]


@router.delete("/history/{item_id}")
async def delete_history_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single analysis record by ID."""
    stmt = select(Analysis).where(Analysis.id == item_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    await db.delete(record)
    await db.commit()
    return {"status": "success", "message": f"Deleted analysis #{item_id}"}


@router.delete("/history")
async def clear_all_history(
    db: AsyncSession = Depends(get_db),
):
    """Clear all analysis history records."""
    await db.execute(delete(Analysis))
    await db.commit()
    return {"status": "success", "message": "All history cleared"}
