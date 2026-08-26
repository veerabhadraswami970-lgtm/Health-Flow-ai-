"""
Tests for Prescription Analysis, OCR entity extraction, and Human Verification (Module 3 & 4)
"""
import pytest
from app.services.prescription_service import prescription_service
from app.services.medicine_service import medicine_service
from app.domain.schemas.prescription import PrescriptionVerificationUpdate

@pytest.mark.asyncio
async def test_prescription_ocr_processing():
    sample_text = """
    Dr. Ramesh Varma, MD, DM (Cardiology) - NIMS Hyderabad
    Patient: Ravi Kumar, Age: 48 yrs, Date: 2026-08-19
    Dx: Hypertension & Type 2 Diabetes
    Rx:
    1. Tab Telma 40 1-0-0 (Morning) x 30 days
    2. Tab Dolo 650 1-0-1 (SOS) x 5 days
    3. Tab Glycomet 500 1-0-0 x 30 days
    """
    res = await prescription_service.process_prescription_content(
        raw_text=sample_text,
        patient_id="patient_ravi_kumar"
    )

    assert res.id.startswith("rx_")
    assert res.patient_name == "Ravi Kumar"
    assert len(res.items) >= 2
    assert res.overall_ocr_confidence > 0.80
    assert res.secure_qr_token is not None

    # Verify medicine database matching
    telma_item = next((i for i in res.items if "Telma" in i.medicine_name), None)
    assert telma_item is not None
    assert telma_item.generic_name is not None

@pytest.mark.asyncio
async def test_prescription_human_verification():
    sample_text = "Dr. Priya Sharma\nPatient: Test User\nRx: Unknown Cursive Script"
    res = await prescription_service.process_prescription_content(
        raw_text=sample_text,
        patient_id="patient_test_01"
    )

    # If any item has low confidence, status is ANALYZED_PENDING_REVIEW
    if any(i.needs_human_verification for i in res.items):
        assert res.status == "ANALYZED_PENDING_REVIEW"

    # Doctor verifies the prescription
    update_req = PrescriptionVerificationUpdate(
        verified_by_doctor_id="doc_ramesh_varma",
        notes="Verified and approved all dosage intervals"
    )
    verified_res = await prescription_service.verify_prescription(
        prescription_id=res.id,
        update=update_req,
        actor_id="doc_ramesh_varma",
        actor_role="Doctor"
    )
    assert verified_res.status == "VERIFIED_BY_PROFESSIONAL"
    assert verified_res.verified_at is not None
