"""
HealthFlow AI - Secure QR Schemas
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.domain.schemas.prescription import PrescriptionResponse

class QRGenerateRequest(BaseModel):
    prescription_id: str
    patient_id: str
    doctor_id: Optional[str] = "doc_ramesh_varma"
    expires_minutes: int = 30

class QRGenerateResponse(BaseModel):
    prescription_id: str
    token: str
    qr_payload: str  # Token string encoded into QR
    expires_at: str
    disclaimer: str = "This QR code contains only a cryptographically signed token and zero medical PII. Access requires authorized verification."

class QRVerifyRequest(BaseModel):
    token: str
    scanner_role: str = Field("Pharmacist", description="Pharmacist | Doctor | Patient | HospitalAdmin")
    scanner_id: str = Field("pharm_apollo_01", description="Identifier of scanner")
    scanner_name: Optional[str] = "Apollo Pharmacy Kiosk"

class QRVerifyResponse(BaseModel):
    is_valid: bool
    prescription: Optional[PrescriptionResponse] = None
    patient_id: Optional[str] = None
    error_message: Optional[str] = None
    audit_id: str
    scanned_at: str
