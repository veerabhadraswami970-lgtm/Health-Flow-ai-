"""
Tests for Telephony Webhooks, IVR state transitions, and Voice OTP Security (Module 12)
"""
import pytest
from app.services.telephony_service import telephony_service
from app.domain.schemas.voice import (
    TelephonyIncomingWebhookRequest,
    TelephonyVerifyPinRequest,
    TelephonyEventRequest
)

@pytest.mark.asyncio
async def test_telephony_incoming_greeting():
    req = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_call_001",
        From="+919876543210",
        To="+918001234567"
    )
    res = await telephony_service.handle_incoming_call(req)
    assert res["CallSid"] == "CA_test_call_001"
    assert res["NextState"] == "MAIN_MENU"
    assert "Healthcare Without Barriers" in res["ResponseText"]

@pytest.mark.asyncio
async def test_telephony_ivr_digit_routes():
    # Emergency (0)
    req0 = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_0",
        From="+919876543210",
        To="+918001234567",
        Digits="0"
    )
    res0 = await telephony_service.handle_incoming_call(req0)
    assert res0["NextState"] == "EMERGENCY_ROUTED"
    assert "112" in res0["ResponseText"]

    # Schemes (1)
    req1 = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_1",
        From="+919876543210",
        To="+918001234567",
        Digits="1"
    )
    res1 = await telephony_service.handle_incoming_call(req1)
    assert res1["NextState"] == "SCHEME_PROMPT"

    # Blood Bank (2)
    req2 = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_2",
        From="+919876543210",
        To="+918001234567",
        Digits="2"
    )
    res2 = await telephony_service.handle_incoming_call(req2)
    assert res2["NextState"] == "BLOOD_BANK_PROMPT"

    # Doctor (3)
    req3 = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_3",
        From="+919876543210",
        To="+918001234567",
        Digits="3"
    )
    res3 = await telephony_service.handle_incoming_call(req3)
    assert res3["NextState"] == "DOCTOR_PROMPT"

    # Prescription PIN (4)
    req4 = TelephonyIncomingWebhookRequest(
        CallSid="CA_test_4",
        From="+919876543210",
        To="+918001234567",
        Digits="4"
    )
    res4 = await telephony_service.handle_incoming_call(req4)
    assert res4["NextState"] == "AWAITING_PIN"

@pytest.mark.asyncio
async def test_telephony_voice_pin_auth_success():
    # Attempting to access private prescription via PIN challenge
    req = TelephonyVerifyPinRequest(
        call_sid="CA_test_call_001",
        phone_number="+919876543210",
        pin="1234"
    )
    res = await telephony_service.verify_voice_pin(req)
    assert res["authenticated"] is True
    assert "Ravi Kumar" in res["patient_name"]
    assert "Authentication successful" in res["response_text"]

@pytest.mark.asyncio
async def test_telephony_voice_pin_auth_failed():
    req = TelephonyVerifyPinRequest(
        call_sid="CA_test_call_001",
        phone_number="+919876543210",
        pin="9999"  # Wrong PIN
    )
    res = await telephony_service.verify_voice_pin(req)
    assert res["authenticated"] is False
    assert "Authentication failed" in res["response_text"]

@pytest.mark.asyncio
async def test_telephony_events_and_logs():
    # Test call event update
    event_req = TelephonyEventRequest(
        CallSid="CA_test_call_001",
        CallStatus="in-progress",
        Duration=45
    )
    event_res = await telephony_service.handle_call_event(event_req)
    assert event_res["status"] == "event_recorded"

    # Test call completion
    complete_res = await telephony_service.handle_call_complete("CA_test_call_001")
    assert complete_res["status"] == "completed"

    # Test get logs
    logs = telephony_service.get_all_call_logs()
    assert len(logs) > 0
    assert any(log.get("call_sid") == "CA_test_call_001" for log in logs)

