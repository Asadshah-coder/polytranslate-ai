"""OpenAI provider: chat completions + Whisper STT + TTS (plain httpx, no SDK)."""

import httpx

from ..core.logging import get_logger
from .base import AIProvider
from .errors import AUTH_ERROR, NETWORK_ERROR, PROVIDER_ERROR, RATE_LIMITED, AIProviderError

log = get_logger("ai.openai")

DEFAULT_MODEL = "gpt-4o-mini"
WHISPER_MODEL = "whisper-1"
TTS_MODEL = "tts-1"

# Voices actually offered by the OpenAI TTS API — only these are exposed.
TTS_VOICES = ("alloy", "echo", "fable", "onyx", "nova", "shimmer")

_API = "https://api.openai.com/v1"


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(
        self, api_key: str, model: str = DEFAULT_MODEL, timeout: int = 60
    ) -> None:
        self.api_key = api_key
        self.model = model
        self.last_model_used = model
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    async def complete(self, system: str, user: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    f"{_API}/chat/completions",
                    headers=self._headers(),
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": user},
                        ],
                        "temperature": 0.3,
                    },
                )
        except httpx.HTTPError as exc:
            raise AIProviderError(
                NETWORK_ERROR, "Could not reach the AI provider. Try again shortly."
            ) from exc
        self._raise_for_status(resp)
        try:
            data = resp.json()
            return str(data["choices"][0]["message"]["content"]).strip()
        except (KeyError, IndexError, ValueError) as exc:
            raise AIProviderError(
                PROVIDER_ERROR, "The AI provider returned an unexpected response."
            ) from exc

    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, content_type: str
    ) -> tuple[str, str | None]:
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    f"{_API}/audio/transcriptions",
                    headers=self._headers(),
                    files={"file": (filename, audio_bytes, content_type or "audio/mpeg")},
                    data={"model": WHISPER_MODEL, "response_format": "verbose_json"},
                )
        except httpx.HTTPError as exc:
            raise AIProviderError(
                NETWORK_ERROR, "Could not reach the AI provider. Try again shortly."
            ) from exc
        self._raise_for_status(resp)
        try:
            data = resp.json()
            transcript = str(data.get("text", "")).strip()
        except ValueError as exc:
            raise AIProviderError(
                PROVIDER_ERROR, "The AI provider returned an unexpected response."
            ) from exc
        if not transcript:
            raise AIProviderError(
                PROVIDER_ERROR, "No speech could be recognized in the audio."
            )
        return transcript, data.get("language")

    async def synthesize_speech(
        self,
        text: str,
        language: str,
        voice: str | None = None,
        speed: float = 1.0,
    ) -> tuple[bytes, str]:
        chosen = voice or "alloy"
        if chosen not in TTS_VOICES:
            raise AIProviderError(
                PROVIDER_ERROR,
                f"Unsupported voice. Available voices: {', '.join(TTS_VOICES)}.",
            )
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    f"{_API}/audio/speech",
                    headers=self._headers(),
                    json={
                        "model": TTS_MODEL,
                        "input": text[:4000],
                        "voice": chosen,
                        "speed": min(max(speed, 0.25), 4.0),
                        "response_format": "mp3",
                    },
                )
        except httpx.HTTPError as exc:
            raise AIProviderError(
                NETWORK_ERROR, "Could not reach the AI provider. Try again shortly."
            ) from exc
        self._raise_for_status(resp)
        return resp.content, "audio/mpeg"

    def _raise_for_status(self, resp: httpx.Response) -> None:
        if resp.status_code == 401:
            raise AIProviderError(
                AUTH_ERROR, "The configured OpenAI API key was rejected."
            )
        if resp.status_code == 429:
            raise AIProviderError(
                RATE_LIMITED,
                "The AI provider is rate-limited right now. Try again shortly.",
            )
        if resp.status_code >= 400:
            log.warning("OpenAI error %s: %s", resp.status_code, resp.text[:300])
            raise AIProviderError(
                PROVIDER_ERROR, "The AI provider returned an error. Try again shortly."
            )
