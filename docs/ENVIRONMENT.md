# HealthFlow AI — Environment Configuration

## Environment Variables Dictionary

| Variable | Type | Default | Description |
|---|---|---|---|
| `ENVIRONMENT` | string | `development` | Environment mode (`development`, `staging`, `production`) |
| `DEBUG` | boolean | `True` | Enable FastAPI debug mode and auto-reload |
| `SECRET_KEY` | string | `healthflow-ai-...` | Master cryptographic key for JWT and QR signing |
| `PERSISTENCE_MODE` | string | `local` | `local` (file-backed JSON store) or `firestore` (Google Cloud) |
| `LOCAL_STORAGE_DIR` | string | `backend/data_store` | Local directory for persistent mock collections |
| `FIREBASE_CREDENTIALS_PATH` | string | `None` | Path to `serviceAccountKey.json` for live Firebase |
| `USE_MOCK_INTEGRATIONS` | boolean | `True` | Use local sandbox providers for ABDM and e-RaktKosh |
| `ABDM_CLIENT_ID` | string | `None` | National Health Authority ABDM client ID |
| `ABDM_CLIENT_SECRET` | string | `None` | ABDM Gateway client secret |
| `TELEPHONY_PROVIDER` | string | `mock` | `mock`, `twilio`, or `exotel` |
| `EMERGENCY_AMBULANCE_NUMBER` | string | `108` | National emergency ambulance dial number |
| `EMERGENCY_NATIONAL_NUMBER` | string | `112` | National unified emergency helpline |
