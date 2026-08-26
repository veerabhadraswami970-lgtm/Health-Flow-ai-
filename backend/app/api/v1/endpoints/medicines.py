"""
HealthFlow AI - Medicine Intelligence Endpoints (Module 4)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.domain.schemas.medicine import MedicineResponse, MedicineAIExplanationResponse
from app.services.medicine_service import medicine_service

router = APIRouter(prefix="/medicines", tags=["Medicine Intelligence"])

@router.get("/search", response_model=List[MedicineResponse])
async def search_medicines(query: str = Query("", description="Search by brand name, generic name, or composition")):
    return medicine_service.search_medicines(query=query)

@router.get("/{medicine_id}", response_model=MedicineAIExplanationResponse)
async def get_medicine_explanation(medicine_id: str):
    exp = medicine_service.get_plain_language_explanation(medicine_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Medicine not found in verified database")
    return exp
from app.domain.schemas.medicine_scan import MedicineScanResponse
from app.services.medicine_scanner_service import medicine_scanner_service

@router.post("/scan", response_model=MedicineScanResponse)
async def scan_medicine_image(file: UploadFile = File(...)):
    """Accept an image of a medicine and return identified items with confidence scores."""
    return await medicine_scanner_service.scan_image(file)
