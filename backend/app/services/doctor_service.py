"""
HealthFlow AI - Doctor Discovery Service (ABDM HPR)
"""
from typing import List, Optional
from app.core.config import settings
from app.domain.schemas.doctor import DoctorResponse, DoctorSearchQuery
from app.integrations.abdm.hpr_adapter import MockHPRProvider, LiveHPRProvider, BaseHPRProvider
from app.core.logger import logger

class DoctorService:
    def __init__(self):
        if settings.USE_MOCK_INTEGRATIONS or not settings.ABDM_CLIENT_ID:
            self.provider: BaseHPRProvider = MockHPRProvider()
        else:
            self.provider = LiveHPRProvider(
                client_id=settings.ABDM_CLIENT_ID,
                client_secret=settings.ABDM_CLIENT_SECRET or "",
                base_url=settings.ABDM_SANDBOX_BASE_URL
            )

    def search_doctors(self, query: DoctorSearchQuery) -> List[DoctorResponse]:
        return self.provider.search_doctors(
            query=query.query,
            specialty=query.specialty,
            city=query.city,
            state=query.state,
            language=query.language
        )

    def get_doctor_by_id(self, doc_id: str) -> Optional[DoctorResponse]:
        from app.db.firestore_client import db
        doc = db.collection("doctors").document(doc_id).get()
        if doc.exists:
            return DoctorResponse(**doc.to_dict())
        return None

    def get_doctor_by_hpr_id(self, hpr_id: str) -> Optional[DoctorResponse]:
        return self.provider.get_doctor_by_hpr_id(hpr_id)

    def recommend_alternatives(self, doctor_id: str) -> List[DoctorResponse]:
        """Find available alternative doctors matching specialization, hospital, or city."""
        target = self.get_doctor_by_id(doctor_id)
        if not target:
            # Try searching by doctor_id in provider
            all_docs = self.provider.search_doctors()
            for d in all_docs:
                if d.id == doctor_id or d.hpr_id == doctor_id:
                    target = d
                    break

        if not target:
            return []

        # Find doctors with same specialty or hospital, not on leave
        all_candidates = self.provider.search_doctors(specialty=target.specialty)
        alternatives = []
        for candidate in all_candidates:
            if candidate.id == target.id or candidate.hpr_id == target.hpr_id:
                continue
            if candidate.is_on_leave:
                continue
            alternatives.append(candidate)

        # If no same specialty candidate, fall back to city search
        if not alternatives:
            city_candidates = self.provider.search_doctors(city=target.city)
            for c in city_candidates:
                if c.id != target.id and not c.is_on_leave:
                    alternatives.append(c)

        return alternatives[:5]

doctor_service = DoctorService()
