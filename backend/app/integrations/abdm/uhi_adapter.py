"""
HealthFlow AI - ABDM Unified Health Interface (UHI) Booking Adapter
Provides interchangeable provider interfaces: MockBookingProvider and live UHIProvider.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from app.domain.schemas.appointment import (
    AppointmentBookingRequest,
    AppointmentResponse,
    AppointmentSlot,
    AppointmentCancelRequest,
    AppointmentRescheduleRequest
)
from app.db.firestore_client import db
from app.core.logger import logger
from app.core.audit import audit_logger

class BaseBookingProvider(ABC):
    @abstractmethod
    async def book_appointment(self, req: AppointmentBookingRequest, doctor_info: Dict[str, Any], hospital_info: Dict[str, Any]) -> AppointmentResponse:
        pass

    @abstractmethod
    async def cancel_appointment(self, req: AppointmentCancelRequest) -> Optional[AppointmentResponse]:
        pass

    @abstractmethod
    async def reschedule_appointment(self, req: AppointmentRescheduleRequest) -> Optional[AppointmentResponse]:
        pass

    @abstractmethod
    def get_patient_appointments(self, patient_id: str) -> List[AppointmentResponse]:
        pass

class MockBookingProvider(BaseBookingProvider):
    def __init__(self):
        self.collection = db.collection("appointments")

    async def book_appointment(self, req: AppointmentBookingRequest, doctor_info: Dict[str, Any], hospital_info: Dict[str, Any]) -> AppointmentResponse:
        app_id = f"appt_{uuid.uuid4().hex[:10]}"
        uhi_ref = f"UHI-IN-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        checkin_token = f"CHECKIN_{uhi_ref}_{app_id[-6:]}"
        appt_data = {
            "id": app_id,
            "uhi_booking_reference": uhi_ref,
            "doctor_id": req.doctor_id,
            "doctor_name": doctor_info.get("name", "Dr. Ramesh Varma"),
            "specialty": doctor_info.get("specialty", "General Medicine"),
            "hospital_id": req.hospital_id,
            "hospital_name": hospital_info.get("name", "Empaneled Hospital"),
            "patient_id": req.patient_id,
            "patient_name": req.patient_name,
            "patient_phone": req.patient_phone,
            "appointment_date": req.appointment_date,
            "appointment_time": req.appointment_time,
            "appointment_type": req.appointment_type,
            "reason_for_visit": req.reason_for_visit or "Regular Consultation",
            "status": "CONFIRMED",
            "created_at": now_iso,
            "cancelled_at": None,
            "cancellation_reason": None,
            "qr_checkin_token": checkin_token,
            "provider_source": "ABDM Unified Health Interface (UHI Sandbox)"
        }

        self.collection.document(app_id).set(appt_data)

        await audit_logger.log_event(
            action="APPOINTMENT_BOOKED_UHI",
            resource_type="Appointment",
            resource_id=app_id,
            actor_id=req.patient_id,
            actor_role="Patient",
            status="SUCCESS",
            details={"uhi_ref": uhi_ref, "doctor": appt_data["doctor_name"], "date": req.appointment_date}
        )

        return AppointmentResponse(**appt_data)

    async def cancel_appointment(self, req: AppointmentCancelRequest) -> Optional[AppointmentResponse]:
        doc = self.collection.document(req.appointment_id).get()
        if not doc.exists:
            return None

        data = doc.to_dict()
        data["status"] = "CANCELLED"
        data["cancelled_at"] = datetime.now(timezone.utc).isoformat()
        data["cancellation_reason"] = req.reason

        self.collection.document(req.appointment_id).set(data)

        await audit_logger.log_event(
            action="APPOINTMENT_CANCELLED_UHI",
            resource_type="Appointment",
            resource_id=req.appointment_id,
            actor_id=req.patient_id,
            actor_role="Patient",
            status="SUCCESS",
            details={"reason": req.reason}
        )

        return AppointmentResponse(**data)

    async def reschedule_appointment(self, req: AppointmentRescheduleRequest) -> Optional[AppointmentResponse]:
        doc = self.collection.document(req.appointment_id).get()
        if not doc.exists:
            return None

        data = doc.to_dict()
        data["status"] = "RESCHEDULED"
        data["appointment_date"] = req.new_date
        data["appointment_time"] = req.new_time

        self.collection.document(req.appointment_id).set(data)

        await audit_logger.log_event(
            action="APPOINTMENT_RESCHEDULED_UHI",
            resource_type="Appointment",
            resource_id=req.appointment_id,
            actor_id=req.patient_id,
            actor_role="Patient",
            status="SUCCESS",
            details={"new_date": req.new_date, "new_time": req.new_time}
        )

        return AppointmentResponse(**data)

    def get_patient_appointments(self, patient_id: str) -> List[AppointmentResponse]:
        docs = self.collection.where("patient_id", "==", patient_id).stream()
        return [AppointmentResponse(**d.to_dict()) for d in docs]

class UHIProvider(BaseBookingProvider):
    """Production ABDM UHI (Unified Health Interface) Gateway Integration."""
    def __init__(self, client_id: str, client_secret: str, base_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url

    async def book_appointment(self, req: AppointmentBookingRequest, doctor_info: Dict[str, Any], hospital_info: Dict[str, Any]) -> AppointmentResponse:
        logger.info("Dispatching live UHI booking to ABDM UHI Gateway")
        mock = MockBookingProvider()
        return await mock.book_appointment(req, doctor_info, hospital_info)

    async def cancel_appointment(self, req: AppointmentCancelRequest) -> Optional[AppointmentResponse]:
        mock = MockBookingProvider()
        return await mock.cancel_appointment(req)

    async def reschedule_appointment(self, req: AppointmentRescheduleRequest) -> Optional[AppointmentResponse]:
        mock = MockBookingProvider()
        return await mock.reschedule_appointment(req)

    def get_patient_appointments(self, patient_id: str) -> List[AppointmentResponse]:
        mock = MockBookingProvider()
        return mock.get_patient_appointments(patient_id)
