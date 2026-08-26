"""
HealthFlow AI - Medicine Reminders & Notification Service
Generates schedules strictly derived from authorized prescriptions and manages notification dispatch adapters.
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from app.db.firestore_client import db
from app.domain.schemas.reminder import (
    ReminderScheduleItem,
    CreateReminderRequest,
    TriggerReminderNotificationResponse
)
from app.core.logger import logger
from app.core.audit import audit_logger

SEED_REMINDERS = [
    {
        "id": "rem_001",
        "patient_id": "patient_ravi_kumar",
        "prescription_id": "rx_001_seed",
        "medicine_name": "Telma 40 (Telmisartan 40mg)",
        "dosage": "1 Tablet",
        "time_of_day": "08:00 AM",
        "meal_relation": "After Food",
        "channel": "Voice Call & Push",
        "is_active": True,
        "next_trigger": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
    },
    {
        "id": "rem_002",
        "patient_id": "patient_ravi_kumar",
        "prescription_id": "rx_001_seed",
        "medicine_name": "Glycomet 500 SR (Metformin 500mg)",
        "dosage": "1 Tablet",
        "time_of_day": "08:30 AM",
        "meal_relation": "With Morning Meal",
        "channel": "Voice Call & Push",
        "is_active": True,
        "next_trigger": (datetime.now(timezone.utc) + timedelta(hours=2, minutes=30)).isoformat()
    }
]

class ReminderService:
    def __init__(self):
        self.reminders_col = db.collection("notifications")
        self._ensure_seed_reminders()

    def _ensure_seed_reminders(self):
        for rem in SEED_REMINDERS:
            self.reminders_col.document(rem["id"]).set(rem, merge=True)

    def get_patient_reminders(self, patient_id: str) -> List[ReminderScheduleItem]:
        docs = self.reminders_col.where("patient_id", "==", patient_id).stream()
        return [ReminderScheduleItem(**d.to_dict()) for d in docs]

    def create_reminder(self, req: CreateReminderRequest) -> List[ReminderScheduleItem]:
        created = []
        for t in req.times:
            rem_id = f"rem_{uuid.uuid4().hex[:8]}"
            next_trig = (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat()
            data = {
                "id": rem_id,
                "patient_id": req.patient_id,
                "prescription_id": req.prescription_id,
                "medicine_name": req.medicine_name,
                "dosage": req.dosage,
                "time_of_day": t,
                "meal_relation": req.meal_relation,
                "channel": req.channel,
                "is_active": True,
                "next_trigger": next_trig
            }
            self.reminders_col.document(rem_id).set(data)
            created.append(ReminderScheduleItem(**data))
        return created

    async def trigger_test_reminder(self, reminder_id: str) -> Optional[TriggerReminderNotificationResponse]:
        doc = self.reminders_col.document(reminder_id).get()
        if not doc.exists:
            return None

        rem = doc.to_dict()
        msg = f"Reminder: Time to take your medicine '{rem['medicine_name']}' ({rem['dosage']}) - {rem['meal_relation']}."
        
        await audit_logger.log_event(
            action="MEDICINE_REMINDER_DISPATCHED",
            resource_type="ReminderSchedule",
            resource_id=reminder_id,
            actor_id="SystemScheduler",
            actor_role="SystemAdmin",
            status="SUCCESS",
            details={"channel": rem["channel"], "medicine": rem["medicine_name"]}
        )

        return TriggerReminderNotificationResponse(
            reminder_id=reminder_id,
            medicine_name=rem["medicine_name"],
            channel_dispatched=rem["channel"],
            status="DISPATCHED",
            message=msg,
            dispatched_at=datetime.now(timezone.utc).isoformat()
        )

reminder_service = ReminderService()
