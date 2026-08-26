"""
HealthFlow AI - Database Client Factory
Provides a unified Firestore client interface supporting both production Firebase and local persistent storage.
"""
from typing import Any
import os
import json
import base64
from app.core.config import settings
from app.core.logger import logger
from app.db.mock_firestore import MockFirestoreClient

_db_instance = None

def _get_firebase_credentials():
    """Extract Certificate object from path, raw JSON string, or Base64 JSON string."""
    from firebase_admin import credentials

    # 1. Base64 or Raw JSON string in environment variable (Ideal for Render/Cloud PAAS)
    creds_env = os.getenv("FIREBASE_CREDENTIALS_JSON") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if creds_env:
        try:
            # Try raw JSON string first
            data = json.loads(creds_env)
            return credentials.Certificate(data)
        except json.JSONDecodeError:
            # Try base64 decoding if raw JSON fails
            try:
                decoded = base64.b64decode(creds_env).decode('utf-8')
                data = json.loads(decoded)
                return credentials.Certificate(data)
            except Exception as b64_err:
                logger.error(f"Failed to decode base64/JSON FIREBASE_CREDENTIALS_JSON: {b64_err}")

    # 2. Credential File Path
    cred_path = settings.FIREBASE_CREDENTIALS_PATH or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        return credentials.Certificate(cred_path)

    return None

def get_db() -> Any:
    global _db_instance
    if _db_instance is not None:
        return _db_instance

    is_production = settings.ENVIRONMENT.lower() in ["production", "prod"] or os.getenv("FAIL_ON_FIRESTORE_ERROR", "false").lower() == "true"
    cred = _get_firebase_credentials()

    if cred or settings.PERSISTENCE_MODE == "firestore":
        try:
            import firebase_admin
            from firebase_admin import firestore
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET
                })
            _db_instance = firestore.client()
            logger.info("Successfully connected to Production Google Cloud Firestore")
            return _db_instance
        except Exception as e:
            msg = f"Failed to initialize Production Firebase Admin SDK ({e})."
            if is_production or settings.PERSISTENCE_MODE == "firestore":
                logger.error(f"CRITICAL PROD FAILURE: {msg}")
                raise RuntimeError(f"Deployment Blocker: {msg} Cannot fall back to transient local storage in production mode.") from e
            logger.warning(f"{msg} Falling back to Local Mock Firestore for development.")

    # Default to Local Mock Firestore for local dev/testing
    _db_instance = MockFirestoreClient(storage_dir=settings.LOCAL_STORAGE_DIR)
    logger.info(f"Initialized Local Persistent Mock Firestore at {settings.LOCAL_STORAGE_DIR}")
    return _db_instance

db = get_db()
