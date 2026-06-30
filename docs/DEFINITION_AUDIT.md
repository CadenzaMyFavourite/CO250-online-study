# Definition audit

## Authority and scope

The supplied textbook is the depth authority. Reviews 1–11 define the course-unit boundary and sequence; they are summaries, not the source of formal wording.

The library contains 89 definitions used by those units. Every record has a stable ID, a unit, a textbook section, and a PDF page. Formula-bearing definitions also have strict KaTeX input.

## Audit method

1. Extracted the relevant textbook ranges: PDF pages 17–149, 219–244, 280–289, and 312–333.
2. Searched definition markers including “we define,” “we say,” “we call,” “is called,” and “referred to as.”
3. Reconciled those candidates against `data/course-definitions.json` and the 11-unit map.
4. Visually inspected extraction-sensitive and formula-heavy pages, including the ratio test on PDF page 109 and pivoting on PDF page 133.
5. Ran schema/source validation and strict KaTeX parsing after reconciliation.

The reconciliation added two terms that had previously appeared only inside procedure material: **Simplex ratio test** and **Matrix pivot operation**.

## Deliberate boundaries

The audit does not promote a phrase to a course definition when it is:

- a temporary definition introduced only within one exercise, such as the exercise-specific “almost satisfy CS” condition on PDF page 242;
- application-domain vocabulary outside the 11-unit map, such as graph objects used only to state a particular modeling example;
- a theorem or algorithm whose formal statement already lives in the result or procedure library.

These exclusions are explicit so a later scope expansion can revisit them without confusing “not in scope” with “missed.”
