"""Tests for translation history endpoints."""


def _translate(client, headers, text):
    resp = client.post(
        "/api/v1/translate",
        json={"text": text, "source_lang": "en", "target_lang": "ur"},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text


def test_history_list_search_and_pagination(client, auth_headers):
    _translate(client, auth_headers, "Hello world")
    _translate(client, auth_headers, "Good morning")
    _translate(client, auth_headers, "How are you")

    resp = client.get("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 3
    assert len(body["items"]) == 3
    item = body["items"][0]
    for field in ("id", "source_lang", "target_lang", "source_text",
                  "translated_text", "tone", "style", "created_at"):
        assert field in item

    search = client.get("/api/v1/history?search=morning", headers=auth_headers)
    assert search.json()["total"] == 1
    assert search.json()["items"][0]["source_text"] == "Good morning"

    page = client.get("/api/v1/history?limit=2&offset=1", headers=auth_headers)
    assert page.json()["total"] == 3
    assert len(page.json()["items"]) == 2


def test_history_delete_one(client, auth_headers):
    _translate(client, auth_headers, "Delete me")
    items = client.get("/api/v1/history", headers=auth_headers).json()["items"]
    item_id = items[0]["id"]

    resp = client.delete(f"/api/v1/history/{item_id}", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get("/api/v1/history", headers=auth_headers).json()["total"] == 0


def test_history_delete_missing_404(client, auth_headers):
    resp = client.delete("/api/v1/history/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_history_clear_all(client, auth_headers):
    _translate(client, auth_headers, "One")
    _translate(client, auth_headers, "Two")
    resp = client.delete("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get("/api/v1/history", headers=auth_headers).json()["total"] == 0


def test_history_requires_auth(client):
    resp = client.get("/api/v1/history")
    assert resp.status_code == 401


def test_history_is_per_user(client, auth_headers):
    _translate(client, auth_headers, "Mine")
    # Second user sees an empty history.
    client.post(
        "/api/v1/auth/signup",
        json={"name": "B", "email": "b@example.com", "password": "secret123"},
    )
    login = client.post(
        "/api/v1/auth/login",
        data={"username": "b@example.com", "password": "secret123"},
    )
    headers2 = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert client.get("/api/v1/history", headers=headers2).json()["total"] == 0
