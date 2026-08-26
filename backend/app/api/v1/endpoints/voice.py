"""
HealthFlow AI - AI Voice & Telephony Endpoints (Module 11 & Module 12)
"""
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.domain.schemas.voice import (
    VoiceInteractionRequest,
    VoiceInteractionResponse,
    TelephonyIncomingWebhookRequest,
    TelephonyEventRequest,
    TelephonyVerifyPinRequest
)
from app.services.voice_service import voice_service
from app.services.telephony_service import telephony_service

router = APIRouter(prefix="/voice", tags=["AI Voice & Telephony Assistant"])

@router.post("/interact", response_model=VoiceInteractionResponse)
async def interact_voice(req: VoiceInteractionRequest):
    return await voice_service.handle_voice_interaction(req)

@router.post("/incoming")
async def telephony_incoming_call(req: TelephonyIncomingWebhookRequest):
    """
    Telephony Carrier Webhook (Twilio / Exotel / Local Simulator)
    Invoked when caller connects.
    """
    return await telephony_service.handle_incoming_call(req)

@router.post("/verify-pin")
async def telephony_verify_pin(req: TelephonyVerifyPinRequest):
    """
    Voice OTP/PIN Verification challenge to access sensitive health records over phone.
    """
    return await telephony_service.verify_voice_pin(req)

@router.post("/events")
async def telephony_event_webhook(req: TelephonyEventRequest):
    return await telephony_service.handle_call_event(req)

@router.get("/call-logs", response_model=List[Dict[str, Any]])
async def get_telephony_call_logs():
    """Retrieve all telephony call logs for debugging/monitoring purposes."""
    return telephony_service.get_all_call_logs()

@router.post("/call-complete")
async def telephony_call_complete(call_sid: str):
    return await telephony_service.handle_call_complete(call_sid)
