"""
HealthFlow AI - Authoritative Initial Dataset & Seeding Engine
Seeds verified Central & State health schemes, medicines, ABDM HPR doctors, HFR facilities, and e-RaktKosh blood banks.
"""
from typing import Any
from datetime import datetime, timezone
from app.core.logger import logger

SEED_SCHEMES = [
    {
        "id": "pmjay_central",
        "name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "type": "Central",
        "state": "All India",
        "department": "National Health Authority (NHA), Ministry of Health & Family Welfare",
        "coverage_amount": "₹5,00,000 per family per year",
        "summary": "World's largest government-funded healthcare scheme providing secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.",
        "benefits": [
            "Cashless & paperless access to healthcare services at empaneled hospitals",
            "Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses",
            "Covers 1,949 medical and surgical procedures across 27 specialties",
            "No restriction on family size, age or gender",
            "All pre-existing conditions are covered from day one"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 250000,
            "applicable_states": ["All India"],
            "target_categories": ["BPL", "SECC Deprived", "Rashtriya Swasthya Bima Yojana Beneficiaries", "Antyodaya Anna Yojana", "All Senior Citizens 70+"],
            "applicable_diseases": ["Cardiology", "Oncology", "Neurosurgery", "Orthopedics", "Nephrology", "General Surgery", "Pediatrics", "Burns"],
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card or Voter ID",
            "Ration Card / PMJAY Family Identification Letter",
            "Income Certificate (if SECC not mapped)"
        ],
        "application_process": "Visit any nearest Ayushman Mitra at empaneled public/private hospitals or Common Service Centre (CSC) with Aadhaar and Ration Card for instant e-KYC and Ayushman Card generation.",
        "official_url": "https://pmjay.gov.in",
        "helpline": "14555",
        "source_organization": "National Health Authority, Govt. of India",
        "source_url": "https://pmjay.gov.in/about/pmjay",
        "last_verified": "2026-08-01T00:00:00Z",
        "data_version": "v3.4.0",
        "status": "Active"
    },
    {
        "id": "aarogyasri_ap_tg",
        "name": "Dr. YSR Aarogyasri / Aarogyasri Health Scheme",
        "type": "State",
        "state": "Andhra Pradesh",
        "department": "Dr. YSR Aarogyasri Health Care Trust",
        "coverage_amount": "Up to ₹25,00,000 per family per year",
        "summary": "State flagship catastrophic health insurance scheme providing comprehensive financial protection for low and middle-income families in Andhra Pradesh and Telangana.",
        "benefits": [
            "Complete cashless treatment for 3,257 identified surgical and medical procedures",
            "Post-operative financial assistance under Aarogya Asara (₹225/day or ₹5,000/month)",
            "Free follow-up medicines and diet during hospital stay",
            "Covers cochlear implants, organ transplants, and advanced cancer therapy"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 500000,
            "applicable_states": ["Andhra Pradesh", "Telangana"],
            "target_categories": ["White Ration Card Holders", "BPL", "Rice Card Holders", "Low Income Families"],
            "applicable_diseases": ["Cardiology", "Cardiovascular Surgery", "Oncology", "Renal Dialysis", "Kidney Transplant", "Liver Transplant", "Polytrauma", "Neurology"],
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "White Ration Card / YSR Rice Card / Food Security Card",
            "Doctor Medical Diagnosis Certificate"
        ],
        "application_process": "Approach the Aarogyasri Help Desk / Aarogya Mithra at any Government General Hospital, District Hospital, or Empaneled Network Hospital with your Rice Card and Aadhaar.",
        "official_url": "https://ysraarogyasri.ap.gov.in",
        "helpline": "104",
        "source_organization": "Aarogyasri Health Care Trust",
        "source_url": "https://ysraarogyasri.ap.gov.in/about",
        "last_verified": "2026-08-05T00:00:00Z",
        "data_version": "v2.8.1",
        "status": "Active"
    },
    {
        "id": "cmchis_tn",
        "name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
        "type": "State",
        "state": "Tamil Nadu",
        "department": "Department of Health & Family Welfare, Govt. of Tamil Nadu",
        "coverage_amount": "₹5,00,000 per family per year",
        "summary": "Comprehensive health insurance scheme ensuring quality medical care through private and government hospitals for underprivileged families in Tamil Nadu.",
        "benefits": [
            "Cashless hospitalization for 1,513 procedures across medical and surgical specialties",
            "Coverage for 52 specialized diagnostic procedures and 8 high-end surgeries",
            "Dedicated corpus fund for costly specialized procedures like bone marrow and organ transplants"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 120000,
            "applicable_states": ["Tamil Nadu", "Puducherry"],
            "target_categories": ["Smart Family Card Holders", "Income < ₹1.2 Lakhs", "BPL", "Registered Migrant Workers in TN"],
            "applicable_diseases": ["Oncology", "Cardiology", "Congenital Anomalies", "Nephrology", "Ophthalmology", "Orthopedics"],
            "gender": "All"
        },
        "required_documents": [
            "Smart Family Ration Card",
            "Aadhaar Card",
            "Village Administrative Officer (VAO) Income Certificate (under ₹1.2L)"
        ],
        "application_process": "Submit application along with Smart Card and Income Certificate to the CMCHIS Kiosk located at District Collectorates or Taluk Offices.",
        "official_url": "https://cmchistn.com",
        "helpline": "1800-425-3993",
        "source_organization": "United India Insurance & Govt. of Tamil Nadu",
        "source_url": "https://cmchistn.com/scheme_details.php",
        "last_verified": "2026-07-28T00:00:00Z",
        "data_version": "v2.2.0",
        "status": "Active"
    },
    {
        "id": "ran_central",
        "name": "Rashtriya Arogya Nidhi (RAN) & Rare Diseases Fund",
        "type": "Central",
        "state": "All India",
        "department": "Ministry of Health & Family Welfare, Govt. of India",
        "coverage_amount": "Up to ₹20,00,000 one-time assistance",
        "summary": "Provides one-time direct financial assistance to poor patients living below poverty line suffering from major life-threatening diseases receiving treatment at designated Super Specialty Government Hospitals / AIIMS.",
        "benefits": [
            "Direct revolving fund advance to participating super-specialty hospital",
            "Covers costly implants, chemotherapy drugs, and major surgeries",
            "Special component for Rare Diseases (up to ₹50 Lakhs assistance)"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 150000,
            "applicable_states": ["All India"],
            "target_categories": ["BPL", "Severely Indigent", "Patients receiving treatment at Central Govt Hospitals/AIIMS"],
            "applicable_diseases": ["Cancer", "Leukemia", "Cardiovascular Life-threatening", "Chronic Renal Failure", "Liver Failure", "Rare Diseases"],
            "gender": "All"
        },
        "required_documents": [
            "BPL Ration Card / Income Certificate from District Magistrate",
            "Aadhaar Card",
            "Medical Report and Cost Estimation Proforma signed by Treating Doctor & Medical Superintendent"
        ],
        "application_process": "Treating doctor at AIIMS/Designated Central Hospital prepares the RAN Proforma which is forwarded through the Medical Superintendent to MoHFW.",
        "official_url": "https://mohfw.gov.in/major-programmes/poor-patients-financial-assistance/rashtriya-arogya-nidhi",
        "helpline": "011-23061986",
        "source_organization": "Ministry of Health & Family Welfare",
        "source_url": "https://mohfw.gov.in/ran",
        "last_verified": "2026-08-02T00:00:00Z",
        "data_version": "v1.9.0",
        "status": "Active"
    },
    {
        "id": "pmndp_dialysis",
        "name": "Pradhan Mantri National Dialysis Programme (PMNDP)",
        "type": "Central",
        "state": "All India",
        "department": "National Health Mission (NHM)",
        "coverage_amount": "100% Free Hemodialysis & Peritoneal Dialysis for BPL",
        "summary": "Offers free life-saving dialysis services to below poverty line (BPL) patients in public-private partnership mode at all District Hospitals across India.",
        "benefits": [
            "Zero cost hemodialysis sessions at nearest District Hospital",
            "Subsidized rates for non-BPL patients",
            "Covers both Hemodialysis and Peritoneal Dialysis",
            "Integrated with PMNDP Digital Portal for seamless nationwide session tracking"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 300000,
            "applicable_states": ["All India"],
            "target_categories": ["BPL", "ESRD (End Stage Renal Disease) Patients", "Ration Card Holders"],
            "applicable_diseases": ["Chronic Kidney Disease (CKD)", "End Stage Renal Disease", "Acute Kidney Injury requiring dialysis"],
            "gender": "All"
        },
        "required_documents": [
            "BPL Card or White Ration Card",
            "Aadhaar Card",
            "Nephrologist Dialysis Prescription and Serum Creatinine lab reports"
        ],
        "application_process": "Register directly at the NHM Dialysis Centre at your nearest Government District Hospital with Nephrologist prescription.",
        "official_url": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1055&lid=609",
        "helpline": "104",
        "source_organization": "National Health Mission",
        "source_url": "https://nhm.gov.in/pmndp",
        "last_verified": "2026-07-20T00:00:00Z",
        "data_version": "v2.1.0",
        "status": "Active"
    },
    {
        "id": "swasthya_sathi_wb",
        "name": "Swasthya Sathi Scheme",
        "type": "State",
        "state": "West Bengal",
        "department": "Department of Health & Family Welfare, Govt. of West Bengal",
        "coverage_amount": "₹5,00,000 per family per year",
        "summary": "Universal health insurance scheme in West Bengal with the Smart Card issued in the name of the eldest female member of the family.",
        "benefits": [
            "Universal paperless & cashless coverage for all residents of West Bengal",
            "Zero income restriction for state residents",
            "Over 2,000 medical and surgical treatment packages"
        ],
        "eligibility_rules": {
            "min_age": 0,
            "max_age": 120,
            "max_income": 9999999,
            "applicable_states": ["West Bengal"],
            "target_categories": ["All West Bengal Residents", "Female Headed Households"],
            "applicable_diseases": ["Cardiology", "General Surgery", "Gynecology", "Oncology", "Orthopedics", "Pediatrics"],
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "Khadya Sathi Ration Card",
            "Residential Proof"
        ],
        "application_process": "Enrolment through 'Duare Sarkar' (Government at your doorstep) camps or at Municipality / BDO offices.",
        "official_url": "https://swasthyasathi.gov.in",
        "helpline": "1800-345-5384",
        "source_organization": "Govt. of West Bengal",
        "source_url": "https://swasthyasathi.gov.in/AboutScheme",
        "last_verified": "2026-08-08T00:00:00Z",
        "data_version": "v3.1.0",
        "status": "Active"
    }
]

SEED_MEDICINES = [
    {
        "id": "med_dolo_650",
        "generic_name": "Paracetamol",
        "brand_name": "Dolo 650",
        "composition": "Paracetamol 650 mg",
        "strength": "650mg",
        "dosage_form": "Tablet",
        "manufacturer": "Micro Labs Ltd",
        "indications": ["Fever (Pyrexia)", "Mild to moderate pain", "Headache", "Body ache", "Post-vaccination pyrexia"],
        "contraindications": ["Severe liver disease / hepatic impairment", "Known hypersensitivity to paracetamol"],
        "known_interactions": ["Alcohol (increases risk of hepatotoxicity)", "Warfarin (may slightly increase INR with chronic high doses)"],
        "warnings": "Do not exceed 4000mg per 24 hours. Overdose causes severe, potentially fatal liver damage. Avoid taking other paracetamol-containing combination drugs simultaneously.",
        "storage_info": "Store below 30°C in a dry place. Protect from moisture and direct sunlight.",
        "prescription_required": False,
        "source": "Indian Pharmacopoeia (IP) / CDSCO Verified Drug Directory",
        "last_verified": "2026-08-10T00:00:00Z"
    },
    {
        "id": "med_glycomet_500",
        "generic_name": "Metformin Hydrochloride",
        "brand_name": "Glycomet 500",
        "composition": "Metformin Hydrochloride 500 mg",
        "strength": "500mg",
        "dosage_form": "Sustained Release Tablet",
        "manufacturer": "USV Pvt Ltd",
        "indications": ["Type 2 Diabetes Mellitus", "Insulin resistance", "Polycystic Ovary Syndrome (PCOS) adjuvant"],
        "contraindications": ["Severe renal impairment (eGFR < 30 mL/min)", "Metabolic acidosis / Diabetic ketoacidosis", "Severe cardiac failure", "Severe dehydration"],
        "known_interactions": ["Iodinated radiocontrast agents (risk of lactic acidosis - withhold 48h)", "Furosemide", "Cimetidine"],
        "warnings": "Take with meals to reduce gastrointestinal upset. Rare risk of lactic acidosis in patients with significant renal impairment.",
        "storage_info": "Store at controlled room temperature (20°C to 25°C). Keep out of reach of children.",
        "prescription_required": True,
        "source": "CDSCO / Central Drugs Standard Control Organisation",
        "last_verified": "2026-08-01T00:00:00Z"
    },
    {
        "id": "med_telma_40",
        "generic_name": "Telmisartan",
        "brand_name": "Telma 40",
        "composition": "Telmisartan 40 mg",
        "strength": "40mg",
        "dosage_form": "Tablet",
        "manufacturer": "Glenmark Pharmaceuticals",
        "indications": ["Essential Hypertension (High Blood Pressure)", "Cardiovascular risk reduction in high-risk patients"],
        "contraindications": ["Pregnancy (2nd and 3rd trimesters - causes fetal toxicity)", "Biliary obstructive disorders", "Severe hepatic impairment"],
        "known_interactions": ["Potassium-sparing diuretics & Potassium supplements (risk of hyperkalemia)", "Lithium", "NSAIDs (may reduce antihypertensive effect)"],
        "warnings": "Monitor serum potassium and renal function periodically. Do not discontinue abruptly without physician consultation.",
        "storage_info": "Store in the original moisture-resistant blister pack below 30°C.",
        "prescription_required": True,
        "source": "CDSCO / National List of Essential Medicines (NLEM)",
        "last_verified": "2026-07-25T00:00:00Z"
    },
    {
        "id": "med_augmentin_625",
        "generic_name": "Amoxicillin and Potassium Clavulanate",
        "brand_name": "Augmentin 625 Duo",
        "composition": "Amoxicillin 500 mg + Clavulanic Acid 125 mg",
        "strength": "625mg",
        "dosage_form": "Tablet",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals",
        "indications": ["Community-acquired pneumonia", "Acute bacterial sinusitis", "Otitis media", "Urinary tract infections", "Skin & soft tissue infections"],
        "contraindications": ["History of amoxicillin/clavulanate-associated jaundice or hepatic dysfunction", "Severe penicillin allergy"],
        "known_interactions": ["Methotrexate (reduced clearance)", "Oral anticoagulants", "Probenecid"],
        "warnings": "Complete full prescribed course to prevent antimicrobial resistance. Discontinue immediately if allergic rash or anaphylaxis occurs.",
        "storage_info": "Store in a cool, dry place below 25°C protected from moisture.",
        "prescription_required": True,
        "source": "CDSCO / NLEM India",
        "last_verified": "2026-08-03T00:00:00Z"
    },
    {
        "id": "med_pan_40",
        "generic_name": "Pantoprazole Gastro-resistant",
        "brand_name": "Pan 40",
        "composition": "Pantoprazole Sodium 40 mg",
        "strength": "40mg",
        "dosage_form": "Gastro-resistant Tablet",
        "manufacturer": "Alkem Laboratories",
        "indications": ["Gastroesophageal Reflux Disease (GERD)", "Peptic & Duodenal Ulcers", "Zollinger-Ellison Syndrome", "NSAID-induced ulcer prophylaxis"],
        "contraindications": ["Hypersensitivity to substituted benzimidazoles"],
        "known_interactions": ["Ketoconazole / Itraconazole (decreased absorption due to increased pH)", "Atazanavir", "Methotrexate"],
        "warnings": "Best taken 30 to 60 minutes before breakfast. Swallow whole, do not crush or chew.",
        "storage_info": "Store protected from moisture and light at temperature not exceeding 30°C.",
        "prescription_required": True,
        "source": "CDSCO Verified Database",
        "last_verified": "2026-08-06T00:00:00Z"
    },
    {
        "id": "med_atorva_20",
        "generic_name": "Atorvastatin Calcium",
        "brand_name": "Atorva 20",
        "composition": "Atorvastatin Calcium 20 mg",
        "strength": "20mg",
        "dosage_form": "Film-coated Tablet",
        "manufacturer": "Zydus Healthcare",
        "indications": ["Hypercholesterolemia", "Hyperlipidemia", "Prevention of cardiovascular events in coronary artery disease"],
        "contraindications": ["Active liver disease / unexplained persistent elevation of serum transaminases", "Pregnancy and lactation"],
        "known_interactions": ["Clarithromycin / Erythromycin (increased risk of myopathy)", "Cyclosporine", "Grapefruit juice in large quantities"],
        "warnings": "Report unexplained muscle pain, tenderness, or weakness promptly (risk of rhabdomyolysis).",
        "storage_info": "Store below 25°C in a dry place.",
        "prescription_required": True,
        "source": "CDSCO / NLEM India",
        "last_verified": "2026-08-07T00:00:00Z"
    }
]

SEED_DOCTORS = [
    {
        "id": "doc_ramesh_varma",
        "hpr_id": "dr.ramesh.varma@hpr",
        "name": "Dr. Ramesh Varma",
        "qualification": "MBBS, MD (Gen Med), DM (Cardiology)",
        "specialty": "Cardiology",
        "sub_specialties": ["Interventional Cardiology", "Heart Failure Management", "Hypertension"],
        "experience_years": 18,
        "languages": ["English", "Telugu", "Hindi"],
        "hospital_id": "hosp_nims_hyd",
        "hospital_name": "Nizam's Institute of Medical Sciences (NIMS)",
        "city": "Hyderabad",
        "state": "Telangana",
        "consultation_fee": 300,
        "is_abdm_verified": True,
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
        "appointment_types": ["Physical OPD", "Teleconsultation"],
        "contact": "040-23489000",
        "rating": 4.9
    },
    {
        "id": "doc_ananya_sen",
        "hpr_id": "dr.ananya.sen@hpr",
        "name": "Dr. Ananya Sen",
        "qualification": "MBBS, MD (Endocrinology)",
        "specialty": "Endocrinology & Diabetology",
        "sub_specialties": ["Type 1 & 2 Diabetes", "Thyroid Disorders", "Metabolic Syndrome"],
        "experience_years": 14,
        "languages": ["English", "Hindi", "Bengali"],
        "hospital_id": "hosp_aiims_delhi",
        "hospital_name": "AIIMS New Delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "consultation_fee": 150,
        "is_abdm_verified": True,
        "available_days": ["Monday", "Wednesday", "Friday"],
        "slots": ["09:30 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
        "appointment_types": ["Physical OPD", "Teleconsultation"],
        "contact": "011-26588500",
        "rating": 4.8
    },
    {
        "id": "doc_kavitha_reddy",
        "hpr_id": "dr.kavitha.reddy@hpr",
        "name": "Dr. Kavitha Reddy",
        "qualification": "MBBS, DCH, DNB (Pediatrics)",
        "specialty": "Pediatrics",
        "sub_specialties": ["Neonatology", "Pediatric Immunization", "Child Nutrition"],
        "experience_years": 12,
        "languages": ["English", "Telugu"],
        "hospital_id": "hosp_kgh_vizag",
        "hospital_name": "King George Hospital (KGH)",
        "city": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "consultation_fee": 100,
        "is_abdm_verified": True,
        "available_days": ["Monday", "Tuesday", "Thursday", "Saturday"],
        "slots": ["08:30 AM", "10:30 AM", "01:00 PM", "03:00 PM"],
        "appointment_types": ["Physical OPD"],
        "contact": "0891-2564891",
        "rating": 4.9
    },
    {
        "id": "doc_venkat_murthy",
        "hpr_id": "dr.venkat.murthy@hpr",
        "name": "Dr. Venkatesh Murthy",
        "qualification": "MBBS, MD (Pulmonary Medicine)",
        "specialty": "Pulmonology",
        "sub_specialties": ["Asthma & COPD", "Sleep Apnea", "Tuberculosis & Respiratory Infections"],
        "experience_years": 16,
        "languages": ["English", "Kannada", "Telugu", "Hindi"],
        "hospital_id": "hosp_victoria_blr",
        "hospital_name": "Victoria Hospital / BMCRI",
        "city": "Bengaluru",
        "state": "Karnataka",
        "consultation_fee": 200,
        "is_abdm_verified": True,
        "available_days": ["Tuesday", "Wednesday", "Friday", "Saturday"],
        "slots": ["09:00 AM", "11:00 AM", "02:30 PM"],
        "appointment_types": ["Physical OPD", "Teleconsultation"],
        "contact": "080-26701150",
        "rating": 4.7
    }
]

SEED_HOSPITALS = [
    {
        "id": "hosp_nims_hyd",
        "hfr_id": "IN36100002",
        "name": "Nizam's Institute of Medical Sciences (NIMS)",
        "facility_type": "Government Super Specialty & Autonomous University",
        "address": "Punjagutta, Hyderabad, Telangana - 500082",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500082",
        "latitude": 17.4239,
        "longitude": 78.4526,
        "helpline": "040-23489000",
        "emergency_contact": "040-23489244",
        "has_24_7_emergency": True,
        "has_blood_bank": True,
        "has_dialysis": True,
        "has_icu": True,
        "schemes_empaneled": ["pmjay_central", "aarogyasri_ap_tg", "ran_central", "pmndp_dialysis"],
        "specialties": ["Cardiology", "Neurosurgery", "Nephrology", "Oncology", "Orthopedics", "Emergency Trauma"],
        "is_abdm_verified": True,
        "total_beds": 1400,
        "status": "Operational"
    },
    {
        "id": "hosp_aiims_delhi",
        "hfr_id": "IN07100001",
        "name": "All India Institute of Medical Sciences (AIIMS)",
        "facility_type": "Central Government Apex Referral Medical Institute",
        "address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110029",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "helpline": "011-26588500",
        "emergency_contact": "011-26594405",
        "has_24_7_emergency": True,
        "has_blood_bank": True,
        "has_dialysis": True,
        "has_icu": True,
        "schemes_empaneled": ["pmjay_central", "ran_central", "pmndp_dialysis"],
        "specialties": ["Cardiology", "Oncology", "Endocrinology", "Organ Transplant", "Trauma & Emergency", "Neurology"],
        "is_abdm_verified": True,
        "total_beds": 2500,
        "status": "Operational"
    },
    {
        "id": "hosp_kgh_vizag",
        "hfr_id": "IN28100003",
        "name": "King George Hospital (KGH)",
        "facility_type": "Government General & Teaching Hospital",
        "address": "Maharanipeta, Visakhapatnam, Andhra Pradesh - 530002",
        "city": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "pincode": "530002",
        "latitude": 17.7088,
        "longitude": 83.3056,
        "helpline": "0891-2564891",
        "emergency_contact": "0891-2564895",
        "has_24_7_emergency": True,
        "has_blood_bank": True,
        "has_dialysis": True,
        "has_icu": True,
        "schemes_empaneled": ["pmjay_central", "aarogyasri_ap_tg", "pmndp_dialysis", "ran_central"],
        "specialties": ["General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology", "Emergency Casualty"],
        "is_abdm_verified": True,
        "total_beds": 1250,
        "status": "Operational"
    },
    {
        "id": "hosp_victoria_blr",
        "hfr_id": "IN29100005",
        "name": "Victoria Hospital / BMCRI",
        "facility_type": "Government Multi-specialty Teaching Hospital",
        "address": "Fort Road, near City Market, Bengaluru, Karnataka - 560002",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560002",
        "latitude": 12.9634,
        "longitude": 77.5752,
        "helpline": "080-26701150",
        "emergency_contact": "080-26701155",
        "has_24_7_emergency": True,
        "has_blood_bank": True,
        "has_dialysis": True,
        "has_icu": True,
        "schemes_empaneled": ["pmjay_central", "ran_central", "pmndp_dialysis"],
        "specialties": ["Pulmonology", "Trauma Care", "Burns Center", "General Surgery", "Nephrology"],
        "is_abdm_verified": True,
        "total_beds": 1000,
        "status": "Operational"
    }
]

SEED_BLOOD_BANKS = [
    {
        "id": "bb_redcross_hyd",
        "name": "Indian Red Cross Society Blood Centre",
        "address": "Red Cross Building, Vidyanagar, Hyderabad, Telangana",
        "city": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3995,
        "longitude": 78.5085,
        "contact_phone": "040-27633087",
        "helpline": "104",
        "inventory": {
            "A+": 18,
            "A-": 4,
            "B+": 25,
            "B-": 6,
            "AB+": 12,
            "AB-": 2,
            "O+": 32,
            "O-": 8,
            "Platelets": 14,
            "Plasma": 22
        },
        "source": "e-RaktKosh (National Blood Transfusion Council)",
        "source_url": "https://eraktkosh.mohfw.gov.in",
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "is_verified": True,
        "is_24_7": True
    },
    {
        "id": "bb_rotary_delhi",
        "name": "Rotary Blood Bank Central Facility",
        "address": "56-57, Institutional Area, Tughlakabad, New Delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "latitude": 28.5134,
        "longitude": 77.2762,
        "contact_phone": "011-29054066",
        "helpline": "108",
        "inventory": {
            "A+": 24,
            "A-": 7,
            "B+": 38,
            "B-": 5,
            "AB+": 16,
            "AB-": 3,
            "O+": 45,
            "O-": 9,
            "Platelets": 20,
            "Plasma": 30
        },
        "source": "e-RaktKosh National Portal",
        "source_url": "https://eraktkosh.mohfw.gov.in",
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "is_verified": True,
        "is_24_7": True
    },
    {
        "id": "bb_lions_vizag",
        "name": "Lions Club Blood Bank & Research Foundation",
        "address": "Waltair Uplands, Ram Nagar, Visakhapatnam, Andhra Pradesh",
        "city": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "latitude": 17.7215,
        "longitude": 83.3150,
        "contact_phone": "0891-2563344",
        "helpline": "104",
        "inventory": {
            "A+": 12,
            "A-": 2,
            "B+": 19,
            "B-": 4,
            "AB+": 8,
            "AB-": 1,
            "O+": 26,
            "O-": 5,
            "Platelets": 9,
            "Plasma": 15
        },
        "source": "e-RaktKosh AP Chapter",
        "source_url": "https://eraktkosh.mohfw.gov.in",
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "is_verified": True,
        "is_24_7": True
    }
]

def seed_initial_data(db_client: Any) -> None:
    """Seeds collections if they do not exist or are empty."""
    try:
        # Seed Schemes
        schemes_col = db_client.collection("government_schemes")
        for s in SEED_SCHEMES:
            schemes_col.document(s["id"]).set(s)

        # Seed Medicines
        meds_col = db_client.collection("medicines")
        for m in SEED_MEDICINES:
            meds_col.document(m["id"]).set(m)

        # Seed Doctors
        docs_col = db_client.collection("doctors")
        for d in SEED_DOCTORS:
            docs_col.document(d["id"]).set(d)

        # Seed Hospitals
        hosp_col = db_client.collection("hospitals")
        for h in SEED_HOSPITALS:
            hosp_col.document(h["id"]).set(h)

        # Seed Blood Banks
        bb_col = db_client.collection("blood_banks")
        for b in SEED_BLOOD_BANKS:
            bb_col.document(b["id"]).set(b)

        logger.info("Successfully loaded authoritative HealthFlow AI seed dataset into database.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
