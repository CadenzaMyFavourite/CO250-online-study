# Question taxonomy

The taxonomy below is limited to types supported by the supplied formulation, simplex, duality, integer-programming, and convex-optimization material.

| Type | What it tests | Recognition | Procedure / result | Typical trap | Validation | Representative |
|---|---|---|---|---|---|---|
| Definition recall | Exact concept and quantifiers | “Define”, “state” | Retrieve definition, then explain symbols | Omitting “for every” | Source statement match | `q-convex-set` |
| Recognition | Identify the model object | “State variables”, “what kind” | Name the decisions and units | Defining a derived value | Model audit | `q-lp-variables` |
| Formulation | Translate prose to math | resources, decisions, best/least | Define variables → objective → constraints → audit | Wrong inequality or missing signs | Unit/case audit | `q-lp-formulate` |
| Error analysis | Find a missing or invalid step | proposed model/solution | Test intended cases and identify failure | Trusting prose not constraints | Counterexample or substitution | `q-lp-error` |
| Conversion | Change representation | “SEF”, free variable, slack | Apply equivalence rule everywhere | Transforming constraints but not objective | Algebraic equivalence | `q-sef-free` |
| Algorithm step | Execute one iteration | entering/leaving, ratio | Apply the stated algorithm in order | Using nonpositive ratios | Deterministic calculation | `q-simplex-ratio` |
| Intermediate-state interpretation | Read algorithm outcome | phase-I value, reduced cost | Apply the termination theorem | Wrong sign convention | Theorem application | `q-phase-one` |
| Certificate verification | Prove an LP outcome | candidate y, d, or bounds | Check dimensions, feasibility, signs, strict condition | Checking only one relation | Deterministic matrix checks | `q-cert-unbounded` |
| Theorem application | Verify assumptions and conclude | feasible primal/dual values | State theorem, check premises, conclude exactly | Using weak duality on infeasible points | Premise/conclusion audit | `q-weak-duality` |
| Assumption check | Decide if a result applies | “before applying”, candidate optimum | List and verify every hypothesis | Skipping Slater or convexity | Checklist + source | `q-kkt-assumptions` |
| True/false with correction | Test conceptual precision | absolute wording (“exactly one”) | Find a proof or counterexample | Reading inclusive OR as exclusive | Logic check | `q-cs-inclusive` |
| Relaxation interpretation | Use containment and bounds | LP solution vs IP | Check integrality, feasibility, bound direction | Rounding without rechecking | Set-containment proof | `q-ip-relaxation` |
| Multiperiod balance | Link indexed periods | inventory/flow over time | previous state + inflow − outflow | Reversing flow signs | Unit and conservation audit | `q-multiperiod` |
| Mixed exam | Select across completed units | exam-style combination | Allocate time, solve independently, submit before review | Revealing solutions early | Per-question methods | Exam builder |

## Expected solution structure

For theorem/proof questions: state the exact result, list assumptions, show each assumption, perform the decisive calculation, and state only the licensed conclusion. For modelling questions: variables with units, objective, named constraints, domains, then a meaning/unit audit. For algorithms: current state, rule used, calculation, next state, and termination check.

