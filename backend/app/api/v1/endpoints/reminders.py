"""
HealthFlow AI - Medicine Reminders Endpoints (Module 14)
"""
from typing import List
from fastapi import APIRouter, HTTPException
from app.domain.schemas.reminder import (
    ReminderScheduleItem,
    CreateReminderRequest,
    TriggerReminderNotificationResponse
)
from app.services.reminder_service import reminder_service

router = APIRouter(prefix="/reminders", tags=["Medicine Reminders"])

@router.get("/patient/{patient_id}", response_model=List[ReminderScheduleItem])
async def get_patient_reminders(patient_id: str):
    return reminder_service.get_patient_reminders(patient_id)

@router.post("/create", response_model=List[ReminderScheduleItem])
async def create_reminder(req: CreateReminderRequest):
    return reminder_service.create_reminder(req)

@router.post("/{reminder_id}/trigger", response_model=TriggerReminderNotificationResponse)
async def trigger_test_reminder(reminder_id: str):
    res = await reminder_service.trigger_test_reminder(reminder_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return res
