"""
HealthFlow AI - Authentication & Profile Endpoints
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import create_access_token, get_current_user_payload, UserRole
from app.domain.schemas.auth import RegisterUserRequest, LoginUserRequest, AuthUserResponse
from app.domain.schemas.patient import PatientRegistrationRequest, PatientRegistrationResponse
from app.services.user_service import user_service
from app.services.patient_service import patient_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    patient_id: Optional[str] = None
    role: str
    name: str

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginUserRequest):
    user = user_service.authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    token = create_access_token(
        subject=user["id"],
        role=user["role"],
        claims={"name": user.get("name", user.get("email", "")), "patient_id": user.get("patient_id")}
    )
    return LoginResponse(
        access_token=token,
        user_id=user["id"],
        patient_id=user.get("patient_id"),
        role=user["role"],
        name=user.get("name", user.get("email", ""))
    )

@router.post("/register", response_model=AuthUserResponse)
async def register_user(req: RegisterUserRequest):
    # Role Security Guard: Disallow self-registration as admin
    restricted_roles = [UserRole.SYSTEM_ADMIN, UserRole.DATA_ADMIN, UserRole.HOSPITAL_ADMIN]
    if req.role in restricted_roles or req.role.value in ["SystemAdmin", "DataAdmin", "HospitalAdmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative accounts cannot be self-registered publicly. Contact system administration."
        )

    # Check for existing email
    existing = user_service.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in instead."
        )

    # Validate password length
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters long."
        )

    # Create patient profile in clinical registry
    patient_req = PatientRegistrationRequest(**req.patient_info)
    patient_resp = patient_service.register_patient(patient_req)

    # Create auth user linked to patient
    user = user_service.create_user(
        email=req.email,
        password=req.password,
        role=req.role.value if hasattr(req.role, 'value') else req.role,
        patient_id=patient_resp.patient_id
    )

    # Generate active session JWT token
    token = create_access_token(
        subject=user["id"],
        role=user["role"],
        claims={"name": req.patient_info.get("full_name", req.email), "patient_id": patient_resp.patient_id}
    )

    return AuthUserResponse(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        patient_id=patient_resp.patient_id,
        role=user["role"],
        name=req.patient_info.get("full_name", req.email),
        qr_code=patient_resp.qr_code,
        created_at=patient_resp.created_at
    )

@router.get("/profile")
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    return {
        "user_id": current_user.get("sub"),
        "patient_id": current_user.get("patient_id"),
        "role": current_user.get("role", UserRole.PATIENT.value),
        "name": current_user.get("name", "HealthFlow Beneficiary"),
        "is_guest": current_user.get("is_guest", False)
    }

