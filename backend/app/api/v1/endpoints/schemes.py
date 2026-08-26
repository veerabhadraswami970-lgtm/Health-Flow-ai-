"""
HealthFlow AI - Government Scheme Endpoints (Module 1 & Module 2)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.domain.schemas.scheme import (
    SchemeResponse,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    DiseaseRecommendationRequest
)
from app.services.scheme_service import scheme_service

router = APIRouter(prefix="/schemes", tags=["Government Health Schemes"])

@router.get("", response_model=List[SchemeResponse])
async def list_schemes(
    state: Optional[str] = Query(None, description="Filter by State (e.g. Andhra Pradesh, Telangana, Tamil Nadu)"),
    type: Optional[str] = Query(None, description="Filter by Central or State")
):
    return scheme_service.get_all_schemes(state=state, scheme_type=type)

@router.get("/{scheme_id}", response_model=SchemeResponse)
async def get_scheme(scheme_id: str):
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Government scheme not found")
    return scheme

@router.post("/eligibility", response_model=EligibilityCheckResponse)
async def check_eligibility(req: EligibilityCheckRequest):
    return scheme_service.check_eligibility(req)

@router.post("/recommend-by-disease", response_model=EligibilityCheckResponse)
async def recommend_by_disease(req: DiseaseRecommendationRequest):
    return scheme_service.recommend_by_disease(req)
