"""AI provider error types and codes."""


class AIProviderError(Exception):
    """Raised when the AI provider fails. Carries a user-safe message."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


# Error codes
NETWORK_ERROR = "network_error"
AUTH_ERROR = "auth"
RATE_LIMITED = "rate_limited"
PROVIDER_ERROR = "provider_error"
NOT_CONFIGURED = "not_configured"
DETECTION_FAILED = "detection_failed"


class ProviderNotConfigured(AIProviderError):
    """Raised when the needed provider/key is not configured on this server."""

    def __init__(self, feature: str) -> None:
        self.feature = feature
        message = (
            f"{feature} is not configured on this server."
            if feature != "Translation service"
            else "Translation service is temporarily unavailable."
        )
        super().__init__(NOT_CONFIGURED, message)
