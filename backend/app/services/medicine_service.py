"""
HealthFlow AI - Medicine Intelligence Service
Queries verified medicine database, provides non-hallucinatory summaries and plain-language patient explanations.
"""
from typing import List, Optional
from app.db.firestore_client import db
from app.domain.schemas.medicine import MedicineResponse, MedicineAIExplanationResponse
from app.core.logger import logger

class MedicineService:
    def __init__(self):
        self.collection = db.collection("medicines")

    def search_medicines(self, query: str = "") -> List[MedicineResponse]:
        docs = self.collection.stream()
        results = []
        q = query.lower().strip()
        for d in docs:
            data = d.to_dict()
            if not q:
                results.append(MedicineResponse(**data))
                continue
            generic = data.get("generic_name", "").lower()
            brand = data.get("brand_name", "").lower()
            composition = data.get("composition", "").lower()
            indications = " ".join(data.get("indications", [])).lower()
            if q in generic or q in brand or q in composition or q in indications:
                results.append(MedicineResponse(**data))
        return results

    def get_medicine_by_id(self, med_id: str) -> Optional[MedicineResponse]:
        doc = self.collection.document(med_id).get()
        if doc.exists:
            return MedicineResponse(**doc.to_dict())
        return None

    def match_medicine_by_name(self, name: str) -> Optional[MedicineResponse]:
        name_clean = name.lower().strip()
        all_meds = self.search_medicines("")
        # 1. Exact match
        for m in all_meds:
            if m.brand_name.lower() == name_clean or m.generic_name.lower() == name_clean:
                return m
        # 2. Substring match
        for m in all_meds:
            if name_clean in m.brand_name.lower() or name_clean in m.generic_name.lower():
                return m
            if m.brand_name.lower() in name_clean or m.generic_name.lower() in name_clean:
                return m
        # 3. Token match
        tokens = [t for t in name_clean.split() if len(t) > 2]
        for m in all_meds:
            for t in tokens:
                if t in m.brand_name.lower() or t in m.generic_name.lower():
                    return m
        return None

    def get_plain_language_explanation(self, med_id: str) -> Optional[MedicineAIExplanationResponse]:
        med = self.get_medicine_by_id(med_id)
        if not med:
            return None

        # Verified summary from database
        db_summary = (
            f"{med.brand_name} contains {med.composition}. "
            f"Dosage form: {med.dosage_form}. Manufactured by {med.manufacturer}. "
            f"Prescription status: {'Prescription Required (Schedule H/H1)' if med.prescription_required else 'Over The Counter (OTC)'}."
        )

        # Non-hallucinatory, grounded plain language explanation
        ai_explanation = (
            f"• What it is for: Mainly used for treating {', '.join(med.indications[:3])}.\n"
            f"• How it works: {med.generic_name} is active in managing these symptoms.\n"
            f"• Key precautions: {med.warnings}\n"
            f"• Important warning: Avoid if you have {', '.join(med.contraindications[:2])}."
        )

        safety_advisory = (
            f"Important: Do not combine {med.brand_name} with {', '.join(med.known_interactions[:2])}. "
            f"Storage: {med.storage_info}."
        )

        return MedicineAIExplanationResponse(
            medicine=med,
            database_verified_summary=db_summary,
            ai_plain_language_explanation=ai_explanation,
            safety_advisory=safety_advisory
        )

medicine_service = MedicineService()
