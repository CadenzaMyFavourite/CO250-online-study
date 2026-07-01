# CO250 Field Guide

A static CO250 study platform derived from the supplied course PDFs. It organizes the course into 11 units, makes source references visible, supports guided practice and question sets, and publishes the open course materials without requiring an account or backend.

## Privacy model

- No student account or advertising. Vercel Web Analytics provides anonymized, cookie-free page-view analytics.
- The source folder `/materials/` remains excluded; approved public copies are served from `/public/materials/`.
- Practice notes exist only in current React state. The site does not save progress, answers, or question sets.

## Install and run

Requires Node.js 20+, pnpm 9+, Python 3.11+, and the packages in `requirements.txt`.

```powershell
pnpm install
python -m pip install -r requirements.txt
pnpm dev
```

## Deploy to Vercel

This is a client-only Vite application with no database, API, environment variables, or Vercel Functions.

1. Import `CadenzaMyFavourite/CO250-online-study` in Vercel.
2. Keep the framework as **Vite**.
3. Use `pnpm build` and output directory `dist`.
4. Deploy the `main` branch.

`vercel.json` rewrites application routes to `index.html`, so direct visits and refreshes work. Future pushes to `main` deploy automatically. Vercel Web Analytics is integrated through `@vercel/analytics/react`.

## Quality commands

```powershell
pnpm validate
pnpm test -- --run
python -m unittest discover backend/tests
pnpm build
```

## Add or update course materials

1. Put source PDFs in `materials/`; this working folder is not committed.
2. Run `python scripts/inventory_sources.py`.
3. Review `data/source-index.json` for page counts, extraction quality, and duplicates.
4. Render and inspect equation-heavy or handwritten pages.
5. Update the relevant course JSON and TeX mappings.
6. Copy approved public PDFs to `public/materials/`.
7. Run all validation and tests.

## Grounding model

`data/course-definitions.json` is the textbook-first authority for the 89 course definitions and records a textbook section and PDF page for each item. Theorem-like results, procedures, and questions have source references. Generated questions record their validation method and status. TeX is checked with strict KaTeX parsing by `pnpm validate`.

## Contact

Corrections and suggestions are welcome: Jackie Zou at `zjiaqi1214@gmail.com`, [LinkedIn](https://www.linkedin.com/in/jackie-zou-652084382/), or [GitHub Issues](https://github.com/CadenzaMyFavourite/CO250-online-study/issues).

## Known limitations

Definitions, formal mathematics, two worked examples, a plain-language first-read guide, and at least three practice questions span all 11 units. Every worked example includes a matrix lens with dimensions and a beginner reading. The remaining gap is practice breadth toward five questions per unit. See the [definition audit](docs/DEFINITION_AUDIT.md) and [known limitations](docs/KNOWN_LIMITATIONS.md).
