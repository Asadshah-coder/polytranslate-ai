"""Speech endpoints: transcription (STT) and synthesis (TTS)."""

import io

from fastapi import APIRouter, Depends, File, Request, Response, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user_optional
from ....core.rate_limit import limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....db.session import get_db
from ....models.user import User
from ....schemas import SynthesizeRequest, TranscribeResponse
from ....services import speech as speech_service
from .common import ip_hash_for

router = APIRouter()


@router.post("/speech/transcribe", response_model=TranscribeResponse)
@limiter.limit(
    "20/minute",
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def transcribe(
    request: Request,
    response: Response,
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    data = await audio.read()
    return await speech_service.transcribe(
        db,
        data=data,
        filename=audio.filename or "audio",
        content_type=audio.content_type or "application/octet-stream",
        user=user,
        ip_hash=ip_hash_for(request),
    )


@router.post("/speech/synthesize")
@limiter.limit(
    "20/minute",
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def synthesize(
    request: Request,
    payload: SynthesizeRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    audio_bytes, media_type = await speech_service.synthesize(
        db,
        text=payload.text,
        language=payload.language,
        voice=payload.voice,
        speed=payload.speed,
        user=user,
        ip_hash=ip_hash_for(request),
    )
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type=media_type,
        headers={"Content-Disposition": 'attachment; filename="speech.mp3"'},
    )
