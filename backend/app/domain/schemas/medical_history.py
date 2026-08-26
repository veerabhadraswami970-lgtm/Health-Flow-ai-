"""
HealthFlow AI - Medical History Schemas
Tracks previous medicines, hospitals, treatments, and prescriptions.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MedicalHistoryEntry(BaseModel):
    id: str
    patient_id: str
    hospital_id: str = ""
    hospital_name: str
    doctor_id: str = ""
    doctor_name: str
    date: str  # YYYY-MM-DD
    treatment_type: str  # OPD Consultation | Surgery | Inpatient | Lab Test | Follow-up
    diagnosis: str = ""
    medicines: List[str] = []
    procedures: List[str] = []
    notes: str = ""
    created_at: str = ""


class MedicalHistoryAddRequest(BaseModel):
    patient_id: str = "patient_ravi_kumar"
    hospital_id: Optional[str] = ""
    hospital_name: str = "NIMS Hyderabad"
    doctor_id: Optional[str] = ""
    doctor_name: str = "Dr. Ramesh Varma"
    date: str = "2026-08-01"
    treatment_type: str = "OPD Consultation"
    diagnosis: str = ""
    medicines: List[str] = []
    procedures: List[str] = []
    notes: str = ""


class MedicalHistoryResponse(BaseModel):
    patient_id: str
    total_entries: int
    entries: List[MedicalHistoryEntry]
