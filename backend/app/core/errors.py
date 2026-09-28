"""Application-level exceptions mapped to HTTP responses in main.py."""


class AppError(Exception):
    status_code: int = 500

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class BadRequest(AppError):
    status_code = 400


class Unauthorized(AppError):
    status_code = 401


class UsageLimitExceeded(AppError):
    """402 — monthly character cap reached."""

    status_code = 402


class NotFound(AppError):
    status_code = 404
