"""
HealthFlow AI - Digital Health Records & Consent-Based Access Service
Enforces patient-controlled data sharing, consent life cycle, and audit logging.
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from app.db.firestore_client import db
from app.domain.schemas.health_record import (
    HealthRecordItem,
    ConsentRequest,
    ConsentResponse,
    ConsentActionRequest
)
from app.core.audit import audit_logger
from app.core.logger import logger

SEED_HEALTH_RECORDS = [
    {
        "id": "rec_001_ecg",
        "patient_id": "patient_ravi_kumar",
        "record_type": "DiagnosticSummary",
        "title": "12-Lead ECG Report (Normal Sinus Rhythm)",
        "facility_name": "NIMS Hyderabad",
        "doctor_name": "Dr. Ramesh Varma",
        "date": "2026-07-15",
        "summary": "Sinus rhythm with regular PR interval, no acute ST-T changes. Normal Axis.",
        "details": {"hr": 74, "qt_interval": "410ms", "interpretation": "Within Normal Limits"},
        "document_url": "/reports/ecg_sample.pdf",
        "created_at": "2026-07-15T11:00:00Z"
    },
    {
        "id": "rec_002_hba1c",
        "patient_id": "patient_ravi_kumar",
        "record_type": "LabReport",
        "title": "Comprehensive Diabetic Panel & HbA1c",
        "facility_name": "Apollo Diagnostics, Hyderabad",
        "doctor_name": "Dr. Ananya Sen",
        "date": "2026-08-01",
        "summary": "HbA1c: 6.8% (Target < 7.0%). Fasting Blood Glucose: 118 mg/dL. Serum Creatinine: 0.9 mg/dL.",
        "details": {"hba1c": 6.8, "fbs": 118, "creatinine": 0.9, "egfr": 95},
        "document_url": "/reports/hba1c_panel.pdf",
        "created_at": "2026-08-01T09:30:00Z"
    },
    {
        "id": "rec_003_vax",
        "patient_id": "patient_ravi_kumar",
        "record_type": "Immunization",
        "title": "COVID-19 & Influenza Booster Certificate",
        "facility_name": "Primary Health Centre, Hyderabad",
        "doctor_name": "Medical Officer",
        "date": "2025-11-20",
        "summary": "Completed Quadrivalent Inactivated Influenza & Annual Precautionary Booster.",
        "details": {"vaccine_name": "FluQuadri + Covishield Precaution", "batch": "FL8902A"},
        "document_url": "/reports/vaccination.pdf",
        "created_at": "2025-11-20T10:00:00Z"
    }
]

class HealthRecordService:
    def __init__(self):
        self.records_col = db.collection("medical_records")
        self.consents_col = db.collection("consents")
        self._ensure_seed_records()

    def _ensure_seed_records(self):
        for rec in SEED_HEALTH_RECORDS:
            self.records_col.document(rec["id"]).set(rec, merge=True)

    def get_records_for_patient(self, patient_id: str) -> List[HealthRecordItem]:
        docs = self.records_col.where("patient_id", "==", patient_id).stream()
        return [HealthRecordItem(**d.to_dict()) for d in docs]

    async def get_records_with_consent(
        self,
        patient_id: str,
        requester_id: str,
        requester_role: str,
        ip_address: str = "127.0.0.1"
    ) -> List[HealthRecordItem]:
        # Patient always has full access to their own records
        if requester_role == "Patient" or requester_id == patient_id:
            return self.get_records_for_patient(patient_id)

        # Check for active, unexpired consent
        active_consents = self.consents_col.where("patient_id", "==", patient_id)\
            .where("requester_id", "==", requester_id)\
            .where("status", "==", "GRANTED").stream()

        now_iso = datetime.now(timezone.utc).isoformat()
        valid_consent = None
        for c in active_consents:
            c_data = c.to_dict()
            if c_data.get("expires_at", "") > now_iso:
                valid_consent = c_data
                break

        if not valid_consent:
            await audit_logger.log_event(
                action="CONSENT_DENIED_HEALTH_RECORDS_ACCESS",
                resource_type="HealthRecord",
                resource_id=patient_id,
                actor_id=requester_id,
                actor_role=requester_role,
                status="UNAUTHORIZED_BLOCKED",
                ip_address=ip_address,
                details={"reason": "No active granted consent artifact found"}
            )
            return []

        # Consent granted - filter permitted record types
        allowed_types = valid_consent.get("allowed_record_types", [])
        all_records = self.get_records_for_patient(patient_id)
        permitted = [r for r in all_records if r.record_type in allowed_types]

        await audit_logger.log_event(
            action="CONSENT_AUTHORIZED_HEALTH_RECORDS_ACCESSED",
            resource_type="HealthRecord",
            resource_id=patient_id,
            actor_id=requester_id,
            actor_role=requester_role,
            status="SUCCESS",
            ip_address=ip_address,
            details={"consent_id": valid_consent.get("id"), "records_returned": len(permitted)}
        )

        return permitted

    def create_consent_request(self, req: ConsentRequest) -> ConsentResponse:
        consent_id = f"consent_{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc)
        exp = now + timedelta(hours=req.duration_hours)

        data = {
            "id": consent_id,
            "patient_id": req.patient_id,
            "requester_id": req.requester_id,
            "requester_name": req.requester_name,
            "requester_role": req.requester_role,
            "purpose": req.purpose,
            "allowed_record_types": req.allowed_record_types,
            "status": "PENDING",
            "granted_at": None,
            "expires_at": exp.isoformat(),
            "created_at": now.isoformat()
        }

        self.consents_col.document(consent_id).set(data)
        return ConsentResponse(**data)

    async def handle_consent_action(self, req: ConsentActionRequest, actor_id: str) -> Optional[ConsentResponse]:
        doc = self.consents_col.document(req.consent_id).get()
        if not doc.exists:
            return None

        c_data = doc.to_dict()
        if c_data.get("patient_id") != req.patient_id:
            return None

        if req.action == "GRANT":
            c_data["status"] = "GRANTED"
            c_data["granted_at"] = datetime.now(timezone.utc).isoformat()
        elif req.action == "REVOKE":
            c_data["status"] = "REVOKED"
        elif req.action == "REJECT":
            c_data["status"] = "REJECTED"

        self.consents_col.document(req.consent_id).set(c_data)

        await audit_logger.log_event(
            action=f"CONSENT_{req.action}",
            resource_type="ConsentArtifact",
            resource_id=req.consent_id,
            actor_id=actor_id,
            actor_role="Patient",
            status="SUCCESS",
            details={"action": req.action, "requester_id": c_data.get("requester_id")}
        )

        return ConsentResponse(**c_data)

    def get_patient_consents(self, patient_id: str) -> List[ConsentResponse]:
        docs = self.consents_col.where("patient_id", "==", patient_id).stream()
        return [ConsentResponse(**d.to_dict()) for d in docs]

health_record_service = HealthRecordService()
