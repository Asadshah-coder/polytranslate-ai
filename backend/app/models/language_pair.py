"""Curated SEO language-pair pages.

Pairs are curated in code (services/seo.py) today; this table exists so a
future CMS/admin can override or extend them without a deploy.
"""

from datetime import datetime

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base, utcnow


class LanguagePair(Base):
    __tablename__ = "language_pairs"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    source_lang: Mapped[str] = mapped_column(String(10), nullable=False)
    target_lang: Mapped[str] = mapped_column(String(10), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    intro: Mapped[str | None] = mapped_column(Text, nullable=True)
    faq: Mapped[list | None] = mapped_column(JSON, nullable=True)
    common_phrases: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tips: Mapped[list | None] = mapped_column(JSON, nullable=True)
    related: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=utcnow, nullable=False
    )
