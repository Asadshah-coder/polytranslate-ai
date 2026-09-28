"""Tests for document translation (validation + mocked translation)."""

import io

from docx import Document as DocxDocument

from app.core.config import settings


def _txt_file(content: str, name: str = "notes.txt"):
    return {"file": (name, content.encode("utf-8"), "text/plain")}


def test_supported_formats(client):
    resp = client.get("/api/v1/documents/supported")
    assert resp.status_code == 200
    assert resp.json() == {"input": ["txt", "docx", "pdf"], "output": ["txt", "docx", "pdf"]}


def test_translate_txt_document(client):
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("Hello world.\n\nSecond paragraph."),
        data={"source_lang": "en", "target_lang": "ur", "output_format": "txt"},
    )
    assert resp.status_code == 200, resp.text
    assert "attachment" in resp.headers["content-disposition"]
    assert resp.headers["content-disposition"].endswith('.txt"')
    body = resp.content.decode("utf-8")
    assert "Hello world." in body
    assert body.startswith("[mock]")


def test_translate_txt_auto_detect(client):
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("مجھے آج کام پر جانا ہے"),
        data={"source_lang": "auto", "target_lang": "en", "output_format": "txt"},
    )
    assert resp.status_code == 200, resp.text


def test_translate_docx_roundtrip(client):
    doc = DocxDocument()
    doc.add_paragraph("First paragraph.")
    doc.add_paragraph("Second paragraph.")
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    resp = client.post(
        "/api/v1/documents/translate",
        files={"file": ("in.docx", buf.getvalue(),
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={"source_lang": "en", "target_lang": "ur", "output_format": "docx"},
    )
    assert resp.status_code == 200, resp.text
    out = DocxDocument(io.BytesIO(resp.content))
    text = "\n".join(p.text for p in out.paragraphs)
    assert "First paragraph." in text
    assert "[mock]" in text


def test_translate_pdf_output(client):
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("Hello PDF world."),
        data={"source_lang": "en", "target_lang": "ur", "output_format": "pdf"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content.startswith(b"%PDF")
    # Honest best-effort notice for generated PDFs.
    assert "X-PDF-Note" in resp.headers


def test_unsupported_type_rejected(client):
    resp = client.post(
        "/api/v1/documents/translate",
        files={"file": ("evil.exe", b"MZ...", "application/octet-stream")},
        data={"source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 400


def test_oversized_file_rejected(client, monkeypatch):
    monkeypatch.setattr(settings, "MAX_FILE_SIZE_MB", 0)
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("Hello"),
        data={"source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 400


def test_document_char_cap_rejected(client, monkeypatch):
    monkeypatch.setattr(settings, "MAX_DOCUMENT_CHARS", 5)
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("This is definitely longer than five characters."),
        data={"source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 400


def test_empty_document_rejected(client):
    resp = client.post(
        "/api/v1/documents/translate",
        files=_txt_file("   "),
        data={"source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 400
