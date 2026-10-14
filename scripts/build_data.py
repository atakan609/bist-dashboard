"""
build_data.py - Automated Data Builder for AtakanOS BIST Dashboard
Fetches latest market quotes, valuation ratios, and portfolio states using yfinance.
Outputs formatted data.json for static GitHub Pages hosting.
Zero-breakage fallback: If any ticker fails, preserves existing/default metrics.
"""

from __future__ import annotations

import datetime
import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional
import yfinance as yf

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("DashboardDataBuilder")

# Core Assets: Atakan's Portfolio Holdings (4+1 Core Model)
PORTFOLIO_HOLDINGS = [
    {"ticker": "ALTIN.S1", "name": "Darphane Altın Sertifikası", "lot": 20, "fallback_price": 71.05, "sector": "Emtia / Altın"},
    {"ticker": "AKBNK.IS", "name": "Akbank T.A.Ş.", "lot": 19, "fallback_price": 67.85, "sector": "Bankacılık"},
    {"ticker": "HRKET.IS", "name": "Hareket Proje Taşımacılığı", "lot": 82, "fallback_price": 10.10, "sector": "Lojistik / Enerji"},
    {"ticker": "GENIL.IS", "name": "Gen İlaç ve Sağlık Ürünleri", "lot": 135, "fallback_price": 5.04, "sector": "İlaç / Sağlık"},
    {"ticker": "PPZ", "name": "Azimut Portföy Para Piyasası Fonu (PPF)", "lot": 1, "fallback_price": 364.62, "sector": "Para Piyasası / Likit", "is_fund": True},
]

CASH_TRY = 0.00

# Additional Watched BIST Chips
WATCHLIST_TICKERS = [
    "THYAO.IS", "ASELS.IS", "TUPRS.IS", "BIMAS.IS", "KCHOL.IS", "EREGL.IS", "SISE.IS"
]

MACRO_TICKERS = {
    "USD_TRY": "TRY=X",
    "BIST_100": "XU100.IS",
    "GOLD_USD": "GC=F",
}


def fetch_quote(ticker: str, fallback_price: float = 0.0) -> Dict[str, Any]:
    """Fetches quote metrics with strict exception shielding."""
    try:
        t = yf.Ticker(ticker)
        fast_info = getattr(t, "fast_info", None)
        info = t.info or {}

        price = None
        if fast_info:
            price = getattr(fast_info, "last_price", None) or getattr(fast_info, "previous_close", None)
        if price is None:
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")

        if price is None or price <= 0:
            price = fallback_price

        prev_close = info.get("previousClose") or price
        change_pct = ((price - prev_close) / prev_close * 100.0) if prev_close else 0.0

        return {
            "ticker": ticker.replace(".IS", ""),
            "symbol": ticker,
            "price": round(float(price), 2),
            "change_pct": round(float(change_pct), 2),
            "market_cap": info.get("marketCap"),
            "pe_ratio": round(float(info.get("trailingPE")), 2) if info.get("trailingPE") else None,
            "pb_ratio": round(float(info.get("priceToBook")), 2) if info.get("priceToBook") else None,
            "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
            "success": True,
        }
    except Exception as e:
        logger.warning(f"Failed to fetch {ticker}: {e}. Using fallback {fallback_price}")
        return {
            "ticker": ticker.replace(".IS", ""),
            "symbol": ticker,
            "price": round(float(fallback_price), 2),
            "change_pct": 0.0,
            "market_cap": None,
            "pe_ratio": None,
            "pb_ratio": None,
            "fifty_two_week_low": None,
            "fifty_two_week_high": None,
            "success": False,
            "error": str(e),
        }


def build_full_dataset() -> Dict[str, Any]:
    logger.info("Starting automated market and portfolio data aggregation...")
    
    # 1. Macro Indicators
    macro: Dict[str, Any] = {}
    for name, sym in MACRO_TICKERS.items():
        q = fetch_quote(sym)
        macro[name] = {"symbol": sym, "price": q["price"], "change_pct": q["change_pct"]}

    # 2. Portfolio Items
    portfolio_items: List[Dict[str, Any]] = []
    total_market_value = CASH_TRY

    for item in PORTFOLIO_HOLDINGS:
        sym = item["ticker"]
        if item.get("is_fund"):
            val = item["fallback_price"] * item["lot"]
            total_market_value += val
            portfolio_items.append({
                "ticker": item["ticker"],
                "name": item["name"],
                "lot": item["lot"],
                "price": item["fallback_price"],
                "change_pct": 0.0,
                "market_value": round(val, 2),
                "sector": item["sector"],
                "pe_ratio": None,
                "pb_ratio": None,
            })
        else:
            q = fetch_quote(sym, fallback_price=item["fallback_price"])
            val = q["price"] * item["lot"]
            total_market_value += val
            portfolio_items.append({
                "ticker": item["ticker"].replace(".IS", ""),
                "name": item["name"],
                "lot": item["lot"],
                "price": q["price"],
                "change_pct": q["change_pct"],
                "market_value": round(val, 2),
                "sector": item["sector"],
                "pe_ratio": q.get("pe_ratio"),
                "pb_ratio": q.get("pb_ratio"),
            })

    # Compute weights
    for p in portfolio_items:
        p["weight_pct"] = round((p["market_value"] / total_market_value * 100.0), 2) if total_market_value else 0.0

    # 3. Watched Chips
    watched_items: List[Dict[str, Any]] = []
    for sym in WATCHLIST_TICKERS:
        q = fetch_quote(sym)
        watched_items.append(q)

    # 4. Target 4+1 Model Portfolio
    target_model = [
        {"ticker": "ALTIN.S1", "name": "Darphane Altın Sertifikası", "target_weight_pct": 30.0, "role": "TL Devalüasyon & Enflasyon Kalkanı"},
        {"ticker": "AKBNK", "name": "Akbank T.A.Ş.", "target_weight_pct": 25.0, "role": "BIST 30 Lokomotif & Temettü Gücü"},
        {"ticker": "HRKET", "name": "Hareket Proje Taşımacılığı", "target_weight_pct": 18.0, "role": "Global Ağır Nakliye & Döviz Geliri"},
        {"ticker": "GENIL", "name": "Gen İlaç ve Sağlık", "target_weight_pct": 15.0, "role": "Defansif Büyüme & Net Nakit"},
        {"ticker": "PPF", "name": "Para Piyasası Fonu / Nakit (PPZ)", "target_weight_pct": 12.0, "role": "%50 Faiz Kalkanı & Fırsat Akçesi"},
    ]

    return {
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "as_of_date": datetime.date.today().isoformat(),
        "macro": macro,
        "portfolio": {
            "total_value": round(total_market_value, 2),
            "cash_try": CASH_TRY,
            "items": portfolio_items,
            "target_model": target_model,
        },
        "watchlist": watched_items,
    }


def main() -> None:
    target_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.json")
    if not os.path.exists(os.path.dirname(target_path)):
        target_path = "data.json"

    dataset = build_full_dataset()

    # Save atomically
    tmp_path = f"{target_path}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    if os.path.exists(target_path):
        os.remove(target_path)
    os.rename(tmp_path, target_path)

    logger.info(f"Successfully generated updated data.json at: {target_path} (Total Portfolio Value: {dataset['portfolio']['total_value']:,.2f} TL)")


if __name__ == "__main__":
    main()
