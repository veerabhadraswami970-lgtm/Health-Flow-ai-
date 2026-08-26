"""
HealthFlow AI - Secure QR Endpoints (Module 5)
"""
from fastapi import APIRouter, Request
from app.domain.schemas.qr import (
    QRGenerateRequest,
    QRGenerateResponse,
    QRVerifyRequest,
    QRVerifyResponse
)
from app.services.qr_service import qr_service

router = APIRouter(prefix="/qr", tags=["Secure QR Prescription"])

@router.post("/generate", response_model=QRGenerateResponse)
async def generate_qr(req: QRGenerateRequest):
    return qr_service.generate_prescription_qr(req)

@router.post("/verify", response_model=QRVerifyResponse)
async def verify_qr(req: QRVerifyRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    return await qr_service.verify_and_resolve_qr(req, ip_address=client_ip)
