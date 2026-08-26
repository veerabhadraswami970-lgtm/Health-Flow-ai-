"""
HealthFlow AI - Emergency Service
"""
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.domain.schemas.emergency import EmergencyAlertRequest, EmergencySOSResponse, EmergencyContact
from app.domain.schemas.hospital import HospitalSearchQuery
from app.services.hospital_service import hospital_service
from app.core.config import settings
from app.core.audit import audit_logger

class EmergencyService:
    async def trigger_emergency_sos(self, req: EmergencyAlertRequest) -> EmergencySOSResponse:
        sos_id = f"sos_{uuid.uuid4().hex[:8]}"

        # Search for nearest 24/7 trauma hospitals
        hospitals = hospital_service.search_hospitals(
            HospitalSearchQuery(city=req.city, emergency_only=True)
        )

        sample_contacts = [
            EmergencyContact(name="Anil Kumar", relation="Son", phone="+919876543211"),
            EmergencyContact(name="Sunita Devi", relation="Spouse", phone="+919876543212")
        ]

        instructions = [
            "1. Stay calm and place the patient in a safe, comfortable resting position.",
            "2. Keep the airway open and loosen any tight clothing around the neck and chest.",
            "3. If chest pain or difficulty breathing, keep the patient seated upright.",
            "4. Do NOT administer unprescribed solid medications or force fluids if consciousness is impaired.",
            "5. Keep hospital emergency phone 108 connected while emergency services arrive."
        ]

        await audit_logger.log_event(
            action="EMERGENCY_SOS_TRIGGERED",
            resource_type="EmergencyAlert",
            resource_id=sos_id,
            actor_id=req.user_id or "anonymous",
            actor_role="Patient",
            status="CRITICAL_ALERT",
            details={"city": req.city, "emergency_type": req.emergency_type}
        )

        return EmergencySOSResponse(
            sos_id=sos_id,
            status="ACTIVE_DISPATCHED",
            ambulance_hotline=settings.EMERGENCY_AMBULANCE_NUMBER,
            national_emergency_hotline=settings.EMERGENCY_NATIONAL_NUMBER,
            maternal_child_hotline=settings.EMERGENCY_MATERNAL_NUMBER,
            nearest_trauma_hospitals=hospitals[:3],
            emergency_contacts_notified=sample_contacts,
            first_aid_immediate_instructions=instructions,
            activated_at=datetime.now(timezone.utc).isoformat()
        )

emergency_service = EmergencyService()
