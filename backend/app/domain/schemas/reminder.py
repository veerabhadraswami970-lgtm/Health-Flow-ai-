"""
HealthFlow AI - Medicine Reminders Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class ReminderScheduleItem(BaseModel):
    id: str
    patient_id: str
    prescription_id: Optional[str] = None
    medicine_name: str
    dosage: str
    time_of_day: str  # e.g., "08:00 AM", "01:00 PM", "08:00 PM"
    meal_relation: str  # Before Food | After Food
    channel: str = "Voice Call & Push"  # Voice Call | SMS | Push Notification | WhatsApp
    is_active: bool = True
    next_trigger: str

class CreateReminderRequest(BaseModel):
    patient_id: str
    prescription_id: Optional[str] = None
    medicine_name: str
    dosage: str
    times: List[str] = ["08:00 AM", "08:00 PM"]
    meal_relation: str = "After Food"
    channel: str = "Voice Call & Push"

class TriggerReminderNotificationResponse(BaseModel):
    reminder_id: str
    medicine_name: str
    channel_dispatched: str
    status: str
    message: str
    dispatched_at: str
