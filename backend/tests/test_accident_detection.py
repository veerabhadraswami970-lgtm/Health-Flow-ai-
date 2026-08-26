"""
HealthFlow AI - Accident Detection & Emergency Response Test Suite
Validates multi-sensor confidence scoring, false positive protection,
and emergency incident workflows according to safety specifications.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.accident_detection_service import accident_detection_service
from app.domain.schemas.accident import SensorTelemetryEvent

client = TestClient(app)

def test_scenario_1_phone_drop_false_positive():
    """
    Scenario 1: Phone dropped on table
    High impact acceleration (e.g. 24 m/s^2), but 0 rotation, 0 stop, 0 inactivity, normal orientation.
    Expectation: False positive mitigation dampens confidence score < 40 (NORMAL).
    """
    telemetry = SensorTelemetryEvent(
        acceleration=24.0,
        rotation=0.0,
        speed=0.0,
        is_sudden_stop=False,
        inactivity_duration_sec=0.0,
        abnormal_orientation=False
    )
    result = accident_detection_service.calculate_confidence(telemetry)
    assert result["confidence_score"] < 40.0
    assert result["risk_level"] == "NORMAL"
    assert result["is_false_positive_mitigated"] is True

def test_scenario_2_sudden_braking():
    """
    Scenario 2: Sudden braking
    Acceleration spike + speed reduction, no rotation/inactivity.
    Expectation: Medium/Possible incident confidence.
    """
    telemetry = SensorTelemetryEvent(
        acceleration=18.0,
        rotation=10.0,
        speed=35.0,
        is_sudden_stop=True,
        inactivity_duration_sec=0.0,
        abnormal_orientation=False
    )
    result = accident_detection_service.calculate_confidence(telemetry)
    assert result["confidence_score"] >= 20.0
    assert result["breakdown"]["stop_score"] > 0

def test_scenario_3_high_confidence_accident():
    """
    Scenario 3: Possible accident
    High impact + sudden rotation + sudden stop + post-impact inactivity + abnormal orientation.
    Expectation: High-risk confidence (>= 70) and is_possible_accident == True.
    """
    telemetry = SensorTelemetryEvent(
        acceleration=38.0,
        rotation=180.0,
        speed=45.0,
        is_sudden_stop=True,
        inactivity_duration_sec=12.0,
        abnormal_orientation=True
    )
    result = accident_detection_service.calculate_confidence(telemetry)
    assert result["confidence_score"] >= 70.0
    assert result["is_possible_accident"] is True
    assert result["requires_user_confirmation"] is True

def test_scenario_4_and_5_incident_lifecycle():
    """
    Scenarios 4 & 5: Incident creation, user NEED HELP, user I'M OK (FALSE_ALARM cancellation).
    """
    # Create incident
    payload = {
        "patient_id": "patient_ravi_kumar",
        "confidence_score": 88.5,
        "detection_signals": {"impact": 35, "rotation": 20, "stop": 20, "inactivity": 13.5},
        "latitude": 17.3850,
        "longitude": 78.4867,
        "user_response": "USER_CONFIRMED_HELP"
    }
    resp = client.post("/api/v1/accident/incidents", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    incident_id = data["incident_id"]
    assert data["confidence_score"] == 88.5
    assert len(data["notified_contacts"]) > 0
    assert "Notification sent" in data["notified_contacts"][0]["notification_status"]

    # Confirm help requested
    confirm_resp = client.post(f"/api/v1/accident/incidents/{incident_id}/confirm")
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["status"] == "USER_CONFIRMED_HELP"

    # User then indicates safe / false alarm (Scenario 5)
    cancel_resp = client.post(f"/api/v1/accident/incidents/{incident_id}/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "FALSE_ALARM"

def test_scenario_6_no_response_timeout():
    """
    Scenario 6: Countdown finishes without response.
    Expectation: Automatic escalation creates incident with TIMEOUT_NO_RESPONSE status.
    """
    payload = {
        "patient_id": "patient_ravi_kumar",
        "confidence_score": 92.0,
        "detection_signals": {"impact": 35, "rotation": 20, "stop": 20, "inactivity": 15},
        "user_response": "TIMEOUT_NO_RESPONSE"
    }
    resp = client.post("/api/v1/accident/incidents", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_response"] == "TIMEOUT_NO_RESPONSE"
    assert len(data["notified_contacts"]) > 0

import uuid

def test_accident_settings_crud():
    """
    Verifies GET and PUT endpoints for patient accident detection settings.
    """
    patient_id = f"patient_test_{uuid.uuid4().hex[:8]}"
    get_resp = client.get(f"/api/v1/accident/settings/{patient_id}")
    assert get_resp.status_code == 200
    settings_data = get_resp.json()
    assert settings_data["enabled"] is True
    assert settings_data["confirmation_timeout_sec"] == 20

    put_resp = client.put(f"/api/v1/accident/settings/{patient_id}", json={
        "confirmation_timeout_sec": 25,
        "auto_escalation": True
    })
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["confirmation_timeout_sec"] == 25



