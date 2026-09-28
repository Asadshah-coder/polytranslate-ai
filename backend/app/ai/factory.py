"""Provider factory: selects the AI provider from AI_PROVIDER / available keys.

Raises ProviderNotConfigured (-> 503 for translation, -> 501 for speech)
when no usable provider is configured. The app never fabricates output.
"""

from ..core.config import settings
from .base import AIProvider
from .errors import ProviderNotConfigured
from .gemini_provider import GeminiProvider
from .openai_provider import OpenAIProvider


def get_provider() -> AIProvider:
    choice = settings.AI_PROVIDER.lower().strip()
    if choice == "gemini":
        if not settings.GEMINI_API_KEY:
            raise ProviderNotConfigured("Translation service")
        return GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL)
    if choice == "openai":
        if not settings.OPENAI_API_KEY:
            raise ProviderNotConfigured("Translation service")
        return OpenAIProvider(settings.OPENAI_API_KEY, settings.OPENAI_MODEL)
    # auto: prefer Gemini, fall back to OpenAI
    if settings.GEMINI_API_KEY:
        return GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL)
    if settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY, settings.OPENAI_MODEL)
    raise ProviderNotConfigured("Translation service")


def provider_configured() -> bool:
    try:
        get_provider()
        return True
    except ProviderNotConfigured:
        return False


def active_provider_name() -> str | None:
    try:
        return get_provider().name
    except ProviderNotConfigured:
        return None
