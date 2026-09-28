"""POST /api/v1/improve — grammar correction / text improvement."""

from fastapi import APIRouter, Depends, Request, Response

from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....schemas import ImproveRequest, ImproveResponse
from ....services import writing as writing_service

router = APIRouter()


@router.post("/improve", response_model=ImproveResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def improve(request: Request, response: Response, payload: ImproveRequest):
    # "improve" endpoint performs grammar correction (kind="grammar").
    improved = await writing_service.improve_text(
        payload.text, language=payload.language, kind="grammar"
    )
    return {"improved_text": improved}
