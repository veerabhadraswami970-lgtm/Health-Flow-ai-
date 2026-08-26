"""
HealthFlow AI - Trusted Contact Schemas
Defines data models for adding family/trusted contacts with granular permissions.
"""

from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class TrustedContactPermission(str, Enum):
    READ_RECORDS = "READ_RECORDS"
    VIEW_QR = "VIEW_QR"
    INITIATE_SOS = "INITIATE_SOS"

class TrustedContactInfo(BaseModel):
    name: str = Field(..., description="Full name of the trusted contact")
    relationship: str = Field(..., description="Relationship to the patient")
    phone: str = Field(..., description="Contact phone number")
    email: str = Field(..., description="Contact email address")
    address: str = Field(..., description="Physical address of the contact")

class TrustedContactGrantRequest(BaseModel):
    contact: TrustedContactInfo
    permissions: List[TrustedContactPermission] = Field(..., description="List of granted permissions")

class TrustedContactResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the granted contact")
    contact: TrustedContactInfo
    permissions: List[TrustedContactPermission]
    granted_at: str = Field(..., description="ISO timestamp when the grant was created")
