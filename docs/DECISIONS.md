# Decisions

## D1 — Static local architecture

Use React/Vite plus structured JSON and browser storage. A local API/SQLite layer would add installation and synchronization risk without benefit for one read-only content bundle.

## D2 — Reviews define course order

The supplied numbered review sheets define the 11 units. The textbook supports statements and section links but does not override the current review sequence.

## D3 — Duplicate source handling

Keep both Assignment 3 filenames in the inventory because both exist, but count one unique content source and cite only `CO_250_S26 (14).pdf`.

## D4 — Honest vertical slice

Unit 1 is fully implemented with a worked example and four practice forms. Every other unit is visible, source-linked, and usable at representative depth; missing example breadth is explicit in coverage and limitations.

## D5 — LocalStorage before IndexedDB

The progress payload is small and versioned. `localStorage` gives reliable reload persistence with no asynchronous data layer. Move to IndexedDB only if user-authored notes or large question histories make size a real issue.

## D6 — Generated visual spec

The approved internal concepts in `docs/design/` define a true-white, navy/ochre, editorial interface. Source truth changed “16 local sources” in the concept to “18 files / 17 unique sources” in production.

## D7 — Weakness is explainable

The score is visible and deterministic:

`(1−accuracy)×40 + hint rate×20 + repeated mistakes×15 + recency×10 + low confidence×15`.

Units with no attempts are not labelled weak.

