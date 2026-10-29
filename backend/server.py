"""
FINN: High-Performance Python HTTP Server
Provides REST API endpoints for:
- /api/portfolio : Portfolio stocks, quotes, and market-cap tiers
- /api/digest    : Windowed proactive push digest with smart prioritization
- /api/alerts    : Triggered alert threshold engine & live monitoring
- /api/research  : On-demand 8-module primary fundamental research
- /api/copilot   : Natural language investor copilot queries
Serves modern mobile-first web interface from frontend/static/.
"""

import sys
import os
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

# Ensure backend directory is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.data.portfolio import get_all_companies, PORTFOLIO, AD_HOC_COMPANIES
from backend.engine.digest_engine import generate_push_digest
from backend.engine.alerts_engine import evaluate_alerts
from backend.engine.research_engine import get_company_research
from backend.engine.copilot_engine import process_copilot_query

STATIC_DIR = os.path.join(PROJECT_ROOT, "frontend", "static")

# In-memory alert configuration
RUNTIME_CONFIG = {
    "price_move_threshold_pct": 3.0,
    "volume_multiplier_threshold": 2.0,
    "material_categories": ["results", "M&A", "management_change", "capex", "litigation", "pledging"],
    "hours_lookback": 24
}

class FinnRequestHandler(SimpleHTTPRequestHandler):
    """
    HTTP Request Handler serving both FINN REST APIs and static mobile frontend.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, data, status=200):
        """Sends serialized JSON response with appropriate headers."""
        payload = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        """Handle REST API GET endpoints and fallback to static frontend."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # 1. API: Portfolio List
        if path == "/api/portfolio":
            all_comps = get_all_companies()
            self.send_json({
                "portfolio_count": len(PORTFOLIO),
                "ad_hoc_count": len(AD_HOC_COMPANIES),
                "companies": all_comps
            })
            return

        # 2. API: Windowed Push Digest
        if path == "/api/digest":
            hours = int(query.get("window", [24])[0])
            cat = query.get("category", [None])[0]
            ticker = query.get("ticker", [None])[0]
            digest = generate_push_digest(hours_window=hours, category_filter=cat, ticker_filter=ticker)
            self.send_json(digest)
            return

        # 3. API: Triggered Alerts
        if path == "/api/alerts":
            price_t = query.get("price_thresh", [RUNTIME_CONFIG["price_move_threshold_pct"]])[0]
            vol_t = query.get("vol_thresh", [RUNTIME_CONFIG["volume_multiplier_threshold"]])[0]
            hours = query.get("hours", [RUNTIME_CONFIG["hours_lookback"]])[0]
            
            cfg = {
                "price_move_threshold_pct": float(price_t),
                "volume_multiplier_threshold": float(vol_t),
                "hours_lookback": int(hours),
                "material_categories": RUNTIME_CONFIG["material_categories"]
            }
            alerts = evaluate_alerts(cfg)
            self.send_json(alerts)
            return

        # 4. API: Pull Deep Research (8 Modules)
        if path == "/api/research":
            ticker = query.get("ticker", ["RELIANCE"])[0]
            research_data = get_company_research(ticker)
            self.send_json(research_data)
            return

        # 5. Default: serve index.html for root, or static files
        if path == "/" or path == "":
            self.path = "/index.html"
            
        return super().do_GET()

    def do_POST(self):
        """Handle REST API POST endpoints."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # 1. API: Copilot Query
        if path == "/api/copilot":
            query_text = payload.get("query", "")
            active_ticker = payload.get("active_ticker", "RELIANCE")
            response = process_copilot_query(query_text, active_ticker=active_ticker)
            self.send_json(response)
            return

        # 2. API: Update Alert Configuration
        if path == "/api/alerts/config":
            if "price_move_threshold_pct" in payload:
                RUNTIME_CONFIG["price_move_threshold_pct"] = float(payload["price_move_threshold_pct"])
            if "volume_multiplier_threshold" in payload:
                RUNTIME_CONFIG["volume_multiplier_threshold"] = float(payload["volume_multiplier_threshold"])
            if "hours_lookback" in payload:
                RUNTIME_CONFIG["hours_lookback"] = int(payload["hours_lookback"])
            if "material_categories" in payload:
                RUNTIME_CONFIG["material_categories"] = payload["material_categories"]
                
            self.send_json({"status": "success", "config": RUNTIME_CONFIG})
            return

        self.send_error(404, "Endpoint Not Found")

def run_server(port=8080):
    """Starts the FINN backend server."""
    server_address = ("", port)
    httpd = socketserver.ThreadingTCPServer(server_address, FinnRequestHandler)
    print(f"==================================================")
    print(f" FINN - Financial Investment Agent Server Started ")
    print(f" URL: http://localhost:{port}")
    print(f" Static root: {STATIC_DIR}")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping FINN server...")
        httpd.server_close()

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(port)
