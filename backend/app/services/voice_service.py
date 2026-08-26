"""
HealthFlow AI - Voice Assistant Service
Manages interactive multilingual voice conversations and AI tool orchestration.
"""
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.domain.schemas.voice import VoiceInteractionRequest, VoiceInteractionResponse
from app.ai.orchestrator import ai_orchestrator
from app.db.firestore_client import db
from app.core.logger import logger

class VoiceService:
    def __init__(self):
        self.sessions_col = db.collection("voice_sessions")

    async def handle_voice_interaction(self, req: VoiceInteractionRequest) -> VoiceInteractionResponse:
        session_id = req.session_id or f"vses_{uuid.uuid4().hex[:10]}"
        
        result = await ai_orchestrator.process_user_query(
            query=req.transcript,
            user_id=req.user_id or "guest_patient",
            explicit_language=req.language,
            context=req.context
        )

        session_entry = {
            "session_id": session_id,
            "trace_id": result["trace_id"],
            "user_id": req.user_id,
            "user_transcript": req.transcript,
            "language": result["detected_language"],
            "tool_called": result["tool_called"],
            "spoken_response": result["spoken_response"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        self.sessions_col.document(session_id).set(session_entry, merge=True)

        return VoiceInteractionResponse(
            session_id=session_id,
            trace_id=result["trace_id"],
            transcript_received=req.transcript,
            detected_language=result["detected_language"],
            spoken_response=result["spoken_response"],
            tool_called=result["tool_called"],
            structured_data=result["structured_data"],
            timestamp=result["timestamp"]
        )

voice_service = VoiceService()
