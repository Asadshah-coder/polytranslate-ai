"""Translation history persistence."""

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..core.errors import NotFound
from ..models.translation import Translation


def save(
    db: Session,
    *,
    user_id: int,
    source_lang: str,
    target_lang: str,
    source_text: str,
    translated_text: str,
    tone: str,
    style: str,
    was_auto_detected: bool,
    duration_ms: int,
    provider: str,
    model: str,
) -> Translation:
    record = Translation(
        user_id=user_id,
        source_lang=source_lang,
        target_lang=target_lang,
        source_text=source_text,
        translated_text=translated_text,
        tone=tone,
        style=style,
        was_auto_detected=was_auto_detected,
        duration_ms=duration_ms,
        provider=provider,
        model=model,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_history(
    db: Session, user_id: int, *, search: str | None = None,
    limit: int = 20, offset: int = 0,
) -> tuple[list[Translation], int]:
    query = db.query(Translation).filter(Translation.user_id == user_id)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Translation.source_text.ilike(like),
                Translation.translated_text.ilike(like),
            )
        )
    total = query.count()
    items = (
        query.order_by(Translation.created_at.desc(), Translation.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def delete_one(db: Session, user_id: int, item_id: int) -> None:
    record = (
        db.query(Translation)
        .filter(Translation.id == item_id, Translation.user_id == user_id)
        .first()
    )
    if not record:
        raise NotFound("History item not found.")
    db.delete(record)
    db.commit()


def clear_all(db: Session, user_id: int) -> int:
    count = (
        db.query(Translation).filter(Translation.user_id == user_id).delete()
    )
    db.commit()
    return count


def history_count(db: Session, user_id: int) -> int:
    return (
        db.query(func.count(Translation.id))
        .filter(Translation.user_id == user_id)
        .scalar()
        or 0
    )
