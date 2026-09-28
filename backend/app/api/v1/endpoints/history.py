"""Translation history endpoints (authenticated)."""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from ....auth.deps import get_current_user
from ....db.session import get_db
from ....models.user import User
from ....schemas import HistoryItem, HistoryList
from ....services import history as history_service

router = APIRouter()


@router.get("/history", response_model=HistoryList)
async def get_history(
    search: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items, total = history_service.list_history(
        db, user.id, search=search, limit=limit, offset=offset
    )
    return {"items": [HistoryItem.model_validate(i) for i in items], "total": total}


@router.delete("/history/{item_id}", status_code=204)
async def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    history_service.delete_one(db, user.id, item_id)
    return Response(status_code=204)


@router.delete("/history", status_code=204)
async def clear_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    history_service.clear_all(db, user.id)
    return Response(status_code=204)
