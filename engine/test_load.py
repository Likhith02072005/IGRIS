import sys
import os

# Set pythonpath
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from app.main import app
    print("SUCCESS: FastAPI App and all adapters imported successfully!")
except Exception as e:
    print(f"FAILED: Import error: {e}")
    sys.exit(1)
