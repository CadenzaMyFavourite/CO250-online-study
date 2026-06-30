import json
import unittest
from pathlib import Path

from scripts.validate_content import validate_content


ROOT = Path(__file__).resolve().parents[2]


class ContentValidationTests(unittest.TestCase):
    def test_grounded_content_has_no_schema_or_reference_errors(self):
        payload = json.loads((ROOT / "data" / "course-content.json").read_text(encoding="utf-8"))
        self.assertEqual(validate_content(payload), [])

    def test_every_detected_unit_is_in_course_map(self):
        content = json.loads((ROOT / "data" / "course-content.json").read_text(encoding="utf-8"))
        course_map = json.loads((ROOT / "data" / "course-map.json").read_text(encoding="utf-8"))
        self.assertEqual({unit["id"] for unit in content["units"]}, {unit["id"] for unit in course_map["units"]})


if __name__ == "__main__":
    unittest.main()

