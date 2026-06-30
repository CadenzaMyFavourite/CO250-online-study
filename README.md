# CO 250 / Field Guide

A static, local-first study platform derived from the CO 250 PDFs in `materials/`. It organizes the supplied course into 11 units, makes source references visible, supports guided and mixed practice, builds local exams, and stores learning progress only in the browser. The public site contains the learning content but does not publish the source PDFs.

## Privacy model

- No account, telemetry, analytics, advertising, or runtime network calls.
- Course materials are read only by the local inventory script.
- PDFs are excluded from Git by `.gitignore`.
- Progress is stored under `co250-field-guide-progress-v1` in browser `localStorage`.
- Exam state is stored under `co250-field-guide-exam-v1`.

## Prerequisites

- Node.js 20+ and pnpm 9+
- Python 3.11+ for ingestion and deterministic content tests
- `pypdf` from `requirements.txt`

## Install and run

```powershell
pnpm install
python -m pip install -r requirements.txt
pnpm dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

## Deploy to Vercel

This is a client-only Vite application. It requires no database, API, environment variables, or Vercel Functions.

1. Import `CadenzaMyFavourite/CO250-online-study` in Vercel.
2. Keep the detected framework as **Vite**.
3. Use `pnpm build` as the build command and `dist` as the output directory. Vercel can use its automatic pnpm install command.
4. Deploy the `main` branch.

The root `vercel.json` rewrites application routes to `index.html`, so direct visits and browser refreshes work on routes such as `/topic/two-phase-simplex`. Future pushes to `main` create production deployments automatically after the Git integration is connected.

Study progress and exam drafts remain in `localStorage`. They survive refreshes in the same browser, but do not synchronize between devices or browser profiles.

## Commands

```powershell
pnpm build
pnpm test
pnpm validate
python -m unittest discover backend/tests
python scripts/inventory_sources.py
```

## Add or update course materials

1. Put private PDFs in `materials/`. Do not commit that directory.
2. Run `python scripts/inventory_sources.py`.
3. Review `data/source-index.json` for page counts, extraction quality, and duplicates.
4. Render and inspect equation-heavy or handwritten pages before adding content.
5. Add textbook definitions to `data/course-definitions.json`; add worked examples to `data/course-examples.json`; add their textbook-style matrix translations to `data/course-matrices.json`; add definition questions to `data/definition-practice.json`; add results, procedures, or other questions to `data/course-content.json`.
6. Add or update result/practice TeX mappings in `data/course-math.json`.
7. Run the content/math validator and tests.
8. Update `docs/CONTENT_COVERAGE.md`.

The inventory script records metadata and hashes only. It does not copy PDF text into tracked source data.

## Grounding model

`data/course-definitions.json` is the textbook-first authority for the 89 course definitions and records a textbook section plus PDF page for each item. Theorem-like results, procedures, and questions in `data/course-content.json` have source references. Generated questions are labelled `generated` and record their validation method/status. TeX is checked with strict KaTeX parsing by `pnpm validate`.

## Reset progress

Use **Progress → Reset progress**, or clear this site’s local storage in the browser.

## Known limitations

Definitions, formal mathematics, two worked examples, a plain-language first-read guide, and at least three practice questions now span all 11 units. Every worked example includes a matrix lens with dimensions and a beginner reading. A short self-check recommends the first missing prerequisite, beginner mode guarantees at least two level 1–2 questions per unit, and the notation guide translates 21 common expressions into spoken and plain language. The remaining gap is practice breadth toward five questions per unit. See the [definition audit](docs/DEFINITION_AUDIT.md) and [known limitations](docs/KNOWN_LIMITATIONS.md).
