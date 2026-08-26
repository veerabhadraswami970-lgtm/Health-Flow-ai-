"""
HealthFlow AI - Hospital & Facility Schemas (ABDM HFR)
Enriched with 3D visualization metadata, department lists, doctors,
and emergency capacity metrics.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HospitalResponse(BaseModel):
    id: str
    hfr_id: str
    name: str
    facility_type: str = "Multi-Specialty Tertiary Care Hospital"
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    helpline: str
    emergency_contact: str
    has_24_7_emergency: bool = True
    has_blood_bank: bool = True
    has_dialysis: bool = True
    has_icu: bool = True
    schemes_empaneled: List[str] = []
    specialties: List[str] = []
    departments: List[str] = []
    facilities: List[str] = []
    doctors_list: List[Dict[str, Any]] = []
    is_abdm_verified: bool = True
    total_beds: int = 450
    icu_beds: int = 60
    emergency_beds: int = 30
    rating: float = 4.8
    distance_km: float = 2.5
    open_status: str = "Open 24/7"
    opening_hours: str = "Open 24 Hours • Emergency & Outpatient Services Active"
    visual_theme_3d: Dict[str, Any] = Field(
        default_factory=lambda: {
            "building_type": "modern_medical_tower",
            "primary_color": "#0ea5e9",
            "accent_color": "#10b981",
            "floors": 12,
            "has_helipad": True,
            "glow": "rgba(14, 165, 233, 0.4)"
        }
    )
    status: str = "OPERATIONAL"


class HospitalSearchQuery(BaseModel):
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    facility_type: Optional[str] = None
    emergency_only: Optional[bool] = None
    scheme_id: Optional[str] = None
    has_dialysis: Optional[bool] = None
    has_blood_bank: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: Optional[float] = None

