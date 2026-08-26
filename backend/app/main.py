"""
HealthFlow AI - Core Application Entry Point
Healthcare Without Barriers.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import os
import json
from app.core.config import settings
from app.core.logger import logger
from app.db.firestore_client import get_db
from app.db.seed_data import seed_initial_data
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing HealthFlow AI platform...")
    db = get_db()
    seed_initial_data(db)
    logger.info("HealthFlow AI is operational and ready to serve requests.")
    yield
    logger.info("Shutting down HealthFlow AI platform...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="HealthFlow AI — Healthcare Without Barriers. Real, modular, production-oriented healthcare platform with zero-hallucination guardrails, rules-based schemes, ABDM integrations, and multilingual voice support.",
    lifespan=lifespan
)

# CORS configuration
raw_origins = os.getenv("BACKEND_CORS_ORIGINS")
if raw_origins:
    try:
        origins = json.loads(raw_origins)
    except Exception:
        origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    origins = [str(o) for o in settings.BACKEND_CORS_ORIGINS]

has_wildcard = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if has_wildcard else origins,
    allow_credentials=not has_wildcard,  # Crucial fix: browsers reject wildcard origins with allow_credentials=True
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app" if not has_wildcard else None,
)

# Request Timing & Trace Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
    response.headers["X-Platform"] = "HealthFlow AI"
    return response

# Root health endpoint
@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "tagline": settings.TAGLINE,
        "environment": settings.ENVIRONMENT
    }

# Mount v1 API
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
