from typing import Optional, Dict, Any
from datetime import datetime, timezone

from app.db.firestore_client import db
from app.core.security import get_password_hash, verify_password
from app.core.logger import logger

class UserService:
    def __init__(self):
        self.collection = db.collection("users")

    def create_user(self, email: str, password: str, role: str, patient_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new user with hashed password.
        Returns the stored user dict.
        """
        # Ensure email uniqueness
        existing = self.collection.where("email", "==", email).stream()
        if any(True for _ in existing):
            raise ValueError("User with this email already exists")
        user_id = f"user_{email.lower().replace('@', '_').replace('.', '_')}"
        now_iso = datetime.now(timezone.utc).isoformat()
        user_data = {
            "id": user_id,
            "email": email,
            "password_hash": get_password_hash(password),
            "role": role,
            "patient_id": patient_id,
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        self.collection.document(user_id).set(user_data)
        logger.info(f"Created new user {user_id}")
        return user_data

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        docs = self.collection.where("email", "==", email).stream()
        for doc in docs:
            if doc.exists:
                return doc.to_dict()
        return None

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.get("password_hash", "")):
            return None
        return user

user_service = UserService()
