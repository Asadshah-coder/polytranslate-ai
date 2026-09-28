"""AI provider abstraction.

Add a new provider by subclassing AIProvider and implementing complete().
The translate/detect/improve/paraphrase/summarize operations have default
implementations built on complete() + the prompt engine, so providers only
need provider-specific logic (e.g. speech) on top.

Never expose API keys in logs or responses.
"""

import json
import re
from abc import ABC, abstractmethod

from ..languages import registry as lang_registry
from ..prompts import translation as tp
from ..prompts import writing as wp
from .errors import (
    DETECTION_FAILED,
    AIProviderError,
    ProviderNotConfigured,
)

_CONFIDENCE_LABELS = {"high", "medium", "low"}

_DETECTION_JSON_RE = re.compile(r"\{.*\}", re.DOTALL)


def parse_detection(raw: str) -> tuple[str, str | None]:
    """Parse the model's detection reply into (code, confidence|None)."""
    match = _DETECTION_JSON_RE.search(raw or "")
    if not match:
        raise AIProviderError(
            DETECTION_FAILED, "Could not detect the language of the provided text."
        )
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise AIProviderError(
            DETECTION_FAILED, "Could not detect the language of the provided text."
        ) from exc
    code = str(data.get("language_code", "")).lower().strip()
    if not code or not lang_registry.validate(code):
        raise AIProviderError(
            DETECTION_FAILED, "Could not detect the language of the provided text."
        )
    confidence = data.get("confidence")
    if confidence not in _CONFIDENCE_LABELS:
        confidence = None
    return code, confidence


class AIProvider(ABC):
    name: str = "base"
    model: str = ""
    last_model_used: str = ""

    @abstractmethod
    async def complete(self, system: str, user: str) -> str:
        """Return the model's text reply for a system+user prompt pair."""

    # ---- text operations (default implementations) ----

    async def translate(
        self,
        *,
        text: str,
        source_lang: str,
        target_lang: str,
        tone: str = "general",
        style: str = "natural",
    ) -> str:
        src = lang_registry.get(source_lang)
        tgt = lang_registry.get(target_lang)
        if not src or not tgt:
            raise AIProviderError(
                DETECTION_FAILED, "Unsupported language for translation."
            )
        system, instruction = tp.build_translation_prompt(
            src["name"], tgt["name"], tone, style
        )
        return await self.complete(system, f"{instruction}\n\n{text}")

    async def detect_language(self, text: str) -> tuple[str, str | None]:
        raw = await self.complete(tp.DETECT_SYSTEM, text[:2000])
        return parse_detection(raw)

    async def improve_text(
        self, text: str, language: str = "en", kind: str = "grammar"
    ) -> str:
        lang = lang_registry.get(language)
        system, instruction = wp.build_improve_prompt(
            (lang["name"] if lang else language), kind
        )
        return await self.complete(system, f"{instruction}\n\n{text}")

    async def paraphrase(
        self, text: str, style: str = "professional"
    ) -> tuple[str, list[str]]:
        system, instruction = wp.build_paraphrase_prompt(style)
        raw = await self.complete(system, f"{instruction}\n\n{text}")
        parts = raw.split("Alternatives:")
        main = parts[0].strip()
        alternatives: list[str] = []
        if len(parts) > 1:
            for line in parts[1].strip().splitlines():
                line = line.strip().lstrip("-•*0123456789. ")
                if line:
                    alternatives.append(line)
        return main, alternatives[:3]

    async def summarize(self, text: str, format: str = "short") -> str:
        system, instruction = wp.build_summarize_prompt(format)
        return await self.complete(system, f"{instruction}\n\n{text}")

    # ---- speech operations (provider-specific; default: unavailable) ----

    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, content_type: str
    ) -> tuple[str, str | None]:
        """Return (transcript, language_code|None)."""
        raise ProviderNotConfigured("Speech transcription")

    async def synthesize_speech(
        self,
        text: str,
        language: str,
        voice: str | None = None,
        speed: float = 1.0,
    ) -> tuple[bytes, str]:
        """Return (audio_bytes, media_type)."""
        raise ProviderNotConfigured("Speech synthesis")
