"""
HealthFlow AI - Accident Detection & Emergency Incident Schemas
Domain data models for multi-sensor accident confidence scoring and emergency response lifecycle.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class SensorTelemetryEvent(BaseModel):
    acceleration: float = Field(default=0.0, description="Measured acceleration magnitude in m/s^2")
    rotation: float = Field(default=0.0, description="Measured rotational angular velocity in deg/s")
    speed: float = Field(default=0.0, description="Approximate speed in km/h before/at trigger")
    is_sudden_stop: bool = Field(default=False, description="Whether GPS telemetry registered a sudden high-G stop")
    inactivity_duration_sec: float = Field(default=0.0, description="Duration in seconds phone remained stationary post-impact")
    abnormal_orientation: bool = Field(default=False, description="Device resting in abnormal tilt/upside down orientation")
    elevation_change_m: Optional[float] = Field(default=None, description="Optional barometric altitude delta in meters")
    latitude: Optional[float] = Field(default=None, description="GPS Latitude")
    longitude: Optional[float] = Field(default=None, description="GPS Longitude")
    accuracy_m: Optional[float] = Field(default=None, description="GPS position accuracy radius in meters")
    timestamp: Optional[str] = Field(default=None, description="Client reading timestamp ISO string")

class AccidentEvaluationRequest(BaseModel):
    patient_id: str = Field(default="patient_ravi_kumar", description="Registered Patient ID")
    telemetry: SensorTelemetryEvent
    trigger_source: str = Field(default="sensor_monitor", description="sensor_monitor | telemetry_simulator | manual_sos")

class AccidentEvaluationResponse(BaseModel):
    event_id: str
    patient_id: str
    timestamp: str
    confidence_score: float
    risk_level: str  # NORMAL | POSSIBLE_INCIDENT | HIGH_RISK_POSSIBLE_ACCIDENT | CRITICAL_SUSPECTED_INCIDENT
    is_possible_accident: bool
    requires_user_confirmation: bool
    signals_breakdown: Dict[str, Any]
    recommended_action: str
    disclaimer: str

class EmergencyIncidentCreate(BaseModel):
    patient_id: str = Field(default="patient_ravi_kumar")
    event_id: Optional[str] = None
    confidence_score: float = Field(default=85.0)
    detection_signals: Dict[str, Any] = Field(default_factory=dict)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_label: Optional[str] = None
    user_response: str = Field(default="USER_CONFIRMED_HELP", description="USER_CONFIRMED_HELP | TIMEOUT_NO_RESPONSE | MANUAL_TRIGGER")

class EmergencyIncidentUpdate(BaseModel):
    status: Optional[str] = None
    user_response: Optional[str] = None
    resolved_at: Optional[str] = None
    notes: Optional[str] = None

class EmergencyIncident(BaseModel):
    incident_id: str
    patient_id: str
    event_id: Optional[str] = None
    detection_time: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    confidence_score: float
    detection_signals: Dict[str, Any]
    user_response: str
    status: str
    patient_summary: Dict[str, Any] = Field(default_factory=dict)
    notified_contacts: List[Dict[str, Any]] = Field(default_factory=list)
    notified_hospitals: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str
    resolved_at: Optional[str] = None
    disclaimer: str = "HealthFlow AI provides assistive emergency triage technology and does not replace emergency dispatch services."

class AccidentSettings(BaseModel):
    patient_id: str = Field(default="patient_ravi_kumar")
    enabled: bool = Field(default=True, description="Master toggle for mobile sensor accident detection")
    auto_escalation: bool = Field(default=True, description="Automatically escalate if countdown expires with no response")
    confirmation_timeout_sec: int = Field(default=20, ge=15, le=30, description="Countdown timeout in seconds (15-30s)")
    location_permission_granted: bool = Field(default=True)
    sensor_monitoring_active: bool = Field(default=True)
    emergency_contacts: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AccidentSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    auto_escalation: Optional[bool] = None
    confirmation_timeout_sec: Optional[int] = Field(default=None, ge=15, le=30)
    location_permission_granted: Optional[bool] = None
    sensor_monitoring_active: Optional[bool] = None
    emergency_contacts: Optional[List[Dict[str, Any]]] = None

