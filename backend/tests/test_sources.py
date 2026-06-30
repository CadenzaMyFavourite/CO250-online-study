import unittest
from pathlib import Path

from scripts.inventory_sources import discover_pdf_paths, file_hash


ROOT = Path(__file__).resolve().parents[2]


class SourceInventoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = discover_pdf_paths(ROOT / "materials")

    def test_discovers_all_supplied_pdf_files(self):
        self.assertEqual(len(self.sources), 18)
        self.assertTrue(all(source.stat().st_size > 0 for source in self.sources))

    def test_detects_the_assignment_three_duplicate(self):
        hashes = {}
        for source in self.sources:
            hashes.setdefault(file_hash(source), []).append(source.name)
        duplicates = [set(names) for names in hashes.values() if len(names) > 1]
        self.assertIn({"CO_250_S26 (14).pdf", "CO_250_S26 (14) (1).pdf"}, duplicates)


if __name__ == "__main__":
    unittest.main()
