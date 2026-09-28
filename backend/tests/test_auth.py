"""Tests for the auth endpoints."""

from app.auth.reset import create_reset_token


def test_signup_creates_user(client):
    resp = client.post(
        "/api/v1/auth/signup",
        json={"name": "Asad Bukhari", "email": "asad@example.com", "password": "secret123"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "asad@example.com"
    assert data["user"]["plan"] == "free"
    assert "password" not in data["user"]


def test_signup_duplicate_email_rejected(client):
    payload = {"name": "A", "email": "dup@example.com", "password": "secret123"}
    assert client.post("/api/v1/auth/signup", json=payload).status_code == 201
    resp = client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 400


def test_signup_short_password_rejected(client):
    resp = client.post(
        "/api/v1/auth/signup",
        json={"name": "A", "email": "short@example.com", "password": "123"},
    )
    assert resp.status_code == 422


def test_login_and_me(client):
    client.post(
        "/api/v1/auth/signup",
        json={"name": "A", "email": "login@example.com", "password": "secret123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    me = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == "login@example.com"


def test_login_wrong_password_401(client):
    client.post(
        "/api/v1/auth/signup",
        json={"name": "A", "email": "wrong@example.com", "password": "secret123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "nope-nope-nope"},
    )
    assert resp.status_code == 401


def test_me_without_token_401(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Authentication required."


def test_me_with_invalid_token_401(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bogus"})
    assert resp.status_code == 401


def test_password_reset_request_always_200(client):
    client.post(
        "/api/v1/auth/signup",
        json={"name": "A", "email": "reset@example.com", "password": "secret123"},
    )
    for email in ("reset@example.com", "nobody@example.com"):
        resp = client.post("/api/v1/auth/password-reset/request", json={"email": email})
        assert resp.status_code == 200
        assert resp.json() == {
            "message": "If an account exists, a reset link has been sent."
        }


def test_password_reset_confirm_flow(client):
    client.post(
        "/api/v1/auth/signup",
        json={"name": "A", "email": "flow@example.com", "password": "secret123"},
    )
    # Grab the user id from /me, then mint a real reset token.
    login = client.post(
        "/api/v1/auth/login",
        data={"username": "flow@example.com", "password": "secret123"},
    )
    token = login.json()["access_token"]
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    reset_token = create_reset_token(me.json()["id"])

    resp = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": reset_token, "new_password": "newsecret456"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"message": "Password has been reset."}

    # New password works, old one doesn't.
    ok = client.post(
        "/api/v1/auth/login",
        data={"username": "flow@example.com", "password": "newsecret456"},
    )
    assert ok.status_code == 200
    bad = client.post(
        "/api/v1/auth/login",
        data={"username": "flow@example.com", "password": "secret123"},
    )
    assert bad.status_code == 401


def test_password_reset_confirm_bad_token_400(client):
    resp = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": "not-a-real-token", "new_password": "newsecret456"},
    )
    assert resp.status_code == 400
