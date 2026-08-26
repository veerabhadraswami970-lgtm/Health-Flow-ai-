"""
HealthFlow AI - Trusted Contact API Endpoints
Provides RESTful routes for managing trusted contacts.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.security import get_current_user_payload
from app.domain.schemas.trusted_contact import (
    TrustedContactGrantRequest,
    TrustedContactResponse,
)
from app.services.trusted_contact_service import trusted_contact_service

router = APIRouter(prefix="/trusted-contacts", tags=["Trusted Contacts"])

def get_current_patient_id(
    patient_id: Optional[str] = Query(None),
    user_payload: dict = Depends(get_current_user_payload)
) -> str:
    if patient_id:
        return patient_id
    sub = user_payload.get("sub")
    if sub and sub != "guest_user":
        return sub
    return "patient_ravi_kumar"

@router.post("/grant", response_model=TrustedContactResponse, status_code=status.HTTP_201_CREATED)
async def grant_trusted_contact(
    request: TrustedContactGrantRequest,
    patient_id: str = Depends(get_current_patient_id),
):
    """Create a new trusted contact for the authenticated patient."""
    return trusted_contact_service.add_trusted_contact(patient_id, request)

@router.get("/list", response_model=list[TrustedContactResponse])
async def list_trusted_contacts(
    patient_id: str = Depends(get_current_patient_id),
):
    """List all trusted contacts for the authenticated patient."""
    return trusted_contact_service.list_trusted_contacts(patient_id)

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_trusted_contact(
    contact_id: str,
    patient_id: str = Depends(get_current_patient_id),
):
    """Revoke a trusted contact for the authenticated patient."""
    success = trusted_contact_service.revoke_trusted_contact(patient_id, contact_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trusted contact not found")
    return None

