"""
HealthFlow AI - Appointment Booking Endpoints (Module 9 - ABDM UHI)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.domain.schemas.appointment import (
    AppointmentBookingRequest,
    AppointmentResponse,
    AppointmentCancelRequest,
    AppointmentRescheduleRequest
)
from app.services.appointment_service import appointment_service
from app.core.security import get_current_user_payload

router = APIRouter(prefix="/appointments", tags=["Appointment Booking (ABDM UHI)"])

@router.post("/book", response_model=AppointmentResponse)
async def book_appointment(
    req: AppointmentBookingRequest,
    current_user: dict = Depends(get_current_user_payload)
):
    return await appointment_service.book_appointment(req)

@router.post("/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    req: AppointmentCancelRequest,
    current_user: dict = Depends(get_current_user_payload)
):
    res = await appointment_service.cancel_appointment(req)
    if not res:
        raise HTTPException(status_code=404, detail="Appointment not found or already cancelled")
    return res

@router.post("/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    req: AppointmentRescheduleRequest,
    current_user: dict = Depends(get_current_user_payload)
):
    res = await appointment_service.reschedule_appointment(req)
    if not res:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return res

@router.get("/patient/{patient_id}", response_model=List[AppointmentResponse])
async def get_patient_appointments(patient_id: str):
    return appointment_service.get_patient_appointments(patient_id)
