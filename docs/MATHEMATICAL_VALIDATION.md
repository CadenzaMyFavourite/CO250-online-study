# Mathematical validation

## Implemented deterministic checks

`backend/validation/validators.py` provides:

- standard-equality-form feasibility, including nonnegativity
- unbounded-ray certificate verification
- weak-duality value ordering
- inequality-form primal/dual feasibility, objective-gap, and complementary-slackness diagnostics
- normalized Phase I auxiliary-point checks, including zero-artificial feasibility certificates
- matching primal/dual Phase I certificates for a negative optimum and original infeasibility
- Gauss-Jordan tableau pivot computation and proposed-result diagnostics

Unit tests cover known valid and invalid examples. The diagnostic primal/dual checker uses

\[
\max\{c^\mathsf{T}x:Ax\le b,\ x\ge0\}
\qquad\text{and}\qquad
\min\{b^\mathsf{T}y:A^\mathsf{T}y\ge c,\ y\ge0\}.
\]

It separately reports primal feasibility, dual feasibility, objective agreement, and the largest complementary-slackness residual. The Phase I checker deliberately does not treat a positive objective at an arbitrary auxiliary feasible point as proof of original infeasibility; that conclusion requires a positive *optimal* Phase I value.

`scripts/validate_content.py` checks:

- stable-ID uniqueness
- unit/prerequisite/source cross-references
- source presence on formal results, procedures, and questions
- definition-count agreement, stable IDs, unit coverage, and valid textbook PDF pages
- nonempty question objectives/solutions/answers
- theorem assumptions
- procedure recognition signals and steps
- difficulty range 1–5

`scripts/validate_math.mjs` parses every tracked TeX expression with strict KaTeX error handling. It also rejects control characters caused by incorrect JSON backslash escaping and checks that every result and practice question has a TeX mapping. The current audit passes 361 expressions, including all 21 practical example-expansion records, 22 matrix views, 26 definition/application questions, and 21 notation-guide formulas.

## Validation labels

- `numerically-validated`: deterministic arithmetic check
- `symbolically-validated`: exact algebraic identity or symbolic tool check
- `source-verified`: matched to the supplied source
- `requires-human-review`: pedagogically reviewed but not fully deterministically checked

No proof in this project is described as formally verified. The definition pass checked 45 rendered textbook PDF pages, including formula-heavy pages for bases, geometry, duality, integer programs, and convex optimization. KKT, duality, certificate, and geometry statements were compared with supplied source pages; only the small numerical validators and TeX syntax checks are automated.

## Next validators

Next, connect these deterministic certificate checks directly to generated numerical practice and add randomized property tests for dimension-safe cases.
