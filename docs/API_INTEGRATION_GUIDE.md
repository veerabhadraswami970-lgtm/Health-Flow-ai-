# HealthFlow AI — External API Integration Guide

## 1. Integrating New State Health Schemes
1. Define scheme parameters in `backend/app/domain/models/scheme.py`.
2. Add the verified scheme record to `SEED_SCHEMES` in `backend/app/db/seed_data.py`.
3. Specify exact eligibility rules: `min_age`, `max_age`, `max_income`, `applicable_states`, `target_categories`, `applicable_diseases`.
4. Provide authoritative verification metadata (`source_url`, `last_verified`, `version`).

## 2. Connecting Live ABDM Gateway Credentials
1. Register on the [NHA ABDM Sandbox Portal](https://sandbox.abdm.gov.in/).
2. Obtain Client ID, Client Secret, and mTLS certificates.
3. Configure environment variables in `.env`:
   ```bash
   USE_MOCK_INTEGRATIONS=False
   ABDM_CLIENT_ID=your_client_id
   ABDM_CLIENT_SECRET=your_client_secret
   ABDM_SANDBOX_BASE_URL=https://dev.abdm.gov.in/gateway/v0.5
   ```
4. The system automatically switches from `MockHPRProvider` / `MockBookingProvider` to `LiveHPRProvider` / `UHIProvider`.

## 3. Configuring Live Cellular Telephony (Twilio / Exotel)
1. Point your inbound phone number webhook to:
   `https://<your-domain>/api/v1/voice/incoming` (HTTP POST).
2. Set webhook callback for events to:
   `https://<your-domain>/api/v1/voice/events` (HTTP POST).
3. Set `TELEPHONY_PROVIDER=twilio` or `exotel` in `.env`.
