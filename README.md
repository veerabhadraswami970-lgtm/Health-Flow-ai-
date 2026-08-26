# HealthFlow AI — "Healthcare Without Barriers"

[![HealthFlow CI/CD](https://img.shields.io/badge/HealthFlow-Production%20Ready-10b981.svg)](https://github.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com)
[![Vite + React](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-61DAFB.svg)](https://vitejs.dev)
[![ABDM Ready](https://img.shields.io/badge/ABDM-HPR%20%7C%20HFR%20%7C%20UHI-blue.svg)](https://abdm.gov.in)
[![Multilingual](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-orange.svg)](https://github.com)

**HealthFlow AI** is a modular, production-oriented digital healthcare platform engineered to dismantle accessibility barriers across smartphones, modern web, low-literacy multilingual voice interaction, and basic/feature phones via telephony AI voice calls.

The platform strictly enforces the **Healthcare Safety Principle**: **Zero Hallucination** across scheme eligibility, medicine indications, doctor credentials, and blood availability, backed by immutable audit logs, cryptographic QR tokens, and ABDM sandbox adapters.

---

## 🌟 Supported Personas & Devices

1. **Smartphone & Web Users**: Rich glassmorphic responsive web portal with real-time eligibility checkers, prescription OCR viewers, ABDM doctor search, appointment booking, and encrypted health lockers.
2. **Basic / Feature Phone Users**: Inbound telephony voice assistant with IVR keypad routing, voice prompts, and 4-digit PIN challenge for secure medical record disclosure.
3. **Low-Literacy & Vernacular Users**: Multilingual voice recognition and audio speech synthesis in **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** with extensible support for Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, and Odia.

---

## 🚀 Quick Start (Local Zero-Dependency Run)

### 1. Start FastAPI Backend
```bash
# In project root:
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
python backend/run.py
```
*Backend runs on `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`).*

### 2. Start Vite + React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Run Automated Pytest Suite
```bash
python -m pytest backend/tests/ -v
```

---

## 🧩 15 Core Modules Architecture

| Module | Name | Key Functionality |
|---|---|---|
| **01** | **Government Scheme Finder** | Central (PM-JAY, RAN, PMNDP) and State (Aarogyasri, CMCHIS, Swasthya Sathi) schemes with deterministic rules engine. |
| **02** | **Disease → Scheme Recommendation** | Condition normalization, category mapping, entitlement scoring, and non-hallucinatory disclaimer. |
| **03** | **AI Prescription OCR & Normalization** | Entity extraction, CDSCO drug matching, confidence scoring (<80% human review flag), doctor certification. |
| **04** | **Medicine Intelligence Database** | Generic compositions, indications, contraindications, drug interactions, and warnings. |
| **05** | **Secure QR Prescription** | Ephemeral, cryptographically signed zero-PII tokens. Scans generate compliance audit events. |
| **06** | **Digital Health Records & Consent** | Patient health locker with ABDM-style consent lifecycle (Request, Grant, Revoke, Scope limits). |
| **07** | **Doctor Discovery (ABDM HPR)** | Search Healthcare Professional Registry by specialty, language, hospital, and fees. |
| **08** | **Hospital Discovery (ABDM HFR)** | Search Health Facility Registry with 24/7 trauma indicators, bed counts, and dialysis centers. |
| **09** | **Online Appointment Booking (UHI)** | Unified Health Interface slot reservation, confirmation token, reschedule, and cancellation. |
| **10** | **Blood Bank Finder (e-RaktKosh)** | Real-time blood group inventory (A+, B+, AB+, O+, platelets, plasma) with last-verified timestamps. |
| **11** | **AI Multilingual Voice Assistant** | Web Speech API + Audio waveform + LLM tool calling + Speech synthesis playback in EN/TE/HI. |
| **12** | **AI Phone Call Assistant (Telephony)** | Telephony webhooks (`/incoming`, `/events`, `/verify-pin`, `/call-complete`) and Voice PIN verification. |
| **13** | **Multilingual Normalization Engine** | Canonical concept mapping ensuring clinical safety independent of display language. |
| **14** | **Medicine Reminders** | Prescription-derived dosage schedules and multi-channel alerts (SMS, Push, Voice mock). |
| **15** | **Emergency Mode & Hotlines** | Instant SOS triage, 108/112 quick dials, nearest 24/7 trauma emergency hospital routing. |

---

## 📚 Technical Documentation Index

All architecture, database, integration, security, and deployment guides are available in the [`docs/`](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/) directory:

- [System Architecture (`docs/ARCHITECTURE.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/ARCHITECTURE.md)
- [Database & Schema Model (`docs/DATABASE.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/DATABASE.md)
- [REST API Reference (`docs/API.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/API.md)
- [AI Agents & Tool Calling (`docs/AI_AGENTS.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/AI_AGENTS.md)
- [Voice AI Architecture (`docs/VOICE_AI.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/VOICE_AI.md)
- [Phone Call Telephony (`docs/PHONE_CALL_AI.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/PHONE_CALL_AI.md)
- [Government Scheme Data (`docs/GOVERNMENT_SCHEME_DATA.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/GOVERNMENT_SCHEME_DATA.md)
- [Prescription OCR Pipeline (`docs/PRESCRIPTION_OCR.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/PRESCRIPTION_OCR.md)
- [Secure QR Cryptography (`docs/QR_SECURITY.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/QR_SECURITY.md)
- [ABDM & UHI Integration (`docs/ABDM_INTEGRATION.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/ABDM_INTEGRATION.md)
- [e-RaktKosh Blood Bank Integration (`docs/BLOOD_BANK_INTEGRATION.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/BLOOD_BANK_INTEGRATION.md)
- [Security & RBAC Architecture (`docs/SECURITY.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/SECURITY.md)
- [Privacy & Consent Architecture (`docs/PRIVACY.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/PRIVACY.md)
- [Deployment & Docker Guide (`docs/DEPLOYMENT.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/DEPLOYMENT.md)
- [Testing & Quality Assurance (`docs/TESTING.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/TESTING.md)
- [Environment Configuration (`docs/ENVIRONMENT.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/ENVIRONMENT.md)
- [Data Dictionary & Provenance (`docs/DATA_DICTIONARY.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/DATA_DICTIONARY.md)
- [API Integration Guide (`docs/API_INTEGRATION_GUIDE.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/API_INTEGRATION_GUIDE.md)
- [Disaster Recovery & Business Continuity (`docs/DISASTER_RECOVERY.md`)](file:///c:/Users/manoh/Health%20flow%20One%20click/docs/DISASTER_RECOVERY.md)

---
*HealthFlow AI — Designed and built for real-world India Digital Health integration and barrier-free healthcare delivery.*
