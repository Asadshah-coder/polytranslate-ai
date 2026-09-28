"""Back-translation: forward translation + translation back to the source.

Helps users eyeball semantic consistency. The API/frontend must NOT claim
that back-translation proves translation accuracy.
"""

from ..ai import factory
from ..languages import registry


async def back_translate(text: str, source_lang: str, target_lang: str) -> dict:
    provider = factory.get_provider()

    resolved_source = source_lang
    if source_lang == "auto":
        resolved_source, _ = await provider.detect_language(text)
    if resolved_source == target_lang:
        # Round-trip through the same language is meaningless; return as-is.
        return {
            "original_text": text,
            "translated_text": text,
            "back_translated_text": text,
            "source_lang": resolved_source,
            "target_lang": target_lang,
        }

    src = registry.get(resolved_source)
    tgt = registry.get(target_lang)
    assert src is not None and tgt is not None

    translated = await provider.translate(
        text=text, source_lang=resolved_source, target_lang=target_lang
    )
    back = await provider.translate(
        text=translated, source_lang=target_lang, target_lang=resolved_source
    )
    return {
        "original_text": text,
        "translated_text": translated,
        "back_translated_text": back,
        "source_lang": resolved_source,
        "target_lang": target_lang,
    }
