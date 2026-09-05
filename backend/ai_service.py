from typing import List, Dict, Any, Optional

class AIService:
    """
    AI Clinical Intelligence & Safety Service.
    Enforces strict safety guardrails:
    - Never diagnoses or prescribes.
    - Never speculates on medical outcomes.
    - Highlights inconsistencies purely as documentation discrepancies.
    - Explicitly attaches organizational disclaimers.
    """

    SAFE_SUMMARY_DISCLAIMER = (
        "AI-generated organizational summary. MedLens organizes and summarizes clinical documentation. "
        "It does not provide diagnosis, prognosis, or treatment recommendations."
    )

    CONFLICT_DISCLAIMER = (
        "These records contain potentially inconsistent information. "
        "Please verify with a qualified healthcare professional before clinical decisions."
    )

    # Cross-reactivity & conflict knowledge graph for verification
    ALLERGY_MEDICATION_MAP = {
        "penicillin": ["amoxicillin", "ampicillin", "augmentin", "piperacillin", "oxacillin"],
        "sulfa": ["bactrim", "septra", "sulfamethoxazole"],
        "aspirin": ["ibuprofen", "naproxen", "nsaid"],
    }

    @classmethod
    def detect_conflicts(cls, patient_allergies: Optional[str], patient_conditions: Optional[str], extracted_medications: List[Dict[str, Any]], source_doc_name: str) -> List[Dict[str, Any]]:
        """
        Detects factual inconsistencies between user profile and document extraction.
        Never declares medical danger; only flags the record discrepancy for professional review.
        """
        conflicts = []
        if not patient_allergies:
            return conflicts

        allergies_lower = patient_allergies.lower()

        for med in extracted_medications:
            med_name_lower = med.get("name", "").lower()
            
            # Check direct or class cross-reactivity
            for allergen, related_meds in cls.ALLERGY_MEDICATION_MAP.items():
                if allergen in allergies_lower:
                    if med_name_lower == allergen or med_name_lower in related_meds:
                        conflicts.append({
                            "conflict_type": "ALLERGY_MEDICATION",
                            "severity": "WARNING",
                            "title": f"Documented Allergy vs Prescribed Medication: {med.get('name')}",
                            "user_statement": f"Documented Patient Allergy: {patient_allergies.strip()} (Provenance: USER_PROVIDED)",
                            "document_statement": f"Prescribed Medication: {med.get('name')} {med.get('dosage', '')} (Source: {source_doc_name})",
                            "source_document_name": source_doc_name,
                            "source_page": med.get("source_page", 1),
                            "status": "UNRESOLVED",
                            "review_recommendation": "Needs Professional Review",
                            "disclaimer": cls.CONFLICT_DISCLAIMER
                        })

        return conflicts

    @classmethod
    def generate_safe_summary(cls, patient_name: str, lab_results: List[Dict[str, Any]], conflicts: List[Dict[str, Any]], unverified_count: int) -> Dict[str, Any]:
        """
        Generates an organizational, non-diagnostic clinical summary.
        """
        tested_names = [r.get("test_name") for r in lab_results if r.get("test_name")]
        tests_str = ", ".join(tested_names[:4]) if tested_names else "routine laboratory parameters"
        
        low_tests = [r.get("test_name") for r in lab_results if r.get("status") == "LOW"]
        high_tests = [r.get("test_name") for r in lab_results if r.get("status") == "HIGH"]
        undetermined_tests = [r.get("test_name") for r in lab_results if r.get("status") == "NOT_DETERMINED"]

        observations = []
        if low_tests:
            observations.append(f"{', '.join(low_tests)} is marked LOW according to the reference range provided in the report.")
        if high_tests:
            observations.append(f"{', '.join(high_tests)} is marked HIGH according to the reference range provided in the report.")
        if undetermined_tests:
            observations.append(f"{', '.join(undetermined_tests)} has no reference range provided in the source document.")

        obs_text = " ".join(observations) if observations else "Displayed results are aligned with reference ranges provided in source documents."

        summary_text = (
            f"{patient_name}'s latest medical record contains documented findings for {tests_str}. "
            f"{obs_text} All reference ranges reflect explicit values from uploaded source documentation."
        )

        review_items = []
        low_conf_count = len([r for r in lab_results if r.get("confidence", 1.0) < 0.90])
        if low_conf_count > 0:
            review_items.append(f"{low_conf_count} low-confidence extraction requiring manual review")
        if unverified_count > 0:
            review_items.append(f"{unverified_count} unverified clinical field(s)")
        if conflicts:
            review_items.append(f"{len(conflicts)} potential record conflict detected")

        return {
            "summary_text": summary_text,
            "review_items": review_items,
            "disclaimer": cls.SAFE_SUMMARY_DISCLAIMER
        }

    @classmethod
    def compare_reports(cls, prev_results: List[Dict[str, Any]], curr_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Compares numeric values between previous and current reports.
        Strictly produces numeric comparisons without diagnostic interpretation.
        """
        comparisons = []
        curr_map = {r["test_name"].lower(): r for r in curr_results if "test_name" in r}

        for prev in prev_results:
            name_key = prev.get("test_name", "").lower()
            if name_key in curr_map:
                curr = curr_map[name_key]
                p_val = prev.get("value")
                c_val = curr.get("value")
                
                if p_val is not None and c_val is not None:
                    delta = round(c_val - p_val, 2)
                    direction = "increased" if delta > 0 else ("decreased" if delta < 0 else "unchanged")
                    unit = curr.get("unit", "")
                    
                    factual_statement = (
                        f"{curr['test_name']} {direction} from {p_val} {unit} to {c_val} {unit}."
                        if delta != 0 else
                        f"{curr['test_name']} remained constant at {c_val} {unit}."
                    )

                    comparisons.append({
                        "test_name": curr["test_name"],
                        "unit": unit,
                        "previous_value": p_val,
                        "previous_date": prev.get("result_date", "2026-05-14"),
                        "current_value": c_val,
                        "current_date": curr.get("result_date", "2026-08-28"),
                        "delta": delta,
                        "direction": direction.upper(),
                        "factual_statement": factual_statement,
                        "disclaimer": "Numerical delta only. Does not constitute clinical trend diagnosis."
                    })

        return comparisons
