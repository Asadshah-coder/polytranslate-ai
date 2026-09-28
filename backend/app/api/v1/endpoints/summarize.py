"""POST /api/v1/summarize"""

from fastapi import APIRouter, Depends, Request, Response

from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....schemas import SummarizeRequest, SummarizeResponse
from ....services import writing as writing_service

router = APIRouter()


@router.post("/summarize", response_model=SummarizeResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def summarize(request: Request, response: Response, payload: SummarizeRequest):
    summary = await writing_service.summarize_text(payload.text, format=payload.format)
    return {"summary": summary}
