import unittest
import os
import sys

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.reference_range_validator import ReferenceRangeValidator
from ai_service import AIService
from main import sanitize_filename, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, require_role
from fastapi import HTTPException

class TestReferenceRangeSafety(unittest.TestCase):
    """
    Validates Phase 13 & Phase 24:
    Never invent reference ranges.
    If missing from source, status MUST be strictly NOT_DETERMINED.
    """

    def test_normal_value_within_explicit_range(self):
        low, high = ReferenceRangeValidator.parse_raw_reference_text("12.0 - 16.0")
        res = ReferenceRangeValidator.evaluate_status(14.0, low, high, "12.0 - 16.0")
        self.assertEqual(res["status"], "NORMAL")
        self.assertIn("within source reference range", res["message"])

    def test_low_value_below_explicit_range(self):
        low, high = ReferenceRangeValidator.parse_raw_reference_text("12.0 - 16.0")
        res = ReferenceRangeValidator.evaluate_status(11.2, low, high, "12.0 - 16.0")
        self.assertEqual(res["status"], "LOW")
        self.assertIn("below source reference low limit", res["message"])

    def test_high_value_above_explicit_range(self):
        low, high = ReferenceRangeValidator.parse_raw_reference_text("70 - 99")
        res = ReferenceRangeValidator.evaluate_status(115.0, low, high, "70 - 99")
        self.assertEqual(res["status"], "HIGH")
        self.assertIn("above source reference high limit", res["message"])

    def test_missing_reference_range_is_strictly_not_determined(self):
        # When range is None or missing in document, MedLens must NEVER guess
        low, high = ReferenceRangeValidator.parse_raw_reference_text(None)
        self.assertIsNone(low)
        self.assertIsNone(high)

        res = ReferenceRangeValidator.evaluate_status(28.0, low, high, None)
        self.assertEqual(res["status"], "NOT_DETERMINED")
        self.assertEqual(res["message"], "Reference range not provided in source document.")

    def test_unparseable_or_not_provided_text(self):
        low, high = ReferenceRangeValidator.parse_raw_reference_text("not provided")
        self.assertIsNone(low)
        self.assertIsNone(high)
        res = ReferenceRangeValidator.evaluate_status(28.0, low, high, "not provided")
        self.assertEqual(res["status"], "NOT_DETERMINED")

    def test_less_than_upper_limit_range(self):
        low, high = ReferenceRangeValidator.parse_raw_reference_text("< 200")
        self.assertIsNone(low)
        self.assertEqual(high, 200.0)

        res_high = ReferenceRangeValidator.evaluate_status(215.0, low, high, "< 200")
        self.assertEqual(res_high["status"], "HIGH")

        res_norm = ReferenceRangeValidator.evaluate_status(180.0, low, high, "< 200")
        self.assertEqual(res_norm["status"], "NORMAL")


class TestConflictDetectionSafety(unittest.TestCase):
    """
    Validates Phase 18 & Phase 31:
    Conflict detection surfaces record inconsistencies for professional review.
    Does NOT diagnose, claim danger, or recommend medical treatment.
    """

    def test_penicillin_allergy_vs_amoxicillin_prescription(self):
        meds = [{"name": "Amoxicillin", "dosage": "500mg", "source_page": 1}]
        conflicts = AIService.detect_conflicts(
            patient_allergies="Penicillin",
            patient_conditions="Hypertension",
            extracted_medications=meds,
            source_doc_name="City_Clinic_Prescription_2026-09-02.pdf"
        )
        self.assertEqual(len(conflicts), 1)
        c = conflicts[0]
        self.assertEqual(c["conflict_type"], "ALLERGY_MEDICATION")
        self.assertIn("Penicillin", c["user_statement"])
        self.assertIn("Amoxicillin", c["document_statement"])
        # Non-diagnostic guardrail verification
        self.assertIn("Please verify with a qualified healthcare professional", c["disclaimer"])
        self.assertNotIn("dangerous", c["disclaimer"].lower())
        self.assertNotIn("stop taking", c["disclaimer"].lower())

    def test_no_conflict_when_allergies_clean(self):
        meds = [{"name": "Paracetamol", "dosage": "650mg", "source_page": 1}]
        conflicts = AIService.detect_conflicts(
            patient_allergies="None",
            patient_conditions=None,
            extracted_medications=meds,
            source_doc_name="City_Clinic_Prescription.pdf"
        )
        self.assertEqual(len(conflicts), 0)


class TestSafeSummaryAndComparison(unittest.TestCase):
    """
    Validates Phase 20 & Phase 21:
    Summaries and comparisons are strictly factual and non-diagnostic.
    """

    def test_safe_summary_disclaimer_presence(self):
        lab_results = [
            {"test_name": "Hemoglobin", "status": "LOW", "confidence": 0.96},
            {"test_name": "WBC Count", "status": "NORMAL", "confidence": 0.98}
        ]
        summary = AIService.generate_safe_summary("Rahul Kumar", lab_results, [], 1)
        self.assertIn("Rahul Kumar", summary["summary_text"])
        self.assertIn("Hemoglobin is marked LOW", summary["summary_text"])
        self.assertIn("does not provide diagnosis", summary["disclaimer"])

    def test_factual_numerical_delta_comparison(self):
        prev = [{"test_name": "Hemoglobin", "value": 11.0, "unit": "g/dL"}]
        curr = [{"test_name": "Hemoglobin", "value": 11.2, "unit": "g/dL"}]
        comps = AIService.compare_reports(prev, curr)
        self.assertEqual(len(comps), 1)
        self.assertEqual(comps[0]["delta"], 0.2)
        self.assertEqual(comps[0]["direction"], "INCREASED")
        self.assertIn("increased from 11.0 g/dL to 11.2 g/dL", comps[0]["factual_statement"])


class TestSecurityAndSanitization(unittest.TestCase):
    """
    Validates Phase 8:
    File type restriction, size limit, path traversal defense, and authorization checks.
    """

    def test_filename_sanitization_removes_path_traversal(self):
        unsafe = "../../etc/shadow.pdf"
        safe = sanitize_filename(unsafe)
        self.assertNotIn("/", safe)
        self.assertNotIn("..", safe)
        self.assertTrue(safe.endswith(".pdf"))

    def test_allowed_file_extensions(self):
        self.assertIn(".pdf", ALLOWED_EXTENSIONS)
        self.assertIn(".png", ALLOWED_EXTENSIONS)
        self.assertIn(".jpg", ALLOWED_EXTENSIONS)
        self.assertIn(".jpeg", ALLOWED_EXTENSIONS)
        self.assertNotIn(".exe", ALLOWED_EXTENSIONS)
        self.assertNotIn(".sh", ALLOWED_EXTENSIONS)
        self.assertNotIn(".bat", ALLOWED_EXTENSIONS)

    def test_max_file_size_is_10mb(self):
        self.assertEqual(MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024)

    def test_role_checker_authorization_rejection(self):
        doctor_guard = require_role(["Doctor", "Clinician"])
        # Unauthorized role 'Patient' must raise 403 Forbidden
        with self.assertRaises(HTTPException) as ctx:
            doctor_guard(role="Patient")
        self.assertEqual(ctx.exception.status_code, 403)

    def test_role_checker_authorization_acceptance(self):
        doctor_guard = require_role(["Doctor", "Clinician"])
        # Authorized role accepted
        res = doctor_guard(role="Lead Clinician")
        self.assertEqual(res, "Lead Clinician")

if __name__ == "__main__":
    unittest.main()
