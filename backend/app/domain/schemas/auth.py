from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "Patient"
    DOCTOR = "Doctor"
    HOSPITAL_ADMIN = "HospitalAdmin"
    PHARMACIST = "Pharmacist"
    BLOOD_BANK_ADMIN = "BloodBankAdmin"
    SYSTEM_ADMIN = "SystemAdmin"
    DATA_ADMIN = "DataAdmin"

class RegisterUserRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    role: UserRole = Field(default=UserRole.PATIENT, description="User role")
    patient_info: dict = Field(..., description="Patient registration fields as defined in PatientRegistrationRequest")

class LoginUserRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")

class AuthUserResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    patient_id: Optional[str] = None
    role: str
    name: str
    qr_code: Optional[str] = None
    created_at: str
