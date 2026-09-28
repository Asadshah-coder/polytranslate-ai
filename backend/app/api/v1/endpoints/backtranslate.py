"""POST /api/v1/back-translate"""

from fastapi import APIRouter, Depends, Request, Response

from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....schemas import BackTranslateRequest, BackTranslateResponse
from ....services import backtranslation as backtranslation_service

router = APIRouter()


@router.post("/back-translate", response_model=BackTranslateResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def back_translate(request: Request, response: Response, payload: BackTranslateRequest):
    return await backtranslation_service.back_translate(
        payload.text,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
    )
