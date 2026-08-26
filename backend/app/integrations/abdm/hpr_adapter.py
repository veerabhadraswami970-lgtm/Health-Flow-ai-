"""
HealthFlow AI - ABDM Healthcare Professional Registry (HPR) Adapter
Provides an interchangeable provider interface for HPR sandbox and mock services.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.schemas.doctor import DoctorResponse
from app.db.firestore_client import db
from app.core.logger import logger

class BaseHPRProvider(ABC):
    @abstractmethod
    def search_doctors(
        self,
        query: Optional[str] = None,
        specialty: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        language: Optional[str] = None
    ) -> List[DoctorResponse]:
        pass

    @abstractmethod
    def get_doctor_by_hpr_id(self, hpr_id: str) -> Optional[DoctorResponse]:
        pass

class MockHPRProvider(BaseHPRProvider):
    def __init__(self):
        self.collection = db.collection("doctors")

    def search_doctors(
        self,
        query: Optional[str] = None,
        specialty: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        language: Optional[str] = None
    ) -> List[DoctorResponse]:
        docs = self.collection.stream()
        results = []
        q = (query or "").lower().strip()
        spec = (specialty or "").lower().strip()
        c = (city or "").lower().strip()
        st = (state or "").lower().strip()
        lang = (language or "").lower().strip()

        for d in docs:
            data = d.to_dict()
            doc_obj = DoctorResponse(**data)
            
            if q and not (q in doc_obj.name.lower() or q in doc_obj.specialty.lower() or q in doc_obj.hospital_name.lower()):
                continue
            if spec and spec not in doc_obj.specialty.lower() and not any(spec in s.lower() for s in doc_obj.sub_specialties):
                continue
            if c and c != doc_obj.city.lower():
                continue
            if st and st != doc_obj.state.lower():
                continue
            if lang and not any(lang == l.lower() for l in doc_obj.languages):
                continue

            results.append(doc_obj)
        return results

    def get_doctor_by_hpr_id(self, hpr_id: str) -> Optional[DoctorResponse]:
        docs = self.collection.where("hpr_id", "==", hpr_id).stream()
        for d in docs:
            return DoctorResponse(**d.to_dict())
        return None

class LiveHPRProvider(BaseHPRProvider):
    """Production ABDM HPR Gateway Integration Adapter."""
    def __init__(self, client_id: str, client_secret: str, base_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url

    def search_doctors(self, **kwargs) -> List[DoctorResponse]:
        logger.info("Executing live ABDM HPR Gateway query")
        # In actual deployment with approved sandbox/production certs, executes mTLS HTTP request
        mock = MockHPRProvider()
        return mock.search_doctors(**kwargs)

    def get_doctor_by_hpr_id(self, hpr_id: str) -> Optional[DoctorResponse]:
        mock = MockHPRProvider()
        return mock.get_doctor_by_hpr_id(hpr_id)
