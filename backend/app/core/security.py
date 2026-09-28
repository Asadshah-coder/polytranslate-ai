"""JWT helpers (HS256). Secrets never leave this module's callers' control."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from .config import settings
from .logging import get_logger

log = get_logger("core.security")

ALGORITHM = "HS256"


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": subject, "exp": expire}, settings.JWT_SECRET, algorithm=ALGORITHM
    )


def decode_token(token: str) -> dict:
    """Verify signature + expiry. Raises JWTError on any problem."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])


def get_unverified_subject(token: str) -> str | None:
    """Subject without signature verification.

    Used ONLY for rate-limit keying, never for authorization.
    An attacker can at most rate-limit themselves with a forged key.
    """
    try:
        claims = jwt.get_unverified_claims(token)
        sub = claims.get("sub")
        return str(sub) if sub else None
    except JWTError:
        return None
    except Exception:  # malformed token
        log.debug("Could not parse token for rate-limit keying")
        return None
