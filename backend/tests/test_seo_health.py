"""Tests for SEO pairs, billing plans, and health."""


def test_seo_pairs_shape(client):
    resp = client.get("/api/v1/seo/pairs")
    assert resp.status_code == 200, resp.text
    pairs = resp.json()["pairs"]
    assert len(pairs) >= 10
    slugs = [p["slug"] for p in pairs]
    assert len(set(slugs)) == len(slugs)  # unique slugs
    assert "english-to-urdu" in slugs
    for p in pairs:
        assert set(p) == {"slug", "source_lang", "target_lang", "title"}
        assert p["title"]  # non-empty, unique-ish titles
    titles = [p["title"] for p in pairs]
    assert len(set(titles)) == len(titles)


def test_seo_pair_full_config():
    from app.services import seo

    pair = seo.get_pair("english-to-urdu")
    assert pair is not None
    assert pair["source_lang"] == "en"
    assert pair["target_lang"] == "ur"
    assert pair["meta_description"]
    assert pair["intro"]
    assert len(pair["faq"]) >= 4
    assert all(q["question"] and q["answer"] for q in pair["faq"])
    assert len(pair["common_phrases"]) >= 8
    assert pair["tips"]
    assert pair["related"]
    assert seo.get_pair("no-such-pair") is None


def test_billing_plans(client):
    resp = client.get("/api/v1/billing/plans")
    assert resp.status_code == 200, resp.text
    plans = resp.json()["plans"]
    assert [p["id"] for p in plans] == ["free", "pro", "business"]
    free, pro, business = plans
    assert free["price_usd"] == 0
    assert free["monthly_characters"] == 50000
    assert pro["price_usd"] == 12
    assert pro["monthly_characters"] == 2000000
    assert business["price_usd"] == 49
    assert business["monthly_characters"] == 10000000
    for p in plans:
        assert p["features"]


def test_health(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert data["provider_configured"] is True  # mocked in conftest
    assert data["provider"] == "mock"
    assert data["database"] == "ok"


def test_health_no_provider(client, monkeypatch):
    from app.ai import factory

    monkeypatch.setattr(factory, "provider_configured", lambda: False)
    monkeypatch.setattr(factory, "active_provider_name", lambda: None)
    data = client.get("/api/v1/health").json()
    assert data["provider_configured"] is False
    assert data["provider"] is None
    assert data["status"] == "ok"
