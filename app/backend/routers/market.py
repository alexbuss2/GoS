from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from models.asset_price_history import AssetPriceHistory
from pydantic import BaseModel
from schemas.auth import UserResponse
from services.market_catalog import build_market_catalog, generate_synthetic_history
from services.market_prices import MarketPriceProvider
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

router = APIRouter(prefix="/api/v1/market", tags=["market"])


class MarketAssetResponse(BaseModel):
    asset_key: str
    name: str
    symbol: str
    type: str
    current_price: float
    previous_price: float
    change_percent: float
    currency: str
    updated_at: datetime


class AssetHistoryPoint(BaseModel):
    timestamp: datetime
    price: float


class AssetHistoryResponse(BaseModel):
    asset_key: str
    range: str
    points: list[AssetHistoryPoint]


def _range_config(range_code: str) -> tuple[timedelta, int, str]:
    range_map: dict[str, tuple[timedelta, int, str]] = {
        "1D": (timedelta(days=1), 5, "5m"),
        "1W": (timedelta(days=7), 30, "30m"),
        "1M": (timedelta(days=30), 240, "4h"),
        "3M": (timedelta(days=90), 1440, "1d"),
        "1Y": (timedelta(days=365), 1440, "1d"),
    }
    value = range_map.get(range_code.upper())
    if not value:
        raise HTTPException(status_code=400, detail="Invalid range. Use 1D, 1W, 1M, 3M, 1Y")
    return value


@router.get("/assets", response_model=list[MarketAssetResponse])
async def list_market_assets(
    type: Optional[str] = Query(default=None, description="gold|currency|crypto"),
    query: Optional[str] = Query(default=None, description="Search by name or key"),
):
    return await build_market_catalog(requested_type=type or "", search_query=query or "")


@router.get("/assets/{asset_key}/history", response_model=AssetHistoryResponse)
async def get_asset_history(
    asset_key: str,
    range: Literal["1D", "1W", "1M", "3M", "1Y"] = Query(default="1D"),
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_current_user),
):
    window, synthetic_step_minutes, interval_bucket = _range_config(range)
    now = datetime.now(timezone.utc)
    cutoff = now - window

    stmt: Select[tuple[AssetPriceHistory]] = (
        select(AssetPriceHistory)
        .where(
            AssetPriceHistory.asset_key == asset_key,
            AssetPriceHistory.timestamp >= cutoff,
            AssetPriceHistory.interval_bucket == interval_bucket,
        )
        .order_by(AssetPriceHistory.timestamp.asc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    points: list[AssetHistoryPoint] = [
        AssetHistoryPoint(timestamp=row.timestamp, price=float(row.price))
        for row in rows
    ]
    if not points:
        catalog = await build_market_catalog()
        match = next((item for item in catalog if item["asset_key"] == asset_key), None)
        current_price = float(match["current_price"]) if match else 0.0
        fallback_points = generate_synthetic_history(
            current_price=current_price,
            points=60 if range in {"1D", "1W"} else 90,
            step_minutes=synthetic_step_minutes,
        )
        points = [AssetHistoryPoint(**point) for point in fallback_points]

    return AssetHistoryResponse(asset_key=asset_key, range=range, points=points)
