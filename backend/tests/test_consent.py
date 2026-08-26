"""
Tests for Digital Health Records & Consent-Gated Access (Module 6)
"""
import pytest
from app.services.health_record_service import health_record_service
from app.domain.schemas.health_record import ConsentRequest, ConsentActionRequest

@pytest.mark.asyncio
async def test_health_records_patient_access():
    records = health_record_service.get_records_for_patient("patient_ravi_kumar")
    assert len(records) >= 2
    types = [r.record_type for r in records]
    assert "DiagnosticSummary" in types or "LabReport" in types

@pytest.mark.asyncio
async def test_doctor_access_blocked_without_consent():
    # External doctor attempts to access without granted consent
    records = await health_record_service.get_records_with_consent(
        patient_id="patient_ravi_kumar",
        requester_id="doc_external_unauthorized",
        requester_role="Doctor"
    )
    assert len(records) == 0

@pytest.mark.asyncio
async def test_consent_request_grant_and_access_lifecycle():
    # 1. Doctor requests consent
    c_req = ConsentRequest(
        patient_id="patient_ravi_kumar",
        requester_id="doc_ramesh_varma",
        requester_name="Dr. Ramesh Varma",
        requester_role="Doctor",
        purpose="Cardiology OPD Review",
        allowed_record_types=["DiagnosticSummary", "LabReport"],
        duration_hours=24
    )
    consent = health_record_service.create_consent_request(c_req)
    assert consent.status == "PENDING"

    # 2. Patient grants consent
    action_req = ConsentActionRequest(
        consent_id=consent.id,
        patient_id="patient_ravi_kumar",
        action="GRANT"
    )
    granted = await health_record_service.handle_consent_action(action_req, actor_id="patient_ravi_kumar")
    assert granted.status == "GRANTED"
    assert granted.granted_at is not None

    # 3. Doctor accesses health records successfully
    permitted_records = await health_record_service.get_records_with_consent(
        patient_id="patient_ravi_kumar",
        requester_id="doc_ramesh_varma",
        requester_role="Doctor"
    )
    assert len(permitted_records) >= 1
    for r in permitted_records:
        assert r.record_type in ["DiagnosticSummary", "LabReport"]
