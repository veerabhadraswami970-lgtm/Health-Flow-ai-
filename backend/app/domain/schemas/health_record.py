"""
HealthFlow AI - Digital Health Records & Consent Schemas
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class HealthRecordItem(BaseModel):
    id: str
    patient_id: str
    record_type: str  # Prescription | LabReport | DiagnosticSummary | HospitalVisit | Immunization
    title: str
    facility_name: str
    doctor_name: Optional[str] = None
    date: str
    summary: str
    details: Dict[str, Any] = {}
    document_url: Optional[str] = None
    created_at: str

class ConsentRequest(BaseModel):
    patient_id: str
    requester_id: str  # e.g., Doctor HPR ID or Hospital HFR ID
    requester_name: str
    requester_role: str  # Doctor | HospitalAdmin | Pharmacist
    purpose: str  # Consultation | Emergency Care | Scheme Verification | Pharmacy Dispensation
    allowed_record_types: List[str] = ["Prescription", "LabReport", "DiagnosticSummary"]
    duration_hours: int = Field(default=24, ge=1, le=720)

class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    requester_id: str
    requester_name: str
    requester_role: str
    purpose: str
    allowed_record_types: List[str]
    status: str  # PENDING | GRANTED | REVOKED | EXPIRED
    granted_at: Optional[str] = None
    expires_at: str
    created_at: str

class ConsentActionRequest(BaseModel):
    consent_id: str
    patient_id: str
    action: str  # GRANT | REVOKE | REJECT
