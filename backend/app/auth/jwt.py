"""JWT token issuance for authenticated sessions."""

from ..core import security


def create_token_for_user(user_id: int) -> str:
    return security.create_access_token(str(user_id))
