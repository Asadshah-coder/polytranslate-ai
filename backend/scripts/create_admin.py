#!/usr/bin/env python3
"""Create the first admin/regular user.

Usage (from the backend/ directory):
    python scripts/create_admin.py user@example.com 's3cret-password' --name "Asad Bukhari" --plan pro

Creates the user if missing, otherwise updates password/plan.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.auth.password import hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.models.subscription import Subscription  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.billing import VALID_PLAN_IDS  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a PolyTranslate AI user.")
    parser.add_argument("email", help="User email")
    parser.add_argument("password", help="Password (min 8 chars)")
    parser.add_argument("--name", default="Admin", help="Display name")
    parser.add_argument("--plan", default="free", choices=sorted(VALID_PLAN_IDS))
    args = parser.parse_args()

    if len(args.password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = args.email.lower().strip()
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password_hash = hash_password(args.password)
            user.plan = args.plan
            sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
            if sub:
                sub.plan = args.plan
            print(f"Updated user {email} (plan={args.plan}).")
        else:
            user = User(
                name=args.name,
                email=email,
                password_hash=hash_password(args.password),
                plan=args.plan,
            )
            db.add(user)
            db.flush()
            db.add(Subscription(user_id=user.id, plan=args.plan, status="active"))
            print(f"Created user {email} (plan={args.plan}).")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
