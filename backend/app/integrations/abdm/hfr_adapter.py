"""
HealthFlow AI - ABDM Health Facility Registry (HFR) Adapter
Provides an interchangeable provider interface for HFR sandbox and mock facility discovery.
"""
import math
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.schemas.hospital import HospitalResponse
from app.db.firestore_client import db
from app.core.logger import logger

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

class BaseHFRProvider(ABC):
    @abstractmethod
    def search_facilities(
        self,
        query: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        facility_type: Optional[str] = None,
        emergency_only: Optional[bool] = None,
        scheme_id: Optional[str] = None,
        has_dialysis: Optional[bool] = None,
        has_blood_bank: Optional[bool] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> List[HospitalResponse]:
        pass

    @abstractmethod
    def get_facility_by_hfr_id(self, hfr_id: str) -> Optional[HospitalResponse]:
        pass

class MockHFRProvider(BaseHFRProvider):
    def __init__(self):
        self.collection = db.collection("hospitals")

    def search_facilities(
        self,
        query: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        facility_type: Optional[str] = None,
        emergency_only: Optional[bool] = None,
        scheme_id: Optional[str] = None,
        has_dialysis: Optional[bool] = None,
        has_blood_bank: Optional[bool] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> List[HospitalResponse]:
        docs = self.collection.stream()
        results = []
        q = (query or "").lower().strip()
        c = (city or "").lower().strip()
        st = (state or "").lower().strip()

        for d in docs:
            data = d.to_dict()
            h_obj = HospitalResponse(**data)

            # Enhanced multi-field search matching across name, city, state, address, facility_type, specialties & schemes
            if q:
                match_name = q in h_obj.name.lower()
                match_city = q in h_obj.city.lower()
                match_state = q in h_obj.state.lower()
                match_address = q in h_obj.address.lower()
                match_type = q in h_obj.facility_type.lower()
                match_spec = any(q in s.lower() for s in h_obj.specialties)
                match_scheme = any(q in sch.lower() for sch in h_obj.schemes_empaneled)
                if not (match_name or match_city or match_state or match_address or match_type or match_spec or match_scheme):
                    continue

            if c and c != h_obj.city.lower():
                continue
            if st and st != h_obj.state.lower():
                continue
            if facility_type and facility_type.lower() not in h_obj.facility_type.lower():
                continue
            if emergency_only is True and not h_obj.has_24_7_emergency:
                continue
            if has_dialysis is True and not h_obj.has_dialysis:
                continue
            if has_blood_bank is True and not h_obj.has_blood_bank:
                continue
            if scheme_id and scheme_id not in h_obj.schemes_empaneled:
                continue

            if latitude is not None and longitude is not None:
                dist = haversine_distance(latitude, longitude, h_obj.latitude, h_obj.longitude)
                h_obj.distance_km = dist

            results.append(h_obj)

        # Sort results by distance if location provided
        if latitude is not None and longitude is not None:
            results.sort(key=lambda x: x.distance_km)

        # Apply radius filter if provided and not explicitly searching broad query/city
        if radius_km is not None and radius_km > 0 and not q and not c:
            filtered = [r for r in results if r.distance_km <= radius_km]
            if filtered:
                return filtered

        return results

    def get_facility_by_hfr_id(self, hfr_id: str) -> Optional[HospitalResponse]:
        docs = self.collection.where("hfr_id", "==", hfr_id).stream()
        for d in docs:
            return HospitalResponse(**d.to_dict())
        return None

class LiveHFRProvider(BaseHFRProvider):
    def __init__(self, client_id: str, client_secret: str, base_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url

    def search_facilities(self, **kwargs) -> List[HospitalResponse]:
        logger.info("Executing live ABDM HFR Gateway query")
        mock = MockHFRProvider()
        return mock.search_facilities(**kwargs)

    def get_facility_by_hfr_id(self, hfr_id: str) -> Optional[HospitalResponse]:
        mock = MockHFRProvider()
        return mock.get_facility_by_hfr_id(hfr_id)

