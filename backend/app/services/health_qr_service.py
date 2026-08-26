"""
HealthFlow AI - Health QR Service
Generates and manages "My Health QR" tokens for patient-controlled health summary sharing.
Flow: QR → Secure Token → Backend Validation → Authorized Records
"""
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from app.core.config import settings
from app.core.audit import audit_logger
from app.core.logger import logger
from app.db.firestore_client import db
from app.domain.schemas.health_qr import (
    HealthQRGenerateRequest,
    HealthQRGenerateResponse,
    HealthQRScanRequest,
    HealthQRScanResponse,
    HealthQRRevokeRequest,
    HealthQRActiveResponse,
)


class HealthQRService:
    def __init__(self):
        self.collection = db.collection("health_qr")

    def generate_health_qr(self, req: HealthQRGenerateRequest) -> HealthQRGenerateResponse:
        qr_id = f"hqr_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=req.expires_minutes)

        # Create signed JWT token
        payload = {
            "qr_id": qr_id,
            "patient_id": req.patient_id,
            "exp": expire,
            "iat": now,
            "type": "health_qr",
            "iss": "healthflow-ai",
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        # Persist QR record
        qr_data = {
            "qr_id": qr_id,
            "patient_id": req.patient_id,
            "token": token,
            "qr_payload": token,
            "expires_at": expire.isoformat(),
            "created_at": now.isoformat(),
            "is_active": True,
            "is_revoked": False,
        }
        self.collection.document(qr_id).set(qr_data)

        return HealthQRGenerateResponse(
            qr_id=qr_id,
            patient_id=req.patient_id,
            token=token,
            qr_payload=token,
            expires_at=expire.isoformat(),
            created_at=now.isoformat(),
            is_active=True,
        )

    async def scan_health_qr(self, req: HealthQRScanRequest) -> HealthQRScanResponse:
        now = datetime.now(timezone.utc)
        try:
            # Decode and verify the JWT token
            payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

            if payload.get("type") != "health_qr":
                audit_entry = await audit_logger.log_event(
                    action="HEALTH_QR_INVALID_TYPE",
                    resource_type="HealthQR",
                    resource_id="UNKNOWN",
                    actor_id=req.scanner_id,
                    actor_role=req.scanner_role,
                    status="FAILED",
                    details={"error": "Token is not a Health QR type"},
                )
                return HealthQRScanResponse(
                    is_valid=False,
                    error_message="Invalid token: This is not a Health QR token.",
                    audit_id=audit_entry["id"],
                    scanned_at=now.isoformat(),
                )

            qr_id = payload.get("qr_id")
            patient_id = payload.get("patient_id")

            # Check if QR has been revoked
            qr_doc = self.collection.document(qr_id).get()
            if qr_doc.exists:
                qr_data = qr_doc.to_dict()
                if qr_data.get("is_revoked", False):
                    audit_entry = await audit_logger.log_event(
                        action="HEALTH_QR_SCAN_REVOKED",
                        resource_type="HealthQR",
                        resource_id=qr_id,
                        actor_id=req.scanner_id,
                        actor_role=req.scanner_role,
                        status="REVOKED_DENIED",
                        details={"patient_id": patient_id},
                    )
                    return HealthQRScanResponse(
                        is_valid=False,
                        error_message="This Health QR has been revoked by the patient.",
                        audit_id=audit_entry["id"],
                        scanned_at=now.isoformat(),
                    )

            # Fetch patient profile
            from app.services.patient_service import patient_service
            profile = patient_service.get_patient_profile(patient_id)

            # Fetch medical history
            from app.services.medical_history_service import medical_history_service
            history = medical_history_service.get_patient_history(patient_id)
            prev_medicines = medical_history_service.get_patient_medicines(patient_id)
            prev_hospitals = medical_history_service.get_patient_hospitals(patient_id)

            # Build treatment summaries
            treatments = []
            for entry in history.entries[:10]:  # Last 10 entries
                treatments.append({
                    "date": entry.date,
                    "hospital": entry.hospital_name,
                    "doctor": entry.doctor_name,
                    "type": entry.treatment_type,
                    "diagnosis": entry.diagnosis,
                })

            # Build emergency contacts
            emergency_contacts = []
            if profile:
                if profile.emergency_contact_1.name:
                    emergency_contacts.append(profile.emergency_contact_1.model_dump())
                if profile.emergency_contact_2.name:
                    emergency_contacts.append(profile.emergency_contact_2.model_dump())

            # Audit log
            audit_entry = await audit_logger.log_event(
                action="HEALTH_QR_SCANNED_AUTHORIZED",
                resource_type="HealthQR",
                resource_id=qr_id,
                actor_id=req.scanner_id,
                actor_role=req.scanner_role,
                status="SUCCESS",
                details={"patient_id": patient_id, "scanner_name": req.scanner_name},
            )

            return HealthQRScanResponse(
                is_valid=True,
                is_authorized=True,
                patient_name=profile.name if profile else "Unknown",
                blood_group=profile.blood_group if profile else "",
                known_allergies=profile.known_allergies if profile else [],
                existing_diseases=profile.existing_diseases if profile else [],
                previous_medicines=prev_medicines,
                previous_hospitals=prev_hospitals,
                previous_treatments=treatments,
                emergency_contacts=emergency_contacts,
                audit_id=audit_entry["id"],
                scanned_at=now.isoformat(),
            )

        except JWTError as e:
            audit_entry = await audit_logger.log_event(
                action="HEALTH_QR_SCAN_INVALID",
                resource_type="HealthQR",
                resource_id="UNKNOWN",
                actor_id=req.scanner_id,
                actor_role=req.scanner_role,
                status="SECURITY_ALERT",
                details={"jwt_error": str(e)},
            )
            return HealthQRScanResponse(
                is_valid=False,
                error_message=f"Health QR token is expired, invalid, or tampered: {str(e)}",
                audit_id=audit_entry["id"],
                scanned_at=now.isoformat(),
            )

    async def revoke_health_qr(self, req: HealthQRRevokeRequest) -> bool:
        doc = self.collection.document(req.qr_id).get()
        if not doc.exists:
            return False
        data = doc.to_dict()
        if data.get("patient_id") != req.patient_id:
            return False
        data["is_revoked"] = True
        data["is_active"] = False
        data["revoked_at"] = datetime.now(timezone.utc).isoformat()
        self.collection.document(req.qr_id).set(data)

        await audit_logger.log_event(
            action="HEALTH_QR_REVOKED",
            resource_type="HealthQR",
            resource_id=req.qr_id,
            actor_id=req.patient_id,
            actor_role="Patient",
            status="SUCCESS",
        )
        return True

    def get_active_qrs(self, patient_id: str) -> HealthQRActiveResponse:
        docs = self.collection.where("patient_id", "==", patient_id).stream()
        now = datetime.now(timezone.utc).isoformat()
        active = []
        for d in docs:
            data = d.to_dict()
            if not data.get("is_revoked", False) and data.get("expires_at", "") > now:
                active.append(HealthQRGenerateResponse(
                    qr_id=data["qr_id"],
                    patient_id=data["patient_id"],
                    token=data["token"],
                    qr_payload=data.get("qr_payload", data["token"]),
                    expires_at=data["expires_at"],
                    created_at=data.get("created_at", ""),
                    is_active=True,
                ))
        return HealthQRActiveResponse(
            patient_id=patient_id,
            active_qrs=active,
            total=len(active),
        )


health_qr_service = HealthQRService()
