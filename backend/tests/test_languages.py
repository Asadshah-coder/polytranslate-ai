"""Tests for the language registry endpoints."""


def test_languages_count(client):
    resp = client.get("/api/v1/languages")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["count"] >= 100
    assert data["count"] == len(data["languages"])
    codes = {lang["code"] for lang in data["languages"]}
    assert len(codes) == len(data["languages"])  # unique codes
    for lang in data["languages"]:
        assert set(lang) == {"code", "name", "native_name", "direction", "locale"}
        assert lang["direction"] in ("ltr", "rtl")


def test_rtl_languages(client):
    data = client.get("/api/v1/languages").json()
    by_code = {lang["code"]: lang for lang in data["languages"]}
    for code in ("ur", "ar", "fa", "he", "ps", "sd", "ug", "yi"):
        assert by_code[code]["direction"] == "rtl", code
    assert by_code["en"]["direction"] == "ltr"


def test_get_single_language(client):
    resp = client.get("/api/v1/languages/ur")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Urdu"
    assert data["native_name"] == "اردو"
    assert data["direction"] == "rtl"
    assert data["locale"] == "ur-PK"


def test_get_unknown_language_404(client):
    resp = client.get("/api/v1/languages/xx")
    assert resp.status_code == 404
