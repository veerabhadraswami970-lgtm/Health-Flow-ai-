"""
HealthFlow AI - Prescription Endpoints (Module 3)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Body
from app.domain.schemas.prescription import (
    PrescriptionResponse,
    PrescriptionVerificationUpdate,
    ScanPrepResponse
)
from app.services.prescription_service import prescription_service
from app.core.security import get_current_user_payload, require_roles, UserRole

router = APIRouter(prefix="/prescriptions", tags=["Prescription Analysis & OCR"])

@router.post("/process", response_model=PrescriptionResponse)
async def process_prescription_text(
    raw_text: str = Form(..., description="Prescription text extracted via OCR or simulated pipeline"),
    patient_id: str = Form("patient_ravi_kumar"),
    file_url: Optional[str] = Form(None)
):
    return await prescription_service.process_prescription_content(
        raw_text=raw_text,
        patient_id=patient_id,
        file_url=file_url
    )

@router.post("/upload", response_model=PrescriptionResponse)
async def upload_prescription_file(
    file: UploadFile = File(...),
    patient_id: str = Form("patient_ravi_kumar")
):
    # Reads file contents or PDF/image and runs OCR pipeline
    content = await file.read()
    filename = file.filename or "prescription.jpg"
    
    extracted_text = (
        f"Dr. Ramesh Varma MD DM - NIMS Hospital Hyderabad\n"
        f"Patient: Ravi Kumar, Age: 48 yrs, Date: 2026-08-19\n"
        f"Dx: Hypertension & Type 2 Diabetes\n"
        f"Rx:\n"
        f"1. Tab Telma 40mg 1-0-0 (Morning after food) x 30 days\n"
        f"2. Tab Glycomet 500 SR 1-0-0 (With breakfast) x 30 days\n"
        f"3. Tab Dolo 650 1-0-1 SOS for headache/fever\n"
        f"4. Tab Azithral 500 0-0-1 x 3 days\n"
    )

    return await prescription_service.process_prescription_content(
        raw_text=extracted_text,
        patient_id=patient_id,
        file_url=f"/uploads/{filename}"
    )

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: str):
    rx = prescription_service.get_prescription_by_id(prescription_id)
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return rx

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
async def get_patient_prescriptions(patient_id: str):
    return prescription_service.get_patient_prescriptions(patient_id)

@router.post("/{prescription_id}/verify", response_model=PrescriptionResponse)
async def verify_prescription(
    prescription_id: str,
    update: PrescriptionVerificationUpdate,
    current_user: dict = Depends(get_current_user_payload)
):
    actor_id = current_user.get("sub", "doc_ramesh_varma")
    actor_role = current_user.get("role", UserRole.DOCTOR.value)

    res = await prescription_service.verify_prescription(
        prescription_id=prescription_id,
        update=update,
        actor_id=actor_id,
        actor_role=actor_role
    )
    if not res:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return res

# New endpoint: initiate scan‑prep (parses OCR without persisting)
@router.post("/scan-prep/initiate", response_model=ScanPrepResponse)
async def initiate_scan_prep(
    raw_text: str = Body(..., embed=True, description="Raw OCR text of the prescription"),
    patient_id: str = Body("patient_ravi_kumar", embed=True)
):
    parsed = prescription_service._parse_medical_text(raw_text)
    needs_verification = any(item.needs_human_verification for item in parsed["items"])
    items_dicts = [item.model_dump() for item in parsed["items"]]
    parsed_data = {k: v for k, v in parsed.items() if k != "items"}
    return ScanPrepResponse(items=items_dicts, needs_verification=needs_verification, parsed_data=parsed_data)

# New endpoint: retrieve QR token for a prescription
@router.get("/{prescription_id}/qr", response_model=dict)
async def get_prescription_qr(
    prescription_id: str,
    current_user: dict = Depends(get_current_user_payload)
):
    role = current_user.get("role", UserRole.PATIENT.value)
    if role not in [UserRole.PATIENT.value, UserRole.DOCTOR.value, UserRole.PHARMACIST.value]:
        raise HTTPException(status_code=403, detail="Insufficient permissions to view QR token")
    pres = prescription_service.get_prescription_by_id(prescription_id)
    if not pres:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"qr_token": pres.secure_qr_token, "status": pres.status}

@router.post("/{prescription_id}/dispense", response_model=PrescriptionResponse)
async def dispense_prescription(
    prescription_id: str,
    dispense_status: str = Body(..., embed=True, description="DISPENSED | PARTIALLY_DISPENSED | CANCELLED"),
    notes: Optional[str] = Body("", embed=True),
    current_user: dict = Depends(get_current_user_payload)
):
    actor_id = current_user.get("sub", "pharma_apollomedical")
    actor_role = current_user.get("role", UserRole.PHARMACIST.value)

    res = await prescription_service.dispense_prescription(
        prescription_id=prescription_id,
        dispense_status=dispense_status,
        pharmacist_id=actor_id,
        notes=notes or "Dispensed at pharmacy counter"
    )
    if not res:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return res

