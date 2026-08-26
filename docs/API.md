# HealthFlow AI — REST API Reference

Base URL: `/api/v1`
Interactive Swagger Documentation: `http://localhost:8000/docs`
ReDoc Reference: `http://localhost:8000/redoc`

---

## Endpoints Summary

### 1. Authentication (`/auth`)
- `POST /auth/login`: Issue role-based JWT access token.
- `GET /auth/profile`: Get current authenticated user profile.

### 2. Government Health Schemes (`/schemes`)
- `GET /schemes`: Filter schemes by `state` and `type` (Central/State).
- `GET /schemes/{id}`: Retrieve detailed scheme package by ID.
- `POST /schemes/eligibility`: Execute deterministic rules engine with patient demographics.
- `POST /schemes/recommend-by-disease`: Normalizes condition and ranks matching packages.

### 3. Prescriptions (`/prescriptions`)
- `POST /prescriptions/process`: OCR entity extraction, drug normalization, and confidence evaluation.
- `POST /prescriptions/upload`: Multipart file upload (Image/PDF) for OCR pipeline.
- `GET /prescriptions/{id}`: Retrieve prescription details and verification status.
- `GET /prescriptions/patient/{patient_id}`: Retrieve all prescriptions for a patient.
- `POST /prescriptions/{id}/verify`: Doctor/Pharmacist digital certification.

### 4. Medicines (`/medicines`)
- `GET /medicines/search`: Search by brand name, generic name, or composition.
- `GET /medicines/{id}`: Retrieve verified medicine intelligence and plain-language explanation.

### 5. Secure QR (`/qr`)
- `POST /qr/generate`: Generate ephemeral cryptographically signed zero-PII token.
- `POST /qr/verify`: Cryptographically verify token, check scanner permissions, and log audit event.

### 6. Digital Health Records & Consents (`/health-records`)
- `GET /health-records`: Get records for authenticated patient.
- `POST /health-records/access-with-consent`: Consent-gated record access for doctors/hospitals.
- `POST /health-records/consents/request`: Create an ABDM-style consent request.
- `POST /health-records/consents/action`: Grant, revoke, or reject consent.

### 7. Doctors (`/doctors`)
- `GET /doctors/search`: Search ABDM HPR doctors by specialty, city, state, or language.
- `GET /doctors/{id}`: Get doctor credentials, consultation fee, and available slots.

### 8. Hospitals (`/hospitals`)
- `GET /hospitals/search`: Search ABDM HFR facilities with 24/7 trauma, dialysis, or scheme filters.
- `GET /hospitals/{id}`: Get hospital details and emergency contact numbers.

### 9. Appointment Booking (`/appointments`)
- `POST /appointments/book`: Reserve and confirm appointment via ABDM UHI interface.
- `POST /appointments/cancel`: Cancel an existing appointment with reason.
- `POST /appointments/reschedule`: Update appointment date and time slot.
- `GET /appointments/patient/{patient_id}`: List patient appointments.

### 10. Blood Banks (`/blood-banks`)
- `GET /blood-banks/search`: Query e-RaktKosh live inventory by blood group and city.
- `GET /blood-banks/{id}`: Get blood bank contact and component breakdown.

### 11. AI Voice & Telephony (`/voice`)
- `POST /voice/interact`: Process multilingual voice transcript, execute tool, and return audio synthesis text.
- `POST /voice/incoming`: Telephony carrier inbound call webhook (IVR state machine).
- `POST /voice/verify-pin`: Voice 4-digit PIN verification challenge for medical record access.
- `POST /voice/events`: Telephony call status event webhook.

### 12. Medicine Reminders (`/reminders`)
- `GET /reminders/patient/{patient_id}`: Get prescription-derived dosage timeline.
- `POST /reminders/{id}/trigger`: Test-fire notification (Voice Call / SMS / Push mock).

### 13. Emergency Assistance (`/emergency`)
- `POST /emergency/sos`: Trigger acute SOS triage, ambulance hotlines, and nearest trauma center routing.

### 14. Admin & Observability (`/admin`)
- `GET /admin/overview`: System health, verified provenance records, live audit logs stream, AI traces.
- `POST /admin/ingest`: Ingest external dataset with SHA-256 checksum and version tracking.
