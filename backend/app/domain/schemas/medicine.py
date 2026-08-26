"""
HealthFlow AI - Medicine Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class MedicineResponse(BaseModel):
    id: str
    generic_name: str
    brand_name: str
    composition: str
    strength: str
    dosage_form: str
    manufacturer: str
    indications: List[str]
    contraindications: List[str]
    known_interactions: List[str]
    warnings: str
    storage_info: str
    prescription_required: bool
    source: str
    last_verified: str

class MedicineSearchQuery(BaseModel):
    query: str
    dosage_form: Optional[str] = None
    prescription_required: Optional[bool] = None

class MedicineAIExplanationResponse(BaseModel):
    medicine: MedicineResponse
    database_verified_summary: str
    ai_plain_language_explanation: str
    safety_advisory: str
    disclaimer: str = "This information is for educational purposes. Never modify dosage or discontinue medication without consulting a qualified medical doctor."
