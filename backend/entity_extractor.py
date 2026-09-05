import re
from typing import Dict, Any, List
from services.reference_range_validator import ReferenceRangeValidator

class EntityExtractor:
    """
    Extracts clinical entities, reference ranges, and medications with source provenance.
    Strictly follows reference-range safety rules:
    - Never invents reference ranges.
    - If reference range is missing in source, status is NOT_DETERMINED.
    """

    TEST_DEFINITIONS = [
        {
            "name": "Hemoglobin",
            "aliases": ["hemoglobin", "haemoglobin", "hb", "hgb"],
            "unit": "g/dL",
            "page": 1
        },
        {
            "name": "WBC Count",
            "aliases": ["wbc", "total leucocyte count", "white blood cells", "leukocyte count", "leukocytes"],
            "unit": "/uL",
            "page": 1
        },
        {
            "name": "Platelet Count",
            "aliases": ["platelet", "platelets", "plt", "platelet count"],
            "unit": "x10^3/uL",
            "page": 1
        },
        {
            "name": "Fasting Blood Glucose",
            "aliases": ["fasting blood glucose", "glucose", "fbs", "fasting blood sugar"],
            "unit": "mg/dL",
            "page": 1
        },
        {
            "name": "Serum Creatinine",
            "aliases": ["creatinine", "serum creatinine"],
            "unit": "mg/dL",
            "page": 1
        },
        {
            "name": "Total Cholesterol",
            "aliases": ["total cholesterol", "cholesterol", "serum cholesterol"],
            "unit": "mg/dL",
            "page": 1
        },
        {
            "name": "Erythrocyte Sedimentation Rate (ESR)",
            "aliases": ["esr", "erythrocyte sedimentation", "erythrocyte sedimentation rate"],
            "unit": "mm/hr",
            "page": 1
        }
    ]

    @classmethod
    def extract_entities(cls, document_name: str, full_text: str) -> Dict[str, Any]:
        lines = [l.strip() for l in full_text.split("\n") if l.strip()]
        lab_results = []
        medications = []
        patient_info = {}

        # 1. Check patient name and ID
        for line in lines:
            m_pid = re.search(r'(?:patient id|id)\s*[:\-]\s*([A-Z0-9\-]+)', line, re.IGNORECASE)
            if m_pid:
                patient_info["patient_id"] = m_pid.group(1).strip()
            m_name = re.search(r'(?:name|patient name)\s*[:\-]\s*([A-Za-z\s]+?)(?:\s*\||\s*Age|\s*$)', line, re.IGNORECASE)
            if m_name:
                patient_info["name"] = m_name.group(1).strip()

        # 2. Extract lab parameters
        for test in cls.TEST_DEFINITIONS:
            for idx, line in enumerate(lines):
                line_lower = line.lower()
                if any(alias in line_lower for alias in test["aliases"]):
                    # Look for numerical value
                    val_matches = re.findall(r'(\d+(?:\.\d+)?)', line)
                    if val_matches:
                        # Value is typically the first number after the test name
                        val = float(val_matches[0])
                        
                        # Look for reference range
                        raw_range_text = None
                        context_window = " ".join(lines[max(0, idx-1):min(len(lines), idx+2)])
                        
                        # Search for range format (e.g. 12.0 - 16.0 or < 200)
                        range_pattern = re.search(r'(?:ref|reference|range|normal)?[:\s]*(\d+(?:\.\d+)?\s*[-–—to]+\s*\d+(?:\.\d+)?|<\s*\d+(?:\.\d+)?|>\s*\d+(?:\.\d+)?)', line, re.IGNORECASE)
                        if range_pattern and range_pattern.group(1) != str(val):
                            raw_range_text = range_pattern.group(1).strip()
                        elif "not provided" in line_lower or "not provided" in context_window.lower():
                            raw_range_text = None

                        low, high = ReferenceRangeValidator.parse_raw_reference_text(raw_range_text)
                        eval_res = ReferenceRangeValidator.evaluate_status(val, low, high, raw_range_text)

                        confidence = 0.97 if raw_range_text else 0.88

                        lab_results.append({
                            "test_name": test["name"],
                            "value": val,
                            "raw_value": str(val),
                            "unit": test["unit"],
                            "reference_low": low,
                            "reference_high": high,
                            "raw_reference_text": raw_range_text if raw_range_text else "Reference range not provided in source document",
                            "status": eval_res["status"],
                            "source_document": document_name,
                            "source_page": test["page"],
                            "source_text": line,
                            "confidence": confidence,
                            "provenance": "DOCUMENT_EXTRACTED",
                            "verification_status": "PENDING"
                        })
                        break

        # 3. Extract medications (e.g. Rx section)
        med_patterns = [
            (r'(amoxicillin)\s*(\d+\s*mg)', "Amoxicillin"),
            (r'(paracetamol)\s*(\d+\s*mg)', "Paracetamol"),
            (r'(penicillin)\s*(\d+\s*mg)', "Penicillin"),
            (r'(metformin)\s*(\d+\s*mg)', "Metformin"),
            (r'(lisinopril)\s*(\d+\s*mg)', "Lisinopril"),
            (r'(atorvastatin)\s*(\d+\s*mg)', "Atorvastatin")
        ]

        for line in lines:
            for pattern, generic_name in med_patterns:
                m = re.search(pattern, line, re.IGNORECASE)
                if m:
                    dosage = m.group(2) if len(m.groups()) > 1 else ""
                    medications.append({
                        "name": generic_name,
                        "dosage": dosage,
                        "source_line": line,
                        "provenance": "DOCUMENT_EXTRACTED",
                        "confidence": 0.95
                    })

        return {
            "patient_info": patient_info,
            "lab_results": lab_results,
            "medications": medications
        }
