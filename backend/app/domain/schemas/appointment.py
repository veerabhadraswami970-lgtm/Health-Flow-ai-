"""
HealthFlow AI - Appointment Booking Schemas (ABDM UHI)
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class AppointmentSlot(BaseModel):
    slot_id: str
    doctor_id: str
    doctor_name: str
    hospital_id: str
    hospital_name: str
    date: str  # YYYY-MM-DD
    time: str  # e.g., "10:00 AM"
    appointment_type: str  # Physical OPD | Teleconsultation
    is_available: bool = True

class AppointmentBookingRequest(BaseModel):
    doctor_id: str
    hospital_id: str
    patient_id: str
    patient_name: str
    patient_phone: str
    appointment_date: str
    appointment_time: str
    appointment_type: str = "Physical OPD"
    department: Optional[str] = None
    reason_for_visit: Optional[str] = "Regular Consultation"
    abha_address: Optional[str] = None

class AppointmentCancelRequest(BaseModel):
    appointment_id: str
    patient_id: str
    reason: str = "Patient requested cancellation"

class AppointmentRescheduleRequest(BaseModel):
    appointment_id: str
    patient_id: str
    new_date: str
    new_time: str

class AppointmentResponse(BaseModel):
    id: str
    uhi_booking_reference: str
    doctor_id: str
    doctor_name: str
    specialty: str
    hospital_id: str
    hospital_name: str
    patient_id: str
    patient_name: str
    patient_phone: str
    appointment_date: str
    appointment_time: str
    appointment_type: str
    reason_for_visit: str
    status: str  # CONFIRMED | RESCHEDULED | CANCELLED | COMPLETED
    created_at: str
    cancelled_at: Optional[str] = None
    cancellation_reason: Optional[str] = None
    qr_checkin_token: Optional[str] = None
    provider_source: str = "ABDM Unified Health Interface (UHI)"

