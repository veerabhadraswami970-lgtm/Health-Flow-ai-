"""
HealthFlow AI - Government Health Scheme Schemas
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SchemeEligibilityRules(BaseModel):
    min_age: int = 0
    max_age: int = 120
    max_income: float = 9999999
    applicable_states: List[str] = ["All India"]
    target_categories: List[str] = []
    applicable_diseases: List[str] = []
    gender: str = "All"

class SchemeResponse(BaseModel):
    id: str
    name: str
    type: str  # Central | State | UT
    state: str
    department: str
    coverage_amount: str
    summary: str
    benefits: List[str]
    eligibility_rules: SchemeEligibilityRules
    required_documents: List[str]
    application_process: str
    official_url: str
    helpline: str
    source_organization: str
    source_url: str
    last_verified: str
    data_version: str
    status: str

class EligibilityCheckRequest(BaseModel):
    age: int = Field(..., ge=0, le=125, description="Patient age in years")
    annual_income: float = Field(..., ge=0, description="Annual family income in INR")
    state: str = Field(..., description="State or Union Territory of residence")
    district: Optional[str] = None
    category: Optional[str] = Field("General", description="BPL | White Ration Card | SECC | General | SC | ST | OBC")
    occupation: Optional[str] = Field("Unspecified", description="Farmer | Daily Wage | Unorganized | Salaried | Senior Citizen")
    gender: Optional[str] = Field("All", description="Male | Female | Other | All")
    disease: Optional[str] = Field(None, description="Diagnosed disease or symptom if applicable")

class CriterionResult(BaseModel):
    criterion: str
    passed: bool
    details: str

class SchemeMatchResult(BaseModel):
    scheme: SchemeResponse
    status: str  # POTENTIALLY_ELIGIBLE | PARTIALLY_ELIGIBLE | NOT_ELIGIBLE
    match_score: int  # 0 to 100
    matched_criteria: List[CriterionResult]
    unmet_criteria: List[CriterionResult]
    ai_explanation: str
    required_documents: List[str]
    official_source: Dict[str, str]

class EligibilityCheckResponse(BaseModel):
    timestamp: str
    total_evaluated: int
    matched_count: int
    results: List[SchemeMatchResult]
    disclaimer: str = "Potentially eligible based on the information provided. HealthFlow AI does not guarantee government approval. Official verification at empaneled centres is mandatory."

class DiseaseRecommendationRequest(BaseModel):
    disease_or_symptom: str
    age: int
    state: str
    annual_income: float
    category: Optional[str] = "BPL"
    gender: Optional[str] = "All"
