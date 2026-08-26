"""
HealthFlow AI - Digital Health Records & Consent-Gated Endpoints (Module 6)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from app.domain.schemas.health_record import (
    HealthRecordItem,
    ConsentRequest,
    ConsentResponse,
    ConsentActionRequest
)
from app.services.health_record_service import health_record_service
from app.core.security import get_current_user_payload

router = APIRouter(prefix="/health-records", tags=["Digital Health Records & Consents"])

@router.get("", response_model=List[HealthRecordItem])
async def get_my_records(
    patient_id: str = Query("patient_ravi_kumar"),
    current_user: dict = Depends(get_current_user_payload)
):
    return health_record_service.get_records_for_patient(patient_id)

@router.post("/access-with-consent", response_model=List[HealthRecordItem])
async def access_records_with_consent(
    patient_id: str,
    requester_id: str,
    requester_role: str,
    request: Request
):
    ip = request.client.host if request.client else "127.0.0.1"
    records = await health_record_service.get_records_with_consent(
        patient_id=patient_id,
        requester_id=requester_id,
        requester_role=requester_role,
        ip_address=ip
    )
    return records

@router.post("/consents/request", response_model=ConsentResponse)
async def create_consent_request(req: ConsentRequest):
    return health_record_service.create_consent_request(req)

@router.post("/consents/action", response_model=ConsentResponse)
async def act_on_consent(
    req: ConsentActionRequest,
    current_user: dict = Depends(get_current_user_payload)
):
    actor_id = current_user.get("sub", req.patient_id)
    res = await health_record_service.handle_consent_action(req, actor_id=actor_id)
    if not res:
        raise HTTPException(status_code=404, detail="Consent request not found or unauthorized")
    return res

@router.get("/consents/patient/{patient_id}", response_model=List[ConsentResponse])
async def get_patient_consents(patient_id: str):
    return health_record_service.get_patient_consents(patient_id)
