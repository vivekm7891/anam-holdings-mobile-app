"""
FINN: Pull Research Engine (On-Demand Primary Source Analysis)
Delivers deep, rigorous financial analysis grounded in primary sources (Annual Reports,
Quarterly Filings, Earnings Call Transcripts) across 8 analytical pillars:
1. Business Snapshot & Operating Segments
2. Financial Snapshot & Valuation Metrics
3. Trajectory & Growth Divergence
4. Balance Sheet & Working Capital Cycle
5. Cash Quality & Cash Conversion (CFO vs PAT, FCF)
6. Narrative vs Numbers (Guidance vs Actual Delivery over past 4 Quarters)
7. Forward Guidance (Revenue, Margin, Capex)
8. Bull vs Bear Institutional Case
Generalises cleanly to ANY NSE ticker.
"""

from backend.data.fundamentals_data import get_company_fundamental_data
from backend.data.portfolio import find_company

def get_company_research(ticker_or_symbol):
    """
    Returns the comprehensive 8-module research package for a given stock.
    Grounded exclusively in primary source filings and concalls.
    """
    clean_sym = ticker_or_symbol.strip().upper().replace(".NS", "").replace(".BO", "")
    
    # 1. Look up company metadata
    meta = find_company(clean_sym)
    
    # 2. Look up fundamental dataset
    fundamentals = get_company_fundamental_data(clean_sym)

    # 3. Compute derived institutional ratios if not explicitly present
    fin = fundamentals.get("financial_snapshot", {})
    cash = fundamentals.get("cash_quality", {})
    
    # Cash conversion calculation: (CFO / PAT) * 100
    if cash.get("pat_ttm_cr") and cash.get("cfo_ttm_cr"):
        cash_conv = round((cash["cfo_ttm_cr"] / cash["pat_ttm_cr"]) * 100, 1)
        cash["computed_cash_conversion_pct"] = cash_conv
    
    # Free Cash Flow: CFO - Capex
    if cash.get("cfo_ttm_cr") and cash.get("capex_ttm_cr"):
        cash["computed_fcf_cr"] = cash["cfo_ttm_cr"] - cash["capex_ttm_cr"]

    return {
        "symbol": clean_sym,
        "ticker": f"{clean_sym}.NS",
        "name": meta["name"] if meta else fundamentals.get("name", f"{clean_sym} Ltd"),
        "sector": meta.get("sector", "Diversified") if meta else "Diversified",
        "market_cap_tier": meta.get("market_cap_tier", "NSE Listed") if meta else "NSE Listed",
        "current_market_price": meta.get("last_price") if meta else None,
        "daily_change_pct": meta.get("change_pct") if meta else None,
        "primary_sources": fundamentals.get("primary_sources", []),
        "screener_url": meta.get("screener_url", f"https://www.screener.in/company/{clean_sym}/") if meta else f"https://www.screener.in/company/{clean_sym}/",
        "modules": {
            "business_snapshot": fundamentals.get("business_snapshot"),
            "financial_snapshot": fundamentals.get("financial_snapshot"),
            "trajectory": fundamentals.get("trajectory"),
            "balance_sheet": fundamentals.get("balance_sheet"),
            "cash_quality": fundamentals.get("cash_quality"),
            "narrative_vs_numbers": fundamentals.get("narrative_vs_numbers"),
            "forward_guidance": fundamentals.get("forward_guidance"),
            "bull_vs_bear": fundamentals.get("bull_vs_bear")
        }
    }
