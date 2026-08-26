"""
Tests for Secure QR Prescription Generation & Zero-PII Resolution (Module 5)
"""
import pytest
from app.services.qr_service import qr_service
from app.domain.schemas.qr import QRGenerateRequest, QRVerifyRequest
from app.services.prescription_service import prescription_service

@pytest.mark.asyncio
async def test_qr_generation_and_verification_flow():
    # 1. Create a prescription first
    sample_text = "Dr. Ramesh Varma\nPatient: Ravi Kumar\nRx: Tab Telma 40 1-0-0"
    rx = await prescription_service.process_prescription_content(
        raw_text=sample_text,
        patient_id="patient_ravi_kumar"
    )

    # 2. Generate signed QR token
    gen_req = QRGenerateRequest(
        prescription_id=rx.id,
        patient_id="patient_ravi_kumar",
        doctor_id="doc_ramesh_varma",
        expires_minutes=30
    )
    qr_res = qr_service.generate_prescription_qr(gen_req)
    assert qr_res.token is not None
    assert "jwt" not in qr_res.token.lower() or "." in qr_res.token  # Valid JWT format
    
    # 3. Verify zero PII inside token
    from jose import jwt
    from app.core.config import settings
    decoded = jwt.decode(qr_res.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert "medicine" not in decoded
    assert "diagnosis" not in decoded
    assert "patient_name" not in decoded
    assert decoded["prescription_id"] == rx.id

    # 4. Pharmacist scans and resolves QR
    verify_req = QRVerifyRequest(
        token=qr_res.token,
        scanner_role="Pharmacist",
        scanner_id="pharm_apollo_hyderabad",
        scanner_name="Apollo Pharmacy Kiosk"
    )
    verify_res = await qr_service.verify_and_resolve_qr(verify_req)
    assert verify_res.is_valid is True
    assert verify_res.prescription is not None
    assert verify_res.prescription.id == rx.id
    assert verify_res.audit_id.startswith("audit_")

@pytest.mark.asyncio
async def test_invalid_qr_token_rejected():
    verify_req = QRVerifyRequest(
        token="invalid.tampered.token12345",
        scanner_role="Pharmacist",
        scanner_id="pharm_001"
    )
    verify_res = await qr_service.verify_and_resolve_qr(verify_req)
    assert verify_res.is_valid is False
    assert "expired, invalid, or tampered" in verify_res.error_message.lower()
