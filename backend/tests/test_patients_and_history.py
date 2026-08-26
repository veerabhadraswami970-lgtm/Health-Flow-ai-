"""
Tests for Patient Profile and Medical History Services
"""
import pytest
from app.services.patient_service import patient_service
from app.services.medical_history_service import medical_history_service
from app.domain.schemas.patient import PatientProfileUpdateRequest, EmergencyContactInfo
from app.domain.schemas.medical_history import MedicalHistoryAddRequest

def test_get_and_update_patient_profile():
    # 1. Retrieve seeded patient profile
    profile = patient_service.get_patient_profile("patient_ravi_kumar")
    assert profile is not None
    assert profile.name == "Ravi Kumar"
    assert profile.blood_group == "B+"
    assert "Penicillin" in profile.known_allergies

    # 2. Update patient profile for test patient
    update_req = PatientProfileUpdateRequest(
        name="Test Patient",
        blood_group="O+",
        known_allergies=["Penicillin", "Sulfa Drugs", "Aspirin"],
        emergency_contact_1=EmergencyContactInfo(
            name="Emergency Contact Person",
            phone="+919876543212",
            relationship="Spouse"
        )
    )
    updated = patient_service.update_patient_profile("patient_test_unit", update_req)
    assert updated is not None
    assert "Aspirin" in updated.known_allergies
    assert updated.emergency_contact_1.name == "Emergency Contact Person"
    assert updated.blood_group == "O+"

def test_get_emergency_contacts():
    contacts = patient_service.get_emergency_contacts("patient_ravi_kumar")
    assert contacts["patient_name"] == "Ravi Kumar"
    assert contacts["blood_group"] == "B+"
    assert len(contacts["contacts"]) >= 1

def test_medical_history_retrieval_and_add():
    # 1. Get history
    history = medical_history_service.get_patient_history("patient_ravi_kumar")
    assert history.total_entries > 0
    assert len(history.entries) == history.total_entries

    # 2. Check medicine and hospital distinct aggregations
    meds = medical_history_service.get_patient_medicines("patient_ravi_kumar")
    assert len(meds) > 0
    assert any("Ecosprin" in m or "Glycomet" in m for m in meds)

    hosps = medical_history_service.get_patient_hospitals("patient_ravi_kumar")
    assert len(hosps) > 0
    assert "NIMS Hyderabad" in hosps

    # 3. Add new medical history entry
    new_entry_req = MedicalHistoryAddRequest(
        patient_id="patient_ravi_kumar",
        hospital_id="hosp_aiims_delhi",
        hospital_name="AIIMS New Delhi",
        doctor_id="doc_test_01",
        doctor_name="Dr. Test Specialist",
        date="2026-08-15",
        treatment_type="Specialist Consultation",
        diagnosis="Preventive cardiac screening - normal",
        medicines=["Multivitamin Tablet"],
        procedures=["Stress ECG", "2D Echo"],
        notes="All parameters within normal limits."
    )
    added = medical_history_service.add_history_entry(new_entry_req)
    assert added.id.startswith("mh_")
    assert added.hospital_name == "AIIMS New Delhi"
    assert "Multivitamin Tablet" in added.medicines

def test_patient_registration():
    from app.domain.schemas.patient import PatientRegistrationRequest, MedicationItem, MedicalHistorySummary
    reg_req = PatientRegistrationRequest(
        full_name="Ananya Sharma",
        date_of_birth="1995-04-12",
        age=31,
        gender="Female",
        blood_group="O+",
        phone="9876501234",
        email="ananya.sharma@example.com",
        address="Flat 402, Green Meadows, Banjara Hills",
        city="Hyderabad",
        state="Telangana",
        pincode="500034",
        emergency_contact=EmergencyContactInfo(
            name="Vikram Sharma",
            relationship="Spouse",
            phone="9876505678"
        ),
        existing_conditions=["Asthma"],
        allergies=["Penicillin"],
        current_medications=[
            MedicationItem(medicine_name="Inhaler", dosage="2 puffs", frequency="1-0-1", duration="60 days")
        ],
        medical_history=MedicalHistorySummary(notes="No major hospitalizations.")
    )
    result = patient_service.register_patient(reg_req)
    assert result.patient_id.startswith("HF-PAT-2026-") or result.patient_id.startswith("patient_")
    assert result.created_at is not None
    assert result.qr_code is not None

    # Verify profile was created in store
    created_profile = patient_service.get_patient_profile(result.patient_id)
    assert created_profile is not None
    assert created_profile.name == "Ananya Sharma"
    assert created_profile.blood_group == "O+"

