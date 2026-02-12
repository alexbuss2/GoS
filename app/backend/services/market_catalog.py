from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from services.market_prices import MarketPriceProvider

DEFAULT_MARKET_ASSETS: list[dict[str, str]] = [
    {"asset_key": "fx_usd_try", "name": "Dolar", "category": "currency", "currency": "TRY"},
    {"asset_key": "fx_eur_try", "name": "Euro", "category": "currency", "currency": "TRY"},
    {"asset_key": "fx_gbp_try", "name": "Sterlin", "category": "currency", "currency": "TRY"},
    {"asset_key": "gold_gram_try", "name": "Gram Altın", "category": "gold", "currency": "TRY"},
    {"asset_key": "gold_quarter_try", "name": "Çeyrek Altın", "category": "gold", "currency": "TRY"},
    {"asset_key": "gold_ons_try", "name": "ONS Altın", "category": "gold", "currency": "TRY"},
    {"asset_key": "crypto_btc", "name": "Bitcoin", "category": "crypto", "currency": "USD"},
    {"asset_key": "crypto_eth", "name": "Ethereum", "category": "crypto", "currency": "USD"},
    {"asset_key": "crypto_bnb", "name": "Binance Coin", "category": "crypto", "currency": "USD"},
]

_CATEGORY_ALIAS = {
    "gold": "gold",
    "altin": "gold",
    "currency": "currency",
    "doviz": "currency",
    "crypto": "crypto",
    "kripto": "crypto",
}


def to_mobile_type(category: str) -> str:
    value = (category or "").strip().lower()
    return _CATEGORY_ALIAS.get(value, value or "other")


def infer_change_percent(current_price: float, previous_price: float) -> float:
    if previous_price <= 0:
        return 0.0
    return ((current_price - previous_price) / previous_price) * 100.0


async def build_market_catalog(
    provider: Optional[MarketPriceProvider] = None,
    requested_type: str = "",
    search_query: str = "",
) -> list[dict[str, Any]]:
    provider = provider or MarketPriceProvider()
    market_prices = await provider.fetch_market_prices()
    now = datetime.now(timezone.utc)
    search = (search_query or "").strip().lower()
    requested = (requested_type or "").strip().lower()

    response: list[dict[str, Any]] = []
    for template in DEFAULT_MARKET_ASSETS:
        mobile_type = to_mobile_type(template["category"])
        if requested and requested != mobile_type:
            continue
        if search and search not in template["name"].lower() and search not in template["asset_key"]:
            continue

        current_price = await provider.resolve_asset_price(
            name=template["name"],
            category=template["category"],
            currency=template["currency"],
            market_prices=market_prices,
        )
        if not isinstance(current_price, (int, float)) or current_price <= 0:
            continue

        previous_price = float(current_price) * 0.997
        response.append(
            {
                "asset_key": template["asset_key"],
                "name": template["name"],
                "symbol": provider.infer_asset_symbol(template["name"], template["category"]),
                "type": mobile_type,
                "current_price": float(current_price),
                "previous_price": previous_price,
                "change_percent": infer_change_percent(float(current_price), previous_price),
                "currency": template["currency"],
                "updated_at": now,
            }
        )
    return response


def generate_synthetic_history(
    current_price: float,
    points: int,
    step_minutes: int,
    volatility: float = 0.003,
) -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    history: list[dict[str, Any]] = []
    if current_price <= 0:
        return history
    for idx in range(points):
        # Deterministic synthetic fallback to avoid empty charts.
        drift_factor = 1.0 + (((idx % 5) - 2) * volatility)
        base = current_price * (1 - (points - idx) * 0.0005)
        price = max(0.0001, base * drift_factor)
        history.append(
            {
                "timestamp": now - timedelta(minutes=step_minutes * (points - idx)),
                "price": float(price),
            }
        )
    return history
