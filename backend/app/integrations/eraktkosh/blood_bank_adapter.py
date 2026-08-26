"""
HealthFlow AI - e-RaktKosh Blood Bank Integration Adapter
Provides an interchangeable provider interface for e-RaktKosh sandbox and mock live inventory.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import math
from app.domain.schemas.blood_bank import BloodBankResponse, BloodSearchQuery
from app.db.firestore_client import db
from app.core.logger import logger

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

class BaseBloodBankProvider(ABC):
    @abstractmethod
    def search_blood_banks(self, query: BloodSearchQuery) -> List[BloodBankResponse]:
        pass

    @abstractmethod
    def get_blood_bank_by_id(self, bank_id: str) -> Optional[BloodBankResponse]:
        pass

class MockeRaktKoshProvider(BaseBloodBankProvider):
    def __init__(self):
        self.collection = db.collection("blood_banks")

    def search_blood_banks(self, query: BloodSearchQuery) -> List[BloodBankResponse]:
        docs = self.collection.stream()
        results = []
        bg = (query.blood_group or "").upper().strip()
        c = (query.city or "").lower().strip()
        st = (query.state or "").lower().strip()

        for d in docs:
            data = d.to_dict()
            bb_obj = BloodBankResponse(**data)

            if c and c != bb_obj.city.lower():
                continue
            if st and st != bb_obj.state.lower():
                continue
            if bg:
                units = bb_obj.inventory.get(bg, 0)
                if units <= 0:
                    continue

            results.append(bb_obj)
        return results

    def get_blood_bank_by_id(self, bank_id: str) -> Optional[BloodBankResponse]:
        doc = self.collection.document(bank_id).get()
        if doc.exists:
            return BloodBankResponse(**doc.to_dict())
        return None

class LiveeRaktKoshProvider(BaseBloodBankProvider):
    """Production e-RaktKosh API Adapter."""
    def search_blood_banks(self, query: BloodSearchQuery) -> List[BloodBankResponse]:
        logger.info("Executing e-RaktKosh live API request")
        mock = MockeRaktKoshProvider()
        return mock.search_blood_banks(query)

    def get_blood_bank_by_id(self, bank_id: str) -> Optional[BloodBankResponse]:
        mock = MockeRaktKoshProvider()
        return mock.get_blood_bank_by_id(bank_id)
