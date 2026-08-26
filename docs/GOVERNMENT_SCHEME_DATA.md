# HealthFlow AI — Government Health Scheme Data & Deterministic Rules Engine

## 1. Authoritative Schemes Coverage
HealthFlow AI maintains verified datasets for both Central and State Government healthcare programs:

| Scheme Code | Scheme Name | Jurisdiction | Maximum Coverage | Target Beneficiary Base | Authoritative Source |
|---|---|---|---|---|---|
| `pmjay_central` | **Ayushman Bharat (AB-PMJAY)** | All India | ₹5,00,000 / family / year | BPL, SECC Deprived, Antyodaya, Senior Citizens 70+ | [pmjay.gov.in](https://pmjay.gov.in) |
| `aarogyasri_ap_tg` | **Dr. YSR Aarogyasri** | AP & Telangana | Up to ₹25,00,000 / family / year | White Ration Card / Rice Card Holders | [ysraarogyasri.ap.gov.in](https://ysraarogyasri.ap.gov.in) |
| `cmchis_tn` | **Chief Minister's Comprehensive (CMCHIS)** | Tamil Nadu | ₹5,00,000 / family / year | Smart Family Card Holders (Income < ₹1.2L) | [cmchistn.com](https://cmchistn.com) |
| `ran_central` | **Rashtriya Arogya Nidhi (RAN)** | All India | Up to ₹20,00,000 one-time | BPL patients at AIIMS / Super Specialty Central Govt Hospitals | [mohfw.gov.in](https://mohfw.gov.in) |
| `pmndp_dialysis` | **Pradhan Mantri National Dialysis (PMNDP)** | All India | 100% Free Hemodialysis | End-Stage Renal Disease (ESRD) / BPL Card Holders | [nhm.gov.in](https://nhm.gov.in) |
| `swasthya_sathi_wb` | **Swasthya Sathi Scheme** | West Bengal | ₹5,00,000 / family / year | Universal Coverage (Issued to female head of household) | [swasthyasathi.gov.in](https://swasthyasathi.gov.in) |

## 2. Deterministic Eligibility Rules Evaluation
Eligibility is computed using hard criteria:
1. **State Jurisdiction**: Checks user state against `applicable_states`.
2. **Income Ceiling**: Verifies `annual_income <= max_income`.
3. **Age Range**: Verifies `min_age <= age <= max_age`.
4. **Target Category**: Checks BPL / Ration Card / SECC criteria.
5. **Disease & Specialty Coverage**: Maps condition to covered specialty packages.

Every output includes the mandatory disclaimer:
> *"Potentially eligible based on the information provided. HealthFlow AI does not guarantee government approval. Official verification at empaneled centres is mandatory."*
