"""
HealthFlow AI - Patient Profile Service
Manages patient profiles with extended fields: blood group, emergency contacts, allergies, diseases.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.db.firestore_client import db
from app.core.logger import logger
from app.domain.schemas.patient import (
    PatientProfile,
    PatientProfileUpdateRequest,
    EmergencyContactInfo,
    PatientRegistrationRequest,
    PatientRegistrationResponse,
)

# Default seed profile for demo patient
SEED_PATIENT = {
    "id": "patient_ravi_kumar",
    "name": "Ravi Kumar",
    "phone": "+919876543210",
    "email": "ravi.kumar@example.com",
    "age": 42,
    "gender": "Male",
    "city": "Hyderabad",
    "state": "Telangana",
    "blood_group": "B+",
    "preferred_language": "en",
    "known_allergies": ["Penicillin", "Sulfa Drugs"],
    "existing_diseases": ["Type 2 Diabetes", "Hypertension"],
    "emergency_contact_1": {
        "name": "Sunita Devi",
        "phone": "+919876543212",
        "relationship": "Wife",
    },
    "emergency_contact_2": {
        "name": "Anil Kumar",
        "phone": "+919876543211",
        "relationship": "Son",
    },
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-08-01T12:00:00Z",
}


class PatientService:
    def __init__(self):
        self.collection = db.collection("patients")
        self._ensure_seed()

    def _ensure_seed(self):
        doc = self.collection.document(SEED_PATIENT["id"]).get()
        if not doc.exists:
            self.collection.document(SEED_PATIENT["id"]).set(SEED_PATIENT)
            logger.info("Seeded default patient profile for demo patient.")

    def register_patient(self, req: PatientRegistrationRequest) -> PatientRegistrationResponse:
        """Create a new patient profile from registration request.

        Generates a unique patient ID, stores all fields in Firestore, creates a QR code
        using HealthQRService, and returns the registration response.
        """
        import random
        # Generate patient ID in HealthFlow format HF-PAT-2026-XXXXXX
        rand_digits = random.randint(100000, 999999)
        patient_id = f"HF-PAT-2026-{rand_digits}"
        now_iso = datetime.now(timezone.utc).isoformat()
        # Prepare data dict from request
        data = req.model_dump()
        
        # Normalize fields for PatientProfile compatibility
        emg_1 = data.get("emergency_contact") or {"name": "", "phone": "", "relationship": "Other"}
        emg_2 = data.get("alternate_emergency_contact") or {"name": "", "phone": "", "relationship": "Other"}

        data.update({
            "id": patient_id,
            "name": req.full_name,
            "emergency_contact_1": emg_1,
            "emergency_contact_2": emg_2,
            "known_allergies": data.get("allergies", []),
            "existing_diseases": data.get("existing_conditions", []),
            "medical_history_summary": data.get("medical_history", {}),
            "created_at": now_iso,
            "updated_at": now_iso,
        })

        # Store in Firestore
        self.collection.document(patient_id).set(data)

        # Generate QR using health_qr_service (if available)
        qr_code = None
        try:
            from app.services.health_qr_service import health_qr_service
            from app.domain.schemas.health_qr import HealthQRGenerateRequest
            qr_req = HealthQRGenerateRequest(patient_id=patient_id, expires_minutes=1440)
            qr_resp = health_qr_service.generate_health_qr(qr_req)
            qr_code = qr_resp.token
        except Exception as e:
            logger.warning(f"Health QR generation failed during registration: {e}")

        # Return response
        from app.domain.schemas.patient import PatientRegistrationResponse
        return PatientRegistrationResponse(
            patient_id=patient_id,
            qr_code=qr_code,
            created_at=now_iso,
        )

    def get_patient_profile(self, patient_id: str) -> Optional[PatientProfile]:
        doc = self.collection.document(patient_id).get()
        if doc.exists:
            data = doc.to_dict()
            if "name" not in data and "full_name" in data:
                data["name"] = data["full_name"]
            # Ensure emergency contacts are properly structured
            for key in ["emergency_contact_1", "emergency_contact_2"]:
                if key not in data or not isinstance(data[key], dict):
                    data[key] = {"name": "", "phone": "", "relationship": "Other"}
            return PatientProfile(**data)
        return None


    def update_patient_profile(
        self, patient_id: str, update: PatientProfileUpdateRequest
    ) -> Optional[PatientProfile]:
        doc = self.collection.document(patient_id).get()
        if not doc.exists:
            # Create new profile
            now = datetime.now(timezone.utc).isoformat()
            new_data = {
                "id": patient_id,
                "created_at": now,
                "updated_at": now,
            }
            update_dict = update.model_dump(exclude_none=True)
            # Convert emergency contacts to dicts
            for key in ["emergency_contact_1", "emergency_contact_2"]:
                if key in update_dict and isinstance(update_dict[key], EmergencyContactInfo):
                    update_dict[key] = update_dict[key].model_dump()
            new_data.update(update_dict)
            self.collection.document(patient_id).set(new_data)
            return self.get_patient_profile(patient_id)

        existing = doc.to_dict()
        update_dict = update.model_dump(exclude_none=True)
        # Convert Pydantic models to dicts for storage
        for key in ["emergency_contact_1", "emergency_contact_2"]:
            if key in update_dict and hasattr(update_dict[key], "model_dump"):
                update_dict[key] = update_dict[key].model_dump()
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        existing.update(update_dict)
        self.collection.document(patient_id).set(existing)
        return self.get_patient_profile(patient_id)

    def get_emergency_contacts(self, patient_id: str) -> Dict[str, Any]:
        profile = self.get_patient_profile(patient_id)
        if not profile:
            return {"contacts": [], "patient_name": "", "blood_group": ""}
        return {
            "patient_name": profile.name,
            "blood_group": profile.blood_group,
            "contacts": [
                profile.emergency_contact_1.model_dump(),
                profile.emergency_contact_2.model_dump(),
            ],
        }


patient_service = PatientService()
