"""Language registry endpoints."""

from fastapi import APIRouter

from ....core.errors import NotFound
from ....languages import registry
from ....schemas import LanguageOut, LanguagesResponse

router = APIRouter()


@router.get("/languages", response_model=LanguagesResponse)
async def list_languages():
    languages = [LanguageOut(**lang) for lang in registry.all()]
    return {"languages": languages, "count": len(languages)}


@router.get("/languages/{code}", response_model=LanguageOut)
async def get_language(code: str):
    lang = registry.get(code)
    if lang is None:
        raise NotFound(f"Unknown language code: {code!r}")
    return LanguageOut(**lang)
