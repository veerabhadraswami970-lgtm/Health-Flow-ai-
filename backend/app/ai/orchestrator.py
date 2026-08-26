"""
HealthFlow AI - Agent Orchestrator & Safe Tool Calling Execution Engine
Orchestrates domain agents, routes queries to safe backend services, and enforces healthcare safety rules.
"""
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
from app.domain.schemas.scheme import EligibilityCheckRequest, DiseaseRecommendationRequest
from app.domain.schemas.doctor import DoctorSearchQuery
from app.domain.schemas.hospital import HospitalSearchQuery
from app.domain.schemas.blood_bank import BloodSearchQuery
from app.services.scheme_service import scheme_service
from app.services.doctor_service import doctor_service
from app.services.hospital_service import hospital_service
from app.services.blood_bank_service import blood_bank_service
from app.services.medicine_service import medicine_service
from app.services.prescription_service import prescription_service
from app.services.multilingual_service import multilingual_service
from app.core.logger import logger
from app.core.audit import audit_logger

class AIOrchestrator:
    async def process_user_query(
        self,
        query: str,
        user_id: str = "guest_user",
        explicit_language: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        trace_id = f"trace_{uuid.uuid4().hex[:12]}"
        normalized_query, detected_lang = multilingual_service.normalize_query_concepts(query)
        lang = explicit_language or detected_lang
        q_lower = normalized_query.lower()

        logger.info(f"[AI_ORCHESTRATOR] Trace: {trace_id} | Lang: {lang} | NormQuery: '{normalized_query}'")

        tool_called = None
        tool_result = None
        spoken_response = ""
        structured_data = {}

        # 1. EMERGENCY INTENT (Highest Priority)
        if any(w in q_lower for w in ["emergency", "ambulance", "accident", "trauma", "heart attack", "108", "112", "అత్యవసర", "आपातकाल"]):
            tool_called = "trigger_emergency_assistance"
            hospitals = hospital_service.search_hospitals(HospitalSearchQuery(emergency_only=True))
            nearest_hosp = hospitals[0] if hospitals else None
            hosp_name = nearest_hosp.name if nearest_hosp else "Designated Government District Hospital"
            hosp_phone = nearest_hosp.emergency_contact if nearest_hosp else "108"

            spoken_response = multilingual_service.format_response(
                "emergency_sos", lang, hospital=hosp_name, phone=hosp_phone
            )
            structured_data = {
                "emergency_mode": True,
                "ambulance_hotline": "108",
                "national_emergency": "112",
                "nearest_hospital": nearest_hosp.model_dump() if nearest_hosp else None,
                "first_aid_guidance": "Keep the patient calm, ensure clear airway, do not give liquids if unconscious, call 108 immediately."
            }

        # 2. BLOOD BANK INTENT
        elif any(w in q_lower for w in ["blood", "rakt", "రక్తం", "platelet", "plasma"]):
            tool_called = "search_blood_banks"
            # Extract blood group if mentioned
            bg = None
            bg_map = {
                "o+": "O+", "o positive": "O+", "o +": "O+",
                "o-": "O-", "o negative": "O-", "o -": "O-",
                "a+": "A+", "a positive": "A+", "a +": "A+",
                "a-": "A-", "a negative": "A-", "a -": "A-",
                "b+": "B+", "b positive": "B+", "b +": "B+",
                "b-": "B-", "b negative": "B-", "b -": "B-",
                "ab+": "AB+", "ab positive": "AB+", "ab +": "AB+",
                "ab-": "AB-", "ab negative": "AB-", "ab -": "AB-",
                "platelet": "Platelets", "plasma": "Plasma"
            }
            for phrase, canon in bg_map.items():
                if phrase in q_lower:
                    bg = canon
                    break

            city = None
            for c in ["Hyderabad", "Visakhapatnam", "Delhi", "Bengaluru", "Guntur", "Vijayawada"]:
                if c.lower() in q_lower:
                    city = c
                    break

            banks = blood_bank_service.search_blood_banks(BloodSearchQuery(blood_group=bg, city=city))
            if banks:
                top_bank = banks[0]
                units = top_bank.inventory.get(bg or "O+", "Available")
                spoken_response = multilingual_service.format_response(
                    "blood_found", lang, group=bg or "O+", name=top_bank.name, city=top_bank.city, units=units
                )
                structured_data = {"blood_banks": [b.model_dump() for b in banks[:5]]}
            else:
                spoken_response = "No matching blood banks found with live inventory for the selected criteria. Please check national e-RaktKosh helpline 104/108."
                structured_data = {"blood_banks": []}

        # 3. GOVERNMENT SCHEME / ELIGIBILITY INTENT
        elif any(w in q_lower for w in ["scheme", "pmjay", "aarogyasri", "eligib", "coverage", "insurance", "yojana", "పథకం", "योजना"]):
            tool_called = "find_government_schemes"
            req = EligibilityCheckRequest(
                age=context.get("age", 45) if context else 45,
                annual_income=context.get("annual_income", 180000) if context else 180000,
                state=context.get("state", "Telangana") if context else "Telangana",
                category="BPL / White Ration Card",
                disease=context.get("disease", normalized_query) if context else normalized_query
            )
            elig_res = scheme_service.check_eligibility(req)
            if elig_res.results:
                top_match = elig_res.results[0]
                spoken_response = multilingual_service.format_response(
                    "scheme_found", lang,
                    name=top_match.scheme.name,
                    coverage=top_match.scheme.coverage_amount,
                    url=top_match.scheme.official_url
                )
                structured_data = elig_res.model_dump()
            else:
                spoken_response = "No government schemes matched the specific search. Please check state health portal."
                structured_data = elig_res.model_dump()

        # 4. DOCTOR DISCOVERY INTENT
        elif any(w in q_lower for w in ["doctor", "cardiologist", "physician", "pediatrician", "specialist", "డాక్టర్", "डॉक्टर"]):
            tool_called = "search_doctors"
            spec = None
            for s in ["Cardiology", "Pediatrics", "Pulmonology", "Endocrinology", "Surgery"]:
                if s.lower() in q_lower:
                    spec = s
                    break
            
            city = None
            for c in ["Hyderabad", "Visakhapatnam", "Delhi", "Bengaluru"]:
                if c.lower() in q_lower:
                    city = c
                    break

            doctors = doctor_service.search_doctors(DoctorSearchQuery(query=normalized_query, specialty=spec, city=city))
            if doctors:
                top_doc = doctors[0]
                spoken_response = multilingual_service.format_response(
                    "doctor_found", lang,
                    name=top_doc.name,
                    specialty=top_doc.specialty,
                    hospital=top_doc.hospital_name,
                    city=top_doc.city,
                    slots=", ".join(top_doc.slots[:2])
                )
                structured_data = {"doctors": [d.model_dump() for d in doctors]}
            else:
                spoken_response = "No ABDM registered doctors matched your search criteria."
                structured_data = {"doctors": []}

        # 5. HOSPITAL DISCOVERY INTENT
        elif any(w in q_lower for w in ["hospital", "clinic", "dispensary", "ఆసుపత్రి", "अस्पताल"]):
            tool_called = "search_hospitals"
            hospitals = hospital_service.search_hospitals(HospitalSearchQuery(query=normalized_query))
            if hospitals:
                top_h = hospitals[0]
                spoken_response = f"Found ABDM verified facility: {top_h.name} in {top_h.city}. Helpline: {top_h.helpline}."
                structured_data = {"hospitals": [h.model_dump() for h in hospitals]}
            else:
                spoken_response = "No registered healthcare facilities found matching your location."
                structured_data = {"hospitals": []}

        # 6. MEDICINE INTELLIGENCE INTENT
        elif any(w in q_lower for w in ["medicine", "dolo", "glycomet", "telma", "pan 40", "paracetamol", "tablet", "dosage", "మందులు", "दवा"]):
            tool_called = "explain_medicine"
            med = medicine_service.match_medicine_by_name(normalized_query)
            if not med:
                meds = medicine_service.search_medicines("")
                med = meds[0] if meds else None

            if med:
                spoken_response = multilingual_service.format_response(
                    "medicine_info", lang,
                    brand=med.brand_name,
                    comp=med.composition,
                    ind=med.indications[0],
                    source=med.source
                )
                exp = medicine_service.get_plain_language_explanation(med.id)
                structured_data = exp.model_dump() if exp else {"medicine": med.model_dump()}
            else:
                spoken_response = "Medicine not found in verified national directory. Please consult your physician."
                structured_data = {}

        # 7. DEFAULT HEALTHFLOW GENERAL ASSISTANT
        else:
            tool_called = "general_health_assistant"
            spoken_response = (
                "Welcome to HealthFlow AI. I can assist you in finding Government Schemes (PM-JAY, Aarogyasri), "
                "locating ABDM doctors & hospitals, checking e-RaktKosh blood availability, or analyzing prescriptions."
            )
            structured_data = {"available_modules": ["Schemes", "Doctors", "Hospitals", "Blood Bank", "Prescriptions", "Emergency SOS"]}

        # Log AI interaction
        await audit_logger.log_event(
            action="AI_AGENT_INTERACTION",
            resource_type="AIToolExecution",
            resource_id=tool_called or "general",
            actor_id=user_id,
            actor_role="User",
            status="SUCCESS",
            details={"trace_id": trace_id, "query": query, "tool_called": tool_called, "language": lang}
        )

        return {
            "trace_id": trace_id,
            "detected_language": lang,
            "tool_called": tool_called,
            "spoken_response": spoken_response,
            "structured_data": structured_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

ai_orchestrator = AIOrchestrator()
