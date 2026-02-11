import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.assets import Assets
from services.market_prices import MarketPriceProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/assets", tags=["mobile-assets"])


class MobileAssetResponse(BaseModel):
    id: str
    name: str
    symbol: str
    type: str
    current_price: float
    previous_price: float
    change_percent: float
    image_url: Optional[str] = None
    updated_at: datetime


_CATEGORY_ALIAS = {
    "gold": "gold",
    "altin": "gold",
    "currency": "currency",
    "doviz": "currency",
    "crypto": "crypto",
    "kripto": "crypto",
}


def _to_mobile_type(category: str) -> str:
    value = (category or "").strip().lower()
    return _CATEGORY_ALIAS.get(value, value or "other")


@router.get("", response_model=list[MobileAssetResponse])
async def list_mobile_assets(
    type: Optional[str] = Query(default=None, description="gold|currency|crypto"),
    db: AsyncSession = Depends(get_db),
):
    """Mobile-friendly assets endpoint compatible with the Flutter client."""
    query = select(Assets).where(or_(Assets.is_sold.is_(None), Assets.is_sold.is_(False))).order_by(Assets.id.asc())
    result = await db.execute(query)
    items = result.scalars().all()

    provider = MarketPriceProvider()
    response: list[MobileAssetResponse] = []
    now = datetime.now(timezone.utc)
    requested_type = (type or "").strip().lower()

    for row in items:
        mobile_type = _to_mobile_type(row.category)
        if requested_type and mobile_type != requested_type:
            continue

        current_price = float(row.current_price or 0.0)
        previous_price = float(row.purchase_price or current_price or 0.0)
        change_percent = 0.0
        if previous_price > 0:
            change_percent = ((current_price - previous_price) / previous_price) * 100.0

        response.append(
            MobileAssetResponse(
                id=str(row.id),
                name=row.name,
                symbol=provider.infer_asset_symbol(name=row.name, category=row.category) or row.name.upper(),
                type=mobile_type,
                current_price=current_price,
                previous_price=previous_price,
                change_percent=change_percent,
                image_url=None,
                updated_at=row.updated_at or now,
            )
        )

    return response
