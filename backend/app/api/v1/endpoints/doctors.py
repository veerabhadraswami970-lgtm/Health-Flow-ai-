"""
HealthFlow AI - Doctor Discovery Endpoints (Module 7 - ABDM HPR)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.domain.schemas.doctor import DoctorResponse, DoctorSearchQuery
from app.services.doctor_service import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctor Discovery (ABDM HPR)"])

@router.get("/search", response_model=List[DoctorResponse])
async def search_doctors(
    query: Optional[str] = Query(None, description="Doctor name, hospital or keyword"),
    specialty: Optional[str] = Query(None, description="Cardiology, Pediatrics, Pulmonology, etc."),
    city: Optional[str] = Query(None, description="City"),
    state: Optional[str] = Query(None, description="State"),
    language: Optional[str] = Query(None, description="Preferred language")
):
    q = DoctorSearchQuery(query=query, specialty=specialty, city=city, state=state, language=language)
    return doctor_service.search_doctors(q)

@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: str):
    doc = doctor_service.get_doctor_by_id(doctor_id)
    if not doc:
        # Check provider
        all_docs = doctor_service.search_doctors(DoctorSearchQuery())
        for d in all_docs:
            if d.id == doctor_id or d.hpr_id == doctor_id:
                doc = d
                break
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found in ABDM HPR directory")
    return doc

@router.get("/{doctor_id}/alternatives", response_model=List[DoctorResponse])
async def get_alternative_doctors(doctor_id: str):
    """Returns AI-recommended alternative doctors when a selected doctor is on leave or unavailable."""
    return doctor_service.recommend_alternatives(doctor_id)
