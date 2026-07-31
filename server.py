#!/usr/bin/env python3
"""
HTTP server for انطلاقة HPC.
Serves all static files with no-cache headers (so browsers always fetch
fresh files), plus two JSON API endpoints for the admin leaderboard panel.

GET  /api/leaderboard         → returns data/leaderboard.json
POST /api/leaderboard         → replaces data/leaderboard.json
     Header: X-Admin-Password: <ADMIN_PASSWORD env var>
     Body:   JSON array of leaderboard entries
"""

import http.server
import json
import os
import sys
import urllib.parse
from pathlib import Path

PORT = int(os.environ.get("PORT", 5000))
DATA_FILE = Path("data/leaderboard.json")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static file handler + /api/leaderboard, with no-cache headers."""

    # ── no-cache headers on every response ────────────────────────────────
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # ── quiet logs — suppress per-request noise, keep errors ──────────────
    def log_message(self, format, *args):
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(format, *args)

    # ── routing ────────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/leaderboard":
            self._get_leaderboard()
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/admin/login":
            self._post_admin_login()
        elif parsed.path == "/api/leaderboard":
            self._post_leaderboard()
        else:
            self._send_json({"error": "not found"}, 404)

    def do_OPTIONS(self):
        """Allow pre-flight CORS from the same origin (dev convenience)."""
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    # ── API handlers ───────────────────────────────────────────────────────
    def _post_admin_login(self):
        """Validates the admin password. Returns 200 on success, 401 on wrong
        password, 503 if ADMIN_PASSWORD is not configured on the server."""
        if not ADMIN_PASSWORD:
            self._send_json(
                {"error": "ADMIN_PASSWORD environment variable is not set on the server."},
                503,
            )
            return
        provided = self.headers.get("X-Admin-Password", "")
        if provided != ADMIN_PASSWORD:
            self._send_json({"error": "Incorrect password."}, 401)
            return
        self._send_json({"ok": True}, 200)

    def _get_leaderboard(self):
        try:
            data = DATA_FILE.read_text(encoding="utf-8")
            self._send_json(json.loads(data), 200)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _post_leaderboard(self):
        # 1. Check password
        if not ADMIN_PASSWORD:
            self._send_json(
                {"error": "ADMIN_PASSWORD environment variable is not set on the server."},
                503,
            )
            return

        provided = self.headers.get("X-Admin-Password", "")
        if provided != ADMIN_PASSWORD:
            self._send_json({"error": "Incorrect password."}, 401)
            return

        # 2. Read and validate body
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            entries = json.loads(body)
            if not isinstance(entries, list):
                raise ValueError("Expected a JSON array.")
            for idx, item in enumerate(entries):
                if not isinstance(item, dict):
                    raise ValueError(f"Item {idx} must be an object, got {type(item).__name__}.")
                for field in ("name", "energy", "img"):
                    if field not in item:
                        raise ValueError(f"Item {idx} is missing required field '{field}'.")
                    if not isinstance(item[field], str):
                        raise ValueError(f"Item {idx} field '{field}' must be a string.")
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json({"error": f"Invalid payload: {e}"}, 400)
            return

        # 3. Persist
        try:
            DATA_FILE.write_text(
                json.dumps(entries, ensure_ascii=False, indent=4),
                encoding="utf-8",
            )
            self._send_json({"ok": True, "count": len(entries)}, 200)
        except Exception as e:
            self._send_json({"error": f"Write failed: {e}"}, 500)

    # ── helpers ────────────────────────────────────────────────────────────
    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Password")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    if not ADMIN_PASSWORD:
        print(
            "⚠️  WARNING: ADMIN_PASSWORD is not set. "
            "The admin API will return 503 until you set it.",
            file=sys.stderr,
        )

    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Serving on http://0.0.0.0:{PORT}", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
