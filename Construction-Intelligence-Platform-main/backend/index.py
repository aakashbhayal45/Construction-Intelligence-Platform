import sys
import os

_backend_dir = os.path.dirname(__file__)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app, application, handler
