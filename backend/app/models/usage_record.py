"""Usage records: every billable AI operation writes one row.

Aggregated per calendar month for plan caps and the dashboard.
All numbers shown to users come from these rows — nothing is fabricated.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base, utcnow

# kind values
KIND_TRANSLATE = "translate"
KIND_DOCUMENT = "document"
KIND_SPEECH = "speech"


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True
    )
    kind: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    chars: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, index=True, nullable=False
    )
