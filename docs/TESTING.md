# HealthFlow AI — Testing & Quality Assurance

## 1. Test Suite Architecture
The test suite in `backend/tests/` provides full automated coverage across all 15 platform modules.

```bash
python -m pytest backend/tests/ -v
```

### Coverage Modules:
1. `test_schemes.py`: Tests scheme listings, income ceiling thresholds, state jurisdiction rules, category checks, and disease-to-scheme recommendations.
2. `test_prescriptions.py`: Tests multi-stage OCR entity extraction, dosage parsing, medicine database matching, and doctor certification.
3. `test_qr.py`: Tests zero-PII signed QR generation, expiration verification, and tamper rejection.
4. `test_consent.py`: Tests patient-controlled consent lifecycle and unauthorized access prevention.
5. `test_appointments.py`: Tests UHI booking, slot conflict resolution, rescheduling, and cancellation.
6. `test_telephony.py`: Tests IVR inbound greetings, carrier webhooks, and 4-digit Voice PIN security challenges.
7. `test_ai_orchestrator.py`: Tests multilingual concept normalization (Telugu, Hindi, English), safe tool execution, and emergency SOS routing.
