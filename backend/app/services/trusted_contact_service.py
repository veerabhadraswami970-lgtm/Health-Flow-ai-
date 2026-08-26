"""
HealthFlow AI - Trusted Contact Service
Provides business logic for managing trusted contacts with granular permissions.
"""

from datetime import datetime, timezone
from typing import List
from uuid import uuid4

from app.db.firestore_client import db
from app.core.logger import logger
from app.domain.schemas.trusted_contact import (
    TrustedContactGrantRequest,
    TrustedContactResponse,
    TrustedContactPermission,
)

# Firestore collection structure:
# patients/{patient_id}/trusted_contacts/{contact_id}

class TrustedContactService:
    def __init__(self):
        # Root collection for patients; sub‑collection created per patient
        self.patients_col = db.collection("patients")

    def _patient_doc(self, patient_id: str):
        return self.patients_col.document(patient_id)

    def _contacts_col(self, patient_id: str):
        return self._patient_doc(patient_id).collection("trusted_contacts")

    def add_trusted_contact(self, patient_id: str, req: TrustedContactGrantRequest) -> TrustedContactResponse:
        """Create a new trusted contact under the given patient.

        Returns the persisted TrustedContactResponse containing the generated ID and timestamp.
        """
        contact_id = f"tc_{uuid4().hex[:12]}"
        granted_at = datetime.now(timezone.utc).isoformat()
        data = {
            "id": contact_id,
            "contact": req.contact.dict(),
            "permissions": [p.value for p in req.permissions],
            "granted_at": granted_at,
        }
        self._contacts_col(patient_id).document(contact_id).set(data)
        logger.info(
            f"Trusted contact {contact_id} granted to patient {patient_id} with permissions {data['permissions']}"
        )
        return TrustedContactResponse(
            id=contact_id,
            contact=req.contact,
            permissions=req.permissions,
            granted_at=granted_at,
        )

    def list_trusted_contacts(self, patient_id: str) -> List[TrustedContactResponse]:
        """Return all trusted contacts for the patient as Pydantic models."""
        docs = self._contacts_col(patient_id).stream()
        contacts: List[TrustedContactResponse] = []
        for doc in docs:
            data = doc.to_dict()
            perms = [TrustedContactPermission(p) for p in data.get("permissions", [])]
            contacts.append(
                TrustedContactResponse(
                    id=data.get("id"),
                    contact=data.get("contact"),
                    permissions=perms,
                    granted_at=data.get("granted_at"),
                )
            )
        return contacts

    def revoke_trusted_contact(self, patient_id: str, contact_id: str) -> bool:
        """Delete a trusted contact. Returns True on success, False if not found."""
        doc_ref = self._contacts_col(patient_id).document(contact_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            logger.info(f"Trusted contact {contact_id} revoked for patient {patient_id}")
            return True
        logger.warning(
            f"Attempted to revoke non‑existent trusted contact {contact_id} for patient {patient_id}"
        )
        return False

# Singleton instance for injection
trusted_contact_service = TrustedContactService()
