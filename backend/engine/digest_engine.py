"""
FINN: Windowed Digest Engine
Constructs the proactive Push Digest across the investor's portfolio:
- Filters filings within configurable time window (24h, 3d, 7d, 30d).
- Separates high-conviction material filings (surfaced prominently with full enrichments)
  from routine low-relevance filings (collapsed into an expandable drawer).
- Calculates category statistics and portfolio coverage.
"""

from backend.data.announcements_data import get_announcements

def generate_push_digest(hours_window=24, category_filter=None, ticker_filter=None):
    """
    Builds the structured push digest view for mobile consumption.
    """
    raw_filings = get_announcements(
        ticker=ticker_filter,
        category=category_filter,
        hours_window=hours_window
    )

    priority_items = []
    routine_items = []
    category_counts = {}

    for item in raw_filings:
        cat = item.get("category", "unclassified")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        if item.get("priority") in ["HIGH", "MEDIUM"]:
            priority_items.append(item)
        else:
            routine_items.append(item)

    return {
        "metadata": {
            "window_hours": hours_window,
            "window_label": format_window_label(hours_window),
            "total_filings_count": len(raw_filings),
            "priority_count": len(priority_items),
            "routine_collapsed_count": len(routine_items),
            "category_distribution": category_counts
        },
        "priority_items": priority_items,
        "routine_items": routine_items
    }

def format_window_label(hours):
    if hours <= 24:
        return f"Last {hours} Hours"
    days = hours // 24
    return f"Last {days} Days"
