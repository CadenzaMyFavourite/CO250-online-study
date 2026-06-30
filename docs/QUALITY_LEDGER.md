# Quality ledger

Scores use 0–5 and require evidence.

## Baseline

- Source discovery found 18 PDFs / 17 unique contents.
- Initial extraction revealed reliable selectable text but degraded handwritten spacing.
- First production build and deterministic tests established the functional baseline.

## Cycle 1 — Grounding and correctness

Score: 4.8 / 5

- Replaced the nine-item summary-level definition set with 89 textbook-first definitions across all 11 units.
- Stored exact textbook section and PDF-page references for every definition.
- Rendered and visually checked 45 definition/result-heavy textbook pages and four representative handwritten review pages.
- Corrected extraction-sensitive notation, including the subgradient definition, against the rendered textbook equation.
- Strict validation passes for 361 KaTeX expressions; content validation reports 11 units, 89 definitions, 9 results, 10 procedures, 22 worked examples, 22 matrix views, 11 beginner guides, 21 notation entries, and 40 questions.
- Remaining gap: application-specific textbook vocabulary and exercises are not atomized when they are outside the 11-unit concept map.

## Cycle 2 — Workflow and persistence

Score: 4.5 / 5

- Browser-tested library search, a definition topic, hint reveal, solution reveal, attempt recording, progress display, and reload persistence.
- Added and browser-checked a worked-example flow for every unit, with prompt, intermediate TeX checks, conclusion, and textbook reference.
- Added one definition-focused retrieval/distinction question per unit; browser verification confirmed unique filters, multi-question navigation, source display, and solution TeX.
- Built a five-question exam; confirmed zero solutions before submission and five solution panels after explicit reveal.
- Confirmed zero console warnings/errors and zero rendered KaTeX error nodes in tested flows.
- The original timer/draft gap was resolved in Cycle 5.

## Cycle 3 — Visual fidelity and responsive QA

Score: 4.6 / 5

- Compared implementation against the dashboard and topic concept references in `docs/design/`.
- Fixed the 1000 px layout overflow by moving the mobile-shell breakpoint to 1100 px.
- Fixed topic-tab overflow at the default desktop viewport while retaining deliberate horizontal tab scrolling on mobile.
- Verified no page-level horizontal overflow at the default viewport or a 390 × 844 mobile override; long formulas remain contained in local horizontal scrollers.
- Split study routes and KaTeX assets on demand, reducing the initial JavaScript chunk from roughly 714 kB to 424 kB and removing Vite's large-chunk advisory.
- Browser screenshot capture can artifact fixed sidebars on long pages, so layout conclusions also use DOM geometry and overflow checks.

## Cycle 4 — Certificate validation and mathematical search

Score: 4.7 / 5

- Added tolerance-aware primal/dual certificate diagnostics for feasibility, objective agreement, and complementary slackness.
- Added normalized Phase I point validation while explicitly preventing the false inference that one positive auxiliary objective proves infeasibility.
- Expanded backend coverage from 7 to 20 passing tests, including invalid dimensions, nonfinite inputs, incorrect tableau pivots, and matching-bound Phase I infeasibility certificates.
- Normalized transpose and inequality notation in library search; browser checks confirm `A^T` and `Aᵀ` return the same 13 entries and include the dual LP definition.
- Added browser-verified semantic aliases for transpose, BFS, SEF, CS, complementarity, RHS, and KKT.
- Remaining gap: ranked/fuzzy search and direct integration of certificate checks into generated numerical practice are not yet implemented.

## Cycle 5 — Beginner learning path and resilient exams

Score: 4.8 / 5

- Added a plain-language first-read guide to every unit: one-sentence big idea, everyday analogy, and first check.
- Expanded every unit to two worked examples, for 22 total; new examples use practical contexts such as gift bags, battery heat, staffing, workshop time, resource prices, boxes, and machine safety.
- Labeled each example with “Problem in plain words,” numbered steps, and “Answer in plain words”; definition pages now explicitly separate formal wording from “In simple words.”
- Browser-tested the new examples and first-read guides at desktop and phone widths with zero KaTeX errors and no page overflow.
- Persisted exam draft answers and timer state across reloads; added a live accessible countdown, pause/resume, and +15-minute accommodation.
- Browser-tested expiry recovery, pause/reload/resume, accommodation time, and draft preservation together.
- Added a discoverable beginner-practice preset and guaranteed at least two level 1–2 questions in every unit.
- Added a five-skill self-check that recommends the first missing prerequisite and links directly to its lesson or easy practice.
- Added a 17-entry “Read the symbols” guide with TeX, spoken readings, and plain-language meanings.
- Added a textbook-style matrix lens to all 22 worked examples, including augmented Phase I matrices, basis matrices, active-row matrices, primal-dual pairs, complementary-slackness vectors, integer-cut row combinations, and KKT Jacobians. Each lens states dimensions and explains how a beginner should read the rows and columns.
- Expanded the notation guide from 17 to 21 entries with augmented matrices, basis matrices, active-row matrices, and rank.
- The diagnostic passes component and production-build tests; final in-app browser navigation to the new route timed out, so it is not counted as a browser-verified flow.
- Remaining gap: question breadth is still uneven across units, though every unit has at least three total and two easy questions.
