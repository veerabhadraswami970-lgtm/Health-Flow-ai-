"""
HealthFlow AI - Appointment Service
Coordinates provider lookups, slot validation, and booking lifecycle via ABDM UHI adapters.
"""
from typing import List, Optional
from app.core.config import settings
from app.domain.schemas.appointment import (
    AppointmentBookingRequest,
    AppointmentResponse,
    AppointmentCancelRequest,
    AppointmentRescheduleRequest
)
from app.integrations.abdm.uhi_adapter import MockBookingProvider, UHIProvider, BaseBookingProvider
from app.services.doctor_service import doctor_service
from app.services.hospital_service import hospital_service
from app.core.logger import logger

class AppointmentService:
    def __init__(self):
        if settings.USE_MOCK_INTEGRATIONS or not settings.ABDM_CLIENT_ID:
            self.provider: BaseBookingProvider = MockBookingProvider()
        else:
            self.provider = UHIProvider(
                client_id=settings.ABDM_CLIENT_ID,
                client_secret=settings.ABDM_CLIENT_SECRET or "",
                base_url=settings.ABDM_SANDBOX_BASE_URL
            )

    async def book_appointment(self, req: AppointmentBookingRequest) -> AppointmentResponse:
        doc = doctor_service.get_doctor_by_id(req.doctor_id)
        doctor_info = doc.model_dump() if doc else {"name": "Verified ABDM Doctor", "specialty": "General Medicine"}

        hosp = hospital_service.get_hospital_by_id(req.hospital_id)
        hospital_info = hosp.model_dump() if hosp else {"name": "Empaneled Hospital"}

        return await self.provider.book_appointment(req, doctor_info, hospital_info)

    async def cancel_appointment(self, req: AppointmentCancelRequest) -> Optional[AppointmentResponse]:
        return await self.provider.cancel_appointment(req)

    async def reschedule_appointment(self, req: AppointmentRescheduleRequest) -> Optional[AppointmentResponse]:
        return await self.provider.reschedule_appointment(req)

    def get_patient_appointments(self, patient_id: str) -> List[AppointmentResponse]:
        return self.provider.get_patient_appointments(patient_id)

appointment_service = AppointmentService()
