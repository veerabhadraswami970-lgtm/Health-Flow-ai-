"""
HealthFlow AI - Health QR Endpoints
My Health QR — separate from Prescription QR (which remains untouched).
"""
from fastapi import APIRouter, HTTPException
from app.domain.schemas.health_qr import (
    HealthQRGenerateRequest,
    HealthQRGenerateResponse,
    HealthQRScanRequest,
    HealthQRScanResponse,
    HealthQRRevokeRequest,
    HealthQRActiveResponse,
)
from app.services.health_qr_service import health_qr_service

router = APIRouter(prefix="/health-qr", tags=["My Health QR"])


@router.post("/generate", response_model=HealthQRGenerateResponse)
async def generate_health_qr(req: HealthQRGenerateRequest):
    return health_qr_service.generate_health_qr(req)


@router.post("/scan", response_model=HealthQRScanResponse)
async def scan_health_qr(req: HealthQRScanRequest):
    return await health_qr_service.scan_health_qr(req)


@router.post("/revoke")
async def revoke_health_qr(req: HealthQRRevokeRequest):
    success = await health_qr_service.revoke_health_qr(req)
    if not success:
        raise HTTPException(status_code=404, detail="Health QR not found or not authorized to revoke.")
    return {"status": "revoked", "qr_id": req.qr_id}


@router.get("/active/{patient_id}", response_model=HealthQRActiveResponse)
async def get_active_qrs(patient_id: str):
    return health_qr_service.get_active_qrs(patient_id)
