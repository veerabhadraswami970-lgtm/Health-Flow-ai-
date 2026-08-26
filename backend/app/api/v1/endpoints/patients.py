"""
HealthFlow AI - Patient Profile Endpoints
"""
from fastapi import APIRouter
from typing import Dict, Any
from app.domain.schemas.patient import PatientProfile, PatientProfileUpdateRequest, PatientRegistrationRequest, PatientRegistrationResponse
from app.services.patient_service import patient_service

router = APIRouter(prefix="/patients", tags=["Patient Profile"])

@router.post("/register", response_model=PatientRegistrationResponse)
async def register_patient(req: PatientRegistrationRequest):
    """Register a new patient and return ID with optional QR."""
    try:
        result = patient_service.register_patient(req)
        return result
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

# Removed duplicate route - kept later definition


@router.get("/{patient_id}", response_model=PatientProfile)
async def get_patient_profile(patient_id: str):
    profile = patient_service.get_patient_profile(patient_id)
    if not profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return profile


@router.put("/{patient_id}", response_model=PatientProfile)
async def update_patient_profile(patient_id: str, update: PatientProfileUpdateRequest):
    result = patient_service.update_patient_profile(patient_id, update)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to update patient profile")
    return result


@router.get("/{patient_id}/emergency-contacts")
async def get_emergency_contacts(patient_id: str) -> Dict[str, Any]:
    return patient_service.get_emergency_contacts(patient_id)
