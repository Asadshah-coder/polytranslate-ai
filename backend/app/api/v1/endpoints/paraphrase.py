"""POST /api/v1/paraphrase"""

from fastapi import APIRouter, Depends, Request, Response

from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....schemas import ParaphraseRequest, ParaphraseResponse
from ....services import writing as writing_service

router = APIRouter()


@router.post("/paraphrase", response_model=ParaphraseResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def paraphrase(request: Request, response: Response, payload: ParaphraseRequest):
    return await writing_service.paraphrase_text(payload.text, style=payload.style)
