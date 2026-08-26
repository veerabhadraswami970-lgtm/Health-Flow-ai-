"""
HealthFlow AI - Health QR Schemas
My Health QR — patient-controlled secure health summary access via QR tokens.
Separate from Prescription QR (which remains unchanged).
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HealthQRGenerateRequest(BaseModel):
    patient_id: str = "patient_ravi_kumar"
    expires_minutes: int = Field(default=1440, description="Token validity in minutes (default 24 hours)")


class HealthQRGenerateResponse(BaseModel):
    qr_id: str
    patient_id: str
    token: str
    qr_payload: str
    expires_at: str
    created_at: str
    is_active: bool = True
    disclaimer: str = "This Health QR contains only a secure token. No medical data is stored in the QR code. Scanning requires backend authorization."


class HealthQRScanRequest(BaseModel):
    token: str
    scanner_role: str = Field("Doctor", description="Doctor | HospitalAdmin | Paramedic")
    scanner_id: str = Field("doc_ramesh_varma", description="Identifier of scanner")
    scanner_name: Optional[str] = "Hospital Scanner"


class HealthQRScanResponse(BaseModel):
    is_valid: bool
    is_authorized: bool = False
    patient_name: Optional[str] = None
    blood_group: Optional[str] = None
    known_allergies: List[str] = []
    existing_diseases: List[str] = []
    previous_medicines: List[str] = []
    previous_hospitals: List[str] = []
    previous_treatments: List[Dict[str, Any]] = []
    emergency_contacts: List[Dict[str, str]] = []
    error_message: Optional[str] = None
    audit_id: str = ""
    scanned_at: str = ""


class HealthQRRevokeRequest(BaseModel):
    qr_id: str
    patient_id: str = "patient_ravi_kumar"


class HealthQRActiveResponse(BaseModel):
    patient_id: str
    active_qrs: List[HealthQRGenerateResponse]
    total: int
