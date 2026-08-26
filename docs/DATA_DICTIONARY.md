# HealthFlow AI — Data Dictionary & Provenance Engine

## 1. Provenance Requirements
Every healthcare entity within HealthFlow AI contains mandatory provenance metadata:
1. `source_id`: Unique identifier of the originating dataset.
2. `source_name`: Official organization (e.g. National Health Authority, CDSCO, NBTC).
3. `source_url`: Verifiable public URL.
4. `version`: Semantic version of the dataset.
5. `checksum_sha256`: Cryptographic hash proving data integrity.
6. `verified_at`: Timestamp of clinical / administrative verification.

## 2. Standardized Field Types
- **Dates**: ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
- **Currency**: Indian Rupees (`INR / ₹`) formatted as float with ceiling definitions.
- **Languages**: BCP-47 language tags (`en-IN`, `te-IN`, `hi-IN`).
- **Identifiers**: Prefixed unique alphanumeric hashes (`rx_*`, `doc_*`, `hosp_*`, `bb_*`, `appt_*`, `consent_*`, `audit_*`).
