"""Speech services: transcription (STT) and synthesis (TTS).

Both delegate to the active AI provider. When the active provider cannot do
speech (e.g. Gemini has no Whisper-style REST endpoint here, or no OpenAI
key is configured), ProviderNotConfigured propagates -> HTTP 501 with a
clear message. No fake transcripts or audio are ever produced.
"""

from sqlalchemy.orm import Session

from ..ai import factory
from ..ai.base import AIProvider
from ..core.config import settings
from ..core.errors import BadRequest
from ..models.user import User
from . import usage as usage_service
from .usage import KIND_SPEECH

AUDIO_EXTENSIONS = ("mp3", "wav", "m4a", "ogg", "webm")


def validate_audio(filename: str, size_bytes: int) -> None:
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    if ext not in AUDIO_EXTENSIONS:
        raise BadRequest(
            f"Unsupported audio type '.{ext}'. Supported: {', '.join(AUDIO_EXTENSIONS)}."
        )
    max_bytes = settings.MAX_AUDIO_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise BadRequest(
            f"Audio is too large. Maximum size is {settings.MAX_AUDIO_MB} MB."
        )
    if size_bytes == 0:
        raise BadRequest("The uploaded audio file is empty.")


async def transcribe(
    db: Session,
    *,
    data: bytes,
    filename: str,
    content_type: str,
    user: User | None = None,
    ip_hash: str | None = None,
) -> dict:
    validate_audio(filename, len(data))
    provider: AIProvider = factory.get_provider()
    transcript, language_code = await provider.transcribe_audio(
        data, filename, content_type
    )
    usage_service.record(
        db, user_id=user.id if user else None, kind=KIND_SPEECH,
        chars=len(transcript), ip_hash=ip_hash,
    )
    return {"transcript": transcript, "language_code": language_code}


async def synthesize(
    db: Session,
    *,
    text: str,
    language: str,
    voice: str | None,
    speed: float,
    user: User | None = None,
    ip_hash: str | None = None,
) -> tuple[bytes, str]:
    provider: AIProvider = factory.get_provider()
    audio, media_type = await provider.synthesize_speech(
        text, language, voice=voice, speed=speed
    )
    usage_service.record(
        db, user_id=user.id if user else None, kind=KIND_SPEECH,
        chars=len(text), ip_hash=ip_hash,
    )
    return audio, media_type
