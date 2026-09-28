"""PolyTranslate AI — FastAPI application entrypoint."""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .ai.errors import AIProviderError, ProviderNotConfigured
from .api.v1.router import api_router
from .core.config import settings
from .core.errors import AppError
from .core.logging import get_logger
from .core.rate_limit import RATE_LIMIT_MESSAGE, limiter
from .db.base import Base
from .db.session import engine
from .models import (  # noqa: F401 — register models for create_all
    DocumentJob,
    LanguagePair,
    Subscription,
    Translation,
    UsageRecord,
    User,
)

log = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist (Alembic handles migrations in prod).
    Base.metadata.create_all(bind=engine)
    from .ai import factory

    log.info(
        "Starting %s v%s (env=%s, provider=%s)",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.APP_ENV,
        factory.active_provider_name() or "none configured",
    )
    if not factory.provider_configured():
        log.warning(
            "No AI provider key configured (GEMINI_API_KEY/OPENAI_API_KEY). "
            "AI endpoints will return 503/501 until a key is set."
        )
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    # ---- exception handlers ----

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        retry_after = "60"
        try:
            current = request.state.view_rate_limit
            if current:
                reset, _ = request.app.state.limiter.limiter.get_window_stats(
                    current[0], *current[1]
                )
                retry_after = str(max(1, int(reset - time.time())))
        except Exception:
            pass
        return JSONResponse(
            status_code=429,
            content={"detail": RATE_LIMIT_MESSAGE},
            headers={"Retry-After": retry_after},
        )

    @app.exception_handler(ProviderNotConfigured)
    async def provider_not_configured_handler(
        request: Request, exc: ProviderNotConfigured
    ):
        # Speech features -> 501 (not configured); translation -> 503 (unavailable).
        status = 501 if exc.feature.startswith("Speech") else 503
        return JSONResponse(status_code=status, content={"detail": exc.message})

    @app.exception_handler(AIProviderError)
    async def ai_provider_error_handler(request: Request, exc: AIProviderError):
        return JSONResponse(
            status_code=503,
            content={"detail": exc.message or "Translation service is temporarily unavailable."},
        )

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    # ---- routes ----

    app.include_router(api_router, prefix="/api/v1")

    @app.get("/", include_in_schema=False)
    async def root():
        return {"name": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
