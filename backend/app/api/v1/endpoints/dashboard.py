"""User dashboard: real usage statistics from the database."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user
from ....db.session import get_db
from ....models.user import User
from ....schemas import DashboardStats
from ....services import usage as usage_service

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return usage_service.dashboard_stats(db, user)
