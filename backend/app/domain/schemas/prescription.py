"""
HealthFlow AI - Prescription Schemas
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PrescribedItem(BaseModel):
    id: str
    medicine_name: str
    strength: Optional[str] = None
    dosage_form: Optional[str] = "Tablet"
    frequency: str = "1-0-1"  # e.g., OD (Once daily), BD (Twice daily), TDS, 1-0-1
    duration: str = "5 days"
    food_timing: str = "After food"
    instructions: Optional[str] = None
    ocr_confidence: float = Field(..., ge=0.0, le=1.0)
    needs_human_verification: bool = False
    matched_medicine_id: Optional[str] = None
    generic_name: Optional[str] = None

class PrescriptionVerificationUpdate(BaseModel):
    verified_by_doctor_id: Optional[str] = None
    verified_by_pharmacist_id: Optional[str] = None
    notes: Optional[str] = None
    corrected_items: Optional[List[PrescribedItem]] = None

class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    patient_age: Optional[int] = None
    doctor_id: Optional[str] = None
    doctor_name: str
    doctor_qualification: Optional[str] = None
    doctor_registration_no: Optional[str] = None
    clinic_or_hospital: Optional[str] = None
    prescription_date: str
    diagnosis: Optional[str] = None
    items: List[PrescribedItem]
    overall_ocr_confidence: float
    status: str  # ANALYZED_PENDING_REVIEW | VERIFIED_BY_PROFESSIONAL | REJECTED
    original_file_url: Optional[str] = None
    created_at: str
    verified_at: Optional[str] = None
    verification_notes: Optional[str] = None
    secure_qr_token: Optional[str] = None
    attached_scans: Optional[List[Dict[str, Any]]] = None

# New schema for scan‑prep initiation response
class ScanPrepResponse(BaseModel):
    items: List[Dict[str, Any]] = Field(..., description="Parsed prescription items with confidence scores")
    needs_verification: bool = Field(..., description="True if any item requires human verification")
    parsed_data: Dict[str, Any] = Field(..., description="Other parsed fields such as doctor, patient, diagnosis")
