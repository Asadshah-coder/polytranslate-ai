"""Authentication endpoints: signup, login, me, password reset."""

from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user
from ....auth.jwt import create_token_for_user
from ....auth.password import hash_password, verify_password
from ....auth.reset import create_reset_token, deliver_reset_token, verify_reset_token
from ....core.errors import BadRequest, Unauthorized
from ....core.logging import get_logger
from ....core.rate_limit import limiter, RATE_LIMIT_MESSAGE
from ....core.rate_limit import rate_limit_key as _ip_key
from ....db.session import get_db
from ....models.subscription import Subscription
from ....models.user import User
from ....schemas import (
    PasswordResetConfirm,
    PasswordResetRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    UserOut,
)

router = APIRouter()
log = get_logger("api.auth")

_AUTH_LIMIT = "10/minute"


def _public(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "plan": user.plan,
        "created_at": user.created_at,
    }


@router.post("/auth/signup", response_model=SignupResponse, status_code=201)
@limiter.limit(_AUTH_LIMIT, key_func=_ip_key, error_message=RATE_LIMIT_MESSAGE)
async def signup(request: Request, response: Response, payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise BadRequest("An account with this email already exists.")
    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        plan="free",
    )
    db.add(user)
    db.flush()
    db.add(Subscription(user_id=user.id, plan="free", status="active"))
    db.commit()
    db.refresh(user)
    token = create_token_for_user(user.id)
    return {"access_token": token, "token_type": "bearer", "user": _public(user)}


@router.post("/auth/login", response_model=TokenResponse)
@limiter.limit(_AUTH_LIMIT, key_func=_ip_key, error_message=RATE_LIMIT_MESSAGE)
async def login(
    request: Request,
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form.username.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise Unauthorized("Incorrect email or password.")
    return {"access_token": create_token_for_user(user.id), "token_type": "bearer"}


@router.get("/auth/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return _public(user)


@router.post("/auth/password-reset/request")
@limiter.limit(_AUTH_LIMIT, key_func=_ip_key, error_message=RATE_LIMIT_MESSAGE)
async def password_reset_request(
    request: Request, response: Response, payload: PasswordResetRequest, db: Session = Depends(get_db)
):
    # Never reveal whether the email exists.
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if user is not None:
        token = create_reset_token(user.id)
        deliver_reset_token(email, token)
    return {"message": "If an account exists, a reset link has been sent."}


@router.post("/auth/password-reset/confirm")
@limiter.limit(_AUTH_LIMIT, key_func=_ip_key, error_message=RATE_LIMIT_MESSAGE)
async def password_reset_confirm(
    request: Request, response: Response, payload: PasswordResetConfirm, db: Session = Depends(get_db)
):
    user_id = verify_reset_token(payload.token)
    if user_id is None:
        raise BadRequest("Invalid or expired reset token.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise BadRequest("Invalid or expired reset token.")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password has been reset."}
