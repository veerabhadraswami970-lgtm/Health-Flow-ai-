"""
HealthFlow AI - Government Scheme & Deterministic Rules Engine Service
Implements rules-based eligibility computation, disease-to-scheme matching, and authoritative source citation.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.db.firestore_client import db
from app.domain.schemas.scheme import (
    SchemeResponse,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    SchemeMatchResult,
    CriterionResult,
    DiseaseRecommendationRequest
)
from app.core.logger import logger

DISEASE_CATEGORY_MAP = {
    "heart": ["Cardiology", "Cardiovascular Surgery"],
    "cardio": ["Cardiology", "Cardiovascular Surgery"],
    "chest pain": ["Cardiology"],
    "heart attack": ["Cardiology", "Cardiovascular Surgery"],
    "cancer": ["Oncology", "Cancer"],
    "tumor": ["Oncology"],
    "chemo": ["Oncology"],
    "leukemia": ["Oncology", "Cancer"],
    "kidney": ["Nephrology", "Renal Dialysis", "Kidney Transplant"],
    "dialysis": ["Nephrology", "Renal Dialysis", "Chronic Kidney Disease (CKD)"],
    "renal": ["Nephrology", "Kidney Transplant"],
    "creatinine": ["Nephrology", "Chronic Kidney Disease (CKD)"],
    "sugar": ["Endocrinology & Diabetology", "General Medicine"],
    "diabetes": ["Endocrinology & Diabetology", "General Medicine"],
    "stroke": ["Neurology", "Neurosurgery"],
    "brain": ["Neurology", "Neurosurgery"],
    "asthma": ["Pulmonology", "Respiratory"],
    "copd": ["Pulmonology"],
    "lungs": ["Pulmonology"],
    "bone": ["Orthopedics"],
    "fracture": ["Orthopedics", "Polytrauma"],
    "trauma": ["Polytrauma", "Emergency Trauma"],
    "burns": ["Burns", "General Surgery"],
    "liver": ["Liver Transplant", "Gastroenterology"],
    "child": ["Pediatrics"],
    "baby": ["Pediatrics"]
}

class SchemeService:
    def __init__(self):
        self.collection = db.collection("government_schemes")

    def get_all_schemes(self, state: Optional[str] = None, scheme_type: Optional[str] = None) -> List[SchemeResponse]:
        docs = self.collection.stream()
        results = []
        for d in docs:
            data = d.to_dict()
            if state and state.lower() != "all india" and data.get("state") not in ["All India", state]:
                continue
            if scheme_type and data.get("type", "").lower() != scheme_type.lower():
                continue
            results.append(SchemeResponse(**data))
        return results

    def get_scheme_by_id(self, scheme_id: str) -> Optional[SchemeResponse]:
        doc = self.collection.document(scheme_id).get()
        if doc.exists:
            return SchemeResponse(**doc.to_dict())
        return None

    def normalize_disease_categories(self, disease_term: str) -> List[str]:
        term = disease_term.lower().strip()
        matched = set()
        for key, categories in DISEASE_CATEGORY_MAP.items():
            if key in term:
                matched.update(categories)
        if not matched:
            matched.add("General Medicine")
        return list(matched)

    def evaluate_scheme_eligibility(self, scheme: SchemeResponse, req: EligibilityCheckRequest) -> SchemeMatchResult:
        matched_criteria: List[CriterionResult] = []
        unmet_criteria: List[CriterionResult] = []
        rules = scheme.eligibility_rules

        # 1. State check
        state_match = "All India" in rules.applicable_states or req.state.lower() in [s.lower() for s in rules.applicable_states]
        if state_match:
            matched_criteria.append(CriterionResult(
                criterion="State Jurisdiction",
                passed=True,
                details=f"Your state '{req.state}' is eligible under {scheme.name}."
            ))
        else:
            unmet_criteria.append(CriterionResult(
                criterion="State Jurisdiction",
                passed=False,
                details=f"Scheme applies to {', '.join(rules.applicable_states)}, but user is in '{req.state}'."
            ))

        # 2. Income check
        if req.annual_income <= rules.max_income:
            matched_criteria.append(CriterionResult(
                criterion="Income Ceiling",
                passed=True,
                details=f"Annual income ₹{req.annual_income:,.0f} is within the scheme ceiling of ₹{rules.max_income:,.0f}."
            ))
        else:
            unmet_criteria.append(CriterionResult(
                criterion="Income Ceiling",
                passed=False,
                details=f"Annual income ₹{req.annual_income:,.0f} exceeds maximum ceiling of ₹{rules.max_income:,.0f}."
            ))

        # 3. Age check
        if rules.min_age <= req.age <= rules.max_age:
            matched_criteria.append(CriterionResult(
                criterion="Age Limits",
                passed=True,
                details=f"Patient age {req.age} falls within eligible range ({rules.min_age} - {rules.max_age} years)."
            ))
        else:
            unmet_criteria.append(CriterionResult(
                criterion="Age Limits",
                passed=False,
                details=f"Patient age {req.age} is outside the allowed range ({rules.min_age} - {rules.max_age} years)."
            ))

        # 4. Target Category / Socioeconomic check
        user_cat = (req.category or "").lower()
        if not rules.target_categories or any(cat.lower() in user_cat or user_cat in cat.lower() for cat in rules.target_categories) or "all" in [c.lower() for c in rules.target_categories]:
            matched_criteria.append(CriterionResult(
                criterion="Category / Socioeconomic Group",
                passed=True,
                details=f"Category '{req.category}' matches target groups ({', '.join(rules.target_categories) if rules.target_categories else 'Universal'})."
            ))
        else:
            # Not a hard failure if BPL card or low income
            if req.annual_income <= 250000:
                matched_criteria.append(CriterionResult(
                    criterion="Category / Socioeconomic Group",
                    passed=True,
                    details=f"Low income profile qualifies for beneficiary consideration under {scheme.name}."
                ))
            else:
                unmet_criteria.append(CriterionResult(
                    criterion="Category / Socioeconomic Group",
                    passed=False,
                    details=f"Preferred categories: {', '.join(rules.target_categories)}. Current: '{req.category}'."
                ))

        # 5. Disease match check (if disease provided)
        if req.disease:
            norm_cats = self.normalize_disease_categories(req.disease)
            disease_matched = False
            for nc in norm_cats:
                if any(nc.lower() in ad.lower() or ad.lower() in nc.lower() for ad in rules.applicable_diseases):
                    disease_matched = True
                    break
            if disease_matched or not rules.applicable_diseases:
                matched_criteria.append(CriterionResult(
                    criterion="Disease & Specialty Coverage",
                    passed=True,
                    details=f"Condition '{req.disease}' (mapped to {', '.join(norm_cats)}) is covered under this scheme package."
                ))
            else:
                unmet_criteria.append(CriterionResult(
                    criterion="Disease & Specialty Coverage",
                    passed=False,
                    details=f"Condition '{req.disease}' may not have an identified surgical/medical package in this specific scheme."
                ))

        total_rules = len(matched_criteria) + len(unmet_criteria)
        passed_rules = len(matched_criteria)
        score = int((passed_rules / total_rules) * 100) if total_rules > 0 else 0

        # Calculate Status
        if not state_match or (req.annual_income > rules.max_income and rules.max_income < 9000000):
            status = "NOT_ELIGIBLE"
        elif score >= 80:
            status = "POTENTIALLY_ELIGIBLE"
        else:
            status = "PARTIALLY_ELIGIBLE"

        # AI Grounded Explanation
        ai_exp = f"Based on verified scheme rules for {scheme.name}, you meet {passed_rules} of {total_rules} criteria. "
        if status == "POTENTIALLY_ELIGIBLE":
            ai_exp += f"Your annual income (₹{req.annual_income:,.0f}) and state residency ({req.state}) qualify you for potential benefits up to {scheme.coverage_amount}."
        elif status == "PARTIALLY_ELIGIBLE":
            ai_exp += "You meet primary criteria but may require additional documentation (e.g. valid BPL ration card or income certificate)."
        else:
            ai_exp += f"You do not meet one or more primary conditions (such as state jurisdiction or income threshold of ₹{rules.max_income:,.0f})."

        return SchemeMatchResult(
            scheme=scheme,
            status=status,
            match_score=score,
            matched_criteria=matched_criteria,
            unmet_criteria=unmet_criteria,
            ai_explanation=ai_exp,
            required_documents=scheme.required_documents,
            official_source={
                "organization": scheme.source_organization,
                "url": scheme.source_url,
                "helpline": scheme.helpline,
                "last_verified": scheme.last_verified,
                "version": scheme.data_version
            }
        )

    def check_eligibility(self, req: EligibilityCheckRequest) -> EligibilityCheckResponse:
        all_schemes = self.get_all_schemes()
        results: List[SchemeMatchResult] = []
        for s in all_schemes:
            result = self.evaluate_scheme_eligibility(s, req)
            results.append(result)

        # Sort: POTENTIALLY_ELIGIBLE first, then by match_score descending
        results.sort(key=lambda r: (r.status == "POTENTIALLY_ELIGIBLE", r.match_score), reverse=True)

        matched_count = sum(1 for r in results if r.status in ["POTENTIALLY_ELIGIBLE", "PARTIALLY_ELIGIBLE"])

        return EligibilityCheckResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            total_evaluated=len(all_schemes),
            matched_count=matched_count,
            results=results
        )

    def recommend_by_disease(self, req: DiseaseRecommendationRequest) -> EligibilityCheckResponse:
        elig_req = EligibilityCheckRequest(
            age=req.age,
            annual_income=req.annual_income,
            state=req.state,
            category=req.category,
            gender=req.gender,
            disease=req.disease_or_symptom
        )
        return self.check_eligibility(elig_req)

scheme_service = SchemeService()
