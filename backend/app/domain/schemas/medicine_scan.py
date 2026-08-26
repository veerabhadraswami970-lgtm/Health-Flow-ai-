"""
HealthFlow AI - Medicine Scan Schema
Defines response models for AI-based image scanning of medicines.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class MedicineScanItem(BaseModel):
    name: str
    confidence: float

class MedicineScanResponse(BaseModel):
    scan_id: str
    patient_id: Optional[str] = None
    items: List[MedicineScanItem]
    scanned_at: datetime
