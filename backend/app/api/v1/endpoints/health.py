"""Health check."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ....ai import factory
from ....core.config import settings
from ....db.session import get_db
from ....schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        database = "error"
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "provider_configured": factory.provider_configured(),
        "provider": factory.active_provider_name(),
        "database": database,
    }
