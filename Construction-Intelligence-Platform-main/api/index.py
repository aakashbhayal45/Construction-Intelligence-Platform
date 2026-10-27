import sys
import os

# Add backend to module search path so 'app' package is importable
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app, application, handler
