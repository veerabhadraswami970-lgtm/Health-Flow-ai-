# HealthFlow AI — Security & Cryptographic Architecture

## 1. Role-Based Access Control (RBAC)
HealthFlow AI enforces least-privilege role boundaries using cryptographic JWT tokens:

| Role | Permitted Actions |
|---|---|
| **Patient** | View personal health records, generate QR tokens, manage consent grants, book appointments. |
| **Doctor** | View verified patient records (with granted consent), certify prescriptions, manage OPD slots. |
| **Pharmacist** | Scan and resolve signed QR prescriptions, verify drug interactions and dispensing status. |
| **Hospital Admin**| Manage facility bed capacity, dialysis units, trauma triage desks, and empaneled schemes. |
| **Data Admin** | Run dataset ingestion pipelines, inspect SHA-256 checksums, monitor data freshness. |
| **System Admin** | Full observability, audit log inspection, AI trace inspection, error tracking. |

## 2. Cryptographic Security Standards
- **Password Hashing**: Bcrypt with auto salt.
- **Access Tokens**: HMAC-SHA256 (HS256) JWT with 24-hour expiration.
- **Prescription QR Tokens**: Ephemeral signed JWT tokens (30-min expiration) containing zero medical PII.
- **Voice Security**: 4-digit PIN challenge gating medical disclosures over telephony lines.
- **Immutable Audit Logging**: Every sensitive action records timestamp, actor ID, role, IP address, resource ID, and status.
