"""
Tests for Government Scheme Finder & Eligibility Rules Engine (Module 1 & 2)
"""
import pytest
from app.services.scheme_service import scheme_service
from app.domain.schemas.scheme import EligibilityCheckRequest, DiseaseRecommendationRequest

def test_get_all_schemes():
    schemes = scheme_service.get_all_schemes()
    assert len(schemes) >= 5
    scheme_ids = [s.id for s in schemes]
    assert "pmjay_central" in scheme_ids
    assert "aarogyasri_ap_tg" in scheme_ids

def test_pmjay_eligibility_bpl_low_income():
    # Low income family in Telangana with cardiology condition
    req = EligibilityCheckRequest(
        age=52,
        annual_income=150000,
        state="Telangana",
        category="BPL",
        disease="Heart Attack Angioplasty"
    )
    res = scheme_service.check_eligibility(req)
    assert res.total_evaluated >= 5
    assert res.matched_count >= 1
    
    # PM-JAY and Aarogyasri should be potentially eligible
    statuses = {r.scheme.id: r.status for r in res.results}
    assert statuses["pmjay_central"] == "POTENTIALLY_ELIGIBLE"
    assert statuses["aarogyasri_ap_tg"] == "POTENTIALLY_ELIGIBLE"
    
    # Verify authoritative source info is included
    pmjay_res = next(r for r in res.results if r.scheme.id == "pmjay_central")
    assert pmjay_res.official_source["url"] == "https://pmjay.gov.in/about/pmjay"
    assert len(pmjay_res.required_documents) > 0

def test_high_income_ineligible_for_pmjay():
    # High income user exceeding ceiling
    req = EligibilityCheckRequest(
        age=35,
        annual_income=1200000,
        state="Delhi",
        category="General",
        disease="General Consultation"
    )
    res = scheme_service.check_eligibility(req)
    pmjay_res = next(r for r in res.results if r.scheme.id == "pmjay_central")
    assert pmjay_res.status == "NOT_ELIGIBLE"

def test_disease_to_scheme_recommendation():
    req = DiseaseRecommendationRequest(
        disease_or_symptom="Chronic Renal Failure Dialysis",
        age=50,
        state="Andhra Pradesh",
        annual_income=180000,
        category="White Ration Card"
    )
    res = scheme_service.recommend_by_disease(req)
    assert res.matched_count >= 1
    matched_ids = [r.scheme.id for r in res.results if r.status == "POTENTIALLY_ELIGIBLE"]
    assert "aarogyasri_ap_tg" in matched_ids or "pmndp_dialysis" in matched_ids
