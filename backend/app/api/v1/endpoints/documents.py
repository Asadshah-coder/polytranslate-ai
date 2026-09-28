"""Document translation endpoints."""

import io

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user_optional
from ....core.rate_limit import limiter, rate_limit_key, RATE_LIMIT_MESSAGE
from ....db.session import get_db
from ....models.user import User
from ....schemas import SupportedDocuments
from ....services import documents as documents_service
from .common import ip_hash_for

router = APIRouter()


@router.get("/documents/supported", response_model=SupportedDocuments)
async def supported_formats():
    return {
        "input": list(documents_service.INPUT_FORMATS),
        "output": list(documents_service.OUTPUT_FORMATS),
    }


@router.post("/documents/translate")
@limiter.limit(
    "10/minute",
    key_func=rate_limit_key,
    error_message=RATE_LIMIT_MESSAGE,
)
async def translate_document(
    request: Request,
    file: UploadFile = File(...),
    source_lang: str = Form("auto"),
    target_lang: str = Form("en"),
    output_format: str | None = Form(None),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    data = await file.read()
    out_bytes, media_type, out_filename, pdf_note = (
        await documents_service.translate_document(
            db,
            data=data,
            filename=file.filename or "document",
            source_lang=(source_lang or "auto").lower().strip(),
            target_lang=(target_lang or "en").lower().strip(),
            output_format=output_format.lower().strip() if output_format else None,
            user=user,
            ip_hash=ip_hash_for(request),
        )
    )
    headers = {"Content-Disposition": f'attachment; filename="{out_filename}"'}
    if pdf_note:
        headers["X-PDF-Note"] = (
            "PDF output is generated from extracted text; layout is best-effort."
        )
    return StreamingResponse(io.BytesIO(out_bytes), media_type=media_type, headers=headers)
