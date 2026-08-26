"""
HealthFlow AI - Database Client Factory
Provides a unified Firestore client interface supporting both production Firebase and local persistent storage.
"""
from typing import Any
import os
from app.core.config import settings
from app.core.logger import logger
from app.db.mock_firestore import MockFirestoreClient

_db_instance = None

def get_db() -> Any:
    global _db_instance
    if _db_instance is not None:
        return _db_instance

    if settings.PERSISTENCE_MODE == "firestore" and settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            if not firebase_admin._apps:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET
                })
            _db_instance = firestore.client()
            logger.info("Successfully connected to Production Google Cloud Firestore")
            return _db_instance
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase Admin SDK ({e}). Falling back to Local Mock Firestore.")

    # Default to Local Mock Firestore
    _db_instance = MockFirestoreClient(storage_dir=settings.LOCAL_STORAGE_DIR)
    logger.info(f"Initialized Local Persistent Mock Firestore at {settings.LOCAL_STORAGE_DIR}")
    return _db_instance

db = get_db()
