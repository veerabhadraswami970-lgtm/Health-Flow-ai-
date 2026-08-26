"""
HealthFlow AI - Emergency Assistance & SOS Schemas
Lifecycle management for acute medical emergencies, contact notifications,
trauma hospital dispatch, and audit logging.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from app.domain.schemas.hospital import HospitalResponse


class EmergencyStatus(str, Enum):
    CREATED = "Created"
    CONTACT_NOTIFIED = "Contact Notified"
    HOSPITAL_NOTIFIED = "Hospital Notified"
    WAITING_FOR_ASSISTANCE = "Waiting for Assistance"
    HELP_DISPATCHED = "Help Dispatched"
    RESOLVED = "Resolved"
    CANCELLED = "Cancelled"


class EmergencyContact(BaseModel):
    name: str
    relation: str
    phone: str


class NotificationMessage(BaseModel):
    contact_name: str
    contact_phone: str
    message: str
    channel: str = "SMS / Voice Alert"
    status: str = "DELIVERED"
    timestamp: str = ""


class EmergencyHospitalAlert(BaseModel):
    hospital_id: str
    hospital_name: str
    helpline: str
    emergency_contact: str
    status: str = "INTAKE_ALERT_DISPATCHED"
    distance_km: float = 2.4
    timestamp: str = ""


class EmergencyAlertRequest(BaseModel):
    user_id: Optional[str] = "patient_ravi_kumar"
    user_name: Optional[str] = "Ravi Kumar"
    user_phone: Optional[str] = "+919876543210"
    latitude: Optional[float] = 17.4239
    longitude: Optional[float] = 78.4526
    address: Optional[str] = ""
    city: Optional[str] = "Hyderabad"
    emergency_type: str = "General Medical Emergency"
    blood_group: Optional[str] = ""
    known_allergies: List[str] = []
    existing_conditions: List[str] = []


class EmergencyIncident(BaseModel):
    incident_id: str
    patient_id: str
    patient_name: str
    patient_phone: str
    blood_group: str = ""
    known_allergies: List[str] = []
    existing_conditions: List[str] = []
    emergency_type: str
    latitude: float
    longitude: float
    address: str
    city: str
    google_maps_link: str
    status: str = EmergencyStatus.WAITING_FOR_ASSISTANCE.value
    emergency_contacts_notified: List[NotificationMessage] = []
    hospitals_alerted: List[EmergencyHospitalAlert] = []
    nearest_trauma_hospitals: List[HospitalResponse] = []
    activated_at: str
    resolved_at: Optional[str] = None
    notes: Optional[str] = None


class EmergencyStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Waiting for Assistance | Help Dispatched | Resolved | Cancelled")
    notes: Optional[str] = None
    actor_id: Optional[str] = None
    actor_role: Optional[str] = "Patient"


class EmergencySOSResponse(BaseModel):
    sos_id: str
    incident_id: str = ""
    status: str = EmergencyStatus.WAITING_FOR_ASSISTANCE.value
    ambulance_hotline: str
    national_emergency_hotline: str
    maternal_child_hotline: str
    nearest_trauma_hospitals: List[HospitalResponse]
    emergency_contacts_notified: List[EmergencyContact]
    notifications_sent: List[NotificationMessage] = []
    hospitals_alerted: List[EmergencyHospitalAlert] = []
    google_maps_link: str = ""
    patient_blood_group: str = ""
    patient_allergies: List[str] = []
    first_aid_immediate_instructions: List[str]
    disclaimer: str = "EMERGENCY SAFETY ADVISORY: HealthFlow AI does not diagnose conditions during acute emergencies. Call 108 immediately or proceed directly to the nearest emergency room."
    activated_at: str


class EmergencyQRResponse(BaseModel):
    patient_id: str
    patient_name: str
    blood_group: str = ""
    known_allergies: List[str] = []
    emergency_contacts: List[EmergencyContact] = []
    generated_at: str
    disclaimer: str = "Emergency Medical Identity Card. Contains basic emergency triage info only. No complete medical history is disclosed."
