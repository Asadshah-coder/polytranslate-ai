"""Billing plans (static config).

Billing abstraction: plans and limits live here and in settings so Stripe
(or another provider) can be plugged in later. No fake checkout exists —
upgrading a plan is an explicit future integration, not a stub that pretends
to charge.
"""

from ..core.config import settings

def _plan_chars(plan_id: str) -> int:
    return {
        "free": settings.FREE_MONTHLY_CHARACTERS,
        "pro": settings.PRO_MONTHLY_CHARACTERS,
        "business": settings.BUSINESS_MONTHLY_CHARACTERS,
    }[plan_id]


_PLAN_DEFS: list[dict] = [
    {
        "id": "free",
        "name": "Free",
        "price_usd": 0,
        "features": [
            "100+ languages",
            "AI writing tools",
            "Translation history",
        ],
    },
    {
        "id": "pro",
        "name": "Pro",
        "price_usd": 12,
        "features": [
            "Everything in Free",
            "Document translation",
            "Priority speed",
        ],
    },
    {
        "id": "business",
        "name": "Business",
        "price_usd": 49,
        "features": [
            "Everything in Pro",
            "Team seats",
            "API access",
        ],
    },
]

# Backwards-compatible static snapshot (defaults); prefer get_plans().
PLANS: list[dict] = [
    {**p, "monthly_characters": _plan_chars(p["id"])} for p in _PLAN_DEFS
]

VALID_PLAN_IDS = {p["id"] for p in _PLAN_DEFS}


def get_plans() -> list[dict]:
    """Plans with live settings values (env overrides respected)."""
    return [{**p, "monthly_characters": _plan_chars(p["id"])} for p in _PLAN_DEFS]
