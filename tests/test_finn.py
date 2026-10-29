"""
FINN: Automated Test Suite
Verifies core institutional logic:
1. Portfolio configuration & NSE tickers
2. Announcement categorisation across the 17 ENAM categories
3. PUSH Windowed Digest prioritization & routine collapsing
4. Enrichment validation (Results matrix QoQ/YoY & Executive Dossier)
5. Alert trigger threshold calculations (Price anomalies & Volume surges)
6. PULL Research Engine 8 analytical modules
7. Narrative vs Numbers guidance tracking
8. Copilot query router & primary source citations
"""

import unittest
import sys
import os

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.data.portfolio import get_all_companies, PORTFOLIO, AD_HOC_COMPANIES, find_company
from backend.data.announcements_data import get_announcements, ANNOUNCEMENTS
from backend.engine.digest_engine import generate_push_digest
from backend.engine.alerts_engine import evaluate_alerts
from backend.engine.research_engine import get_company_research
from backend.engine.copilot_engine import process_copilot_query

class TestFinnPortfolio(unittest.TestCase):
    def test_portfolio_size(self):
        """Mock portfolio should contain 15-20 diverse NSE/BSE listed companies."""
        self.assertGreaterEqual(len(PORTFOLIO), 15)
        self.assertLessEqual(len(PORTFOLIO), 20)
        self.assertEqual(len(PORTFOLIO), 18)

    def test_portfolio_ticker_integrity(self):
        """All tickers should have .NS suffix and required institutional fields."""
        for c in PORTFOLIO:
            self.assertTrue(c["ticker"].endswith(".NS"))
            self.assertIn("symbol", c)
            self.assertIn("sector", c)
            self.assertIn("market_cap_tier", c)
            self.assertIn("last_price", c)
            self.assertIn("pe_ratio", c)
            self.assertIn("roce_pct", c)

    def test_ad_hoc_companies(self):
        """Ad-hoc research companies should be available outside core portfolio."""
        self.assertGreaterEqual(len(AD_HOC_COMPANIES), 3)
        symbols = [c["symbol"] for c in AD_HOC_COMPANIES]
        self.assertIn("ZOMATO", symbols)
        self.assertIn("SUZLON", symbols)

    def test_lookup_company(self):
        """Should find company regardless of case or .NS suffix."""
        c1 = find_company("reliance")
        c2 = find_company("RELIANCE.NS")
        self.assertIsNotNone(c1)
        self.assertEqual(c1["symbol"], "RELIANCE")
        self.assertEqual(c1["symbol"], c2["symbol"])

class TestFinnAnnouncementsAndPush(unittest.TestCase):
    def test_category_coverage(self):
        """Filings should cover key ENAM categories."""
        categories = {a["category"] for a in ANNOUNCEMENTS}
        self.assertIn("results", categories)
        self.assertIn("management_change", categories)
        self.assertIn("M&A", categories)
        self.assertIn("capex", categories)
        self.assertIn("litigation", categories)
        self.assertIn("unclassified", categories)

    def test_windowed_digest_filtering(self):
        """Digest should filter by hours and prioritize items."""
        digest_24 = generate_push_digest(hours_window=24)
        digest_720 = generate_push_digest(hours_window=720)
        
        self.assertLessEqual(digest_24["metadata"]["total_filings_count"], digest_720["metadata"]["total_filings_count"])
        self.assertIn("priority_items", digest_24)
        self.assertIn("routine_items", digest_24)

    def test_results_enrichment(self):
        """Results filings must extract Revenue, EBITDA, PBT, PAT with QoQ and YoY."""
        results_filings = [a for a in ANNOUNCEMENTS if a["category"] == "results"]
        self.assertGreater(len(results_filings), 0)
        for rf in results_filings:
            enr = rf.get("enrichment", {})
            self.assertIn("metrics", enr)
            m = enr["metrics"]
            self.assertIn("revenue", m)
            self.assertIn("ebitda", m)
            self.assertIn("pbt", m)
            self.assertIn("pat", m)
            self.assertIn("qoq_pct", m["revenue"])
            self.assertIn("yoy_pct", m["revenue"])

    def test_management_change_enrichment(self):
        """Management change filings must pull executive background and pedigree."""
        mgmt_filings = [a for a in ANNOUNCEMENTS if a["category"] == "management_change"]
        self.assertGreater(len(mgmt_filings), 0)
        for mf in mgmt_filings:
            enr = mf.get("enrichment", {})
            inc = enr.get("incoming_executive", {})
            self.assertIn("name", inc)
            self.assertIn("career_background", inc)
            self.assertIn("education", inc)
            self.assertIn("strategic_implication", inc)

class TestFinnTriggeredAlerts(unittest.TestCase):
    def test_alert_evaluation_defaults(self):
        """Should detect threshold breaches with default settings."""
        alerts = evaluate_alerts()
        self.assertIn("summary", alerts)
        self.assertIn("price_anomalies", alerts)
        self.assertIn("volume_spikes", alerts)
        self.assertIn("material_filings", alerts)

        # Dixon and Tata Motors should trigger
        symbols = [a["symbol"] for a in alerts["price_anomalies"]]
        self.assertTrue(len(symbols) > 0)

        # Volume surges (>2x avg)
        vol_symbols = [v["symbol"] for v in alerts["volume_spikes"]]
        self.assertTrue(len(vol_symbols) > 0)

    def test_dynamic_threshold_tuning(self):
        """Stricter thresholds should yield fewer triggers."""
        loose_alerts = evaluate_alerts({"price_move_threshold_pct": 1.0})
        strict_alerts = evaluate_alerts({"price_move_threshold_pct": 5.0})
        self.assertGreaterEqual(len(loose_alerts["price_anomalies"]), len(strict_alerts["price_anomalies"]))

class TestFinnPullResearch(unittest.TestCase):
    def test_8_modules_present(self):
        """Pull research must contain all 8 analytical modules."""
        res = get_company_research("RELIANCE")
        mods = res["modules"]
        expected_modules = [
            "business_snapshot",
            "financial_snapshot",
            "trajectory",
            "balance_sheet",
            "cash_quality",
            "narrative_vs_numbers",
            "forward_guidance",
            "bull_vs_bear"
        ]
        for em in expected_modules:
            self.assertIn(em, mods, f"Module {em} missing in research package")
            self.assertIsNotNone(mods[em])

    def test_narrative_vs_numbers_worked_example(self):
        """Narrative vs numbers must track last 4 quarters promises vs delivery."""
        res = get_company_research("TATAMOTORS")
        nvn = res["modules"]["narrative_vs_numbers"]
        self.assertIn("quarters", nvn)
        self.assertEqual(len(nvn["quarters"]), 4)
        for q in nvn["quarters"]:
            self.assertIn("management_promise", q)
            self.assertIn("actual_delivery", q)
            self.assertIn("verdict", q)

    def test_cash_conversion_metric(self):
        """Cash quality module must assess cash conversion integrity."""
        res = get_company_research("RELIANCE")
        cq = res["modules"]["cash_quality"]
        self.assertIn("cfo_ttm_cr", cq)
        self.assertIn("pat_ttm_cr", cq)
        self.assertIn("cash_conversion_pct", cq)
        self.assertGreater(cq["cash_conversion_pct"], 100)

    def test_engine_generalisation(self):
        """Research engine must generalize cleanly to any unseen NSE ticker."""
        res = get_company_research("MARUTI")
        self.assertEqual(res["symbol"], "MARUTI")
        self.assertEqual(res["ticker"], "MARUTI.NS")
        self.assertIn("business_snapshot", res["modules"])
        self.assertIn("narrative_vs_numbers", res["modules"])

class TestFinnCopilot(unittest.TestCase):
    def test_copilot_guidance_query(self):
        """Copilot should accurately route promises vs delivery questions."""
        ans = process_copilot_query("Did Tata Motors deliver on concall guidance?")
        self.assertEqual(ans["type"], "narrative_vs_numbers")
        self.assertIn("table", ans)
        self.assertIn("citations", ans)

    def test_copilot_cash_flow_query(self):
        """Copilot should handle cash conversion and FCF inquiries."""
        ans = process_copilot_query("What is Reliance cash conversion ratio?")
        self.assertEqual(ans["type"], "cash_quality")
        self.assertIn("metrics", ans)

if __name__ == "__main__":
    unittest.main()
