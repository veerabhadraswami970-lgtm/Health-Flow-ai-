"""
HealthFlow AI - Local Server Runner
"""
import uvicorn
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    env_mode = os.getenv("ENVIRONMENT", "development").lower()
    is_reload = os.getenv("RELOAD", "false" if env_mode in ["production", "prod"] else "true").lower() == "true"
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_reload)
