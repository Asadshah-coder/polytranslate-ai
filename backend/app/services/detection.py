"""Language detection service."""

from ..ai import factory
from ..languages import registry


async def detect_language_info(text: str) -> dict:
    provider = factory.get_provider()
    code, confidence = await provider.detect_language(text)
    lang = registry.get(code)
    # registry.get cannot be None here: the provider layer already validated.
    assert lang is not None
    return {
        "language_code": code,
        "language_name": lang["name"],
        "native_name": lang["native_name"],
        "confidence": confidence,
    }
