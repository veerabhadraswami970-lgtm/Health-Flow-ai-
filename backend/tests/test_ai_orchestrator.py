"""
Tests for AI Multilingual Orchestrator & Safe Tool Calling (Module 11 & 13)
"""
import pytest
from app.ai.orchestrator import ai_orchestrator

@pytest.mark.asyncio
async def test_ai_emergency_routing():
    res = await ai_orchestrator.process_user_query(
        query="Emergency! Patient has acute severe chest pain",
        user_id="user_emergency_test"
    )
    assert res["tool_called"] == "trigger_emergency_assistance"
    assert "EMERGENCY PROTOCOL ACTIVATED" in res["spoken_response"]
    assert res["structured_data"]["emergency_mode"] is True
    assert res["structured_data"]["ambulance_hotline"] == "108"

@pytest.mark.asyncio
async def test_ai_blood_bank_query():
    res = await ai_orchestrator.process_user_query(
        query="Find O positive blood in Hyderabad",
        user_id="user_blood_test"
    )
    assert res["tool_called"] == "search_blood_banks"
    assert "blood_banks" in res["structured_data"]
    assert len(res["structured_data"]["blood_banks"]) >= 1

@pytest.mark.asyncio
async def test_ai_multilingual_telugu_scheme_query():
    res = await ai_orchestrator.process_user_query(
        query="నాకు ఆరోగ్యశ్రీ పథకం వివరాలు కావాలి",  # "I want details about Aarogyasri scheme" in Telugu
        user_id="user_telugu_test"
    )
    assert res["detected_language"] == "te"
    assert res["tool_called"] == "find_government_schemes"
    assert "ప్రభుత్వ పథకం" in res["spoken_response"] or "పథకం" in res["spoken_response"]

@pytest.mark.asyncio
async def test_ai_medicine_inquiry():
    res = await ai_orchestrator.process_user_query(
        query="Tell me about Dolo 650 dosage and indications",
        user_id="user_med_test"
    )
    assert res["tool_called"] == "explain_medicine"
    assert "Paracetamol" in res["spoken_response"] or "Dolo" in res["spoken_response"]
