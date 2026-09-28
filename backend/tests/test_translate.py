"""Tests for POST /api/v1/translate."""

from app.ai import factory
from app.ai.errors import ProviderNotConfigured
from app.core.config import settings


def test_translate_explicit_languages(client):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "Hello, how are you?", "source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["translated_text"].endswith("Hello, how are you?")
    assert data["source_lang"] == "en"
    assert data["source_lang_name"] == "English"
    assert data["target_lang"] == "ur"
    assert data["target_lang_name"] == "Urdu"
    assert data["was_auto_detected"] is False
    assert data["source_char_count"] == 19
    assert data["translated_char_count"] == len(data["translated_text"])
    assert data["duration_ms"] >= 0
    assert data["provider"] == "mock"
    assert data["model"] == "mock-model"
    assert data["detection_confidence"] is None


def test_translate_auto_detect_urdu(client):
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "مجھے آج کام پر جانا ہے",
            "source_lang": "auto",
            "target_lang": "en",
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["source_lang"] == "ur"
    assert data["source_lang_name"] == "Urdu"
    assert data["was_auto_detected"] is True
    assert data["detection_confidence"] == "high"


def test_translate_tone_and_style(client):
    resp = client.post(
        "/api/v1/translate",
        json={
            "text": "Hello",
            "source_lang": "en",
            "target_lang": "es",
            "tone": "formal",
            "style": "concise",
        },
    )
    assert resp.status_code == 200, resp.text


def test_translate_empty_text_rejected(client):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "   ", "source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 422


def test_translate_unsupported_language_rejected(client):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "Hello", "source_lang": "en", "target_lang": "xx"},
    )
    assert resp.status_code == 422


def test_translate_too_long_rejected(client):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "x" * 10001, "source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 422


def test_translate_no_provider_returns_503(client, monkeypatch):
    def _raise():
        raise ProviderNotConfigured("Translation service")

    monkeypatch.setattr(factory, "get_provider", _raise)
    resp = client.post(
        "/api/v1/translate",
        json={"text": "Hello", "source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 503
    assert resp.json()["detail"] == "Translation service is temporarily unavailable."


def test_translate_records_history_for_authenticated_user(client, auth_headers):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "Hello", "source_lang": "en", "target_lang": "ur"},
        headers=auth_headers,
    )
    assert resp.status_code == 200, resp.text
    hist = client.get("/api/v1/history", headers=auth_headers)
    assert hist.status_code == 200
    body = hist.json()
    assert body["total"] == 1
    item = body["items"][0]
    assert item["source_text"] == "Hello"
    assert item["source_lang"] == "en"
    assert item["target_lang"] == "ur"


def test_translate_anonymous_does_not_create_history(client):
    resp = client.post(
        "/api/v1/translate",
        json={"text": "Hello", "source_lang": "en", "target_lang": "ur"},
    )
    assert resp.status_code == 200


def test_usage_limit_returns_402(client, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "FREE_MONTHLY_CHARACTERS", 5)
    resp = client.post(
        "/api/v1/translate",
        json={"text": "This text is longer than five characters.", "source_lang": "en", "target_lang": "ur"},
        headers=auth_headers,
    )
    assert resp.status_code == 402
    assert resp.json()["detail"] == "Monthly character limit reached."
