"""
HealthFlow AI - Structured Logging & Observability
Uses Loguru for structured JSON-compatible logging with Trace & Session IDs.
"""
import sys
from loguru import logger
from app.core.config import settings

# Clear default loguru handlers
logger.remove()

# Add standard console output with clean colorized format
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
    level="DEBUG" if settings.DEBUG else "INFO",
)

# In production or structured mode, file sink with rotation
logger.add(
    "logs/healthflow.log",
    rotation="10 MB",
    retention="14 days",
    compression="zip",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} | {message}",
    enqueue=True
)

__all__ = ["logger"]
