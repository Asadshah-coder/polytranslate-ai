"""SEO endpoints: curated language-pair configs for programmatic SEO."""

from fastapi import APIRouter

from ....schemas import SeoPairsResponse
from ....services import seo as seo_service

router = APIRouter()


@router.get("/seo/pairs", response_model=SeoPairsResponse)
async def list_pairs():
    return {"pairs": seo_service.get_pairs()}
