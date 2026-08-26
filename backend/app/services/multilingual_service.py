"""
HealthFlow AI - Multilingual Normalization & Translation Service
Supports English, Telugu (తెలుగు), and Hindi (हिन्दी) with extensible language dictionaries.
"""
from typing import Dict, Any, Tuple, Optional
import re

# Vernacular dictionary mapping terms to canonical English intents/entities
VERNACULAR_INTENT_MAP = {
    # Telugu (తెలుగు)
    "పథకం": "scheme",
    "ఆరోగ్యశ్రీ": "aarogyasri",
    "డాక్టర్": "doctor",
    "గుండె": "cardiology",
    "రక్తం": "blood",
    "రక్తనిధి": "blood_bank",
    "ఆసుపత్రి": "hospital",
    "మందులు": "medicine",
    "అత్యవసర": "emergency",
    "డోలో": "dolo 650",
    "షుగర్": "diabetes",
    "కిడ్నీ": "kidney",
    "డయాలసిస్": "dialysis",

    # Hindi (हिन्दी)
    "योजना": "scheme",
    "आयुष्मान": "pmjay",
    "डॉक्टर": "doctor",
    "दिल": "cardiology",
    "हार्ट": "cardiology",
    "खून": "blood",
    "रक्त": "blood",
    "अस्पताल": "hospital",
    "दवा": "medicine",
    "दवाई": "medicine",
    "आपातकाल": "emergency",
    "इमरजेंसी": "emergency",
    "शुगर": "diabetes",
    "गुर्दा": "kidney",
    "डायलिसिस": "dialysis"
}

MULTILINGUAL_TEMPLATES = {
    "emergency_sos": {
        "en": "EMERGENCY PROTOCOL ACTIVATED: Dialing National Ambulance 108 / Emergency 112 immediately. Nearest 24/7 trauma emergency hospital: {hospital}, Helpline: {phone}.",
        "te": "అత్యవసర ప్రోటోకాల్ ప్రారంభించబడింది: జాతీయ అంబులెన్స్ 108 / 112 కి వెంటనే కాల్ చేయండి. సమీప 24/7 అత్యవసర ఆసుపత్రి: {hospital}, హెల్ప్‌లైన్: {phone}.",
        "hi": "आपातकालीन प्रोटोकॉल सक्रिय: तुरंत राष्ट्रीय एम्बुलेंस 108 / 112 पर कॉल करें। निकटतम 24/7 आपातकालीन अस्पताल: {hospital}, हेल्पलाइन: {phone}।"
    },
    "scheme_found": {
        "en": "Found potentially eligible government scheme: {name}. Maximum coverage: {coverage}. Verified official portal: {url}.",
        "te": "మీకు వర్తించే ప్రభుత్వ పథకం లభించింది: {name}. గరిష్ట కవరేజ్: {coverage}. అధికారిక పోర్టల్: {url}.",
        "hi": "संभावित रूप से पात्र सरकारी योजना मिली: {name}। अधिकतम कवरेज: {coverage}। आधिकारिक पोर्टल: {url}।"
    },
    "doctor_found": {
        "en": "Found ABDM registered specialist: {name} ({specialty}) at {hospital}, {city}. Available slots: {slots}.",
        "te": "ABDM ధృవీకరించబడిన నిపుణుడు లభించారు: {name} ({specialty}), {hospital}, {city}. అందుబాటులో ఉన్న స్లాట్‌లు: {slots}.",
        "hi": "ABDM पंजीकृत विशेषज्ञ डॉक्टर मिले: {name} ({specialty}), {hospital}, {city}। उपलब्ध स्लॉट: {slots}।"
    },
    "blood_found": {
        "en": "Blood group {group} availability confirmed at {name}, {city}. Units available: {units}. Verified via e-RaktKosh.",
        "te": "{name}, {city} వద్ద బ్లడ్ గ్రూప్ {group} అందుబాటులో ఉంది. లభ్యమయ్యే యూనిట్లు: {units}. e-RaktKosh ద్వారా ధృవీకరించబడింది.",
        "hi": "{name}, {city} में ब्लड ग्रुप {group} उपलब्ध है। उपलब्ध यूनिट: {units}। e-RaktKosh द्वारा सत्यापित।"
    },
    "medicine_info": {
        "en": "{brand} contains {comp}. Primarily used for {ind}. Verified database: {source}.",
        "te": "{brand} లో {comp} ఉంది. ముఖ్యంగా {ind} చికిత్సకు ఉపయోగిస్తారు. ధృవీకరించబడిన మూలం: {source}.",
        "hi": "{brand} में {comp} शामिल है। मुख्य रूप से {ind} के उपचार के लिए उपयोग किया जाता है। सत्यापित स्रोत: {source}।"
    }
}

class MultilingualService:
    def detect_language(self, text: str) -> str:
        # Check Unicode ranges
        # Telugu: \u0C00-\u0C7F
        # Devanagari (Hindi): \u0900-\u097F
        if re.search(r"[\u0C00-\u0C7F]", text):
            return "te"
        elif re.search(r"[\u0900-\u097F]", text):
            return "hi"
        return "en"

    def normalize_query_concepts(self, text: str) -> Tuple[str, str]:
        """
        Detects language and returns (normalized_english_text, detected_language).
        """
        lang = self.detect_language(text)
        normalized_words = []
        for word in text.split():
            cleaned = word.strip(",.?! ")
            if cleaned in VERNACULAR_INTENT_MAP:
                normalized_words.append(VERNACULAR_INTENT_MAP[cleaned])
            else:
                normalized_words.append(word)
        return " ".join(normalized_words), lang

    def format_response(self, template_key: str, lang: str, **kwargs) -> str:
        lang_key = lang if lang in ["en", "te", "hi"] else "en"
        tmpl = MULTILINGUAL_TEMPLATES.get(template_key, {}).get(lang_key, "")
        if not tmpl:
            tmpl = MULTILINGUAL_TEMPLATES.get(template_key, {}).get("en", "")
        return tmpl.format(**kwargs)

multilingual_service = MultilingualService()
