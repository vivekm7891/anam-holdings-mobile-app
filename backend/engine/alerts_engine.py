"""
FINN: Triggered Alerts Engine
Monitors and surfaces threshold violations across portfolio companies:
1. Unusual EOD Price Moves (absolute change >= price_threshold_pct, default 3.0%)
2. Unusual Volume Spikes (volume >= volume_multiplier * 20d_avg, default 2.0x)
3. Material Announcements (Results, M&A, Management Change, Capex, Litigation, Pledging)
Supports dynamic threshold reconfiguration by the investor.
"""

from backend.data.portfolio import get_all_companies
from backend.data.announcements_data import get_announcements

DEFAULT_ALERT_CONFIG = {
    "price_move_threshold_pct": 3.0,
    "volume_multiplier_threshold": 2.0,
    "material_categories": [
        "results",
        "M&A",
        "management_change",
        "capex",
        "litigation",
        "pledging"
    ],
    "hours_lookback": 24
}

def evaluate_alerts(config=None):
    """
    Evaluates current market data and announcements against configured thresholds.
    Returns categorized alert triggers: price anomalies, volume spikes, and material filings.
    """
    cfg = DEFAULT_ALERT_CONFIG.copy()
    if config:
        cfg.update(config)

    price_thresh = float(cfg.get("price_move_threshold_pct", 3.0))
    vol_thresh = float(cfg.get("volume_multiplier_threshold", 2.0))
    material_cats = set(cfg.get("material_categories", []))
    hours_lookback = int(cfg.get("hours_lookback", 24))

    alerts = {
        "summary": {
            "total_triggered": 0,
            "price_anomalies_count": 0,
            "volume_spikes_count": 0,
            "material_filings_count": 0,
            "active_thresholds": {
                "price_threshold_pct": price_thresh,
                "volume_multiplier": vol_thresh,
                "lookback_hours": hours_lookback
            }
        },
        "price_anomalies": [],
        "volume_spikes": [],
        "material_filings": []
    }

    companies = get_all_companies()

    # 1. Evaluate EOD Price Anomalies
    for comp in companies:
        chg = comp.get("change_pct", 0.0)
        if abs(chg) >= price_thresh:
            alerts["price_anomalies"].append({
                "ticker": comp["ticker"],
                "symbol": comp["symbol"],
                "name": comp["name"],
                "change_pct": chg,
                "last_price": comp["last_price"],
                "direction": "SURGE" if chg > 0 else "PLUNGE",
                "message": f"Daily price moved {chg:+.2f}% (threshold: ±{price_thresh}%)",
                "severity": "CRITICAL" if abs(chg) >= (price_thresh * 1.5) else "WARNING"
            })

    # 2. Evaluate Volume Spikes
    for comp in companies:
        vol = comp.get("volume", 0)
        avg_vol = comp.get("avg_volume_20d", 1)
        ratio = round(vol / avg_vol, 2) if avg_vol > 0 else 1.0
        if ratio >= vol_thresh:
            alerts["volume_spikes"].append({
                "ticker": comp["ticker"],
                "symbol": comp["symbol"],
                "name": comp["name"],
                "volume": vol,
                "avg_volume_20d": avg_vol,
                "volume_ratio": ratio,
                "message": f"Trading volume is {ratio:.1f}x higher than 20-day average ({vol:,} vs avg {avg_vol:,})",
                "severity": "CRITICAL" if ratio >= (vol_thresh * 1.5) else "WARNING"
            })

    # 3. Evaluate Material Corporate Filings
    filings = get_announcements(hours_window=hours_lookback)
    for filing in filings:
        if filing.get("category") in material_cats or filing.get("priority") == "HIGH":
            alerts["material_filings"].append({
                "id": filing["id"],
                "ticker": filing["ticker"],
                "symbol": filing["symbol"],
                "company_name": filing["company_name"],
                "category": filing["category"],
                "priority": filing["priority"],
                "title": filing["title"],
                "summary": filing["summary"],
                "timestamp": filing["timestamp"],
                "filing_url": filing.get("filing_url", ""),
                "enrichment": filing.get("enrichment")
            })

    # Update summary counts
    alerts["summary"]["price_anomalies_count"] = len(alerts["price_anomalies"])
    alerts["summary"]["volume_spikes_count"] = len(alerts["volume_spikes"])
    alerts["summary"]["material_filings_count"] = len(alerts["material_filings"])
    alerts["summary"]["total_triggered"] = (
        len(alerts["price_anomalies"]) +
        len(alerts["volume_spikes"]) +
        len(alerts["material_filings"])
    )

    return alerts
