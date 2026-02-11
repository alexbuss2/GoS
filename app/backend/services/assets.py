import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.assets import Assets
from services.market_prices import MarketPriceProvider

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class AssetsService:
    """Service layer for Assets operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Assets]:
        """Create a new assets"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Assets(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created assets with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating assets: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for assets {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Assets]:
        """Get assets by ID (user can only see their own records)"""
        try:
            query = select(Assets).where(Assets.id == obj_id)
            if user_id:
                query = query.where(Assets.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching assets {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of assetss (user can only see their own records)"""
        try:
            query = select(Assets)
            count_query = select(func.count(Assets.id))
            
            if user_id:
                query = query.where(Assets.user_id == user_id)
                count_query = count_query.where(Assets.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Assets, field):
                        query = query.where(getattr(Assets, field) == value)
                        count_query = count_query.where(getattr(Assets, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Assets, field_name):
                        query = query.order_by(getattr(Assets, field_name).desc())
                else:
                    if hasattr(Assets, sort):
                        query = query.order_by(getattr(Assets, sort))
            else:
                query = query.order_by(Assets.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching assets list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Assets]:
        """Update assets (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Assets {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated assets {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating assets {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete assets (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Assets {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted assets {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting assets {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Assets]:
        """Get assets by any field"""
        try:
            if not hasattr(Assets, field_name):
                raise ValueError(f"Field {field_name} does not exist on Assets")
            result = await self.db.execute(
                select(Assets).where(getattr(Assets, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching assets by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Assets]:
        """Get list of assetss filtered by field"""
        try:
            if not hasattr(Assets, field_name):
                raise ValueError(f"Field {field_name} does not exist on Assets")
            result = await self.db.execute(
                select(Assets)
                .where(getattr(Assets, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Assets.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching assetss by {field_name}: {str(e)}")
            raise

    async def refresh_market_prices(self, provider: Optional[MarketPriceProvider] = None) -> Dict[str, Any]:
        """Refresh current prices for unsold assets using external market providers."""
        provider = provider or MarketPriceProvider(timeout_seconds=settings.price_refresh_timeout_seconds)
        market_prices = await provider.fetch_market_prices()
        if not market_prices:
            logger.warning("Market refresh skipped: no market prices available from providers")
            return {"updated_count": 0, "skipped_count": 0, "errors": ["market_data_unavailable"]}

        try:
            result = await self.db.execute(
                select(Assets).where(or_(Assets.is_sold.is_(None), Assets.is_sold.is_(False)))
            )
            assets = result.scalars().all()
            if not assets:
                return {"updated_count": 0, "skipped_count": 0, "errors": []}

            updated_count = 0
            skipped_count = 0
            errors: list[str] = []
            now = datetime.now(timezone.utc)

            for asset in assets:
                try:
                    resolved_price = await provider.resolve_asset_price(
                        name=asset.name,
                        category=asset.category,
                        currency=asset.currency,
                        market_prices=market_prices,
                    )
                    if not isinstance(resolved_price, (int, float)) or resolved_price <= 0:
                        skipped_count += 1
                        continue

                    asset.current_price = float(resolved_price)
                    asset.updated_at = now
                    updated_count += 1
                except Exception as exc:
                    skipped_count += 1
                    errors.append(f"asset_id={asset.id}:{exc}")

            await self.db.commit()
            logger.info(
                "Market refresh completed. updated=%s skipped=%s errors=%s",
                updated_count,
                skipped_count,
                len(errors),
            )
            return {"updated_count": updated_count, "skipped_count": skipped_count, "errors": errors}
        except Exception as e:
            await self.db.rollback()
            logger.error("Error refreshing market prices: %s", e, exc_info=True)
            raise