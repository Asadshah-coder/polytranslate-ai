"""Auth dependencies: required and optional current-user resolution."""

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from ..core import security
from ..core.errors import Unauthorized
from ..db.session import get_db
from ..models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login", auto_error=False
)

_AUTH_REQUIRED = "Authentication required."


def _user_from_token(db: Session, token: str | None) -> User | None:
    if not token:
        return None
    try:
        payload = security.decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            return None
        return user
    except (JWTError, ValueError):
        return None


async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
) -> User | None:
    return _user_from_token(db, token)


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
) -> User:
    user = _user_from_token(db, token)
    if user is None:
        raise Unauthorized(_AUTH_REQUIRED)
    return user
