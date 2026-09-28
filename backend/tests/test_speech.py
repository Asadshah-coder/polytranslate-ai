"""Tests for speech endpoints: success with mock provider, 501 without."""

from app.ai import factory
from app.ai.base import AIProvider


class SpeechlessProvider(AIProvider):
    """Mimics a provider with no STT/TTS (e.g. Gemini via this REST path)."""

    name = "speechless"
    model = "speechless-model"

    async def complete(self, system: str, user: str) -> str:
        return "n/a"


def _use_speechless(monkeypatch):
    monkeypatch.setattr(factory, "get_provider", lambda: SpeechlessProvider())


def test_transcribe_with_provider(client):
    resp = client.post(
        "/api/v1/speech/transcribe",
        files={"audio": ("clip.mp3", b"FAKEAUDIOBYTES", "audio/mpeg")},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["transcript"] == "mock transcript"
    assert data["language_code"] == "en"


def test_transcribe_bad_type_rejected(client):
    resp = client.post(
        "/api/v1/speech/transcribe",
        files={"audio": ("notes.txt", b"hello", "text/plain")},
    )
    assert resp.status_code == 400


def test_synthesize_with_provider(client):
    resp = client.post(
        "/api/v1/speech/synthesize",
        json={"text": "Hello world", "language": "en", "speed": 1.0},
    )
    assert resp.status_code == 200, resp.text
    assert resp.content == b"FAKEAUDIO"


def test_synthesize_invalid_speed_rejected(client):
    resp = client.post(
        "/api/v1/speech/synthesize",
        json={"text": "Hello", "language": "en", "speed": 10.0},
    )
    assert resp.status_code == 422


def test_transcribe_501_when_not_configured(client, monkeypatch):
    _use_speechless(monkeypatch)
    resp = client.post(
        "/api/v1/speech/transcribe",
        files={"audio": ("clip.mp3", b"FAKEAUDIOBYTES", "audio/mpeg")},
    )
    assert resp.status_code == 501
    assert resp.json()["detail"] == "Speech transcription is not configured on this server."


def test_synthesize_501_when_not_configured(client, monkeypatch):
    _use_speechless(monkeypatch)
    resp = client.post(
        "/api/v1/speech/synthesize",
        json={"text": "Hello", "language": "en"},
    )
    assert resp.status_code == 501
    assert resp.json()["detail"] == "Speech synthesis is not configured on this server."
