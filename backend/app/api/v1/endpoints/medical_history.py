"""
HealthFlow AI - Medical History Endpoints
"""
from fastapi import APIRouter
from app.domain.schemas.medical_history import (
    MedicalHistoryEntry,
    MedicalHistoryAddRequest,
    MedicalHistoryResponse,
)
from app.services.medical_history_service import medical_history_service
from typing import List

router = APIRouter(prefix="/medical-history", tags=["Medical History"])


@router.get("/{patient_id}", response_model=MedicalHistoryResponse)
async def get_patient_history(patient_id: str):
    return medical_history_service.get_patient_history(patient_id)


@router.post("", response_model=MedicalHistoryEntry)
async def add_history_entry(req: MedicalHistoryAddRequest):
    return medical_history_service.add_history_entry(req)


@router.get("/{patient_id}/medicines", response_model=List[str])
async def get_patient_medicines(patient_id: str):
    return medical_history_service.get_patient_medicines(patient_id)


@router.get("/{patient_id}/hospitals", response_model=List[str])
async def get_patient_hospitals(patient_id: str):
    return medical_history_service.get_patient_hospitals(patient_id)
