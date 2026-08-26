"""
HealthFlow AI - Safe Tool Registry & Function Calling Definitions
Defines deterministic, safe backend tool schemas for the AI Orchestrator.
"""
from typing import Dict, Any, List

TOOL_DEFINITIONS = [
    {
        "name": "find_government_schemes",
        "description": "Find and evaluate government health schemes (e.g. PM-JAY, Aarogyasri, CMCHIS, RAN) based on user age, income, state, category, or disease.",
        "parameters": {
            "type": "object",
            "properties": {
                "age": {"type": "integer", "description": "Patient age in years"},
                "annual_income": {"type": "number", "description": "Annual household income in INR"},
                "state": {"type": "string", "description": "State or Union Territory name (e.g. Telangana, Andhra Pradesh, Delhi)"},
                "category": {"type": "string", "description": "Socioeconomic category e.g. BPL, White Ration Card, SECC, General"},
                "disease": {"type": "string", "description": "Disease or medical condition if applicable (e.g. heart surgery, dialysis, cancer)"}
            },
            "required": ["state", "annual_income"]
        }
    },
    {
        "name": "search_doctors",
        "description": "Search ABDM verified doctors by specialty, city, state, or language.",
        "parameters": {
            "type": "object",
            "properties": {
                "specialty": {"type": "string", "description": "Medical specialty (e.g. Cardiology, Pediatrics, Pulmonology, Diabetology)"},
                "city": {"type": "string", "description": "City name (e.g. Hyderabad, Visakhapatnam, Delhi, Bengaluru)"},
                "language": {"type": "string", "description": "Preferred doctor language (e.g. Telugu, Hindi, English)"}
            }
        }
    },
    {
        "name": "search_hospitals",
        "description": "Search ABDM registered hospitals and facilities by city, emergency capability, dialysis, or empaneled scheme.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"},
                "emergency_only": {"type": "boolean", "description": "Filter only 24/7 emergency trauma hospitals"},
                "has_dialysis": {"type": "boolean", "description": "Filter hospitals with dialysis units"},
                "has_blood_bank": {"type": "boolean", "description": "Filter hospitals with blood banks"}
            }
        }
    },
    {
        "name": "search_blood_banks",
        "description": "Find e-RaktKosh verified blood banks and live inventory for specific blood groups.",
        "parameters": {
            "type": "object",
            "properties": {
                "blood_group": {"type": "string", "description": "Blood group (e.g. O+, A+, B+, AB-, Platelets)"},
                "city": {"type": "string", "description": "City name (e.g. Hyderabad, Delhi, Visakhapatnam)"}
            },
            "required": ["blood_group"]
        }
    },
    {
        "name": "explain_medicine",
        "description": "Lookup verified medical database information for a specific brand or generic medicine.",
        "parameters": {
            "type": "object",
            "properties": {
                "medicine_name": {"type": "string", "description": "Brand name or generic name (e.g. Dolo 650, Glycomet, Telma 40, Augmentin)"}
            },
            "required": ["medicine_name"]
        }
    },
    {
        "name": "trigger_emergency_assistance",
        "description": "Trigger urgent emergency triage protocol, locate nearest trauma center and display national emergency hotlines (108, 112).",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "Current city of user"},
                "emergency_nature": {"type": "string", "description": "Brief nature of emergency (e.g. chest pain, severe accident, breathing difficulty)"}
            }
        }
    }
]
