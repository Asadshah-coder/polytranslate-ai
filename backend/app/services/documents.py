"""Document translation pipeline.

Document -> text extraction -> chunking -> translation -> reconstruction -> download.

Supported input: txt, docx, pdf. Supported output: txt, docx, pdf.
PDF output is generated from extracted text with reportlab (best-effort
layout; complex scripts such as Arabic/Indic render without shaping — the
response carries an X-PDF-Note header saying so).

Honest limits: file size cap (MAX_FILE_SIZE_MB) and extracted-text cap
(MAX_DOCUMENT_CHARS) produce clear 400 errors; extraction failures do too.
"""

import io
import re

from docx import Document as DocxDocument
from pypdf import PdfReader
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy.orm import Session

from ..ai import factory
from ..ai.base import AIProvider
from ..core.config import settings
from ..core.errors import BadRequest
from ..core.logging import get_logger
from ..languages import registry
from ..models.document import DocumentJob
from ..models.user import User
from . import usage as usage_service
from .usage import KIND_DOCUMENT

log = get_logger("services.documents")

INPUT_FORMATS = ("txt", "docx", "pdf")
OUTPUT_FORMATS = ("txt", "docx", "pdf")
CHUNK_CHARS = 2000


def extension_of(filename: str) -> str:
    return (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()


def validate_upload(filename: str, size_bytes: int) -> str:
    ext = extension_of(filename)
    if ext not in INPUT_FORMATS:
        raise BadRequest(
            f"Unsupported file type '.{ext}'. Supported: {', '.join(INPUT_FORMATS)}."
        )
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise BadRequest(
            f"File is too large. Maximum size is {settings.MAX_FILE_SIZE_MB} MB."
        )
    if size_bytes == 0:
        raise BadRequest("The uploaded file is empty.")
    return ext


def extract_text(data: bytes, ext: str) -> str:
    try:
        if ext == "txt":
            return data.decode("utf-8-sig", errors="replace")
        if ext == "docx":
            doc = DocxDocument(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        if ext == "pdf":
            reader = PdfReader(io.BytesIO(data))
            pages = []
            for page in reader.pages:
                pages.append(page.extract_text() or "")
            return "\n\n".join(pages)
    except BadRequest:
        raise
    except Exception as exc:
        log.warning("Document extraction failed (%s): %s", ext, exc)
        raise BadRequest(
            "Could not extract text from this document. The file may be corrupted."
        ) from exc
    raise BadRequest(f"Unsupported file type '.{ext}'.")


def chunk_text(text: str, max_chars: int = CHUNK_CHARS) -> list[str]:
    """Split into ~max_chars chunks on paragraph boundaries."""
    paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
    if not paragraphs:
        paragraphs = [text] if text.strip() else []
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for para in paragraphs:
        # A single huge paragraph is hard-split to bound chunk size.
        pieces = (
            [para[i : i + max_chars] for i in range(0, len(para), max_chars)]
            if len(para) > max_chars
            else [para]
        )
        for piece in pieces:
            if current and current_len + len(piece) + 2 > max_chars:
                chunks.append("\n\n".join(current))
                current, current_len = [], 0
            current.append(piece)
            current_len += len(piece) + 2
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def _xml_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def build_txt(text: str) -> bytes:
    return text.encode("utf-8")


def build_docx(text: str) -> bytes:
    doc = DocxDocument()
    for para in text.split("\n"):
        doc.add_paragraph(para)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def build_pdf(text: str) -> bytes:
    """Best-effort PDF from plain text. Complex-script shaping is NOT applied
    (reportlab limitation) — callers must surface the X-PDF-Note header."""
    buf = io.BytesIO()
    template = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
    )
    styles = getSampleStyleSheet()
    story = []
    for para in text.split("\n"):
        if para.strip():
            story.append(Paragraph(_xml_escape(para), styles["Normal"]))
        else:
            story.append(Paragraph("<br/>", styles["Normal"]))
    if not story:
        story.append(Paragraph("<br/>", styles["Normal"]))
    template.build(story)
    return buf.getvalue()


_BUILDERS = {"txt": build_txt, "docx": build_docx, "pdf": build_pdf}
_MEDIA_TYPES = {
    "txt": "text/plain; charset=utf-8",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pdf": "application/pdf",
}


async def translate_document(
    db: Session,
    *,
    data: bytes,
    filename: str,
    source_lang: str,
    target_lang: str,
    output_format: str | None,
    user: User | None = None,
    ip_hash: str | None = None,
) -> tuple[bytes, str, str, bool]:
    """Translate a document. Returns (bytes, media_type, out_filename, pdf_note)."""
    ext = validate_upload(filename, len(data))
    out_ext = (output_format or ext).lower()
    if out_ext not in OUTPUT_FORMATS:
        raise BadRequest(
            f"Unsupported output format '.{out_ext}'. "
            f"Supported: {', '.join(OUTPUT_FORMATS)}."
        )

    text = extract_text(data, ext)
    if not text.strip():
        raise BadRequest("No readable text was found in this document.")
    if len(text) > settings.MAX_DOCUMENT_CHARS:
        raise BadRequest(
            f"Document text exceeds the {settings.MAX_DOCUMENT_CHARS}-character "
            "limit. Please split it into smaller files."
        )

    provider: AIProvider = factory.get_provider()

    resolved_source = source_lang
    if source_lang == "auto":
        resolved_source, _ = await provider.detect_language(text[:2000])
    if not registry.validate(resolved_source):
        raise BadRequest(f"Unsupported source language: {source_lang!r}")
    if not registry.validate(target_lang):
        raise BadRequest(f"Unsupported target language: {target_lang!r}")

    if user is not None:
        usage_service.check_limit(db, user, len(text))

    chunks = chunk_text(text)
    log.info("Translating document: %d chunks (%s)", len(chunks), filename)
    translated_chunks: list[str] = []
    for chunk in chunks:
        translated_chunks.append(
            await provider.translate(
                text=chunk,
                source_lang=resolved_source,
                target_lang=target_lang,
            )
        )
    translated_text = "\n\n".join(translated_chunks)

    out_bytes = _BUILDERS[out_ext](translated_text)
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    safe_stem = re.sub(r"[^\w\-. ]", "_", stem)[:120] or "document"
    out_filename = f"{safe_stem}-{target_lang}.{out_ext}"

    usage_service.record(
        db, user_id=user.id if user else None, kind=KIND_DOCUMENT,
        chars=len(text), ip_hash=ip_hash,
    )
    db.add(
        DocumentJob(
            user_id=user.id if user else None,
            filename=filename,
            input_format=ext,
            output_format=out_ext,
            source_lang=resolved_source,
            target_lang=target_lang,
            char_count=len(text),
        )
    )
    db.commit()

    pdf_note = out_ext == "pdf"
    return out_bytes, _MEDIA_TYPES[out_ext], out_filename, pdf_note
