"""Tests for /improve, /paraphrase, /summarize."""


def test_improve(client):
    resp = client.post(
        "/api/v1/improve",
        json={"text": "He go to market yesterday.", "language": "en"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["improved_text"].startswith("[mock]")


def test_paraphrase(client):
    resp = client.post(
        "/api/v1/paraphrase",
        json={"text": "The quick brown fox jumps.", "style": "professional"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["paraphrased_text"].startswith("[mock]")
    assert isinstance(data["alternatives"], list)


def test_paraphrase_invalid_style_rejected(client):
    resp = client.post(
        "/api/v1/paraphrase", json={"text": "Hello", "style": "shakespeare"}
    )
    assert resp.status_code == 422


def test_summarize_bullets(client):
    resp = client.post(
        "/api/v1/summarize",
        json={"text": "First sentence. Second sentence. Third sentence.", "format": "bullets"},
    )
    assert resp.status_code == 200, resp.text
    assert isinstance(resp.json()["summary"], str)


def test_summarize_invalid_format_rejected(client):
    resp = client.post("/api/v1/summarize", json={"text": "Hello", "format": "tweet"})
    assert resp.status_code == 422
