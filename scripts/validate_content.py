"""Deterministic checks for grounded CO 250 content data."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "data" / "course-content.json"
DEFINITIONS_PATH = ROOT / "data" / "course-definitions.json"
EXAMPLES_PATH = ROOT / "data" / "course-examples.json"
DEFINITION_PRACTICE_PATH = ROOT / "data" / "definition-practice.json"
BEGINNER_GUIDES_PATH = ROOT / "data" / "beginner-guides.json"
NOTATION_GUIDE_PATH = ROOT / "data" / "notation-guide.json"
MATRICES_PATH = ROOT / "data" / "course-matrices.json"


def validate_content(payload: dict) -> list[str]:
    errors: list[str] = []
    source_ids = {source["id"] for source in payload.get("sources", [])}
    unit_ids = {unit["id"] for unit in payload.get("units", [])}
    seen_ids: set[str] = set()

    def claim(item_id: str, location: str) -> None:
        if not item_id:
            errors.append(f"{location}: missing stable ID")
        elif item_id in seen_ids:
            errors.append(f"{location}: duplicate stable ID {item_id}")
        seen_ids.add(item_id)

    def check_refs(refs: list[dict], location: str) -> None:
        if not refs:
            errors.append(f"{location}: missing source reference")
        for reference in refs:
            if reference.get("sourceId") not in source_ids:
                errors.append(f"{location}: unknown source {reference.get('sourceId')}")

    for unit in payload.get("units", []):
        claim(unit.get("id", ""), "unit")
        for prerequisite in unit.get("prerequisites", []):
            if prerequisite not in unit_ids:
                errors.append(f"{unit['id']}: unknown prerequisite {prerequisite}")
        check_refs(unit.get("sourceReferences", []), unit["id"])
        for theorem in unit.get("theorems", []):
            claim(theorem.get("id", ""), f"{unit['id']} theorem")
            if not theorem.get("assumptions"):
                errors.append(f"{theorem.get('id')}: missing assumptions")
            check_refs(theorem.get("sourceReferences", []), theorem.get("id", "theorem"))
        for procedure in unit.get("procedures", []):
            claim(procedure.get("id", ""), f"{unit['id']} procedure")
            if not procedure.get("recognitionSignals") or not procedure.get("steps"):
                errors.append(f"{procedure.get('id')}: missing recognition signals or steps")
            check_refs(procedure.get("sourceReferences", []), procedure.get("id", "procedure"))

    for question in payload.get("questions", []):
        claim(question.get("id", ""), "question")
        if question.get("unitId") not in unit_ids:
            errors.append(f"{question.get('id')}: unknown unit {question.get('unitId')}")
        if question.get("difficulty") not in {1, 2, 3, 4, 5}:
            errors.append(f"{question.get('id')}: invalid difficulty")
        for field in ("prompt", "learningObjectives", "fullSolution", "finalAnswer", "validationStatus"):
            if not question.get(field):
                errors.append(f"{question.get('id')}: empty {field}")
        check_refs(question.get("sourceReferences", []), question.get("id", "question"))
    return errors


def validate_definitions(definitions_payload: dict, content_payload: dict) -> list[str]:
    errors: list[str] = []
    definitions = definitions_payload.get("definitions", [])
    unit_ids = {unit["id"] for unit in content_payload.get("units", [])}
    seen_ids: set[str] = set()
    covered_units: set[str] = set()

    declared_count = definitions_payload.get("metadata", {}).get("definitionCount")
    if declared_count != len(definitions):
        errors.append(f"definition metadata count {declared_count} does not match {len(definitions)} records")

    for definition in definitions:
        item_id = definition.get("id", "")
        unit_id = definition.get("unitId", "")
        if not item_id:
            errors.append("definition: missing stable ID")
        elif item_id in seen_ids:
            errors.append(f"definition: duplicate stable ID {item_id}")
        seen_ids.add(item_id)
        if unit_id not in unit_ids:
            errors.append(f"{item_id}: unknown unit {unit_id}")
        else:
            covered_units.add(unit_id)
        for field in ("title", "formalStatement", "plainLanguageExplanation", "textbookSection"):
            if not definition.get(field):
                errors.append(f"{item_id}: empty {field}")
        page = definition.get("textbookPage")
        if not isinstance(page, int) or not 1 <= page <= 403:
            errors.append(f"{item_id}: invalid textbook PDF page {page}")

    missing_units = sorted(unit_ids - covered_units)
    if missing_units:
        errors.append(f"definition audit does not cover units: {', '.join(missing_units)}")
    return errors


def validate_examples(examples_payload: dict, content_payload: dict) -> list[str]:
    errors: list[str] = []
    examples = examples_payload.get("examples", [])
    unit_ids = {unit["id"] for unit in content_payload.get("units", [])}
    seen_ids: set[str] = set()
    covered_units: set[str] = set()

    declared_count = examples_payload.get("metadata", {}).get("exampleCount")
    if declared_count != len(examples):
        errors.append(f"example metadata count {declared_count} does not match {len(examples)} records")

    for example in examples:
        item_id = example.get("id", "")
        unit_id = example.get("unitId", "")
        if not item_id:
            errors.append("worked example: missing stable ID")
        elif item_id in seen_ids:
            errors.append(f"worked example: duplicate stable ID {item_id}")
        seen_ids.add(item_id)
        if unit_id not in unit_ids:
            errors.append(f"{item_id}: unknown unit {unit_id}")
        else:
            covered_units.add(unit_id)
        for field in ("title", "prompt", "steps", "finalAnswer", "textbookSection"):
            if not example.get(field):
                errors.append(f"{item_id}: empty {field}")
        if len(example.get("steps", [])) != len(example.get("stepsLatex", [])):
            errors.append(f"{item_id}: steps and stepsLatex lengths differ")
        page = example.get("textbookPage")
        if not isinstance(page, int) or not 1 <= page <= 403:
            errors.append(f"{item_id}: invalid textbook PDF page {page}")

    expected_units = unit_ids - {"unit-01"}
    missing_units = sorted(expected_units - covered_units)
    if missing_units:
        errors.append(f"worked-example expansion does not cover units: {', '.join(missing_units)}")
    return errors


def validate_matrices(matrices_payload: dict, examples_payload: dict, content_payload: dict) -> list[str]:
    errors: list[str] = []
    entries = matrices_payload.get("entries", [])
    declared_count = matrices_payload.get("metadata", {}).get("entryCount")
    if declared_count != len(entries):
        errors.append(f"matrix-view count {declared_count} does not match {len(entries)} records")

    example_ids = {example["id"] for example in examples_payload.get("examples", [])}
    example_ids.update(
        unit["workedExample"]["id"]
        for unit in content_payload.get("units", [])
        if unit.get("workedExample")
    )
    seen_ids: set[str] = set()
    for entry in entries:
        example_id = entry.get("exampleId", "")
        if example_id not in example_ids:
            errors.append(f"matrix view references unknown example {example_id}")
        elif example_id in seen_ids:
            errors.append(f"duplicate matrix view for {example_id}")
        seen_ids.add(example_id)
        for field in ("dimensions", "latex", "plainLanguage"):
            if not entry.get(field):
                errors.append(f"matrix view {example_id}: empty {field}")

    missing = sorted(example_ids - seen_ids)
    if missing:
        errors.append(f"worked examples missing matrix views: {', '.join(missing)}")
    return errors


def validate_beginner_guides(guides_payload: dict, content_payload: dict) -> list[str]:
    errors: list[str] = []
    guides = guides_payload.get("guides", [])
    unit_ids = {unit["id"] for unit in content_payload.get("units", [])}
    seen_units: set[str] = set()

    declared_count = guides_payload.get("metadata", {}).get("guideCount")
    if declared_count != len(guides):
        errors.append(f"beginner-guide count {declared_count} does not match {len(guides)} records")

    for guide in guides:
        unit_id = guide.get("unitId", "")
        if unit_id not in unit_ids:
            errors.append(f"beginner guide: unknown unit {unit_id}")
        elif unit_id in seen_units:
            errors.append(f"beginner guide: duplicate unit {unit_id}")
        seen_units.add(unit_id)
        for field in ("bigIdea", "everydayAnalogy", "firstCheck"):
            if not guide.get(field):
                errors.append(f"beginner guide {unit_id}: empty {field}")

    missing_units = sorted(unit_ids - seen_units)
    if missing_units:
        errors.append(f"beginner guides do not cover units: {', '.join(missing_units)}")
    return errors


def validate_definition_practice(practice_payload: dict, content_payload: dict) -> list[str]:
    errors: list[str] = []
    questions = practice_payload.get("questions", [])
    unit_ids = {unit["id"] for unit in content_payload.get("units", [])}
    seen_ids: set[str] = set()
    covered_units: set[str] = set()

    declared_count = practice_payload.get("metadata", {}).get("questionCount")
    if declared_count != len(questions):
        errors.append(f"definition-practice count {declared_count} does not match {len(questions)} records")

    for question in questions:
        item_id = question.get("id", "")
        unit_id = question.get("unitId", "")
        if not item_id:
            errors.append("definition-practice question: missing stable ID")
        elif item_id in seen_ids:
            errors.append(f"definition-practice question: duplicate stable ID {item_id}")
        seen_ids.add(item_id)
        if unit_id not in unit_ids:
            errors.append(f"{item_id}: unknown unit {unit_id}")
        else:
            covered_units.add(unit_id)
        if question.get("difficulty") not in {1, 2, 3, 4, 5}:
            errors.append(f"{item_id}: invalid difficulty")
        for field in ("type", "prompt", "hints", "fullSolution", "finalAnswer", "learningObjective", "textbookSection"):
            if not question.get(field):
                errors.append(f"{item_id}: empty {field}")
        page = question.get("textbookPage")
        if not isinstance(page, int) or not 1 <= page <= 403:
            errors.append(f"{item_id}: invalid textbook PDF page {page}")

    missing_units = sorted(unit_ids - covered_units)
    if missing_units:
        errors.append(f"definition practice does not cover units: {', '.join(missing_units)}")
    all_questions = [*content_payload.get("questions", []), *questions]
    easy_counts = {unit_id: sum(1 for question in all_questions if question.get("unitId") == unit_id and question.get("difficulty", 6) <= 2) for unit_id in unit_ids}
    thin_beginner_units = sorted(unit_id for unit_id, count in easy_counts.items() if count < 2)
    if thin_beginner_units:
        errors.append(f"beginner practice has fewer than two easy questions in: {', '.join(thin_beginner_units)}")
    return errors


def validate_notation_guide(notation_payload: dict) -> list[str]:
    errors: list[str] = []
    entries = notation_payload.get("entries", [])
    declared_count = notation_payload.get("metadata", {}).get("entryCount")
    if declared_count != len(entries):
        errors.append(f"notation-guide count {declared_count} does not match {len(entries)} records")
    seen_ids: set[str] = set()
    for entry in entries:
        item_id = entry.get("id", "")
        if not item_id:
            errors.append("notation entry: missing stable ID")
        elif item_id in seen_ids:
            errors.append(f"notation entry: duplicate stable ID {item_id}")
        seen_ids.add(item_id)
        for field in ("category", "title", "latex", "readAloud", "meaning"):
            if not entry.get(field):
                errors.append(f"notation entry {item_id}: empty {field}")
    return errors


def main() -> None:
    payload = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    definitions_payload = json.loads(DEFINITIONS_PATH.read_text(encoding="utf-8"))
    examples_payload = json.loads(EXAMPLES_PATH.read_text(encoding="utf-8"))
    definition_practice_payload = json.loads(DEFINITION_PRACTICE_PATH.read_text(encoding="utf-8"))
    beginner_guides_payload = json.loads(BEGINNER_GUIDES_PATH.read_text(encoding="utf-8"))
    notation_payload = json.loads(NOTATION_GUIDE_PATH.read_text(encoding="utf-8"))
    matrices_payload = json.loads(MATRICES_PATH.read_text(encoding="utf-8"))
    errors = (
        validate_content(payload)
        + validate_definitions(definitions_payload, payload)
        + validate_examples(examples_payload, payload)
        + validate_matrices(matrices_payload, examples_payload, payload)
        + validate_definition_practice(definition_practice_payload, payload)
        + validate_beginner_guides(beginner_guides_payload, payload)
        + validate_notation_guide(notation_payload)
    )
    if errors:
        print("Content validation failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    counts = {
        "units": len(payload["units"]),
        "definitions": len(definitions_payload["definitions"]),
        "theorems": sum(len(unit["theorems"]) for unit in payload["units"]),
        "procedures": sum(len(unit["procedures"]) for unit in payload["units"]),
        "questions": len(payload["questions"]) + len(definition_practice_payload["questions"]),
        "worked_examples": len(examples_payload["examples"]) + sum(1 for unit in payload["units"] if unit.get("workedExample")),
        "beginner_guides": len(beginner_guides_payload["guides"]),
        "notation_entries": len(notation_payload["entries"]),
        "matrix_views": len(matrices_payload["entries"]),
    }
    print("Content validation passed:", ", ".join(f"{key}={value}" for key, value in counts.items()))


if __name__ == "__main__":
    main()
