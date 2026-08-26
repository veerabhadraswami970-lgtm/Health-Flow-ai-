# HealthFlow AI — Privacy, Patient Consent & Data Governance

## 1. Patient-Controlled Consent Architecture
In compliance with ABDM and India's Digital Personal Data Protection (DPDP) Act, patients maintain absolute sovereignty over their health data.

```mermaid
sequenceDiagram
    actor Doctor as Doctor / Hospital
    actor Patient as Patient
    participant ConsentMgr as Consent Engine (/consents)
    participant EHR as Health Records Locker

    Doctor->>ConsentMgr: POST /consents/request (Purpose, Duration, Record Types)
    ConsentMgr-->>Patient: Notify Pending Consent Request
    Patient->>ConsentMgr: POST /consents/action (Action='GRANT')
    ConsentMgr->>ConsentMgr: Issue Signed Consent Artefact (Active)

    Doctor->>EHR: POST /health-records/access-with-consent
    EHR->>ConsentMgr: Validate Active Consent & Scope
    EHR-->>Doctor: Return permitted records (Audit logged)

    opt Revocation
        Patient->>ConsentMgr: POST /consents/action (Action='REVOKE')
        ConsentMgr->>ConsentMgr: Mark Consent as REVOKED (Immediate access cutoff)
    end
```

## 2. Granular Consent Controls
- **Time-Bound**: Consents expire automatically after the designated window (1 to 720 hours).
- **Purpose-Bound**: Limited to specific purposes (e.g. "Cardiology OPD Review", "Emergency Care", "Pharmacy Dispensation").
- **Type-Bound**: Patients can restrict access to specific document categories (e.g. Diagnostic Summaries only, excluding mental health or private notes).
