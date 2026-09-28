"""Rate-limit tests: anon tier is enforced with 429 + Retry-After."""

from app.core.config import settings


def test_anonymous_rate_limit_429(client, monkeypatch):
    monkeypatch.setattr(settings, "RATE_LIMIT_ANON", "2/minute")
    payload = {"text": "Hello"}
    assert client.post("/api/v1/detect-language", json=payload).status_code == 200
    assert client.post("/api/v1/detect-language", json=payload).status_code == 200
    resp = client.post("/api/v1/detect-language", json=payload)
    assert resp.status_code == 429
    assert resp.json()["detail"] == "Rate limit exceeded. Try again shortly."
    assert "Retry-After" in resp.headers


def test_authenticated_tier_is_separate(client, auth_headers, monkeypatch):
    # Anon tier tiny; auth tier generous -> authenticated calls still pass.
    monkeypatch.setattr(settings, "RATE_LIMIT_ANON", "1/minute")
    monkeypatch.setattr(settings, "RATE_LIMIT_AUTH", "120/minute")
    payload = {"text": "Hello"}
    assert client.post("/api/v1/detect-language", json=payload).status_code == 200
    assert client.post("/api/v1/detect-language", json=payload).status_code == 429
    for _ in range(3):
        r = client.post(
            "/api/v1/detect-language", json=payload, headers=auth_headers
        )
        assert r.status_code == 200, r.text
