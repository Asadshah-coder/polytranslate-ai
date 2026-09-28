"""API v1 router aggregation."""

from fastapi import APIRouter

from .endpoints import (
    auth,
    backtranslate,
    billing,
    dashboard,
    detect,
    documents,
    health,
    history,
    improve,
    languages,
    paraphrase,
    seo,
    speech,
    summarize,
    translate,
)

api_router = APIRouter()

api_router.include_router(translate.router, tags=["translate"])
api_router.include_router(detect.router, tags=["translate"])
api_router.include_router(improve.router, tags=["writing"])
api_router.include_router(paraphrase.router, tags=["writing"])
api_router.include_router(summarize.router, tags=["writing"])
api_router.include_router(backtranslate.router, tags=["translate"])
api_router.include_router(documents.router, tags=["documents"])
api_router.include_router(speech.router, tags=["speech"])
api_router.include_router(languages.router, tags=["languages"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(history.router, tags=["history"])
api_router.include_router(dashboard.router, tags=["dashboard"])
api_router.include_router(billing.router, tags=["billing"])
api_router.include_router(seo.router, tags=["seo"])
api_router.include_router(health.router, tags=["health"])
