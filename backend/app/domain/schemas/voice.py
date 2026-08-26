"""
HealthFlow AI - Voice & Telephony Schemas
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class VoiceInteractionRequest(BaseModel):
    transcript: str
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    user_id: Optional[str] = "guest_patient"
    context: Optional[Dict[str, Any]] = None

class VoiceInteractionResponse(BaseModel):
    session_id: str
    trace_id: str
    transcript_received: str
    detected_language: str
    spoken_response: str
    tool_called: Optional[str] = None
    structured_data: Dict[str, Any] = {}
    timestamp: str

class TelephonyIncomingWebhookRequest(BaseModel):
    CallSid: str = Field(..., description="Unique call identifier from carrier")
    From: str = Field(..., description="Caller phone number e.g. +919876543210")
    To: str = Field(..., description="HealthFlow telephony inbound number")
    CallStatus: Optional[str] = "ringing"
    Digits: Optional[str] = None
    SpeechResult: Optional[str] = None
    Language: Optional[str] = "en-IN"

class TelephonyEventRequest(BaseModel):
    CallSid: str
    CallStatus: str
    Duration: Optional[int] = None
    Timestamp: Optional[str] = None

class TelephonyVerifyPinRequest(BaseModel):
    call_sid: str
    phone_number: str
    pin: str  # 4-digit security PIN
