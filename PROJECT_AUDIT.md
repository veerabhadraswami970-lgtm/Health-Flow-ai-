# HealthFlow AI — Comprehensive Project Audit (Phase 0)

**Date**: August 20, 2026  
**Environment**: Windows / VS Code / Python 3.13 / Node v22  
**Approach**: Existing Application Enhancement (Surgical fix without full rewrite)  

---

## 1. Current Architecture Overview

```
+-------------------------------------------------------------------------------+
|                               FRONTEND                                        |
|  React 18 + Vite 5 + Vanilla CSS Design System (Glassmorphic Dark UI)          |
|  Stateful Navigation Tabs (18 modules) • i18n Translations (EN, TE, HI)       |
|  API Layer: frontend/src/services/api.js -> Fetch API Client                  |
+---------------------------------------+---------------------------------------+
                                        | (Vite Proxy: /api -> :8000/api/v1)
                                        v
+---------------------------------------+---------------------------------------+
|                               BACKEND                                         |
|  FastAPI 0.110.0 • Python 3.13.7 • Uvicorn Server (:8000)                     |
|  Modular Domain Layer: Schemas (Pydantic v2), Services, Adapters, AI Tools    |
|  Security: JWT Bearer Tokens (HS256) + Passlib Bcrypt + Cryptographic QR Sign|
|  Audit Logger: JSON-backed immutable clinical event stream                    |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                            PERSISTENCE & DATA                                 |
|  Storage Engine: Local JSON Data Store (backend/data_store/) & Mock Firestore |
|  Collections: users, patients, schemes, medicines, doctors, hospitals,        |
|               blood_banks, prescriptions, health_records, health_qrs,         |
|               reminders, trusted_contacts, telephony_logs                     |
+-------------------------------------------------------------------------------+
```

---

## 2. Module Status & Classification

| Module | Location / Files | Current State | Action Plan |
|---|---|---|---|
| **01. Govt Scheme Finder** | `SchemeFinder.jsx`, `scheme_service.py` | ✅ **Working** | **Preserve**: Central/State rules engine with PM-JAY, Aarogyasri, CMCHIS, RAN, PMNDP, Swasthya Sathi |
| **02. Disease → Scheme Recommendation** | `DiseaseSchemeFinder.jsx`, `scheme_service.py` | ✅ **Working** | **Preserve**: Diagnostic category mapping, entitlement scoring, non-hallucinatory disclaimers |
| **03. AI Prescription Reader** | `PrescriptionAnalyzer.jsx`, `prescriptions.py`, `prescription_service.py` | ⚠️ **Partially Implemented** | **Repair (Phase 3)**: Connect real file uploads (JPG/PNG/WEBP/PDF), OCR extraction, link to Medicine Intelligence DB, secure QR token, prescription history |
| **04. Medicine Intelligence** | `MedicineDirectory.jsx`, `medicine_service.py` | ✅ **Working** | **Preserve**: CDSCO database, indications, contraindications, drug interactions |
| **05. Medicine Scanner** | `MedicineScanner.jsx`, `medicine_scanner_service.py` | ✅ **Working** | **Preserve**: Packaging text OCR and composition analysis |
| **06. Doctor Discovery (ABDM HPR)** | `DoctorDiscovery.jsx`, `doctor_service.py` | ✅ **Working** | **Preserve**: HPR ID verified doctors, specialty filtering, booking triggers |
| **07. Hospital Discovery (ABDM HFR)** | `HospitalDiscovery.jsx`, `hospitals.py`, `hospital_service.py` | ❌ **High Priority Broken** | **Repair (Phases 4 & 5)**: Add interactive Leaflet map, browser GPS integration, nearby radial search (2/5/10/25/50km), distance calculation, emergency filter, directions |
| **08. Blood Bank Finder (e-RaktKosh)** | `BloodBankFinder.jsx`, `blood_banks.py`, `blood_bank_service.py` | ⚠️ **Partially Implemented** | **Repair (Phase 6)**: Connect browser GPS proximity, blood group availability filters, distance display, call & directions |
| **09. Patient Registration** | `RegistrationWizard.jsx`, `patients.py`, `auth.py`, `user_service.py` | ❌ **High Priority Broken** | **Repair (Phase 2)**: Add real password & email auth, validation, role security (Patient vs Doctor verification vs Admin restriction), user profile persistence, instant login session |
| **10. Appointment Booking (UHI)** | `AppointmentBooking.jsx`, `appointment_service.py` | ✅ **Working** | **Preserve**: Slot reservations, token confirmation, rescheduling & cancellations |
| **11. AI Multilingual Voice** | `VoiceAssistant.jsx`, `voice_service.py`, `orchestrator.py` | ✅ **Working** | **Preserve**: Web Speech API audio processing, LLM tool execution in EN, TE, HI |
| **12. Telephony Voice Simulator** | `TelephonySimulator.jsx`, `telephony_service.py` | ✅ **Working** | **Preserve**: Inbound IVR call flow, DTMF digit routing, 4-digit Voice PIN security |
| **13. Digital Health Records & Consent** | `HealthRecords.jsx`, `health_record_service.py` | ✅ **Working** | **Preserve**: ABDM consent lifecycle (Request, Grant, Revoke, Scope limits) |
| **14. Medicine Reminders** | `MedicineReminders.jsx`, `reminder_service.py` | ✅ **Working** | **Preserve**: Dosage schedules, alerts, mock voice notifications |
| **15. Emergency SOS & Hotlines** | `EmergencyModal.jsx`, `emergency_service.py` | ⚠️ **Partially Implemented** | **Repair (Phase 7)**: Dynamic GPS location triage, nearest 24/7 trauma facility lookup, emergency contact alerting |
| **16. Secure Health QR** | `QRScannerViewer.jsx`, `health_qr_service.py`, `qr_service.py` | ✅ **Working** | **Preserve**: Ephemeral cryptographic QR tokens, emergency medical disclosure |
| **17. Admin Dashboard** | `AdminDashboard.jsx`, `admin.py`, `ingestion_service.py` | ✅ **Working** | **Preserve**: System metrics, dataset ingestion, audit logs |
| **18. Trusted Contacts** | `TrustedContactModal.jsx`, `trusted_contact_service.py` | ✅ **Working** | **Preserve**: Granular medical record access delegation |

---

## 3. Specific Root Cause Analysis of Problems from Videos

### Video 1 — Hospitals & Blood Bank Discovery (Location & Map)
1. **Root Cause**: `HospitalDiscovery.jsx` does not currently render an interactive map (Leaflet / OpenStreetMap). It only renders static card grids.
2. **Root Cause**: No browser `navigator.geolocation` lifecycle hook is implemented to detect user coordinates and calculate distances on the fly.
3. **Root Cause**: Backend `/api/v1/hospitals/search` does not accept `lat`, `lng`, and `radius` parameters with Haversine distance calculations.
4. **Root Cause**: No radial fallback (e.g., "No hospitals within 5 km. Try 10 km, 25 km, 50 km").

### Video 2 — Patient Registration
1. **Root Cause**: `RegistrationWizard.jsx` does not collect user password / credentials and only registers a raw patient document via `/api/v1/patients/register` without creating an authenticated user record (`users` collection).
2. **Root Cause**: After registration, the session is not authenticated, leaving the user in an unauthenticated guest state instead of logging them in with a JWT token and redirecting to their dashboard.
3. **Root Cause**: Role security is missing — public registration must enforce the Patient role, require proof/verification for Doctor/Hospital Admin, and disallow Admin self-selection.

### Video 3 — AI Prescription Reader Pipeline
1. **Root Cause**: `PrescriptionAnalyzer.jsx` is primarily configured for a textarea string input or simulated sample text rather than end-to-end multi-format file upload (JPG, PNG, WEBP, PDF) with drag-and-drop.
2. **Root Cause**: Backend `/api/v1/prescriptions/upload` was returning a hardcoded sample string rather than performing intelligent image/PDF parsing.
3. **Root Cause**: Prescription medicines need full linkage with the verified CDSCO Medicine Intelligence database to display generic composition, precautions, and warnings.

---

## 4. Phased Implementation Roadmap

```text
PHASE 0: Project Understanding (COMPLETED: PROJECT_AUDIT.md created)
   ↓
PHASE 1: Foundation & API Error Handling Standard
   ↓
PHASE 2: Patient Registration & Role-Based Auth Workflow
   ↓
PHASE 3: AI Prescription Pipeline (Upload, OCR, Normalization, QR, History)
   ↓
PHASE 4: Reusable Geolocation Service (GPS, Permissions, Fallbacks)
   ↓
PHASE 5: Hospitals Discovery (Leaflet Map, Markers, Distance, 5-50km Radii, Directions)
   ↓
PHASE 6: Blood Bank Proximity Finder (GPS distance, Live stock, Blood group filter)
   ↓
PHASE 7: Emergency SOS System (GPS Triage, Nearest 24/7 Trauma, Contact Alert)
   ↓
PHASE 8: Modern UI / Subtle 3D / Responsiveness
   ↓
PHASE 9: Security Audit & Verification
   ↓
PHASE 10 & 11: Full Regression Testing (All 35+ automated tests + UI validation)
```

---

## 5. Files to be Modified / Created

### Frontend:
- `frontend/src/services/locationService.js` (NEW: Reusable browser geolocation & geocoding helper)
- `frontend/src/components/RegistrationWizard.jsx` (MODIFY: Add Account details, Password validation, Role security, Instant login)
- `frontend/src/components/HospitalDiscovery.jsx` (MODIFY: Add interactive Leaflet map, GPS centering, Radius selector, Distance, Directions)
- `frontend/src/components/BloodBankFinder.jsx` (MODIFY: Add GPS proximity calculation, Directions)
- `frontend/src/components/PrescriptionAnalyzer.jsx` (MODIFY: Add drag & drop file upload, Multi-format validation, Progress stages, Medicine Intelligence linking)
- `frontend/src/components/EmergencyModal.jsx` (MODIFY: Add real GPS coordinate integration)
- `frontend/src/services/api.js` (MODIFY: Add nearby hospital/blood bank query parameters, auth login/register helpers)

### Backend:
- `backend/app/api/v1/endpoints/hospitals.py` (MODIFY: Support `lat`, `lng`, `radius`, `emergency_only`, `specialty` query params)
- `backend/app/services/hospital_service.py` (MODIFY: Add Haversine distance computation and radial sorting)
- `backend/app/domain/schemas/hospital.py` (MODIFY: Add latitude/longitude/radius parameters)
- `backend/app/api/v1/endpoints/auth.py` (MODIFY: Standardize unified registration & login)
- `backend/app/services/prescription_service.py` (MODIFY: Robust entity extraction & image handling)

---

## 6. Dependencies & Requirements
- **Frontend Dependencies**:
  - `leaflet` & `react-leaflet` for OpenStreetMap map visualization.
  - `lucide-react` (already installed)
- **Backend Dependencies**:
  - `fastapi`, `uvicorn`, `pydantic`, `python-jose`, `passlib`, `pillow`, `pypdf2` (already installed in `venv`)

---

## 7. Medical Safety & Zero Hallucination Guardrails
- All scheme criteria must be evaluated deterministically against stored government rules.
- Medicine interactions and contraindications must come strictly from the CDSCO database.
- Missing values will display `"Not available"` or `"Needs verification"` — no medical fabrication.
- Emergency disclaimers will be prominently displayed on all AI outputs.
