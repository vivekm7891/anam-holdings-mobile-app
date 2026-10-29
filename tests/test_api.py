"""
FINN: In-Memory REST API Handler Integration Tests
Verifies HTTP dispatching and JSON serialization using in-memory streams:
- GET  /api/portfolio
- GET  /api/digest?window=24
- GET  /api/alerts?price_thresh=3.0&vol_thresh=2.0
- GET  /api/research?ticker=TATAMOTORS
- POST /api/copilot
- POST /api/alerts/config
Zero socket binding required - runs safely in any sandbox environment.
"""

import unittest
import sys
import os
import io
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.server import FinnRequestHandler

class MockSocket:
    def __init__(self, raw_input):
        self.rfile = io.BytesIO(raw_input)
        self.wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if 'r' in mode:
            return self.rfile
        elif 'w' in mode or 'b' in mode:
            return self.wfile
        return self.wfile

    def sendall(self, data):
        self.wfile.write(data)

class DummyServer:
    pass

def execute_request(method, path, body=None, headers=None):
    """Executes an in-memory HTTP request against FinnRequestHandler."""
    if headers is None:
        headers = {}
    
    body_bytes = b""
    if body is not None:
        if isinstance(body, dict):
            body_bytes = json.dumps(body).encode("utf-8")
        elif isinstance(body, str):
            body_bytes = body.encode("utf-8")
        else:
            body_bytes = body
        headers["Content-Length"] = str(len(body_bytes))
        headers["Content-Type"] = "application/json"

    raw_req = f"{method} {path} HTTP/1.1\r\nHost: localhost\r\n".encode("utf-8")
    for k, v in headers.items():
        raw_req += f"{k}: {v}\r\n".encode("utf-8")
    raw_req += b"\r\n" + body_bytes

    mock_sock = MockSocket(raw_req)
    # Instantiate handler with dummy client address and server
    try:
        handler = FinnRequestHandler(mock_sock, ("127.0.0.1", 12345), DummyServer())
    except Exception as e:
        pass

    raw_output = mock_sock.wfile.getvalue()
    if b"\r\n\r\n" in raw_output:
        header_part, body_part = raw_output.split(b"\r\n\r\n", 1)
        headers_str = header_part.decode("utf-8", errors="replace")
        status_line = headers_str.split("\r\n")[0]
        status_code = int(status_line.split()[1])
        try:
            parsed_json = json.loads(body_part.decode("utf-8"))
        except Exception:
            parsed_json = body_part.decode("utf-8", errors="replace")
        return status_code, parsed_json
    return 500, None

class TestFinnApiInMemory(unittest.TestCase):
    def test_api_portfolio_endpoint(self):
        status, data = execute_request("GET", "/api/portfolio")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, dict)
        self.assertEqual(data["portfolio_count"], 18)
        self.assertGreaterEqual(len(data["companies"]), 18)

    def test_api_digest_endpoint(self):
        status, data = execute_request("GET", "/api/digest?window=24")
        self.assertEqual(status, 200)
        self.assertIn("priority_items", data)
        self.assertIn("routine_items", data)
        self.assertIn("metadata", data)
        self.assertEqual(data["metadata"]["window_hours"], 24)

    def test_api_alerts_endpoint(self):
        status, data = execute_request("GET", "/api/alerts?price_thresh=3.0&vol_thresh=2.0")
        self.assertEqual(status, 200)
        self.assertIn("price_anomalies", data)
        self.assertIn("volume_spikes", data)
        self.assertIn("material_filings", data)
        self.assertIn("summary", data)

    def test_api_research_endpoint(self):
        status, data = execute_request("GET", "/api/research?ticker=TATAMOTORS")
        self.assertEqual(status, 200)
        self.assertEqual(data["symbol"], "TATAMOTORS")
        self.assertIn("modules", data)
        self.assertIn("narrative_vs_numbers", data["modules"])
        self.assertIn("cash_quality", data["modules"])

    def test_api_copilot_endpoint(self):
        status, data = execute_request("POST", "/api/copilot", body={"query": "Did Tata Motors deliver on guidance?"})
        self.assertEqual(status, 200)
        self.assertIn("answer", data)
        self.assertIn("citations", data)
        self.assertEqual(data["type"], "narrative_vs_numbers")

    def test_api_config_update_endpoint(self):
        status, data = execute_request("POST", "/api/alerts/config", body={"price_move_threshold_pct": 4.5, "volume_multiplier_threshold": 2.5})
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["config"]["price_move_threshold_pct"], 4.5)

if __name__ == "__main__":
    unittest.main()
