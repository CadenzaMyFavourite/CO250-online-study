# Architecture

## Decision

The platform is a static React + TypeScript + Vite application. A server is unnecessary for the current read-only course data and single-user local progress model.

```text
materials/                 private, gitignored PDFs
scripts/
  inventory_sources.py    PDF discovery, metadata, hashes, extraction quality
  validate_content.py     schema, ID, reference, and coverage invariants
data/
  course-map.json         hierarchy and prerequisites
  course-content.json     grounded results, procedures, examples, and questions
  course-definitions.json textbook-first definition audit with PDF pages and TeX
  course-examples.json    practical worked-example expansions with step-level TeX
  beginner-guides.json    plain-language first-read guidance for all 11 units
  notation-guide.json     TeX plus spoken/plain-language symbol translations
  course-matrices.json    Textbook-style matrix form plus a beginner reading for every worked example
  course-math.json        TeX statements for results and practice solutions
  definition-practice.json textbook definition retrieval and application questions
  source-index.json       generated source metadata; no PDF body text
backend/validation/       deterministic mathematical checks
src/
  components/             shell, page header, source references, math renderer
  data/                   typed indexes over JSON content
  lib/                    versioned local progress and weakness calculation
  pages/                  route-level learning workflows
```

## Runtime

All course content is bundled at build time. The browser makes no API requests. Versioned `localStorage` holds attempts and the current exam. The progress store uses `useSyncExternalStore` so separate screens update from one stable local snapshot.

## Content boundaries

UI components never contain the course syllabus. They read structured JSON. `course-definitions.json` is the authoritative definition dataset; definitions are grouped into units at load time. Source PDFs stay outside Git. The generated source index stores only filename, metadata, text-volume diagnostics, and SHA-256.

## Accessibility and performance

- Semantic navigation, headings, tabs, fieldsets, labels, and status text
- Visible focus rings and a skip link
- Color is paired with labels or shapes
- Reduced-motion mode removes transitions
- No runtime data waterfall or third-party scripts
- Static indexes are computed once at module load
- KaTeX and study-heavy routes load on demand; the initial dashboard bundle excludes KaTeX JavaScript and CSS
