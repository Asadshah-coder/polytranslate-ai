"""Usage tracking: monthly character aggregation and plan limits.

All usage numbers shown to users (dashboard, caps) are real aggregates of
UsageRecord rows. Limits come from environment via settings — never hard-coded.
"""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.errors import UsageLimitExceeded
from ..db.base import utcnow
from ..models.usage_record import KIND_DOCUMENT, KIND_SPEECH, KIND_TRANSLATE, UsageRecord
from ..models.user import User


def month_start() -> datetime:
    return utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def limit_for_plan(plan: str) -> int:
    return {
        "free": settings.FREE_MONTHLY_CHARACTERS,
        "pro": settings.PRO_MONTHLY_CHARACTERS,
        "business": settings.BUSINESS_MONTHLY_CHARACTERS,
    }.get(plan, settings.FREE_MONTHLY_CHARACTERS)


def chars_used_this_month(db: Session, user_id: int) -> int:
    total = (
        db.query(func.coalesce(func.sum(UsageRecord.chars), 0))
        .filter(
            UsageRecord.user_id == user_id,
            UsageRecord.created_at >= month_start(),
        )
        .scalar()
    )
    return int(total or 0)


def count_this_month(db: Session, user_id: int, kind: str) -> int:
    return (
        db.query(UsageRecord)
        .filter(
            UsageRecord.user_id == user_id,
            UsageRecord.kind == kind,
            UsageRecord.created_at >= month_start(),
        )
        .count()
    )


def check_limit(db: Session, user: User, new_chars: int) -> None:
    """Raise 402 when this request would exceed the monthly character cap."""
    limit = limit_for_plan(user.plan)
    used = chars_used_this_month(db, user.id)
    if used + new_chars > limit:
        raise UsageLimitExceeded("Monthly character limit reached.")


def record(
    db: Session,
    *,
    user_id: int | None,
    kind: str,
    chars: int,
    ip_hash: str | None = None,
) -> None:
    db.add(
        UsageRecord(user_id=user_id, kind=kind, chars=max(0, chars), ip_hash=ip_hash)
    )
    db.commit()


def dashboard_stats(db: Session, user: User) -> dict:
    limit = limit_for_plan(user.plan)
    return {
        "plan": user.plan,
        "chars_used_this_month": chars_used_this_month(db, user.id),
        "chars_limit": limit,
        "translations_count": count_this_month(db, user.id, KIND_TRANSLATE),
        "documents_count": count_this_month(db, user.id, KIND_DOCUMENT),
        "speech_requests": count_this_month(db, user.id, KIND_SPEECH),
    }
