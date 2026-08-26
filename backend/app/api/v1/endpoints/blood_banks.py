"""
HealthFlow AI - Blood Bank Endpoints (Module 10 - e-RaktKosh)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.domain.schemas.blood_bank import BloodBankResponse, BloodSearchQuery
from app.services.blood_bank_service import blood_bank_service

router = APIRouter(prefix="/blood-banks", tags=["Blood Bank & Inventory (e-RaktKosh)"])

@router.get("/search", response_model=List[BloodBankResponse])
async def search_blood_banks(
    blood_group: Optional[str] = Query(None, description="e.g. A+, O+, B-, AB+, Platelets, Plasma"),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    user_latitude: Optional[float] = Query(None),
    user_longitude: Optional[float] = Query(None)
):
    q = BloodSearchQuery(
        blood_group=blood_group,
        city=city,
        state=state,
        user_latitude=user_latitude,
        user_longitude=user_longitude
    )
    return blood_bank_service.search_blood_banks(q)

@router.get("/{bank_id}", response_model=BloodBankResponse)
async def get_blood_bank(bank_id: str):
    bank = blood_bank_service.get_blood_bank_by_id(bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found in e-RaktKosh directory")
    return bank
