"""
HealthFlow AI - Patient Profile & Registration Schemas
Comprehensive schemas for full patient lifecycle, multi-step registration,
emergency contacts, and clinical profile.
"""
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum
import re


class RelationshipType(str, Enum):
    FATHER = "Father"
    MOTHER = "Mother"
    BROTHER = "Brother"
    SISTER = "Sister"
    SPOUSE = "Spouse"
    WIFE = "Wife"
    HUSBAND = "Husband"
    SON = "Son"
    DAUGHTER = "Daughter"
    GUARDIAN = "Guardian"
    FRIEND = "Friend"
    OTHER = "Other"


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"
    PREFER_NOT_TO_SAY = "Prefer not to say"


class MedicationItem(BaseModel):
    medicine_name: str
    dosage: str = "1 tablet"
    frequency: str = "1-0-1"
    duration: str = "30 days"


class MedicalHistorySummary(BaseModel):
    surgeries: List[str] = []
    hospitalizations: List[str] = []
    major_illnesses: List[str] = []
    notes: str = ""


class EmergencyContactInfo(BaseModel):
    name: str = ""
    relationship: str = RelationshipType.OTHER.value
    phone: str = ""
    alternate_phone: str = ""
    address: str = ""


class PatientRegistrationRequest(BaseModel):
    # Step 1: Personal Info
    full_name: str = Field(..., min_length=2, description="Patient full legal name")
    date_of_birth: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    age: Optional[int] = None
    gender: str = Field(default="Male", description="Male | Female | Other | Prefer not to say")
    height: Optional[float] = Field(default=None, description="Height in cm")
    weight: Optional[float] = Field(default=None, description="Weight in kg")
    blood_group: str = Field(default="B+", description="A+ | A- | B+ | B- | AB+ | AB- | O+ | O-")
    aadhaar_abha_id: Optional[str] = Field(default="", description="ABHA Health ID or Aadhaar reference")
    profile_photo: Optional[str] = Field(default="", description="Base64 photo URL or avatar image")
    preferred_language: str = Field(default="en", description="en | te | hi | ta | kn | etc.")

    # Step 2: Contact Info
    phone: str = Field(..., min_length=10, description="10-digit primary mobile number")
    email: str = Field(..., description="Valid email address")
    alternate_phone: Optional[str] = ""
    address: str = Field(default="", description="Current residential address")
    city: str = Field(default="Hyderabad", description="City")
    state: str = Field(default="Telangana", description="State / Union Territory")
    district: Optional[str] = "Hyderabad"
    pincode: str = Field(default="500001", description="6-digit postal PIN code")

    # Step 3: Emergency Contact
    emergency_contact: EmergencyContactInfo = Field(..., description="Primary emergency contact")
    alternate_emergency_contact: Optional[EmergencyContactInfo] = None

    # Step 4: Medical Information
    existing_conditions: List[str] = Field(default_factory=list, description="Chronic conditions")
    allergies: List[str] = Field(default_factory=lambda: ["No Known Allergies"], description="Allergies")
    allergy_details: Optional[str] = ""
    current_medications: List[MedicationItem] = Field(default_factory=list, description="Ongoing medications")
    medical_history: Optional[MedicalHistorySummary] = Field(default_factory=MedicalHistorySummary)

    @field_validator("full_name")
    def validate_name(cls, v):
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return clean

    @field_validator("phone")
    def validate_phone(cls, v):
        digits = re.sub(r"[^\d]", "", v)
        if len(digits) < 10:
            raise ValueError("Mobile number must contain at least 10 valid digits.")
        return v.strip()

    @field_validator("email")
    def validate_email(cls, v):
        clean = v.strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Please provide a valid email address.")
        return clean

    @field_validator("pincode")
    def validate_pincode(cls, v):
        clean = v.strip()
        if clean and not re.match(r"^\d{6}$", clean):
            raise ValueError("PIN code must be a valid 6-digit numeric code.")
        return clean

    @field_validator("emergency_contact")
    def validate_emergency_contact(cls, v):
        if not v.name or not v.name.strip():
            raise ValueError("Emergency contact name is required.")
        digits = re.sub(r"[^\d]", "", v.phone)
        if len(digits) < 10:
            raise ValueError("Emergency contact phone number must contain at least 10 digits.")
        return v


class PatientProfile(BaseModel):
    id: str
    name: str
    date_of_birth: str = ""
    age: int = 0
    gender: str = "Male"
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_group: str = ""
    aadhaar_abha_id: str = ""
    profile_photo: str = ""
    preferred_language: str = "en"
    phone: str = ""
    email: str = ""
    alternate_phone: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    district: str = ""
    pincode: str = ""
    known_allergies: List[str] = []
    allergy_details: str = ""
    existing_diseases: List[str] = []
    current_medications: List[MedicationItem] = []
    medical_history_summary: MedicalHistorySummary = MedicalHistorySummary()
    emergency_contact_1: EmergencyContactInfo = EmergencyContactInfo()
    emergency_contact_2: EmergencyContactInfo = EmergencyContactInfo()
    created_at: str = ""
    updated_at: str = ""


class PatientProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_group: Optional[str] = None
    aadhaar_abha_id: Optional[str] = None
    profile_photo: Optional[str] = None
    preferred_language: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    alternate_phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    known_allergies: Optional[List[str]] = None
    allergy_details: Optional[str] = None
    existing_diseases: Optional[List[str]] = None
    current_medications: Optional[List[MedicationItem]] = None
    medical_history_summary: Optional[MedicalHistorySummary] = None
    emergency_contact_1: Optional[EmergencyContactInfo] = None
    emergency_contact_2: Optional[EmergencyContactInfo] = None
class PatientRegistrationResponse(BaseModel):
    patient_id: str
    qr_code: Optional[str] = None
    created_at: str
