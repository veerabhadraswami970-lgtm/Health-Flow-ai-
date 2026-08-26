# HealthFlow AI — Database & Schema Specifications

HealthFlow AI uses **Google Cloud Firestore** (or the high-fidelity persistent Mock Firestore engine locally) as its primary NoSQL document store.

## Collections & Document Schemas

### 1. `government_schemes`
- `id` (string, PK): e.g. `pmjay_central`, `aarogyasri_ap_tg`
- `name` (string): Official scheme title
- `type` (string): `Central` | `State` | `UT`
- `state` (string): Jurisdiction state or `All India`
- `department` (string): Sponsoring ministry / trust
- `coverage_amount` (string): Maximum annual coverage per family
- `summary` (string): Scheme scope and coverage summary
- `benefits` (list[string]): Itemized healthcare entitlements
- `eligibility_rules` (map):
  - `min_age` (int), `max_age` (int)
  - `max_income` (float)
  - `applicable_states` (list[string])
  - `target_categories` (list[string])
  - `applicable_diseases` (list[string])
- `required_documents` (list[string]): Documents required for e-KYC
- `official_url` (string): Authoritative portal URL
- `helpline` (string): National/State toll-free helpline
- `source_organization` (string): Authoritative provenance
- `last_verified` (ISO timestamp)
- `data_version` (string)
- `status` (string): `Active` | `Archived`

### 2. `medicines`
- `id` (string, PK): e.g. `med_dolo_650`, `med_telma_40`
- `generic_name` (string): Standard chemical composition
- `brand_name` (string): Trade commercial name
- `composition` (string): Active drug strength per unit
- `dosage_form` (string): `Tablet` | `Capsule` | `Syrup` | `Injection` | `Inhaler`
- `manufacturer` (string): Registered pharmaceutical producer
- `indications` (list[string]): Approved clinical use-cases
- `contraindications` (list[string]): Unsafe patient conditions
- `known_interactions` (list[string]): Drug-drug interaction alerts
- `warnings` (string): Critical patient cautions
- `storage_info` (string): Storage temperature and humidity
- `prescription_required` (bool): `True` for Schedule H/H1
- `source` (string): CDSCO / NLEM Pharmacopoeia provenance

### 3. `prescriptions`
- `id` (string, PK): Unique prescription ID `rx_*`
- `patient_id` (string): Beneficiary ID
- `patient_name` (string): Patient full name
- `doctor_id` (string): Doctor HPR reference
- `doctor_name` (string): Prescribing physician
- `prescription_date` (string, YYYY-MM-DD)
- `diagnosis` (string): Clinical diagnosis
- `items` (list[map]):
  - `medicine_name`, `strength`, `dosage_form`, `frequency`, `duration`, `food_timing`, `instructions`
  - `ocr_confidence` (float 0.0 - 1.0)
  - `needs_human_verification` (bool)
  - `matched_medicine_id` (string, FK to `medicines`)
- `overall_ocr_confidence` (float)
- `status` (string): `ANALYZED_PENDING_REVIEW` | `VERIFIED_BY_PROFESSIONAL`
- `secure_qr_token` (string): Cryptographic JWT access token

### 4. `doctors` (ABDM HPR)
- `id` (string, PK): `doc_*`
- `hpr_id` (string): e.g. `dr.ramesh.varma@hpr`
- `name` (string), `qualification` (string), `specialty` (string)
- `experience_years` (int), `languages` (list[string])
- `hospital_id` (string), `hospital_name` (string), `city` (string), `state` (string)
- `consultation_fee` (float), `is_abdm_verified` (bool)
- `slots` (list[string]): Available OPD slots

### 5. `hospitals` (ABDM HFR)
- `id` (string, PK): `hosp_*`
- `hfr_id` (string): e.g. `IN36100002`
- `name` (string), `facility_type` (string), `address` (string), `city` (string), `state` (string)
- `has_24_7_emergency` (bool), `has_blood_bank` (bool), `has_dialysis` (bool)
- `schemes_empaneled` (list[string]): FK to `government_schemes`
- `total_beds` (int), `helpline` (string), `emergency_contact` (string)

### 6. `blood_banks` (e-RaktKosh)
- `id` (string, PK): `bb_*`
- `name` (string), `address` (string), `city` (string), `state` (string)
- `inventory` (map): `{"A+": 18, "O+": 32, "Platelets": 14, ...}`
- `source` (string): `e-RaktKosh`
- `last_updated` (ISO timestamp)

### 7. `consents` (ABDM Consent Artefacts)
- `id` (string, PK): `consent_*`
- `patient_id` (string), `requester_id` (string), `requester_name` (string), `requester_role` (string)
- `purpose` (string), `allowed_record_types` (list[string])
- `status` (string): `PENDING` | `GRANTED` | `REVOKED` | `EXPIRED`
- `expires_at` (ISO timestamp)

### 8. `audit_logs`
- `id` (string, PK): `audit_*`
- `timestamp` (ISO timestamp), `action` (string), `resource_type` (string), `resource_id` (string)
- `actor_id` (string), `actor_role` (string), `ip_address` (string), `status` (string)
- `details` (map)
