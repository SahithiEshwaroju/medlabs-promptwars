import re
from typing import Tuple, Optional, Dict, Any

class ReferenceRangeValidator:
    @staticmethod
    def parse_raw_reference_text(raw_text: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
        """
        Parses explicit reference ranges such as '12.0 - 16.0', '12.0-16.0 g/dL', '< 140', '> 60'.
        Returns (low, high). Never guesses or invents.
        """
        if not raw_text or raw_text.strip().lower() in ["none", "n/a", "not provided", "not available"]:
            return None, None

        cleaned = raw_text.strip()

        # Match range pattern: "12.0 - 16.0" or "12.0-16.0"
        range_match = re.search(r'(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)', cleaned, re.IGNORECASE)
        if range_match:
            try:
                low = float(range_match.group(1))
                high = float(range_match.group(2))
                return low, high
            except ValueError:
                pass

        # Match less than: "< 140" or "<140"
        less_match = re.search(r'<\s*(\d+(?:\.\d+)?)', cleaned)
        if less_match:
            try:
                return None, float(less_match.group(1))
            except ValueError:
                pass

        # Match greater than: "> 60" or ">60"
        greater_match = re.search(r'>\s*(\d+(?:\.\d+)?)', cleaned)
        if greater_match:
            try:
                return float(greater_match.group(1)), None
            except ValueError:
                pass

        return None, None

    @staticmethod
    def evaluate_status(value: Optional[float], low: Optional[float], high: Optional[float], raw_text: Optional[str]) -> Dict[str, Any]:
        """
        Evaluates status programmatically.
        If no explicit reference range exists in the report, status MUST be NOT_DETERMINED.
        """
        if value is None:
            return {
                "status": "NOT_DETERMINED",
                "message": "Value not numeric or unavailable."
            }

        if low is None and high is None:
            return {
                "status": "NOT_DETERMINED",
                "message": "Reference range not provided in source document."
            }

        if low is not None and value < low:
            return {
                "status": "LOW",
                "message": f"Value {value} is below source reference low limit ({low})."
            }

        if high is not None and value > high:
            return {
                "status": "HIGH",
                "message": f"Value {value} is above source reference high limit ({high})."
            }

        return {
            "status": "NORMAL",
            "message": f"Value {value} is within source reference range ({low if low is not None else 0} - {high if high is not None else '∞'})."
        }
