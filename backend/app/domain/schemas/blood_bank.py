"""
HealthFlow AI - Blood Bank Schemas (e-RaktKosh)
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class BloodBankResponse(BaseModel):
    id: str
    name: str
    address: str
    city: str
    state: str
    latitude: float
    longitude: float
    contact_phone: str
    helpline: str
    inventory: Dict[str, int] = Field(description="Blood group units e.g. {'A+': 15, 'O+': 25, 'Platelets': 10}")
    source: str = "e-RaktKosh (National Blood Transfusion Council)"
    source_url: str = "https://eraktkosh.mohfw.gov.in"
    last_updated: str
    is_verified: bool = True
    is_24_7: bool = True
    is_cached: bool = False

class BloodSearchQuery(BaseModel):
    blood_group: Optional[str] = None  # e.g., A+, A-, B+, B-, AB+, AB-, O+, O-, Platelets, Plasma
    city: Optional[str] = None
    state: Optional[str] = None
    radius_km: Optional[float] = 50.0
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
