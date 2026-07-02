# CO250 Field Guide

[Open the CO250 Study Guide](https://co250-online-study.vercel.app/) · [Report a problem or suggest an improvement](https://github.com/CadenzaMyFavourite/CO250-online-study/issues/new)

A free, static study platform for University of Waterloo CO250 and mathematical optimization. It organizes the course into 11 units with textbook-grounded definitions, matrix representations, worked examples, concept visualizations, guided practice, question sets, and public course PDFs.

If this project helps you, please [star the repository](https://github.com/CadenzaMyFavourite/CO250-online-study). Stars and shares help more students discover it. Feedback is always welcome—please [open a GitHub issue](https://github.com/CadenzaMyFavourite/CO250-online-study/issues/new) for incorrect mathematics, unclear explanations, broken links, accessibility problems, or feature ideas.

## Features

- 89 textbook-grounded definitions with source references
- 22 worked examples with matrix representations
- 40 practice questions with hints and detailed answers
- Concept visualizations for all 11 units
- Strict KaTeX validation for mathematical expressions
- Searchable definitions, theorems, procedures, and notation
- Stateless practice and question-set tools—no login or saved student data
- Responsive layout, semantic navigation, sitemap, structured metadata, and Google Search Console support
- Public PDF materials and direct source references

## Technology

- React 19 and TypeScript
- Vite
- React Router
- KaTeX
- Vitest and Testing Library
- Python content/source validators with `pypdf`
- Vercel static hosting and Web Analytics

There is no application backend, database, authentication system, or server function. The Python code is used only during development to validate content and inspect source files.

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer
- Python 3.11 or newer
- Git

If pnpm is not available, recent Node.js installations can enable it through Corepack:

```powershell
corepack enable
corepack prepare pnpm@9 --activate
```

## Run the project locally

### 1. Clone the repository

```powershell
git clone https://github.com/CadenzaMyFavourite/CO250-online-study.git
cd CO250-online-study
```

If you plan to contribute, fork the repository first and clone your fork instead.

### 2. Install JavaScript dependencies

```powershell
pnpm install
```

### 3. Install Python validation dependencies

Using a virtual environment is recommended:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

On macOS or Linux, activate the environment with:

```bash
source .venv/bin/activate
```

### 4. Start the development server

```powershell
pnpm dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

## Testing and validation

Run these checks before opening a pull request:

```powershell
# Validate the course structure and every KaTeX expression
pnpm validate

# Run the React component and behavior tests once
pnpm test

# Run frontend tests continuously while developing
pnpm test:watch

# Run the Python content/source validation tests
pnpm test:content

# Type-check and create the production bundle
pnpm build

# Serve the completed production bundle locally
pnpm preview
```

The complete release gate is:

```powershell
pnpm validate
pnpm test
pnpm test:content
pnpm build
```

After `pnpm build`, test important direct routes with `pnpm preview`, including:

- `/`
- `/topic/two-phase-simplex`
- `/notation`
- `/practice`
- `/exam`
- `/materials`

Check desktop and mobile widths, keyboard navigation, mathematical rendering, browser-console errors, missing assets, and horizontal page overflow.

## Project structure

```text
src/
  components/       Shared interface, math, SEO, and visualization components
  pages/            Route-level React pages
  data/             Typed course-data loader and indexes
  test/             Frontend component and behavior tests
data/                Definitions, examples, matrices, questions, math, and source index
public/
  materials/         Public PDF copies served by Vercel
scripts/             Content inventory and validation tools
backend/tests/       Python content/source tests; not an application backend
docs/                Definition audits, coverage notes, and known limitations
```

## Editing application code

1. Create a focused branch:

   ```powershell
   git switch -c feature/short-description
   ```

2. Make the smallest coherent change in `src/components`, `src/pages`, or `src/styles.css`.
3. Add or update a test in `src/test/app.test.tsx` when behavior changes.
4. Run the complete release gate.
5. Review `git diff` and confirm that generated files, local environments, and private files are not staged.
6. Commit the change and open a pull request with a short explanation and screenshots for visual changes.

The app uses route-level lazy loading. Keep large features route-local where possible, use semantic HTML, give SVG visualizations accessible names, and preserve the stateless privacy model.

## Adding or correcting course content

The textbook is the primary authority. Summary notes are useful for navigation, but definitions and mathematical claims should be checked against the textbook before publication.

Relevant files include:

- `data/course-definitions.json` — formal definitions and source locations
- `data/course-content.json` — units, results, procedures, and practice content
- `data/course-examples.json` — worked examples
- `data/course-matrices.json` — textbook-style matrix views
- `data/definition-practice.json` — definition-focused practice
- `data/course-math.json` — validated TeX mappings
- `data/source-index.json` — PDF metadata, hashes, page counts, and duplicates

When adding content:

1. Locate the statement in the textbook or supplied course source.
2. Record the PDF filename, chapter or section, page, and confidence level.
3. Preserve the formal statement and add a separate plain-language explanation.
4. Use valid TeX for mathematical notation instead of approximating formulas with ordinary text.
5. Add practical examples and explain how a beginner should recognize when the idea applies.
6. Add or update practice questions and detailed solutions when appropriate.
7. Run `pnpm validate`, the frontend tests, the Python tests, and the production build.
8. Update the relevant coverage or audit document in `docs/`.

## Adding or updating PDF materials

The root `materials/` folder is a local working directory and is intentionally ignored by Git. Approved public copies are stored in `public/materials/`.

```powershell
# Rebuild PDF metadata and hashes
pnpm inventory
```

Then:

1. Review `data/source-index.json` for missing pages, duplicates, and extraction quality.
2. Open and visually inspect equation-heavy, diagram-heavy, or handwritten pages.
3. Confirm that you have permission to redistribute every new PDF.
4. Copy only approved public files into `public/materials/`.
5. Verify that every public PDF opens and that its hash matches the intended source.
6. Run the complete release gate.

## Privacy and analytics

- No student account or advertising
- No saved progress, answer history, or question-set state
- Scratch notes exist only in current React state and disappear on refresh
- Vercel Web Analytics provides aggregate, cookie-free traffic measurements
- No environment variables are required by the application

## Deploying to Vercel

1. Import `CadenzaMyFavourite/CO250-online-study` into Vercel.
2. Select **Vite** as the framework.
3. Use `pnpm build` as the build command.
4. Use `dist` as the output directory.
5. Leave environment variables empty.
6. Deploy the `main` branch.

`vercel.json` rewrites application routes to `index.html`, allowing client-side routes to load and refresh directly. Pushes to `main` deploy automatically after the GitHub integration is connected.

## Troubleshooting

### `pnpm` is not recognized

Enable Corepack using the commands in the Requirements section, then reopen the terminal.

### Python cannot import `pypdf`

Activate the virtual environment and run:

```powershell
python -m pip install -r requirements.txt
```

### A formula fails validation

Run `pnpm validate`, find the reported expression in the course JSON, and test the TeX with KaTeX syntax. Do not silence strict parsing unless the underlying expression is corrected.

### A direct route returns a 404 after deployment

Confirm that the root `vercel.json` is present and that the deployment output directory is `dist`.

### A PDF link opens the application instead of a PDF

Confirm that the exact file exists under `public/materials/`, including spaces, accents, capitalization, and the `.pdf` extension.

## Contributing and feedback

Contributions are welcome from students, instructors, developers, and anyone interested in mathematical optimization or educational technology.

- [Report incorrect content or a broken feature](https://github.com/CadenzaMyFavourite/CO250-online-study/issues/new)
- [Browse existing issues](https://github.com/CadenzaMyFavourite/CO250-online-study/issues)
- [View the live website](https://co250-online-study.vercel.app/)
- [Star the repository](https://github.com/CadenzaMyFavourite/CO250-online-study)

When reporting a problem, include the page URL, unit or definition name, expected result, actual result, source reference if relevant, browser/device, and a screenshot when the issue is visual.

## Contact

Created by Jackie Zou.

- Email: `zjiaqi1214@gmail.com`
- [LinkedIn](https://www.linkedin.com/in/jackie-zou-652084382/)
- [GitHub Issues](https://github.com/CadenzaMyFavourite/CO250-online-study/issues)

## Known limitations

The site currently has at least three practice questions per unit; broader practice coverage toward five questions per unit remains a useful contribution area. See the [definition audit](docs/DEFINITION_AUDIT.md) and [known limitations](docs/KNOWN_LIMITATIONS.md) for more detail.
