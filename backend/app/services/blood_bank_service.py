"""
HealthFlow AI - Blood Bank Service
"""
from typing import List, Optional
from app.core.config import settings
from app.domain.schemas.blood_bank import BloodBankResponse, BloodSearchQuery
from app.integrations.eraktkosh.blood_bank_adapter import (
    MockeRaktKoshProvider,
    LiveeRaktKoshProvider,
    BaseBloodBankProvider,
    calculate_distance_km
)
from app.core.logger import logger

class BloodBankService:
    def __init__(self):
        if settings.USE_MOCK_INTEGRATIONS:
            self.provider: BaseBloodBankProvider = MockeRaktKoshProvider()
        else:
            self.provider = LiveeRaktKoshProvider()

    def search_blood_banks(self, query: BloodSearchQuery) -> List[BloodBankResponse]:
        results = self.provider.search_blood_banks(query)
        if query.user_latitude and query.user_longitude:
            # Sort by distance
            results.sort(
                key=lambda b: calculate_distance_km(
                    query.user_latitude, query.user_longitude, b.latitude, b.longitude
                )
            )
        return results

    def get_blood_bank_by_id(self, bank_id: str) -> Optional[BloodBankResponse]:
        return self.provider.get_blood_bank_by_id(bank_id)

blood_bank_service = BloodBankService()
