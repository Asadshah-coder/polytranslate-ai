"""Password-reset tokens (itsdangerous, 1-hour expiry).

Tokens are signed with JWT_SECRET and a dedicated salt. The request endpoint
never reveals whether an email exists; without SMTP configured, the token is
logged server-side in development only (documented in the README).
"""

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from ..core.config import settings
from ..core.logging import get_logger

log = get_logger("auth.reset")

_SALT = "polytranslate-password-reset"
_EXPIRY_SECONDS = 3600


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(settings.JWT_SECRET, salt=_SALT)


def create_reset_token(user_id: int) -> str:
    return _serializer().dumps(str(user_id))


def verify_reset_token(token: str) -> int | None:
    try:
        user_id = _serializer().loads(token, max_age=_EXPIRY_SECONDS)
        return int(user_id)
    except (BadSignature, SignatureExpired, ValueError):
        return None


def deliver_reset_token(email: str, token: str) -> None:
    """Send the reset token. SMTP hook goes here; dev fallback logs it."""
    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
    if settings.is_production:
        # No SMTP configured yet: do NOT log tokens in production.
        log.info("Password reset requested for %s (no SMTP configured)", email)
    else:
        log.info("Password reset token for %s: %s", email, token)
        log.info("Reset link (dev only): %s", reset_link)
