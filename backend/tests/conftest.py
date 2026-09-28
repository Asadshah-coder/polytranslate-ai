"""Shared test fixtures.

- Uses an isolated temp-file SQLite database (set before any app import).
- Mocks the AI provider: no network calls, deterministic fake outputs.
- Resets the database and rate-limit counters before every test.
"""

import os
import tempfile

_db = tempfile.NamedTemporaryFile(prefix="polytest_", suffix=".db", delete=False)
_db.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_db.name}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.ai import factory  # noqa: E402
from app.ai.base import AIProvider  # noqa: E402
from app.auth.jwt import create_token_for_user  # noqa: E402
from app.auth.password import hash_password  # noqa: E402
from app.core import rate_limit as rate_limit_module  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402


class MockProvider(AIProvider):
    """Deterministic fake provider for tests. NOT used in production."""

    name = "mock"
    model = "mock-model"

    def __init__(self) -> None:
        self.last_model_used = "mock-model"

    async def complete(self, system: str, user: str) -> str:
        return f"[mock] {user}"

    async def detect_language(self, text: str) -> tuple[str, str | None]:
        # Arabic-script sample text -> Urdu with high confidence; else English.
        if any("؀" <= ch <= "ۿ" for ch in text):
            return ("ur", "high")
        return ("en", None)

    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, content_type: str
    ) -> tuple[str, str | None]:
        return ("mock transcript", "en")

    async def synthesize_speech(
        self,
        text: str,
        language: str,
        voice: str | None = None,
        speed: float = 1.0,
    ) -> tuple[bytes, str]:
        return (b"FAKEAUDIO", "audio/mpeg")


@pytest.fixture(autouse=True)
def _mock_provider(monkeypatch):
    monkeypatch.setattr(factory, "get_provider", lambda: MockProvider())
    monkeypatch.setattr(factory, "provider_configured", lambda: True)
    monkeypatch.setattr(factory, "active_provider_name", lambda: "mock")


@pytest.fixture(autouse=True)
def _clean_state():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    rate_limit_module.reset_storage()
    yield


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def user_token():
    db = SessionLocal()
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hash_password("password123"),
        plan="free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return create_token_for_user(user.id)


@pytest.fixture()
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}
