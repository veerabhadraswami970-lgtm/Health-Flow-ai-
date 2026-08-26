"""
HealthFlow AI - Medical History Service
Manages patient medical history entries: previous treatments, hospitals, medicines.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from app.db.firestore_client import db
from app.domain.schemas.medical_history import (
    MedicalHistoryEntry,
    MedicalHistoryAddRequest,
    MedicalHistoryResponse,
)
from app.core.logger import logger

SEED_HISTORY = [
    {
        "id": "mh_001",
        "patient_id": "patient_ravi_kumar",
        "hospital_id": "hosp_nims_hyd",
        "hospital_name": "NIMS Hyderabad",
        "doctor_id": "doc_ramesh_varma",
        "doctor_name": "Dr. Ramesh Varma",
        "date": "2026-06-15",
        "treatment_type": "OPD Consultation",
        "diagnosis": "Routine Cardiology Follow-up — Stable Angina under control",
        "medicines": ["Ecosprin 75mg", "Atorvastatin 20mg", "Metoprolol 50mg"],
        "procedures": ["12-Lead ECG", "Blood Pressure Monitoring"],
        "notes": "Patient vitals stable. Continue current medications. Review in 3 months.",
        "created_at": "2026-06-15T10:30:00Z",
    },
    {
        "id": "mh_002",
        "patient_id": "patient_ravi_kumar",
        "hospital_id": "hosp_apollo_hyd",
        "hospital_name": "Apollo Hospitals, Jubilee Hills",
        "doctor_id": "doc_ananya_sen",
        "doctor_name": "Dr. Ananya Sen",
        "date": "2026-08-01",
        "treatment_type": "Lab Test",
        "diagnosis": "HbA1c 6.8% — Type 2 Diabetes under good glycemic control",
        "medicines": ["Glycomet GP 2 (Metformin + Glimepiride)", "Telma 40mg"],
        "procedures": ["HbA1c Panel", "Lipid Profile", "Serum Creatinine"],
        "notes": "Diabetes well-controlled. Continue Glycomet GP 2. Recheck HbA1c in 6 months.",
        "created_at": "2026-08-01T09:00:00Z",
    },
    {
        "id": "mh_003",
        "patient_id": "patient_ravi_kumar",
        "hospital_id": "hosp_care_vizag",
        "hospital_name": "CARE Hospitals, Visakhapatnam",
        "doctor_id": "doc_vikram_reddy",
        "doctor_name": "Dr. Vikram Reddy",
        "date": "2025-12-10",
        "treatment_type": "Inpatient",
        "diagnosis": "Acute bronchitis — resolved after 3-day inpatient treatment",
        "medicines": ["Augmentin 625mg", "Montelukast 10mg", "Levolin Inhaler"],
        "procedures": ["Chest X-Ray", "Pulmonary Function Test", "Sputum Culture"],
        "notes": "Discharged after 3 days. Complete antibiotic course. Follow-up in 2 weeks.",
        "created_at": "2025-12-10T14:00:00Z",
    },
    {
        "id": "mh_004",
        "patient_id": "patient_ravi_kumar",
        "hospital_id": "hosp_nims_hyd",
        "hospital_name": "NIMS Hyderabad",
        "doctor_id": "doc_ramesh_varma",
        "doctor_name": "Dr. Ramesh Varma",
        "date": "2025-03-20",
        "treatment_type": "Surgery",
        "diagnosis": "Coronary Angioplasty — Single stent placement in LAD artery",
        "medicines": ["Clopidogrel 75mg", "Ecosprin 75mg", "Rosuvastatin 10mg", "Pantoprazole 40mg"],
        "procedures": ["Coronary Angiography", "PTCA with Stent (Drug-Eluting)"],
        "notes": "Successful single-vessel stent placement. Dual antiplatelet therapy for 12 months.",
        "created_at": "2025-03-20T08:00:00Z",
    },
]


class MedicalHistoryService:
    def __init__(self):
        self.collection = db.collection("medical_history")
        self._ensure_seed()

    def _ensure_seed(self):
        for entry in SEED_HISTORY:
            doc = self.collection.document(entry["id"]).get()
            if not doc.exists:
                self.collection.document(entry["id"]).set(entry)
        logger.info("Medical history seed data loaded.")

    def get_patient_history(self, patient_id: str) -> MedicalHistoryResponse:
        docs = self.collection.where("patient_id", "==", patient_id).stream()
        entries = [MedicalHistoryEntry(**d.to_dict()) for d in docs]
        # Sort by date descending (most recent first)
        entries.sort(key=lambda e: e.date, reverse=True)
        return MedicalHistoryResponse(
            patient_id=patient_id,
            total_entries=len(entries),
            entries=entries,
        )

    def add_history_entry(self, req: MedicalHistoryAddRequest) -> MedicalHistoryEntry:
        entry_id = f"mh_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        data = {
            "id": entry_id,
            "patient_id": req.patient_id,
            "hospital_id": req.hospital_id or "",
            "hospital_name": req.hospital_name,
            "doctor_id": req.doctor_id or "",
            "doctor_name": req.doctor_name,
            "date": req.date,
            "treatment_type": req.treatment_type,
            "diagnosis": req.diagnosis,
            "medicines": req.medicines,
            "procedures": req.procedures,
            "notes": req.notes,
            "created_at": now,
        }
        self.collection.document(entry_id).set(data)
        return MedicalHistoryEntry(**data)

    def get_patient_medicines(self, patient_id: str) -> List[str]:
        """Returns a deduplicated list of all medicines from patient history."""
        history = self.get_patient_history(patient_id)
        all_meds = set()
        for entry in history.entries:
            for med in entry.medicines:
                all_meds.add(med)
        return sorted(all_meds)

    def get_patient_hospitals(self, patient_id: str) -> List[str]:
        """Returns a deduplicated list of all hospitals from patient history."""
        history = self.get_patient_history(patient_id)
        hospitals = set()
        for entry in history.entries:
            if entry.hospital_name:
                hospitals.add(entry.hospital_name)
        return sorted(hospitals)


medical_history_service = MedicalHistoryService()
