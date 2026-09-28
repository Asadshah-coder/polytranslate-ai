"""Shared endpoint helpers."""

import hashlib

from fastapi import Request


def ip_hash_for(request: Request) -> str | None:
    """Privacy-friendly client identifier (SHA-256 of the IP, never the raw IP)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    else:
        return None
    return hashlib.sha256(ip.encode()).hexdigest()
