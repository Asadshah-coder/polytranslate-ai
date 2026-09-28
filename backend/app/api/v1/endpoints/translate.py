"""POST /api/v1/translate"""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user_optional
from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....db.session import get_db
from ....models.user import User
from ....schemas import TranslateRequest, TranslateResponse
from ....services import translation as translation_service
from .common import ip_hash_for

router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def translate(
    request: Request,
    response: Response,
    payload: TranslateRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    result = await translation_service.translate_text(
        db,
        text=payload.text,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
        tone=payload.tone,
        style=payload.style,
        user=user,
        ip_hash=ip_hash_for(request),
    )
    return result
