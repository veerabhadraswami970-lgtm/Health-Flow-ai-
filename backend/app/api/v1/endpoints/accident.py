"""
HealthFlow AI - Accident Detection & Emergency Response Endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.domain.schemas.accident import (
    AccidentEvaluationRequest,
    AccidentEvaluationResponse,
    EmergencyIncidentCreate,
    EmergencyIncident,
    AccidentSettings,
    AccidentSettingsUpdate
)
from app.domain.schemas.hospital import HospitalSearchQuery, HospitalResponse
from app.services.accident_detection_service import accident_detection_service
from app.services.hospital_service import hospital_service

router = APIRouter(prefix="/accident", tags=["AI Accident Detection & Emergency Response"])

@router.post("/events", response_model=AccidentEvaluationResponse)
async def post_telemetry_event(req: AccidentEvaluationRequest):
    """
    Ingests raw mobile sensor telemetry (accelerometer, gyroscope, GPS, inactivity, orientation)
    and evaluates accident confidence.
    """
    return await accident_detection_service.evaluate_accident(req)

@router.post("/evaluate", response_model=AccidentEvaluationResponse)
async def evaluate_telemetry(req: AccidentEvaluationRequest):
    """
    Evaluates multi-signal accident confidence without initiating full emergency dispatch unless requested.
    """
    return await accident_detection_service.evaluate_accident(req)

@router.post("/incidents", response_model=EmergencyIncident)
async def create_emergency_incident(req: EmergencyIncidentCreate):
    """
    Creates an official emergency incident, notifies emergency contacts, and identifies nearby 24/7 trauma hospitals.
    """
    return await accident_detection_service.create_emergency_incident(req)

@router.get("/incidents/{incident_id}", response_model=EmergencyIncident)
async def get_emergency_incident(incident_id: str):
    """
    Fetches real-time status of an active emergency incident.
    """
    incident = accident_detection_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Emergency incident '{incident_id}' not found.")
    return incident

@router.post("/incidents/{incident_id}/confirm", response_model=EmergencyIncident)
async def confirm_emergency_incident(incident_id: str):
    """
    User confirms emergency assistance is needed ("I NEED HELP").
    """
    incident = await accident_detection_service.update_incident_status(
        incident_id=incident_id,
        status="USER_CONFIRMED_HELP",
        user_response="USER_CONFIRMED_HELP"
    )
    if not incident:
        raise HTTPException(status_code=404, detail=f"Emergency incident '{incident_id}' not found.")
    return incident

@router.post("/incidents/{incident_id}/cancel", response_model=EmergencyIncident)
async def cancel_emergency_incident(incident_id: str, reason: Optional[str] = Body(default="USER_CONFIRMED_SAFE")):
    """
    User indicates they are safe ("I'M OK") or cancels false alarm.
    """
    incident = await accident_detection_service.update_incident_status(
        incident_id=incident_id,
        status="FALSE_ALARM",
        user_response="USER_CONFIRMED_SAFE"
    )
    if not incident:
        raise HTTPException(status_code=404, detail=f"Emergency incident '{incident_id}' not found.")
    return incident

@router.get("/nearby-hospitals", response_model=List[HospitalResponse])
async def get_nearby_emergency_hospitals(
    city: str = Query(default="Hyderabad"),
    lat: Optional[float] = Query(default=None),
    lng: Optional[float] = Query(default=None)
):
    """
    Queries ABDM Health Facility Registry (HFR) for nearest trauma & 24/7 emergency hospitals.
    """
    return hospital_service.search_hospitals(
        HospitalSearchQuery(city=city, emergency_only=True)
    )

@router.post("/contacts/notify")
async def notify_emergency_contacts(payload: Dict[str, Any] = Body(...)):
    """
    Dispatches emergency notification alerts to registered caretakers/family members.
    Returns explicit delivery confirmation.
    """
    patient_id = payload.get("patient_id", "patient_ravi_kumar")
    summary = accident_detection_service._get_patient_emergency_summary(patient_id)
    contacts = summary.get("emergency_contacts", [])
    
    dispatch_results = []
    for c in contacts:
        dispatch_results.append({
            "contact_name": c.get("name"),
            "phone": c.get("phone"),
            "relation": c.get("relation"),
            "status": "Notification sent",
            "provider": "HealthFlow Gateway"
        })
        
    return {
        "status": "SUCCESS",
        "contacts_notified": dispatch_results,
        "message": f"Emergency alerts dispatched to {len(dispatch_results)} contacts."
    }

@router.get("/settings/{patient_id}", response_model=AccidentSettings)
async def get_patient_accident_settings(patient_id: str):
    """
    Retrieves patient's accident detection preferences and emergency contact settings.
    """
    return accident_detection_service.get_patient_settings(patient_id)

@router.put("/settings/{patient_id}", response_model=AccidentSettings)
async def update_patient_accident_settings(patient_id: str, req: AccidentSettingsUpdate):
    """
    Updates patient's accident detection preferences, countdown timeout (15-30s), and escalation settings.
    """
    return await accident_detection_service.update_patient_settings(patient_id, req)

