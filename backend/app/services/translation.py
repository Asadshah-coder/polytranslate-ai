"""Translation orchestration: detect (if auto) -> translate -> meter -> store."""

import time

from sqlalchemy.orm import Session

from ..ai import factory
from ..core.logging import get_logger
from ..languages import registry
from ..models.user import User
from . import history as history_service
from . import usage as usage_service

log = get_logger("services.translation")


async def translate_text(
    db: Session,
    *,
    text: str,
    source_lang: str,
    target_lang: str,
    tone: str = "general",
    style: str = "natural",
    user: User | None = None,
    ip_hash: str | None = None,
) -> dict:
    provider = factory.get_provider()

    was_auto_detected = source_lang == "auto"
    detection_confidence: str | None = None
    if was_auto_detected:
        code, confidence = await provider.detect_language(text)
        source_lang = code
        detection_confidence = confidence

    src = registry.get(source_lang)
    tgt = registry.get(target_lang)
    assert src is not None and tgt is not None  # validated by schemas

    if user is not None:
        usage_service.check_limit(db, user, len(text))

    started = time.perf_counter()
    translated = await provider.translate(
        text=text,
        source_lang=source_lang,
        target_lang=target_lang,
        tone=tone,
        style=style,
    )
    duration_ms = int((time.perf_counter() - started) * 1000)

    usage_service.record(
        db,
        user_id=user.id if user else None,
        kind="translate",
        chars=len(text),
        ip_hash=ip_hash,
    )

    if user is not None:
        history_service.save(
            db,
            user_id=user.id,
            source_lang=source_lang,
            target_lang=target_lang,
            source_text=text,
            translated_text=translated,
            tone=tone,
            style=style,
            was_auto_detected=was_auto_detected,
            duration_ms=duration_ms,
            provider=provider.name,
            model=provider.last_model_used or provider.model,
        )

    return {
        "translated_text": translated,
        "source_lang": source_lang,
        "source_lang_name": src["name"],
        "target_lang": target_lang,
        "target_lang_name": tgt["name"],
        "was_auto_detected": was_auto_detected,
        "source_char_count": len(text),
        "translated_char_count": len(translated),
        "duration_ms": duration_ms,
        "provider": provider.name,
        "model": provider.last_model_used or provider.model,
        "detection_confidence": detection_confidence,
    }
