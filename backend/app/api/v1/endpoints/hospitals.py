"""
HealthFlow AI - Hospital & Facility Discovery Endpoints (Module 8 - ABDM HFR)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.domain.schemas.hospital import HospitalResponse, HospitalSearchQuery
from app.services.hospital_service import hospital_service

router = APIRouter(prefix="/hospitals", tags=["Hospital & Facility Discovery (ABDM HFR)"])

@router.get("/search", response_model=List[HospitalResponse])
async def search_hospitals(
    query: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    facility_type: Optional[str] = Query(None),
    emergency_only: Optional[bool] = Query(None),
    scheme_id: Optional[str] = Query(None),
    has_dialysis: Optional[bool] = Query(None),
    has_blood_bank: Optional[bool] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(None)
):
    q = HospitalSearchQuery(
        query=query,
        city=city,
        state=state,
        facility_type=facility_type,
        emergency_only=emergency_only,
        scheme_id=scheme_id,
        has_dialysis=has_dialysis,
        has_blood_bank=has_blood_bank,
        latitude=lat,
        longitude=lng,
        radius_km=radius
    )
    return hospital_service.search_hospitals(q)


@router.get("/{hospital_id}", response_model=HospitalResponse)
async def get_hospital(hospital_id: str):
    hosp = hospital_service.get_hospital_by_id(hospital_id)
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found in ABDM HFR directory")
    return hosp
