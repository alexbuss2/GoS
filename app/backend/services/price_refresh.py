import logging
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from core.config import settings
from core.database import db_manager
from services.assets import AssetsService
from services.market_prices import MarketPriceProvider

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None
_job_id = "market_price_refresh"


async def refresh_prices_once(trigger: str = "manual") -> dict[str, Any]:
    """Run one market refresh cycle."""
    if not db_manager.async_session_maker:
        raise RuntimeError("Database session maker is not initialized")

    async with db_manager.async_session_maker() as session:
        service = AssetsService(session)
        provider = MarketPriceProvider(timeout_seconds=settings.price_refresh_timeout_seconds)
        summary = await service.refresh_market_prices(provider=provider)
        logger.info("Price refresh (%s) summary: %s", trigger, summary)
        return summary


async def _scheduled_refresh() -> None:
    try:
        await refresh_prices_once(trigger="scheduler")
    except Exception as exc:
        logger.error("Scheduled market refresh failed: %s", exc, exc_info=True)


def start_price_refresh_scheduler() -> None:
    """Start APScheduler for market price refresh jobs."""
    global _scheduler
    if not settings.price_refresh_enabled:
        logger.info("Price refresh scheduler is disabled by configuration")
        return

    if _scheduler and _scheduler.running:
        return

    interval_seconds = max(30, int(settings.price_refresh_interval_seconds))
    _scheduler = AsyncIOScheduler(timezone="UTC")
    _scheduler.add_job(
        _scheduled_refresh,
        trigger="interval",
        seconds=interval_seconds,
        id=_job_id,
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Price refresh scheduler started with interval=%ss", interval_seconds)


def stop_price_refresh_scheduler() -> None:
    """Stop APScheduler if running."""
    global _scheduler
    if not _scheduler:
        return
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Price refresh scheduler stopped")
    _scheduler = None
