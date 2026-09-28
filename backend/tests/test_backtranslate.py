"""Tests for POST /api/v1/back-translate."""


def test_back_translate(client):
    resp = client.post(
        "/api/v1/back-translate",
        json={
            "text": "I have to go to work today.",
            "source_lang": "en",
            "target_lang": "ur",
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["original_text"] == "I have to go to work today."
    assert data["translated_text"].startswith("[mock]")
    assert data["back_translated_text"].startswith("[mock]")
    assert data["source_lang"] == "en"
    assert data["target_lang"] == "ur"


def test_back_translate_auto_source(client):
    resp = client.post(
        "/api/v1/back-translate",
        json={"text": "Hello world", "source_lang": "auto", "target_lang": "ur"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["source_lang"] == "en"
