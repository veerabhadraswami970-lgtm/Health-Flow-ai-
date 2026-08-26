"""
HealthFlow AI - Hospital & Health Facility Discovery Service (ABDM HFR)
"""
from typing import List, Optional
from app.core.config import settings
from app.domain.schemas.hospital import HospitalResponse, HospitalSearchQuery
from app.integrations.abdm.hfr_adapter import MockHFRProvider, LiveHFRProvider, BaseHFRProvider
from app.core.logger import logger

class HospitalService:
    def __init__(self):
        if settings.USE_MOCK_INTEGRATIONS or not settings.ABDM_CLIENT_ID:
            self.provider: BaseHFRProvider = MockHFRProvider()
        else:
            self.provider = LiveHFRProvider(
                client_id=settings.ABDM_CLIENT_ID,
                client_secret=settings.ABDM_CLIENT_SECRET or "",
                base_url=settings.ABDM_SANDBOX_BASE_URL
            )

    def search_hospitals(self, query: HospitalSearchQuery) -> List[HospitalResponse]:
        return self.provider.search_facilities(
            query=query.query,
            city=query.city,
            state=query.state,
            facility_type=query.facility_type,
            emergency_only=query.emergency_only,
            scheme_id=query.scheme_id,
            has_dialysis=query.has_dialysis,
            has_blood_bank=query.has_blood_bank,
            latitude=query.latitude,
            longitude=query.longitude,
            radius_km=query.radius_km
        )


    def get_hospital_by_id(self, hosp_id: str) -> Optional[HospitalResponse]:
        from app.db.firestore_client import db
        doc = db.collection("hospitals").document(hosp_id).get()
        if doc.exists:
            return HospitalResponse(**doc.to_dict())
        return None

    def get_hospital_by_hfr_id(self, hfr_id: str) -> Optional[HospitalResponse]:
        return self.provider.get_facility_by_hfr_id(hfr_id)

hospital_service = HospitalService()
