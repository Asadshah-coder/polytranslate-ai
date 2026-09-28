"""AI writing tools: grammar correction, paraphrasing, summarization."""

from ..ai import factory


async def improve_text(text: str, language: str = "en", kind: str = "grammar") -> str:
    provider = factory.get_provider()
    return await provider.improve_text(text, language=language, kind=kind)


async def paraphrase_text(text: str, style: str = "professional") -> dict:
    provider = factory.get_provider()
    paraphrased, alternatives = await provider.paraphrase(text, style=style)
    return {"paraphrased_text": paraphrased, "alternatives": alternatives}


async def summarize_text(text: str, format: str = "short") -> str:
    provider = factory.get_provider()
    return await provider.summarize(text, format=format)
