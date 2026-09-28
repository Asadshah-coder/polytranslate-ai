"""POST /api/v1/detect-language"""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from ....core.rate_limit import dynamic_limit, limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....db.session import get_db
from ....schemas import DetectRequest, DetectResponse
from ....services import detection as detection_service

router = APIRouter()


@router.post("/detect-language", response_model=DetectResponse)
@limiter.limit(
    dynamic_limit,
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def detect_language(
    request: Request,
    response: Response,
    payload: DetectRequest,
    db: Session = Depends(get_db),
):
    return await detection_service.detect_language_info(payload.text)
