"""
HealthFlow AI - Emergency Assistance Endpoints (Module 15)
"""
from fastapi import APIRouter
from app.domain.schemas.emergency import EmergencyAlertRequest, EmergencySOSResponse
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/emergency", tags=["Emergency Assistance & Triage"])

@router.post("/sos", response_model=EmergencySOSResponse)
async def trigger_emergency_sos(req: EmergencyAlertRequest):
    return await emergency_service.trigger_emergency_sos(req)
