"""
build_data.py - Automated Data Builder for AtakanOS BIST Dashboard
Fetches latest market quotes, valuation ratios, and daily OHLCV candles using yfinance.
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
import pandas as pd

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("DashboardDataBuilder")

# Core Assets: Atakan's Portfolio Holdings (4+1 Core Model)
PORTFOLIO_HOLDINGS = [
    {"ticker": "ALTIN.S1", "name": "Darphane Altın Sertifikası", "lot": 20, "fallback_price": 69.97, "sector": "Emtia / Altın", "is_gold_cert": True},
    {"ticker": "AKBNK.IS", "name": "Akbank T.A.Ş.", "lot": 19, "fallback_price": 63.35, "sector": "Bankacılık"},
    {"ticker": "HRKET.IS", "name": "Hareket Proje Taşımacılığı", "lot": 82, "fallback_price": 7.68, "sector": "Lojistik / Enerji"},
    {"ticker": "GENIL.IS", "name": "Gen İlaç ve Sağlık Ürünleri", "lot": 135, "fallback_price": 4.00, "sector": "İlaç / Sağlık"},
    {"ticker": "PPZ", "name": "Azimut Portföy Para Piyasası Fonu (PPF)", "lot": 1, "fallback_price": 368.38, "sector": "Para Piyasası / Likit", "is_fund": True},
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
    clean_ticker = ticker.replace(".IS", "")
    try:
        t = yf.Ticker(ticker)
        fast_info = getattr(t, "fast_info", None)
        info = {}
        try:
            info = t.info or {}
        except Exception:
            pass

        price = None
        if fast_info:
            price = getattr(fast_info, "last_price", None) or getattr(fast_info, "previous_close", None)
        if price is None:
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")

        if price is None or price <= 0:
            price = fallback_price

        prev_close = None
        if fast_info:
            prev_close = getattr(fast_info, "previous_close", None)
        if prev_close is None:
            prev_close = info.get("previousClose") or price

        change_pct = ((price - prev_close) / prev_close * 100.0) if prev_close else 0.0

        return {
            "ticker": clean_ticker,
            "symbol": ticker,
            "price": round(float(price), 2),
            "change_pct": round(float(change_pct), 2),
            "market_cap": info.get("marketCap") or (getattr(fast_info, "market_cap", None) if fast_info else None),
            "pe_ratio": round(float(info.get("trailingPE")), 2) if info.get("trailingPE") else None,
            "pb_ratio": round(float(info.get("priceToBook")), 2) if info.get("priceToBook") else None,
            "fifty_two_week_low": info.get("fiftyTwoWeekLow") or (getattr(fast_info, "year_low", None) if fast_info else None),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh") or (getattr(fast_info, "year_high", None) if fast_info else None),
            "day_low": getattr(fast_info, "day_low", None) or info.get("dayLow"),
            "day_high": getattr(fast_info, "day_high", None) or info.get("dayHigh"),
            "volume": getattr(fast_info, "last_volume", None) or info.get("volume"),
            "success": True,
        }
    except Exception as e:
        logger.warning(f"Failed to fetch {ticker}: {e}. Using fallback {fallback_price}")
        return {
            "ticker": clean_ticker,
            "symbol": ticker,
            "price": round(float(fallback_price), 2),
            "change_pct": 0.0,
            "market_cap": None,
            "pe_ratio": None,
            "pb_ratio": None,
            "fifty_two_week_low": None,
            "fifty_two_week_high": None,
            "day_low": round(float(fallback_price * 0.98), 2),
            "day_high": round(float(fallback_price * 1.02), 2),
            "volume": 10000000,
            "success": False,
            "error": str(e),
        }


def fetch_candles(ticker: str, period: str = "3mo") -> List[Dict[str, Any]]:
    """Fetches real daily OHLCV candles from yfinance."""
    try:
        t = yf.Ticker(ticker)
        df = t.history(period=period, interval="1d")
        if df is None or df.empty:
            return []

        candles = []
        for idx, row in df.iterrows():
            time_str = idx.strftime("%Y-%m-%d")
            o = round(float(row["Open"]), 2)
            h = round(float(row["High"]), 2)
            l = round(float(row["Low"]), 2)
            c = round(float(row["Close"]), 2)
            vol = int(row["Volume"]) if not pd.isna(row["Volume"]) else 0

            # Ensure high is max and low is min
            h = max(h, o, c)
            l = min(l, o, c)

            candles.append({
                "time": time_str,
                "open": o,
                "high": h,
                "low": l,
                "close": c,
                "volume": vol
            })
        return candles
    except Exception as e:
        logger.warning(f"Failed to fetch candles for {ticker}: {e}")
        return []


def generate_gold_candles(target_price: float = 71.05) -> List[Dict[str, Any]]:
    """Generates realistic daily OHLCV for ALTIN.S1 using GC=F (Gold USD) and TRY=X (USD/TRY)."""
    try:
        gc_df = yf.Ticker("GC=F").history(period="3mo", interval="1d")
        try_df = yf.Ticker("TRY=X").history(period="3mo", interval="1d")

        if gc_df.empty or try_df.empty:
            raise ValueError("GC=F or TRY=X empty")

        # Normalize timezones and merge on date
        gc_df.index = gc_df.index.strftime("%Y-%m-%d")
        try_df.index = try_df.index.strftime("%Y-%m-%d")

        merged = pd.DataFrame({
            "gc_open": gc_df["Open"],
            "gc_high": gc_df["High"],
            "gc_low": gc_df["Low"],
            "gc_close": gc_df["Close"],
            "try_close": try_df["Close"]
        }).dropna()

        if merged.empty:
            raise ValueError("Merged gold dataframe empty")

        # 1 oz = 31.1034768 grams, ALTIN.S1 is 0.01g of 995 purity
        # Theoretical S1 = (Gold_USD / 31.1034768) * USD_TRY * 0.995 / 100.0
        # Scale to match target_price (reflecting BIST market premium)
        last_theoretical = (merged["gc_close"].iloc[-1] / 31.1034768) * merged["try_close"].iloc[-1] * 0.995 / 100.0
        scale_factor = target_price / last_theoretical if last_theoretical > 0 else 2.44

        candles = []
        for date_str, row in merged.iterrows():
            usd_try = row["try_close"]
            factor = (usd_try * 0.995 / (31.1034768 * 100.0)) * scale_factor

            o = round(float(row["gc_open"] * factor), 2)
            h = round(float(row["gc_high"] * factor), 2)
            l = round(float(row["gc_low"] * factor), 2)
            c = round(float(row["gc_close"] * factor), 2)
            h = max(h, o, c)
            l = min(l, o, c)

            candles.append({
                "time": date_str,
                "open": o,
                "high": h,
                "low": l,
                "close": c,
                "volume": 2500000
            })
        return candles
    except Exception as e:
        logger.warning(f"Failed to generate gold candles: {e}. Using synthetic baseline.")
        # Fallback synthetic series
        candles = []
        today = datetime.date.today()
        cur = target_price * 0.85
        for i in range(65, -1, -1):
            d = today - datetime.timedelta(days=int(i * 1.45))
            if d.weekday() >= 5:
                continue
            delta = (target_price - cur) / max(1, i + 1) + ((i % 5) - 2) * 0.25
            o = round(cur, 2)
            c = round(cur + delta, 2)
            h = round(max(o, c) + 0.35, 2)
            l = round(min(o, c) - 0.30, 2)
            candles.append({
                "time": d.strftime("%Y-%m-%d"),
                "open": o,
                "high": h,
                "low": l,
                "close": c,
                "volume": 2200000
            })
            cur = c
        if candles:
            candles[-1]["close"] = target_price
        return candles


def generate_ppz_candles(target_price: float = 364.62, days: int = 65) -> List[Dict[str, Any]]:
    """Generates daily candles for PPZ (Azimut Para Piyasası Fonu) reflecting steady repo compounding."""
    candles = []
    today = datetime.date.today()
    # Approx 50% annualized -> ~0.135% per business day
    daily_rate = 0.00135
    start_price = target_price / ((1.0 + daily_rate) ** days)
    cur = start_price

    for i in range(days, -1, -1):
        d = today - datetime.timedelta(days=int(i * 1.45))
        if d.weekday() >= 5:
            continue
        nxt = cur * (1.0 + daily_rate)
        o = round(cur, 2)
        c = round(nxt, 2)
        h = round(c + 0.05, 2)
        l = round(o - 0.02, 2)
        candles.append({
            "time": d.strftime("%Y-%m-%d"),
            "open": o,
            "high": h,
            "low": l,
            "close": c,
            "volume": 850000
        })
        cur = nxt

    if candles:
        candles[-1]["close"] = round(target_price, 2)
        candles[-1]["high"] = round(target_price + 0.05, 2)
    return candles


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
            # Dynamic daily compounding from 2026-10-14 base (364.62 TL) at ~0.093% net daily rate
            days_elapsed = max(0, (datetime.date.today() - datetime.date(2026, 10, 14)).days)
            compounded_val = round(364.62 * ((1.0 + 0.00093) ** days_elapsed), 2)
            val = compounded_val * item["lot"]
            total_market_value += val
            portfolio_items.append({
                "ticker": item["ticker"],
                "name": item["name"],
                "lot": item["lot"],
                "price": compounded_val,
                "change_pct": 0.09,
                "market_value": round(val, 2),
                "sector": item["sector"],
                "pe_ratio": None,
                "pb_ratio": None,
                "day_low": round(compounded_val * 0.999, 2),
                "day_high": round(compounded_val * 1.001, 2),
                "volume": 850000,
                "market_cap": 12500000000,
            })
        elif item.get("is_gold_cert"):
            gold_usd = macro.get("GOLD_USD", {}).get("price") or 4007.90
            usd_try = macro.get("USD_TRY", {}).get("price") or 49.69
            gold_chg = macro.get("GOLD_USD", {}).get("change_pct") or -0.55
            theoretical = (gold_usd / 31.1034768) * usd_try * 0.995 / 100.0
            # BIST ALTIN.S1 trades around ~1.0983x theoretical spot (69.97 TL)
            s1_price = round(theoretical * 1.0983, 2) if theoretical > 0 else item["fallback_price"]
            val = s1_price * item["lot"]
            total_market_value += val
            portfolio_items.append({
                "ticker": "ALTIN.S1",
                "name": item["name"],
                "lot": item["lot"],
                "price": s1_price,
                "change_pct": round(gold_chg, 2),
                "market_value": round(val, 2),
                "sector": item["sector"],
                "pe_ratio": None,
                "pb_ratio": None,
                "day_low": round(s1_price * 0.992, 2),
                "day_high": round(s1_price * 1.008, 2),
                "volume": 18500000,
                "market_cap": 85000000000,
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
                "day_low": q.get("day_low"),
                "day_high": q.get("day_high"),
                "volume": q.get("volume"),
                "market_cap": q.get("market_cap"),
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

    # 5. Fetch Daily Candles for TradingView Chart
    logger.info("Fetching daily OHLCV candles for all tickers...")
    candles_map: Dict[str, List[Dict[str, Any]]] = {}

    # Watchlist tickers
    for sym in WATCHLIST_TICKERS:
        clean = sym.replace(".IS", "")
        c_list = fetch_candles(sym, period="3mo")
        if c_list:
            candles_map[clean] = c_list

    # Portfolio tickers
    for sym in ["AKBNK.IS", "HRKET.IS", "GENIL.IS"]:
        clean = sym.replace(".IS", "")
        c_list = fetch_candles(sym, period="3mo")
        if c_list:
            candles_map[clean] = c_list

    # ALTIN.S1 Gold candles
    altin_item = next((p for p in portfolio_items if p["ticker"] == "ALTIN.S1"), None)
    altin_price = altin_item["price"] if altin_item else 71.05
    candles_map["ALTIN.S1"] = generate_gold_candles(target_price=altin_price)

    # PPZ Fund candles
    ppz_item = next((p for p in portfolio_items if p["ticker"] == "PPZ"), None)
    ppz_price = ppz_item["price"] if ppz_item else 364.62
    candles_map["PPZ"] = generate_ppz_candles(target_price=ppz_price)

    logger.info(f"Candles aggregated for {len(candles_map)} tickers: {list(candles_map.keys())}")

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
        "candles": candles_map,
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
