"""SQLAlchemy 2.0 declarative base."""

from datetime import datetime, timezone

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    """Naive UTC now (consistent with SQLite DATETIME storage)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
