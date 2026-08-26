# HealthFlow AI — Phone Call & Telephony AI Architecture

## 1. Feature Phone Ingress Architecture
For users without smartphones or internet access, HealthFlow AI provides complete IVR and voice-agent interaction over standard cellular phone calls.

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Feature Phone User
    participant Carrier as Telephony Carrier (Twilio/Exotel)
    participant Webhook as /api/v1/voice/incoming
    participant TelephonyService as Telephony State Machine
    participant AuthGuard as Voice PIN / OTP Security
    participant Orchestrator as AI Orchestrator

    Caller->>Carrier: Dials Inbound Helpline (+91-800-123-4567)
    Carrier->>Webhook: POST /api/v1/voice/incoming (CallSid, From, Digits)
    Webhook->>TelephonyService: Evaluate IVR State
    TelephonyService-->>Carrier: TwiML / Response JSON (IVR Menu Greeting)
    Carrier-->>Caller: Speaks IVR Menu (1=Schemes, 2=Blood, 3=Doctors, 4=Prescription, 0=Emergency)

    alt User presses 4 (Prescription / Health Records)
        Caller->>Carrier: Presses '4'
        Carrier->>Webhook: POST /api/v1/voice/incoming (Digits='4')
        Webhook-->>Caller: "Please enter your 4-digit security PIN"
        Caller->>Carrier: Enters '1234'
        Carrier->>AuthGuard: POST /api/v1/voice/verify-pin (CallSid, Phone, PIN)
        AuthGuard->>TelephonyService: Verify Cryptographic Record Access
        TelephonyService-->>Caller: Speaks latest prescription medicines & schedules
    else User speaks natural question
        Caller->>Carrier: Speaks "Find O positive blood in Hyderabad"
        Carrier->>Webhook: POST /api/v1/voice/incoming (SpeechResult)
        Webhook->>Orchestrator: Process query with e-RaktKosh tool
        Orchestrator-->>Carrier: Synthesize audio response
        Carrier-->>Caller: Speaks blood availability results
    end
```

## 2. Voice Security Guardrails
- **Zero Raw PII Disclosure**: Medical history, Aadhaar numbers, or full prescription lists are never read out merely because a caller knows a phone number.
- **Mandatory Voice PIN / OTP**: Access to prescription records requires entering a pre-configured 4-digit security PIN.
- **Audit Trails**: Every call, IVR transition, failed PIN attempt, and disclosure event is recorded in the immutable compliance audit log.
