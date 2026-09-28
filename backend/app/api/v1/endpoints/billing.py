"""Billing plans (static config; Stripe plugs in later)."""

from fastapi import APIRouter

from ....schemas import PlansResponse
from ....services import billing as billing_service

router = APIRouter()


@router.get("/billing/plans", response_model=PlansResponse)
async def list_plans():
    return {"plans": billing_service.get_plans()}
