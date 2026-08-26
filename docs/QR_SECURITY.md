# HealthFlow AI — Secure QR Digital Prescription Architecture

## 1. Zero-PII Cryptographic Principle
Standard QR codes that embed patient names, medical diagnoses, or drug lists present severe privacy and eavesdropping risks. 

**HealthFlow AI mandates that QR codes contain ZERO Protected Health Information (PHI/PII)**.

### QR Code Payload Structure
The QR code encodes strictly an encrypted, signed JWT token:
```json
{
  "prescription_id": "rx_f4ef512902",
  "patient_id": "patient_ravi_kumar",
  "doctor_id": "doc_ramesh_varma",
  "exp": 1787163000,
  "iat": 1787161200,
  "type": "secure_qr_prescription",
  "iss": "healthflow-ai"
}
```

```mermaid
sequenceDiagram
    actor Patient as Patient / Phone User
    actor Pharmacist as Authorized Pharmacist
    participant Server as HealthFlow Backend (/api/v1/qr)
    participant DB as Firestore Repository
    participant Audit as Immutable Audit Log

    Patient->>Server: Request Secure Prescription QR
    Server->>Server: Generate Signed JWT Token (30-min expiry)
    Server-->>Patient: Render Zero-PII QR Code

    Pharmacist->>Patient: Scans QR Code
    Pharmacist->>Server: POST /api/v1/qr/verify (Token, Scanner Role, Scanner ID)
    Server->>Server: Verify Cryptographic Signature & Expiry
    Server->>DB: Fetch Permitted Prescription Record
    Server->>Audit: Record QR_PRESCRIPTION_ACCESSED Event
    Server-->>Pharmacist: Return Permitted Medication Summary
```

## 2. Compliance & Expiration
- QR tokens expire automatically after 30 minutes (configurable via `QR_TOKEN_EXPIRE_MINUTES`).
- Every scan attempt (successful or rejected) creates an immutable compliance audit record.
