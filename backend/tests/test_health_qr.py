"""
Tests for My Health QR Generation, Scanning, Verification, and Revocation
"""
import pytest
from jose import jwt
from app.core.config import settings
from app.services.health_qr_service import health_qr_service
from app.domain.schemas.health_qr import (
    HealthQRGenerateRequest,
    HealthQRScanRequest,
    HealthQRRevokeRequest,
)

@pytest.mark.asyncio
async def test_health_qr_generation_and_scan_flow():
    # 1. Generate a Health QR for demo patient
    gen_req = HealthQRGenerateRequest(
        patient_id="patient_ravi_kumar",
        expires_minutes=60
    )
    gen_res = health_qr_service.generate_health_qr(gen_req)
    
    assert gen_res.qr_id.startswith("hqr_")
    assert gen_res.patient_id == "patient_ravi_kumar"
    assert gen_res.token is not None
    assert gen_res.is_active is True

    # 2. Verify token is signed JWT and contains zero raw PII
    decoded = jwt.decode(gen_res.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["qr_id"] == gen_res.qr_id
    assert decoded["patient_id"] == "patient_ravi_kumar"
    assert decoded["type"] == "health_qr"
    assert "blood_group" not in decoded
    assert "allergies" not in decoded

    # 3. Doctor/Hospital scans the Health QR
    scan_req = HealthQRScanRequest(
        token=gen_res.token,
        scanner_role="Doctor",
        scanner_id="doc_ramesh_varma",
        scanner_name="Dr. Ramesh Varma (NIMS Cardiology)"
    )
    scan_res = await health_qr_service.scan_health_qr(scan_req)

    assert scan_res.is_valid is True
    assert scan_res.is_authorized is True
    assert scan_res.patient_name == "Ravi Kumar"
    assert scan_res.blood_group == "B+"
    assert "Penicillin" in scan_res.known_allergies
    assert "Type 2 Diabetes" in scan_res.existing_diseases
    assert len(scan_res.previous_medicines) > 0
    assert len(scan_res.previous_hospitals) > 0
    assert len(scan_res.previous_treatments) > 0
    assert len(scan_res.emergency_contacts) > 0
    assert scan_res.audit_id.startswith("audit_")

@pytest.mark.asyncio
async def test_health_qr_revocation_flow():
    # 1. Generate QR
    gen_req = HealthQRGenerateRequest(
        patient_id="patient_ravi_kumar",
        expires_minutes=30
    )
    gen_res = health_qr_service.generate_health_qr(gen_req)

    # 2. Revoke the QR
    revoke_req = HealthQRRevokeRequest(
        qr_id=gen_res.qr_id,
        patient_id="patient_ravi_kumar"
    )
    revoked = await health_qr_service.revoke_health_qr(revoke_req)
    assert revoked is True

    # 3. Scanning revoked QR must be rejected
    scan_req = HealthQRScanRequest(
        token=gen_res.token,
        scanner_role="Doctor",
        scanner_id="doc_ramesh_varma"
    )
    scan_res = await health_qr_service.scan_health_qr(scan_req)
    assert scan_res.is_valid is False
    assert "revoked" in scan_res.error_message.lower()

@pytest.mark.asyncio
async def test_health_qr_invalid_token_rejected():
    scan_req = HealthQRScanRequest(
        token="invalid.malformed.token_here",
        scanner_role="Doctor",
        scanner_id="doc_001"
    )
    scan_res = await health_qr_service.scan_health_qr(scan_req)
    assert scan_res.is_valid is False
    assert scan_res.is_authorized is False
