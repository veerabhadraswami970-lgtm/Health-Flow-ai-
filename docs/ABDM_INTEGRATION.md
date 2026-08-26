# HealthFlow AI — Ayushman Bharat Digital Mission (ABDM) Integration Guide

HealthFlow AI natively integrates with India's National Digital Health Ecosystem across four primary building blocks:

```mermaid
graph TD
    ABDM["National Health Authority (ABDM) Gateway"]
    
    subgraph "ABDM Registry Adapters"
        ABDM --> ABHA["ABHA (Ayushman Bharat Health Account)"]
        ABDM --> HPR["HPR (Healthcare Professional Registry)"]
        ABDM --> HFR["HFR (Health Facility Registry)"]
        ABDM --> UHI["UHI (Unified Health Interface)"]
    end
    
    subgraph "HealthFlow AI Adapters"
        HPR --> HPRAdapter["HPR Adapter (doctor_service.py)"]
        HFR --> HFRAdapter["HFR Adapter (hospital_service.py)"]
        UHI --> UHIAdapter["UHI Adapter (appointment_service.py)"]
        ABHA --> EHRConsent["EHR & Consent Engine (health_record_service.py)"]
    end
```

## 1. Healthcare Professional Registry (HPR)
- Integration adapter: `backend/app/integrations/abdm/hpr_adapter.py`
- Verifies doctor registration numbers, qualifications (MCI / State Medical Council), and specialties.

## 2. Health Facility Registry (HFR)
- Integration adapter: `backend/app/integrations/abdm/hfr_adapter.py`
- Verifies hospital registration numbers, facility type, emergency trauma services, and empaneled schemes.

## 3. Unified Health Interface (UHI)
- Integration adapter: `backend/app/integrations/abdm/uhi_adapter.py`
- Implements Beckn/UHI protocol discovery, slot lookup, booking, cancellation, and status callbacks.
