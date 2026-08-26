"""
HealthFlow AI - Doctor Schemas (ABDM HPR)
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class DoctorResponse(BaseModel):
    id: str
    hpr_id: str
    name: str
    qualification: str
    specialty: str
    sub_specialties: List[str] = []
    experience_years: int
    languages: List[str]
    hospital_id: str
    hospital_name: str
    city: str
    state: str
    consultation_fee: float
    is_abdm_verified: bool
    available_days: List[str]
    slots: List[str]
    appointment_types: List[str]
    contact: str
    rating: float = 4.8
    is_on_leave: bool = False
    leave_reason: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorSearchQuery(BaseModel):
    query: Optional[str] = None
    specialty: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None
    appointment_type: Optional[str] = None
