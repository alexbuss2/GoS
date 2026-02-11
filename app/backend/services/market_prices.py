import logging
import re
import unicodedata
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class MarketPriceProvider:
    """Collect market prices from public providers and resolve asset prices."""

    _COINGECKO_ID_MAP = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "BNB": "binancecoin",
        "XRP": "ripple",
        "ADA": "cardano",
        "SOL": "solana",
    }

    def __init__(self, timeout_seconds: int = 15):
        self.timeout_seconds = timeout_seconds

    async def fetch_market_prices(self) -> dict[str, float]:
        """Fetch fiat, gold, and crypto prices into a normalized dictionary."""
        prices: dict[str, float] = {}
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            prices.update(await self._fetch_fx_prices(client))
            prices.update(await self._fetch_crypto_prices(client))
            prices.update(await self._fetch_gold_prices(client, prices))
        return prices

    async def resolve_asset_price(
        self,
        name: str,
        category: str,
        currency: str,
        market_prices: dict[str, float],
    ) -> Optional[float]:
        """Resolve a DB asset into a current market price."""
        target_currency = (currency or "TRY").upper()
        key = self._infer_asset_key(name=name, category=category)

        if key in self._COINGECKO_ID_MAP:
            usd_price = market_prices.get(f"{key}_USD")
            return self._convert_from_usd(usd_price, target_currency, market_prices)

        if key == "USD":
            return self._convert_from_usd(1.0, target_currency, market_prices)
        if key == "EUR":
            eur_try = market_prices.get("EUR_TRY")
            return self._convert_from_try(eur_try, target_currency, market_prices)
        if key == "GBP":
            gbp_try = market_prices.get("GBP_TRY")
            return self._convert_from_try(gbp_try, target_currency, market_prices)

        if key == "XAU_OZ":
            xau_usd = market_prices.get("XAU_USD")
            return self._convert_from_usd(xau_usd, target_currency, market_prices)
        if key == "XAU_GRAM":
            xau_gram_try = market_prices.get("XAU_GRAM_TRY")
            return self._convert_from_try(xau_gram_try, target_currency, market_prices)
        if key == "XAU_QUARTER":
            xau_quarter_try = market_prices.get("XAU_QUARTER_TRY")
            return self._convert_from_try(xau_quarter_try, target_currency, market_prices)

        return None

    def infer_asset_symbol(self, name: str, category: str) -> str:
        """Infer display symbol for API responses."""
        key = self._infer_asset_key(name=name, category=category)
        if key in {"USD", "EUR", "GBP"}:
            return f"{key}/TRY"
        if key == "XAU_OZ":
            return "XAU"
        if key == "XAU_GRAM":
            return "GAU"
        if key == "XAU_QUARTER":
            return "QAU"
        return key

    async def _fetch_fx_prices(self, client: httpx.AsyncClient) -> dict[str, float]:
        prices: dict[str, float] = {}
        pair_requests = (
            ("USD", "TRY", "USD_TRY"),
            ("EUR", "TRY", "EUR_TRY"),
            ("GBP", "TRY", "GBP_TRY"),
        )

        for base, quote, key in pair_requests:
            url = f"https://api.exchangerate.host/latest?base={base}&symbols={quote}"
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                rate = (data.get("rates") or {}).get(quote)
                if isinstance(rate, (int, float)) and rate > 0:
                    prices[key] = float(rate)
            except Exception as exc:
                logger.warning("Failed to fetch FX pair %s/%s: %s", base, quote, exc)

        # Fallback provider: open.er-api.com (free, no API key)
        if not prices.get("USD_TRY"):
            try:
                response = await client.get("https://open.er-api.com/v6/latest/USD")
                response.raise_for_status()
                data = response.json()
                rates = data.get("rates") or {}
                usd_try = rates.get("TRY")
                usd_eur = rates.get("EUR")
                usd_gbp = rates.get("GBP")
                if isinstance(usd_try, (int, float)) and usd_try > 0:
                    prices["USD_TRY"] = float(usd_try)
                    if isinstance(usd_eur, (int, float)) and usd_eur > 0:
                        prices["EUR_TRY"] = float(usd_try) / float(usd_eur)
                    if isinstance(usd_gbp, (int, float)) and usd_gbp > 0:
                        prices["GBP_TRY"] = float(usd_try) / float(usd_gbp)
            except Exception as exc:
                logger.warning("Fallback FX fetch failed from open.er-api.com: %s", exc)

        return prices

    async def _fetch_gold_prices(self, client: httpx.AsyncClient, prices: dict[str, float]) -> dict[str, float]:
        updates: dict[str, float] = {}
        existing_xau = prices.get("XAU_USD")
        if isinstance(existing_xau, (int, float)) and existing_xau > 0:
            updates["XAU_USD"] = float(existing_xau)

        # Preferred source for XAU/USD (free endpoint)
        if "XAU_USD" not in updates:
            try:
                response = await client.get("https://api.exchangerate.host/latest?base=XAU&symbols=USD")
                response.raise_for_status()
                data = response.json()
                xau_usd = (data.get("rates") or {}).get("USD")
                if isinstance(xau_usd, (int, float)) and xau_usd > 0:
                    updates["XAU_USD"] = float(xau_usd)
            except Exception as exc:
                logger.warning("Failed to fetch XAU/USD from exchangerate.host: %s", exc)

        # Fallback proxy: PAX Gold ~= XAU
        if "XAU_USD" not in updates:
            try:
                response = await client.get(
                    "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd"
                )
                response.raise_for_status()
                data = response.json()
                xau_usd = ((data.get("pax-gold") or {}).get("usd"))
                if isinstance(xau_usd, (int, float)) and xau_usd > 0:
                    updates["XAU_USD"] = float(xau_usd)
            except Exception as exc:
                logger.warning("Failed to fetch XAU/USD fallback from CoinGecko: %s", exc)

        usd_try = prices.get("USD_TRY")
        xau_usd = updates.get("XAU_USD")
        if isinstance(usd_try, (int, float)) and usd_try > 0 and isinstance(xau_usd, (int, float)) and xau_usd > 0:
            xau_try = xau_usd * usd_try
            # 1 troy ounce = 31.1034768 grams
            gram_try = xau_try / 31.1034768
            # Rough market approximation for quarter gold coin
            quarter_try = gram_try * 1.75
            updates["XAU_TRY"] = xau_try
            updates["XAU_GRAM_TRY"] = gram_try
            updates["XAU_QUARTER_TRY"] = quarter_try

        return updates

    async def _fetch_crypto_prices(self, client: httpx.AsyncClient) -> dict[str, float]:
        ids = ",".join([*self._COINGECKO_ID_MAP.values(), "pax-gold"])
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd"
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:
            logger.warning("Failed to fetch crypto prices from CoinGecko: %s", exc)
            return {}

        prices: dict[str, float] = {}
        for symbol, cg_id in self._COINGECKO_ID_MAP.items():
            usd_value = ((data.get(cg_id) or {}).get("usd"))
            if isinstance(usd_value, (int, float)) and usd_value > 0:
                prices[f"{symbol}_USD"] = float(usd_value)

        pax_gold_usd = ((data.get("pax-gold") or {}).get("usd"))
        if isinstance(pax_gold_usd, (int, float)) and pax_gold_usd > 0:
            prices["XAU_USD"] = float(pax_gold_usd)
        return prices

    def _infer_asset_key(self, name: str, category: str) -> str:
        normalized_name = self._normalize_text(name)
        normalized_category = self._normalize_text(category)

        category_aliases = {
            "crypto": "crypto",
            "kripto": "crypto",
            "currency": "currency",
            "doviz": "currency",
            "gold": "gold",
            "altin": "gold",
        }
        category_group = category_aliases.get(normalized_category, normalized_category)

        # Fast path by category
        if category_group == "currency":
            if "usd" in normalized_name or "dolar" in normalized_name:
                return "USD"
            if "eur" in normalized_name or "euro" in normalized_name:
                return "EUR"
            if "gbp" in normalized_name or "sterlin" in normalized_name:
                return "GBP"

        if category_group == "gold":
            if "ceyrek" in normalized_name:
                return "XAU_QUARTER"
            if "ons" in normalized_name:
                return "XAU_OZ"
            return "XAU_GRAM"

        # Symbol extraction for crypto and generic names
        token_candidates = re.split(r"[^A-Za-z0-9]+", (name or "").upper())
        for token in token_candidates:
            if token in self._COINGECKO_ID_MAP:
                return token
            if token == "XAU":
                return "XAU_OZ"
            if token in {"USD", "EUR", "GBP"}:
                return token

        # Name-based fallback
        if "bitcoin" in normalized_name:
            return "BTC"
        if "ethereum" in normalized_name:
            return "ETH"
        if "binance" in normalized_name:
            return "BNB"
        if "ripple" in normalized_name or "xrp" in normalized_name:
            return "XRP"
        if "cardano" in normalized_name:
            return "ADA"
        if "solana" in normalized_name:
            return "SOL"
        if "ons" in normalized_name or "xau" in normalized_name:
            return "XAU_OZ"
        if "ceyrek" in normalized_name:
            return "XAU_QUARTER"
        if "altin" in normalized_name or "gold" in normalized_name:
            return "XAU_GRAM"

        return ""

    @staticmethod
    def _normalize_text(value: str) -> str:
        if not value:
            return ""
        normalized = unicodedata.normalize("NFKD", value)
        ascii_text = "".join(ch for ch in normalized if not unicodedata.combining(ch))
        return ascii_text.strip().lower()

    @staticmethod
    def _convert_from_usd(
        usd_price: Optional[float],
        target_currency: str,
        market_prices: dict[str, float],
    ) -> Optional[float]:
        if not isinstance(usd_price, (int, float)) or usd_price <= 0:
            return None
        if target_currency == "USD":
            return float(usd_price)
        if target_currency == "TRY":
            usd_try = market_prices.get("USD_TRY")
            if isinstance(usd_try, (int, float)) and usd_try > 0:
                return float(usd_price) * float(usd_try)
            return None
        if target_currency == "EUR":
            eur_try = market_prices.get("EUR_TRY")
            usd_try = market_prices.get("USD_TRY")
            if isinstance(eur_try, (int, float)) and eur_try > 0 and isinstance(usd_try, (int, float)) and usd_try > 0:
                return float(usd_price) * float(usd_try) / float(eur_try)
            return None
        if target_currency == "GBP":
            gbp_try = market_prices.get("GBP_TRY")
            usd_try = market_prices.get("USD_TRY")
            if isinstance(gbp_try, (int, float)) and gbp_try > 0 and isinstance(usd_try, (int, float)) and usd_try > 0:
                return float(usd_price) * float(usd_try) / float(gbp_try)
            return None
        return None

    @staticmethod
    def _convert_from_try(
        try_price: Optional[float],
        target_currency: str,
        market_prices: dict[str, float],
    ) -> Optional[float]:
        if not isinstance(try_price, (int, float)) or try_price <= 0:
            return None
        if target_currency == "TRY":
            return float(try_price)
        if target_currency == "USD":
            usd_try = market_prices.get("USD_TRY")
            if isinstance(usd_try, (int, float)) and usd_try > 0:
                return float(try_price) / float(usd_try)
            return None
        if target_currency == "EUR":
            eur_try = market_prices.get("EUR_TRY")
            if isinstance(eur_try, (int, float)) and eur_try > 0:
                return float(try_price) / float(eur_try)
            return None
        if target_currency == "GBP":
            gbp_try = market_prices.get("GBP_TRY")
            if isinstance(gbp_try, (int, float)) and gbp_try > 0:
                return float(try_price) / float(gbp_try)
            return None
        return None
