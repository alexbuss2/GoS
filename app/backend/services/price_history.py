from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from models.asset_price_history import AssetPriceHistory
from services.market_catalog import build_market_catalog
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

BUCKET_WINDOWS = {
    "5m": timedelta(minutes=5),
    "30m": timedelta(minutes=30),
    "4h": timedelta(hours=4),
    "1d": timedelta(days=1),
}

BUCKET_RETENTION = {
    "5m": timedelta(days=2),
    "30m": timedelta(days=14),
    "4h": timedelta(days=120),
    "1d": timedelta(days=540),
}


async def append_market_history_snapshot(db: AsyncSession, bucket: str = "5m") -> int:
    now = datetime.now(timezone.utc)
    window = BUCKET_WINDOWS.get(bucket, timedelta(minutes=5))
    catalog = await build_market_catalog()
    if not catalog:
        return 0

    inserted = 0
    for item in catalog:
        result = await db.execute(
            select(AssetPriceHistory)
            .where(
                AssetPriceHistory.asset_key == item["asset_key"],
                AssetPriceHistory.interval_bucket == bucket,
                AssetPriceHistory.timestamp >= now - window,
            )
            .order_by(AssetPriceHistory.timestamp.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        if latest:
            continue

        db.add(
            AssetPriceHistory(
                asset_key=item["asset_key"],
                asset_name=item["name"],
                asset_type=item["type"],
                interval_bucket=bucket,
                price=float(item["current_price"]),
                currency=item["currency"],
                timestamp=now,
            )
        )
        inserted += 1

    if inserted:
        await db.commit()
    return inserted


async def purge_old_history(db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    deleted = 0
    for bucket, retention in BUCKET_RETENTION.items():
        result = await db.execute(
            delete(AssetPriceHistory).where(
                AssetPriceHistory.interval_bucket == bucket,
                AssetPriceHistory.timestamp < now - retention,
            )
        )
        deleted += int(result.rowcount or 0)
    if deleted:
        await db.commit()
    logger.info("Purged %s old market history rows", deleted)
    return deleted
