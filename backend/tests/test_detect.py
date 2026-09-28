"""Tests for POST /api/v1/detect-language."""


def test_detect_urdu(client):
    resp = client.post("/api/v1/detect-language", json={"text": "مجھے آج کام پر جانا ہے"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["language_code"] == "ur"
    assert data["language_name"] == "Urdu"
    assert data["native_name"] == "اردو"
    assert data["confidence"] == "high"


def test_detect_english_no_confidence(client):
    resp = client.post("/api/v1/detect-language", json={"text": "Hello world"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["language_code"] == "en"
    # Provider supplied no coarse label -> null, never invented.
    assert data["confidence"] is None


def test_detect_empty_rejected(client):
    resp = client.post("/api/v1/detect-language", json={"text": ""})
    assert resp.status_code == 422
