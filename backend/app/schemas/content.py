"""Schemas for history, dashboard, languages, SEO, billing, documents, speech, health."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .translate import _validate_text


# ---------------- history ----------------


class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_lang: str
    target_lang: str
    source_text: str
    translated_text: str
    tone: str
    style: str
    created_at: datetime


class HistoryList(BaseModel):
    items: list[HistoryItem]
    total: int


# ---------------- dashboard ----------------


class DashboardStats(BaseModel):
    plan: str
    chars_used_this_month: int
    chars_limit: int
    translations_count: int
    documents_count: int
    speech_requests: int


# ---------------- languages ----------------


class LanguageOut(BaseModel):
    code: str
    name: str
    native_name: str
    direction: str
    locale: str


class LanguagesResponse(BaseModel):
    languages: list[LanguageOut]
    count: int


# ---------------- seo ----------------


class SeoPairSummary(BaseModel):
    slug: str
    source_lang: str
    target_lang: str
    title: str


class SeoPairsResponse(BaseModel):
    pairs: list[SeoPairSummary]


# ---------------- billing ----------------


class PlanOut(BaseModel):
    id: str
    name: str
    price_usd: float
    monthly_characters: int
    features: list[str]


class PlansResponse(BaseModel):
    plans: list[PlanOut]


# ---------------- documents ----------------


class SupportedDocuments(BaseModel):
    input: list[str]
    output: list[str]


# ---------------- speech ----------------


class TranscribeResponse(BaseModel):
    transcript: str
    language_code: Optional[str] = None


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    language: str = "en"
    voice: Optional[str] = None
    speed: float = Field(default=1.0, ge=0.25, le=4.0)

    _text_ok = field_validator("text")(_validate_text)


# ---------------- health ----------------


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
    provider_configured: bool
    provider: Optional[str] = None
    database: Literal["ok", "error"]
