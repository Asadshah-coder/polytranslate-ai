"""Schemas for translation, detection, back-translation."""

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

from ..languages import registry

Tone = Literal[
    "general", "formal", "casual", "professional", "academic", "marketing", "technical"
]
Style = Literal["natural", "literal", "professional", "concise"]


def _validate_source_lang(v: str) -> str:
    v = v.lower().strip()
    if v != "auto" and not registry.validate(v):
        raise ValueError(f"Unsupported source language: {v!r}")
    return v


def _validate_target_lang(v: str) -> str:
    v = v.lower().strip()
    if not registry.validate(v):
        raise ValueError(f"Unsupported target language: {v!r}")
    return v


def _validate_text(v: str) -> str:
    if not v.strip():
        raise ValueError("Text must not be empty.")
    return v


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    source_lang: str = "auto"
    target_lang: str = "en"
    tone: Tone = "general"
    style: Style = "natural"

    _text_ok = field_validator("text")(_validate_text)
    _src_ok = field_validator("source_lang")(_validate_source_lang)
    _tgt_ok = field_validator("target_lang")(_validate_target_lang)


class TranslateResponse(BaseModel):
    translated_text: str
    source_lang: str
    source_lang_name: str
    target_lang: str
    target_lang_name: str
    was_auto_detected: bool
    source_char_count: int
    translated_char_count: int
    duration_ms: int
    provider: str
    model: str
    detection_confidence: Optional[Literal["high", "medium", "low"]] = None


class DetectRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)

    _text_ok = field_validator("text")(_validate_text)


class DetectResponse(BaseModel):
    language_code: str
    language_name: str
    native_name: str
    confidence: Optional[Literal["high", "medium", "low"]] = None


class BackTranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    source_lang: str = "en"
    target_lang: str = "ur"

    _text_ok = field_validator("text")(_validate_text)
    _src_ok = field_validator("source_lang")(_validate_source_lang)
    _tgt_ok = field_validator("target_lang")(_validate_target_lang)


class BackTranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    back_translated_text: str
    source_lang: str
    target_lang: str
