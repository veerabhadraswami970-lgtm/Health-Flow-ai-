"""
HealthFlow AI - Immutable Audit Logging
Tracks all access to prescriptions, health records, QR scans, and consent events.
"""
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid
from app.core.logger import logger

class AuditLogger:
    @staticmethod
    async def log_event(
        action: str,
        resource_type: str,
        resource_id: str,
        actor_id: str,
        actor_role: str,
        ip_address: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
        db_client: Optional[Any] = None
    ) -> Dict[str, Any]:
        audit_entry = {
            "id": f"audit_{uuid.uuid4().hex[:12]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "actor_id": actor_id,
            "actor_role": actor_role,
            "ip_address": ip_address or "127.0.0.1",
            "status": status,
            "details": details or {}
        }
        
        logger.info(
            f"[AUDIT] {action} | {resource_type}:{resource_id} by {actor_role}:{actor_id} | Status: {status}"
        )
        
        if db_client:
            try:
                db_client.collection("audit_logs").document(audit_entry["id"]).set(audit_entry)
            except Exception as e:
                logger.error(f"Failed to persist audit log entry to database: {e}")
                
        return audit_entry

audit_logger = AuditLogger()
