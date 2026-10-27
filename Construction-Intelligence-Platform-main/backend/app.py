"""
FastAPI entrypoint for Vercel deployment.
Exports the FastAPI app instance from app/main.py.
"""
import sys
import os

# Ensure the backend directory itself is on sys.path
# so that 'app' package imports (e.g. app.config, app.routers) resolve correctly.
_backend_dir = os.path.dirname(__file__)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app

# Ensure 'app', 'application', and 'handler' are all exported at top-level
# These are the names Vercel's Python runtime looks for.
application = app
handler = app
