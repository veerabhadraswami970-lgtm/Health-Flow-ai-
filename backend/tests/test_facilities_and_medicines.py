"""
Tests for Medicine Intelligence, Doctor Discovery (ABDM HPR), Hospital Discovery (ABDM HFR), Blood Banks (e-RaktKosh), and Reminders
"""
import pytest
from app.services.medicine_service import medicine_service
from app.services.doctor_service import doctor_service
from app.services.hospital_service import hospital_service
from app.services.blood_bank_service import blood_bank_service
from app.services.reminder_service import reminder_service
from app.domain.schemas.doctor import DoctorSearchQuery
from app.domain.schemas.hospital import HospitalSearchQuery
from app.domain.schemas.blood_bank import BloodSearchQuery

def test_medicine_search_and_plain_explanation():
    # 1. Search by brand name
    results = medicine_service.search_medicines("Telma")
    assert len(results) > 0
    assert any("Telmisartan" in r.generic_name for r in results)

    # 2. Get plain language explanation
    first_med = results[0]
    explanation = medicine_service.get_plain_language_explanation(first_med.id)
    assert explanation is not None
    assert explanation.medicine.brand_name == first_med.brand_name
    assert len(explanation.database_verified_summary) > 0
    assert len(explanation.ai_plain_language_explanation) > 0

def test_doctor_discovery():
    query = DoctorSearchQuery(specialty="Cardiology", city="Hyderabad")
    doctors = doctor_service.search_doctors(query)
    assert len(doctors) > 0
    assert any("Cardiology" in d.specialty for d in doctors)
    assert all(d.is_abdm_verified for d in doctors)

def test_hospital_discovery():
    query = HospitalSearchQuery(city="Hyderabad", emergency_only=True)
    hospitals = hospital_service.search_hospitals(query)
    assert len(hospitals) > 0
    assert all(h.has_24_7_emergency for h in hospitals)

def test_hospital_haversine_distance_search():
    # Hyderabad Center: 17.3850, 78.4867
    query = HospitalSearchQuery(latitude=17.3850, longitude=78.4867, radius_km=15.0)
    hospitals = hospital_service.search_hospitals(query)
    assert len(hospitals) > 0
    assert all(h.distance_km <= 15.0 for h in hospitals)
    # Check that results are sorted ascending by distance
    distances = [h.distance_km for h in hospitals]
    assert distances == sorted(distances)


def test_blood_bank_inventory_search():
    query = BloodSearchQuery(blood_group="B+", state="Telangana")
    banks = blood_bank_service.search_blood_banks(query)
    assert len(banks) > 0
    assert any(b.inventory.get("B+", 0) > 0 for b in banks)

@pytest.mark.asyncio
async def test_reminders_retrieval_and_trigger():
    reminders = reminder_service.get_patient_reminders("patient_ravi_kumar")
    assert len(reminders) > 0
    first_rem = reminders[0]
    triggered = await reminder_service.trigger_test_reminder(first_rem.id)
    assert triggered.status == "DISPATCHED"
    assert triggered.reminder_id == first_rem.id
