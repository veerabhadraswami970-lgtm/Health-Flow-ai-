"""
HealthFlow AI - Secure QR Prescription Token Service
Generates zero-PII signed QR tokens and handles cryptographically verified access resolution with audit logging.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import create_signed_qr_token
from app.core.audit import audit_logger
from app.domain.schemas.qr import (
    QRGenerateRequest,
    QRGenerateResponse,
    QRVerifyRequest,
    QRVerifyResponse
)
from app.services.prescription_service import prescription_service
from app.core.logger import logger

class QRService:
    def generate_prescription_qr(self, req: QRGenerateRequest) -> QRGenerateResponse:
        token = create_signed_qr_token(
            prescription_id=req.prescription_id,
            patient_id=req.patient_id,
            doctor_id=req.doctor_id or "doc_ramesh_varma",
            expires_minutes=req.expires_minutes
        )
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_dt = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()

        return QRGenerateResponse(
            prescription_id=req.prescription_id,
            token=token,
            qr_payload=token,
            expires_at=exp_dt
        )

    async def verify_and_resolve_qr(self, req: QRVerifyRequest, ip_address: str = "127.0.0.1") -> QRVerifyResponse:
        try:
            payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_type = payload.get("type")
            if token_type != "secure_qr_prescription":
                audit_entry = await audit_logger.log_event(
                    action="QR_SCAN_INVALID_TOKEN_TYPE",
                    resource_type="Prescription",
                    resource_id="UNKNOWN",
                    actor_id=req.scanner_id,
                    actor_role=req.scanner_role,
                    status="FAILED",
                    ip_address=ip_address,
                    details={"error": "Token type mismatch"}
                )
                return QRVerifyResponse(
                    is_valid=False,
                    error_message="Invalid QR token format for prescription retrieval.",
                    audit_id=audit_entry["id"],
                    scanned_at=datetime.now(timezone.utc).isoformat()
                )

            prescription_id = payload.get("prescription_id")
            patient_id = payload.get("patient_id")

            # Retrieve prescription
            prescription = prescription_service.get_prescription_by_id(prescription_id)
            if not prescription:
                audit_entry = await audit_logger.log_event(
                    action="QR_SCAN_PRESCRIPTION_NOT_FOUND",
                    resource_type="Prescription",
                    resource_id=prescription_id,
                    actor_id=req.scanner_id,
                    actor_role=req.scanner_role,
                    status="FAILED",
                    ip_address=ip_address
                )
                return QRVerifyResponse(
                    is_valid=False,
                    error_message="Prescription record not found or has been revoked.",
                    audit_id=audit_entry["id"],
                    scanned_at=datetime.now(timezone.utc).isoformat()
                )

            audit_entry = await audit_logger.log_event(
                action="QR_PRESCRIPTION_ACCESSED",
                resource_type="Prescription",
                resource_id=prescription_id,
                actor_id=req.scanner_id,
                actor_role=req.scanner_role,
                status="SUCCESS",
                ip_address=ip_address,
                details={"patient_id": patient_id, "scanner_name": req.scanner_name}
            )

            return QRVerifyResponse(
                is_valid=True,
                prescription=prescription,
                patient_id=patient_id,
                audit_id=audit_entry["id"],
                scanned_at=datetime.now(timezone.utc).isoformat()
            )

        except JWTError as e:
            audit_entry = await audit_logger.log_event(
                action="QR_SCAN_EXPIRED_OR_TAMPERED",
                resource_type="Prescription",
                resource_id="UNKNOWN",
                actor_id=req.scanner_id,
                actor_role=req.scanner_role,
                status="SECURITY_ALERT",
                ip_address=ip_address,
                details={"jwt_error": str(e)}
            )
            return QRVerifyResponse(
                is_valid=False,
                error_message=f"QR token is expired, invalid, or tampered: {str(e)}",
                audit_id=audit_entry["id"],
                scanned_at=datetime.now(timezone.utc).isoformat()
            )

qr_service = QRService()
