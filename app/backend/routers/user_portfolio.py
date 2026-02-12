from datetime import datetime
from typing import Optional

from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.portfolio_positions import PortfolioPosition
from models.user_watchlist import UserWatchlist
from pydantic import BaseModel, Field
from schemas.auth import UserResponse
from services.market_catalog import build_market_catalog
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

router = APIRouter(prefix="/api/v1/user", tags=["user-portfolio"])


class WatchlistUpsertRequest(BaseModel):
    asset_key: str = Field(min_length=2)


class WatchlistItemResponse(BaseModel):
    asset_key: str
    name: str
    symbol: str
    type: str
    current_price: float
    previous_price: float
    change_percent: float
    currency: str
    updated_at: datetime


class PortfolioPositionCreateRequest(BaseModel):
    asset_key: str = Field(min_length=2)
    quantity: float = Field(gt=0)
    avg_cost: float = Field(gt=0)
    currency: str = "TRY"
    opened_at: Optional[datetime] = None
    notes: Optional[str] = None


class PortfolioPositionUpdateRequest(BaseModel):
    quantity: Optional[float] = Field(default=None, gt=0)
    avg_cost: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = None
    opened_at: Optional[datetime] = None
    notes: Optional[str] = None


class PortfolioPositionResponse(BaseModel):
    id: int
    asset_key: str
    asset_name: str
    asset_type: str
    quantity: float
    avg_cost: float
    current_price: float
    market_value: float
    invested_value: float
    pnl_value: float
    pnl_percent: float
    currency: str
    opened_at: Optional[datetime] = None
    notes: Optional[str] = None
    updated_at: datetime


class PortfolioSummaryResponse(BaseModel):
    total_market_value: float
    total_invested_value: float
    total_pnl_value: float
    total_pnl_percent: float
    distribution: dict[str, float]
    position_count: int


def _find_asset(catalog: list[dict], asset_key: str) -> Optional[dict]:
    return next((item for item in catalog if item["asset_key"] == asset_key), None)


@router.get("/watchlist", response_model=list[WatchlistItemResponse])
async def get_watchlist(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserWatchlist).where(UserWatchlist.user_id == str(current_user.id)).order_by(UserWatchlist.id.desc())
    )
    watchlist = result.scalars().all()
    if not watchlist:
        return []

    catalog = await build_market_catalog()
    enriched: list[WatchlistItemResponse] = []
    for item in watchlist:
        asset = _find_asset(catalog, item.asset_key)
        if asset is None:
            continue
        enriched.append(WatchlistItemResponse(**asset))
    return enriched


@router.post("/watchlist", status_code=status.HTTP_201_CREATED)
async def add_watchlist_item(
    payload: WatchlistUpsertRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    catalog = await build_market_catalog()
    if _find_asset(catalog, payload.asset_key) is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    result = await db.execute(
        select(UserWatchlist).where(
            UserWatchlist.user_id == str(current_user.id),
            UserWatchlist.asset_key == payload.asset_key,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "ok", "message": "Already in watchlist"}

    record = UserWatchlist(user_id=str(current_user.id), asset_key=payload.asset_key)
    db.add(record)
    await db.commit()
    return {"status": "ok"}


@router.delete("/watchlist/{asset_key}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_watchlist_item(
    asset_key: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(UserWatchlist).where(
            UserWatchlist.user_id == str(current_user.id),
            UserWatchlist.asset_key == asset_key,
        )
    )
    await db.commit()


@router.get("/portfolio/positions", response_model=list[PortfolioPositionResponse])
async def list_positions(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioPosition).where(PortfolioPosition.user_id == str(current_user.id)).order_by(PortfolioPosition.id.desc())
    )
    positions = result.scalars().all()
    catalog = await build_market_catalog()

    response: list[PortfolioPositionResponse] = []
    for item in positions:
        market_asset = _find_asset(catalog, item.asset_key)
        current_price = float(market_asset["current_price"]) if market_asset else 0.0
        market_value = float(item.quantity) * current_price
        invested_value = float(item.quantity) * float(item.avg_cost)
        pnl_value = market_value - invested_value
        pnl_percent = (pnl_value / invested_value * 100.0) if invested_value > 0 else 0.0
        response.append(
            PortfolioPositionResponse(
                id=item.id,
                asset_key=item.asset_key,
                asset_name=item.asset_name,
                asset_type=item.asset_type,
                quantity=float(item.quantity),
                avg_cost=float(item.avg_cost),
                current_price=current_price,
                market_value=market_value,
                invested_value=invested_value,
                pnl_value=pnl_value,
                pnl_percent=pnl_percent,
                currency=item.currency,
                opened_at=item.opened_at,
                notes=item.notes,
                updated_at=item.updated_at,
            )
        )
    return response


@router.post("/portfolio/positions", response_model=PortfolioPositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(
    payload: PortfolioPositionCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    catalog = await build_market_catalog()
    market_asset = _find_asset(catalog, payload.asset_key)
    if market_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    record = PortfolioPosition(
        user_id=str(current_user.id),
        asset_key=payload.asset_key,
        asset_name=market_asset["name"],
        asset_type=market_asset["type"],
        quantity=payload.quantity,
        avg_cost=payload.avg_cost,
        currency=(payload.currency or market_asset["currency"]).upper(),
        opened_at=payload.opened_at,
        notes=payload.notes,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    current_price = float(market_asset["current_price"])
    market_value = float(record.quantity) * current_price
    invested_value = float(record.quantity) * float(record.avg_cost)
    pnl_value = market_value - invested_value
    pnl_percent = (pnl_value / invested_value * 100.0) if invested_value > 0 else 0.0
    return PortfolioPositionResponse(
        id=record.id,
        asset_key=record.asset_key,
        asset_name=record.asset_name,
        asset_type=record.asset_type,
        quantity=float(record.quantity),
        avg_cost=float(record.avg_cost),
        current_price=current_price,
        market_value=market_value,
        invested_value=invested_value,
        pnl_value=pnl_value,
        pnl_percent=pnl_percent,
        currency=record.currency,
        opened_at=record.opened_at,
        notes=record.notes,
        updated_at=record.updated_at,
    )


@router.put("/portfolio/positions/{position_id}", response_model=PortfolioPositionResponse)
async def update_position(
    position_id: int,
    payload: PortfolioPositionUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioPosition).where(
            PortfolioPosition.id == position_id,
            PortfolioPosition.user_id == str(current_user.id),
        )
    )
    position = result.scalar_one_or_none()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(position, key, value)
    await db.commit()
    await db.refresh(position)

    catalog = await build_market_catalog()
    market_asset = _find_asset(catalog, position.asset_key)
    current_price = float(market_asset["current_price"]) if market_asset else 0.0
    market_value = float(position.quantity) * current_price
    invested_value = float(position.quantity) * float(position.avg_cost)
    pnl_value = market_value - invested_value
    pnl_percent = (pnl_value / invested_value * 100.0) if invested_value > 0 else 0.0
    return PortfolioPositionResponse(
        id=position.id,
        asset_key=position.asset_key,
        asset_name=position.asset_name,
        asset_type=position.asset_type,
        quantity=float(position.quantity),
        avg_cost=float(position.avg_cost),
        current_price=current_price,
        market_value=market_value,
        invested_value=invested_value,
        pnl_value=pnl_value,
        pnl_percent=pnl_percent,
        currency=position.currency,
        opened_at=position.opened_at,
        notes=position.notes,
        updated_at=position.updated_at,
    )


@router.delete("/portfolio/positions/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_position(
    position_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(PortfolioPosition).where(
            PortfolioPosition.id == position_id,
            PortfolioPosition.user_id == str(current_user.id),
        )
    )
    await db.commit()


@router.get("/portfolio/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PortfolioPosition).where(PortfolioPosition.user_id == str(current_user.id)))
    positions = result.scalars().all()
    if not positions:
        return PortfolioSummaryResponse(
            total_market_value=0.0,
            total_invested_value=0.0,
            total_pnl_value=0.0,
            total_pnl_percent=0.0,
            distribution={"gold": 0.0, "currency": 0.0, "crypto": 0.0},
            position_count=0,
        )

    catalog = await build_market_catalog()
    market_total = 0.0
    invested_total = 0.0
    distribution_value = {"gold": 0.0, "currency": 0.0, "crypto": 0.0}

    for position in positions:
        asset = _find_asset(catalog, position.asset_key)
        current_price = float(asset["current_price"]) if asset else 0.0
        value = float(position.quantity) * current_price
        invested = float(position.quantity) * float(position.avg_cost)
        market_total += value
        invested_total += invested
        key = position.asset_type if position.asset_type in distribution_value else "currency"
        distribution_value[key] += value

    pnl_value = market_total - invested_total
    pnl_percent = (pnl_value / invested_total * 100.0) if invested_total > 0 else 0.0
    return PortfolioSummaryResponse(
        total_market_value=market_total,
        total_invested_value=invested_total,
        total_pnl_value=pnl_value,
        total_pnl_percent=pnl_percent,
        distribution=distribution_value,
        position_count=len(positions),
    )
