"""
Tests for ABDM UHI Appointment Booking Flow (Module 9)
"""
import pytest
from app.services.appointment_service import appointment_service
from app.domain.schemas.appointment import (
    AppointmentBookingRequest,
    AppointmentCancelRequest,
    AppointmentRescheduleRequest
)

@pytest.mark.asyncio
async def test_appointment_booking_and_cancellation():
    req = AppointmentBookingRequest(
        doctor_id="doc_ramesh_varma",
        hospital_id="hosp_nims_hyd",
        patient_id="patient_ravi_kumar",
        patient_name="Ravi Kumar",
        patient_phone="+919876543210",
        appointment_date="2026-08-25",
        appointment_time="10:00 AM",
        appointment_type="Physical OPD",
        reason_for_visit="Hypertension review"
    )
    appt = await appointment_service.book_appointment(req)
    assert appt.id.startswith("appt_")
    assert appt.uhi_booking_reference.startswith("UHI-IN-")
    assert appt.status == "CONFIRMED"
    assert appt.doctor_name == "Dr. Ramesh Varma"

    # Reschedule
    resched_req = AppointmentRescheduleRequest(
        appointment_id=appt.id,
        patient_id="patient_ravi_kumar",
        new_date="2026-08-26",
        new_time="11:30 AM"
    )
    rescheduled = await appointment_service.reschedule_appointment(resched_req)
    assert rescheduled.status == "RESCHEDULED"
    assert rescheduled.appointment_date == "2026-08-26"

    # Cancel
    cancel_req = AppointmentCancelRequest(
        appointment_id=appt.id,
        patient_id="patient_ravi_kumar",
        reason="Work conflict"
    )
    cancelled = await appointment_service.cancel_appointment(cancel_req)
    assert cancelled.status == "CANCELLED"
    assert cancelled.cancelled_at is not None
