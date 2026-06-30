"""Inventory private PDF sources without copying their contents into the repository."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / "materials"
OUTPUT = ROOT / "data" / "source-index.json"


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def classify(name: str) -> str:
    lower = name.lower()
    if "review" in lower:
        return "review"
    if "exam" in lower:
        return "exam-solutions"
    if "prac" in lower:
        return "practice-no-solutions"
    if "gentle introduction" in lower:
        return "textbook"
    if "co_250_s26" in lower:
        return "assignment-solutions"
    return "other"


def inspect_pdf(path: Path) -> dict:
    reader = PdfReader(str(path))
    page_lengths = [len((page.extract_text() or "").strip()) for page in reader.pages]
    empty_pages = sum(length < 20 for length in page_lengths)
    average = sum(page_lengths) / max(len(page_lengths), 1)
    extraction = "high" if average > 500 and empty_pages <= 1 else "medium" if average > 100 else "low"
    kind = classify(path.name)
    if kind == "review" and extraction == "high":
        # Handwritten review sheets contain selectable text, but spaces and matrix
        # layout are unreliable enough that rendered-page review is still required.
        extraction = "medium"
    return {
        "fileName": path.name,
        "fileType": "PDF",
        "pages": len(reader.pages),
        "bytes": path.stat().st_size,
        "sha256": file_hash(path),
        "kind": kind,
        "textCharacters": sum(page_lengths),
        "emptyTextPages": empty_pages,
        "extractionQuality": extraction,
    }


def discover_sources(materials: Path = MATERIALS) -> list[dict]:
    return [inspect_pdf(path) for path in sorted(materials.glob("*.pdf"))]


def discover_pdf_paths(materials: Path = MATERIALS) -> list[Path]:
    """Fast source discovery used by tests; does not parse document contents."""
    return sorted(materials.glob("*.pdf"))


def main() -> None:
    sources = discover_sources()
    hashes: dict[str, list[str]] = {}
    for source in sources:
        hashes.setdefault(source["sha256"], []).append(source["fileName"])
    duplicates = [names for names in hashes.values() if len(names) > 1]
    payload = {
        "generatedBy": "scripts/inventory_sources.py",
        "fileCount": len(sources),
        "uniqueContentCount": len(hashes),
        "duplicates": duplicates,
        "sources": sources,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(sources)} PDF files ({len(hashes)} unique) -> {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
