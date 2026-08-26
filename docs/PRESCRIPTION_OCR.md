# HealthFlow AI — Prescription Analysis, OCR & Human-in-the-Loop Verification

## 1. Analysis Pipeline

```mermaid
graph TD
    Input["Prescription (Image / PDF / Camera Upload)"] --> Preprocessing["Image Preprocessing & Noise Reduction"]
    Preprocessing --> OCR["Tesseract / Vision OCR Entity Extraction"]
    OCR --> Extraction["Entity Parser (Doctor, Patient, Date, Dx, Items)"]
    Extraction --> Normalization["Drug Normalizer vs CDSCO Medicine DB"]
    Normalization --> Confidence["Confidence Scoring Engine"]
    
    Confidence --> Check{"Confidence >= 80% & Matched DB?"}
    Check -- Yes --> AutoStatus["Status: VERIFIED_BY_PROFESSIONAL"]
    Check -- No --> FlagHuman["Flag: needs_human_verification = True<br/>Status: ANALYZED_PENDING_REVIEW"]
    
    FlagHuman --> DoctorReview["Doctor / Pharmacist Digital Verification Review"]
    DoctorReview --> Certified["Status: VERIFIED_BY_PROFESSIONAL (Signed)"]
```

## 2. Safety Principles
1. **Never Silently Modify Doctor Orders**: All extracted dosages, frequencies, and instructions preserve original text and are linked to normalized generic compositions.
2. **Confidence Score Transparency**: Every item displays an explicit OCR confidence score (0.0 - 1.0).
3. **Mandatory Human-in-the-Loop**: Any item with confidence below 80% or ambiguous handwriting requires professional human verification before dispensing.
