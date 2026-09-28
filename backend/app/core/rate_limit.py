"""Rate limiting (slowapi).

Two tiers, selected per request:
- anonymous callers  -> RATE_LIMIT_ANON (default "30/minute"), keyed by IP
- authenticated users -> RATE_LIMIT_AUTH (default "120/minute"), keyed by user id

Storage is Redis when REDIS_URL is set, otherwise in-memory.
The dynamic limit callable receives the rate-limit key (slowapi calls any
limit callable whose signature contains a `key` parameter with the key).
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from .config import settings
from .logging import get_logger
from .security import get_unverified_subject

log = get_logger("core.rate_limit")

RATE_LIMIT_MESSAGE = "Rate limit exceeded. Try again shortly."

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL or "memory://",
    headers_enabled=True,
)


def rate_limit_key(request: Request) -> str:
    """Per-user key for authenticated callers, per-IP key otherwise."""
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        sub = get_unverified_subject(auth[7:].strip())
        if sub:
            return f"auth:{sub}"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    else:
        ip = "unknown"
    return f"anon:{ip}"


def dynamic_limit(key: str) -> str:
    """slowapi dynamic limit: pick the tier from the key prefix."""
    if key.startswith("auth:"):
        return settings.RATE_LIMIT_AUTH
    return settings.RATE_LIMIT_ANON


def reset_storage() -> None:
    """Clear rate-limit counters. Used by tests only."""
    try:
        storage = limiter.limiter._storage  # type: ignore[attr-defined]
        if hasattr(storage, "reset"):
            storage.reset()
    except Exception:
        log.debug("Could not reset rate-limit storage")
