"""
HealthFlow AI - Telephony & Phone Call Assistant Service
Handles IVR state machine, telephony provider adapters, and Voice OTP/PIN authentication for private health data.
"""
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from app.db.firestore_client import db
from app.core.audit import audit_logger
from app.core.logger import logger
from app.ai.orchestrator import ai_orchestrator
from app.services.prescription_service import prescription_service
from app.domain.schemas.voice import (
    TelephonyIncomingWebhookRequest,
    TelephonyEventRequest,
    TelephonyVerifyPinRequest
)

# Demo verified phone to PIN mapping
VERIFIED_PHONE_PINS = {
    "+919876543210": {"pin": "1234", "patient_id": "patient_ravi_kumar", "name": "Ravi Kumar"},
    "9876543210": {"pin": "1234", "patient_id": "patient_ravi_kumar", "name": "Ravi Kumar"}
}

class TelephonyService:
    def __init__(self):
        self.calls_col = db.collection("voice_calls")

    async def handle_incoming_call(self, req: TelephonyIncomingWebhookRequest) -> Dict[str, Any]:
        call_id = req.CallSid
        now_iso = datetime.now(timezone.utc).isoformat()

        # Check if caller pressed an IVR digit
        digit = req.Digits or ""
        speech = req.SpeechResult or ""
        
        # IVR State determination
        if digit == "0" or "emergency" in speech.lower():
            response_text = "EMERGENCY ACTIVATED. Routing to National Emergency Service 112 and Ambulance 108 immediately."
            next_state = "EMERGENCY_ROUTED"
        elif digit == "1" or "scheme" in speech.lower():
            response_text = "You have selected Government Health Schemes. AB-PMJAY offers up to 5 Lakh rupees and Dr. YSR Aarogyasri covers up to 25 Lakh rupees for catastrophic illness. What disease or treatment do you need assistance with?"
            next_state = "SCHEME_PROMPT"
        elif digit == "2" or "blood" in speech.lower():
            response_text = "You have selected e-RaktKosh Blood Bank finder. Please say or enter your required blood group, for example O positive, A positive, or Platelets."
            next_state = "BLOOD_BANK_PROMPT"
        elif digit == "3" or "doctor" in speech.lower():
            response_text = "You have selected ABDM Doctor Discovery. Please say the specialty you need, such as Cardiology, Pediatrics, or General Physician."
            next_state = "DOCTOR_PROMPT"
        elif digit == "4" or "prescription" in speech.lower() or "record" in speech.lower():
            response_text = "For patient privacy under India Digital Health Guidelines, please enter your 4-digit security PIN to access your prescription."
            next_state = "AWAITING_PIN"
        elif speech:
            # Process open speech with AI orchestrator
            ai_res = await ai_orchestrator.process_user_query(
                query=speech,
                user_id=f"caller_{req.From}",
                explicit_language="en"
            )
            response_text = ai_res["spoken_response"]
            next_state = "AI_CONVERSATION"
        else:
            response_text = (
                "Welcome to HealthFlow AI, Healthcare Without Barriers. "
                "Press 1 for Government Schemes, Press 2 for Blood Bank, "
                "Press 3 for Doctor discovery, Press 4 for your Prescriptions, or Press 0 for Emergency."
            )
            next_state = "MAIN_MENU"

        call_record = {
            "call_sid": call_id,
            "caller_phone": req.From,
            "inbound_number": req.To,
            "current_state": next_state,
            "last_spoken_response": response_text,
            "is_pin_authenticated": False,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        self.calls_col.document(call_id).set(call_record, merge=True)

        return {
            "CallSid": call_id,
            "ResponseText": response_text,
            "NextState": next_state,
            "Language": req.Language,
            "GatherDigits": True,
            "NumDigits": 1 if next_state == "MAIN_MENU" else (4 if next_state == "AWAITING_PIN" else None)
        }

    async def verify_voice_pin(self, req: TelephonyVerifyPinRequest) -> Dict[str, Any]:
        caller = VERIFIED_PHONE_PINS.get(req.phone_number)
        now_iso = datetime.now(timezone.utc).isoformat()
        
        if not caller or caller["pin"] != req.pin:
            await audit_logger.log_event(
                action="VOICE_PIN_AUTH_FAILED",
                resource_type="TelephonyCall",
                resource_id=req.call_sid,
                actor_id=req.phone_number,
                actor_role="Caller",
                status="SECURITY_DENIED",
                details={"reason": "Incorrect PIN entered on voice line"}
            )
            return {
                "authenticated": False,
                "response_text": "Authentication failed. The security PIN you entered is incorrect. Access to medical records is restricted."
            }

        patient_id = caller["patient_id"]
        prescriptions = prescription_service.get_patient_prescriptions(patient_id)
        
        if prescriptions:
            latest = prescriptions[0]
            items_summary = ", ".join([f"{item.medicine_name} {item.frequency}" for item in latest.items[:3]])
            speech_msg = (
                f"Authentication successful, hello {caller['name']}. Your latest prescription from {latest.doctor_name} "
                f"dated {latest.prescription_date} includes: {items_summary}."
            )
        else:
            speech_msg = f"Authentication successful, hello {caller['name']}. You currently have no active prescriptions on file."

        # Update call doc
        self.calls_col.document(req.call_sid).set({
            "is_pin_authenticated": True,
            "authenticated_patient_id": patient_id,
            "current_state": "PRESCRIPTION_DISCLOSED",
            "updated_at": now_iso
        }, merge=True)

        await audit_logger.log_event(
            action="VOICE_PRESCRIPTION_DISCLOSED_AUTH",
            resource_type="Prescription",
            resource_id=patient_id,
            actor_id=req.phone_number,
            actor_role="Caller",
            status="SUCCESS",
            details={"patient_name": caller["name"]}
        )

        return {
            "authenticated": True,
            "response_text": speech_msg,
            "patient_name": caller["name"]
        }

    async def handle_call_event(self, req: TelephonyEventRequest) -> Dict[str, Any]:
        self.calls_col.document(req.CallSid).set({
            "status": req.CallStatus,
            "duration_seconds": req.Duration,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, merge=True)
        return {"status": "event_recorded"}

    async def handle_call_complete(self, call_sid: str) -> Dict[str, Any]:
        doc = self.calls_col.document(call_sid).get()
        if doc.exists:
            data = doc.to_dict()
            data["status"] = "completed"
            data["completed_at"] = datetime.now(timezone.utc).isoformat()
            self.calls_col.document(call_sid).set(data)
        return {"call_sid": call_sid, "status": "completed"}

    def get_all_call_logs(self) -> List[Dict[str, Any]]:
        docs = self.calls_col.stream()
        return [d.to_dict() for d in docs]

telephony_service = TelephonyService()
