"""Schemas for the AI writing tools."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from ..languages import registry
from .translate import _validate_text


class ImproveRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    language: str = "en"

    _text_ok = field_validator("text")(_validate_text)

    @field_validator("language")
    @classmethod
    def _lang_ok(cls, v: str) -> str:
        v = v.lower().strip()
        if not registry.validate(v):
            raise ValueError(f"Unsupported language: {v!r}")
        return v


class ImproveResponse(BaseModel):
    improved_text: str


class ParaphraseRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    style: Literal["simple", "professional", "academic", "creative"] = "professional"

    _text_ok = field_validator("text")(_validate_text)


class ParaphraseResponse(BaseModel):
    paraphrased_text: str
    alternatives: list[str]


class SummarizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20000)
    format: Literal["short", "bullets", "detailed"] = "short"

    _text_ok = field_validator("text")(_validate_text)


class SummarizeResponse(BaseModel):
    summary: str
