"""
HealthFlow AI - Admin Dashboard & Observability Endpoints
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.db.firestore_client import db
from app.services.ingestion_service import ingestion_service, IngestDatasetRequest, IngestionPipelineResult
from app.services.telephony_service import telephony_service
from app.core.security import get_current_user_payload, require_roles, UserRole

router = APIRouter(prefix="/admin", tags=["Admin & Observability Dashboard"])

@router.get("/overview")
async def get_admin_overview():
    schemes_count = len(db.collection("government_schemes").stream())
    medicines_count = len(db.collection("medicines").stream())
    doctors_count = len(db.collection("doctors").stream())
    hospitals_count = len(db.collection("hospitals").stream())
    blood_banks_count = len(db.collection("blood_banks").stream())
    prescriptions_count = len(db.collection("prescriptions").stream())
    appointments_count = len(db.collection("appointments").stream())

    # Get recent audit logs
    audit_docs = db.collection("audit_logs").stream()
    audit_logs = [d.to_dict() for d in audit_docs]
    # Sort reverse chronological
    audit_logs.sort(key=lambda a: a.get("timestamp", ""), reverse=True)

    # Call logs
    call_logs = telephony_service.get_all_call_logs()

    # Data Sources
    data_sources = ingestion_service.get_all_data_sources()

    return {
        "system_status": "HEALTHY",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "schemes": schemes_count,
            "medicines": medicines_count,
            "doctors": doctors_count,
            "hospitals": hospitals_count,
            "blood_banks": blood_banks_count,
            "prescriptions": prescriptions_count,
            "appointments": appointments_count,
            "total_audit_events": len(audit_logs),
            "total_voice_calls": len(call_logs)
        },
        "recent_audit_logs": audit_logs[:15],
        "recent_call_logs": call_logs[:10],
        "data_sources": [s.model_dump() for s in data_sources],
        "integrations": {
            "abdm_hpr": "OPERATIONAL (Verified Registry)",
            "abdm_hfr": "OPERATIONAL (Verified Facilities)",
            "abdm_uhi": "OPERATIONAL (Sandbox / Live Adapter)",
            "eraktkosh": "OPERATIONAL (Real-time Inventory)",
            "telephony": "OPERATIONAL (Webhook & Voice PIN Guard)"
        }
    }

@router.post("/ingest", response_model=IngestionPipelineResult)
async def ingest_dataset(
    req: IngestDatasetRequest,
    current_user: dict = Depends(get_current_user_payload)
):
    actor_id = current_user.get("sub", "admin_user")
    return await ingestion_service.ingest_dataset(req, actor_id=actor_id)
