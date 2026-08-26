# HealthFlow AI — Deployment, Containerization & Production Guide

## 1. Docker & Docker Compose Deployment
HealthFlow AI is containerized for zero-dependency local execution and multi-node cloud orchestration.

### Single-Command Multi-Container Launch
```bash
docker-compose up --build -d
```
- **Backend**: Container `healthflow_backend` listening on `http://localhost:8000`.
- **Frontend**: Container `healthflow_frontend` listening on `http://localhost:5173`.

## 2. Production Environment Variables Checklist
- Set `ENVIRONMENT=production`
- Set `DEBUG=False`
- Set `PERSISTENCE_MODE=firestore` and provide valid `FIREBASE_CREDENTIALS_PATH`.
- Configure ABDM Gateway mTLS certificates: `ABDM_CLIENT_ID` and `ABDM_CLIENT_SECRET`.
- Configure Telephony Webhook URLs on Twilio/Exotel carrier dashboard pointing to `https://api.healthflow.ai/api/v1/voice/incoming`.
