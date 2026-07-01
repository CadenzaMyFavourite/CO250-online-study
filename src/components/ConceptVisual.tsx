type VisualConfig = {
  title: string
  takeaway: string
  kind: 'model' | 'domains' | 'outcomes' | 'sef' | 'simplex' | 'phase-one' | 'geometry' | 'duality' | 'slackness' | 'integer' | 'convex'
}

const visuals: Record<string, VisualConfig> = {
  'lp-formulation': { title: 'From a story to a linear program', takeaway: 'Variables say what you control; the objective says what “better” means; constraints draw the allowed region.', kind: 'model' },
  'integer-nonlinear-formulation': { title: 'Three different decision spaces', takeaway: 'Continuous variables fill a region, integer variables land on isolated grid points, and nonlinear expressions can bend the boundary.', kind: 'domains' },
  'lp-outcomes-certificates': { title: 'Every linear program has one of three outcomes', takeaway: 'A solution proves optimality; a separating certificate proves infeasibility; an improving ray proves unboundedness.', kind: 'outcomes' },
  'standard-equality-form': { title: 'Inequalities become equalities', takeaway: 'A slack variable records unused capacity, turning each ≤ constraint into an equality while keeping every variable nonnegative.', kind: 'sef' },
  'simplex-algorithm': { title: 'Simplex walks along improving edges', takeaway: 'Starting at one basic feasible solution, simplex moves from vertex to adjacent vertex until no edge improves the objective.', kind: 'simplex' },
  'two-phase-simplex': { title: 'Phase I builds a valid starting point', takeaway: 'Artificial variables provide a temporary basis. Phase I drives them to zero; Phase II then optimizes the original objective.', kind: 'phase-one' },
  'geometry-simplex': { title: 'Algebraic bases correspond to geometric vertices', takeaway: 'Active constraints meet at a vertex. Changing one basis column usually moves to a neighboring vertex along an edge.', kind: 'geometry' },
  duality: { title: 'Primal decisions and dual prices tell the same story', takeaway: 'The primal allocates quantities; the dual prices resources. Every dual feasible value bounds every primal feasible value.', kind: 'duality' },
  'complementary-slackness': { title: 'Unused resource means zero shadow price', takeaway: 'For each primal constraint, either it is tight or its dual variable is zero. The paired dual statement works the same way.', kind: 'slackness' },
  'integer-programs': { title: 'Integer feasibility keeps only lattice points', takeaway: 'The LP relaxation fills the polygon, but an integer program may choose only the grid points inside it.', kind: 'integer' },
  'convex-optimization': { title: 'Convexity rules out deceptive local minima', takeaway: 'On a convex landscape, the line segment between feasible points stays feasible, and every local minimum is global.', kind: 'convex' },
}

const axis = <><path className="visual-axis" d="M70 245H620" /><path className="visual-axis" d="M90 260V35" /></>

function ModelVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="A word problem flowing into variables, objective, constraints, and a feasible region">
    <defs><marker id="arrow-model" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
    <rect className="visual-box visual-box--soft" x="24" y="104" width="120" height="72" rx="6" /><text x="84" y="133">Word problem</text><text className="visual-small" x="84" y="155">bakery, routes, budget…</text>
    <path className="visual-arrow" markerEnd="url(#arrow-model)" d="M150 140H190" />
    <rect className="visual-box" x="200" y="44" width="142" height="52" rx="6" /><text x="271" y="66">Variables</text><text className="visual-small" x="271" y="84">what can change?</text>
    <rect className="visual-box" x="200" y="124" width="142" height="52" rx="6" /><text x="271" y="146">Objective</text><text className="visual-small" x="271" y="164">what is best?</text>
    <rect className="visual-box" x="200" y="204" width="142" height="52" rx="6" /><text x="271" y="226">Constraints</text><text className="visual-small" x="271" y="244">what is allowed?</text>
    <path className="visual-arrow" markerEnd="url(#arrow-model)" d="M352 70C402 70 388 135 426 135" /><path className="visual-arrow" markerEnd="url(#arrow-model)" d="M352 150H426" /><path className="visual-arrow" markerEnd="url(#arrow-model)" d="M352 230C402 230 388 165 426 165" />
    <path className="visual-region" d="M462 230L462 92L548 62L620 145L584 230Z" /><circle className="visual-point visual-point--best" cx="548" cy="62" r="7" /><text x="540" y="44">best feasible point</text><text className="visual-small" x="541" y="255">feasible region</text>
  </svg>
}

function DomainsVisual() {
  const points = Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => <circle key={`${row}-${col}`} className="visual-point" cx={270 + col * 26} cy={82 + row * 33} r="4" />))
  return <svg viewBox="0 0 680 300" role="img" aria-label="Continuous region, integer lattice points, and a curved nonlinear boundary">
    <text className="visual-label" x="112" y="40">Continuous</text><path className="visual-region" d="M38 235V82L120 54L205 126L180 235Z" /><text className="visual-small" x="120" y="258">every point can be used</text>
    <text className="visual-label" x="330" y="40">Integer</text>{points}<path className="visual-outline" d="M258 235V82L330 55L402 126L382 235Z" /><text className="visual-small" x="330" y="258">grid points only</text>
    <text className="visual-label" x="548" y="40">Nonlinear</text><path className="visual-region" d="M465 235C480 115 537 65 642 80V235Z" /><path className="visual-curve" d="M465 235C480 115 537 65 642 80" /><text className="visual-small" x="553" y="258">curved boundary</text>
  </svg>
}

function OutcomesVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="Three branches for optimal, infeasible, and unbounded linear programs">
    <defs><marker id="arrow-outcomes" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
    <rect className="visual-box visual-box--soft" x="258" y="22" width="164" height="52" rx="6" /><text x="340" y="53">Solve the LP</text>
    <path className="visual-arrow" d="M340 76V104M340 104H116V130M340 104V130M340 104H564V130" markerEnd="url(#arrow-outcomes)" />
    <rect className="visual-box" x="34" y="138" width="164" height="100" rx="6" /><text className="visual-label" x="116" y="168">Optimal</text><circle className="visual-point visual-point--best" cx="116" cy="196" r="8" /><text className="visual-small" x="116" y="222">solution + bound</text>
    <rect className="visual-box" x="258" y="138" width="164" height="100" rx="6" /><text className="visual-label" x="340" y="168">Infeasible</text><path className="visual-curve" d="M296 215L326 180M354 215L384 180" /><text className="visual-small" x="340" y="236">certificate separates</text>
    <rect className="visual-box" x="482" y="138" width="164" height="100" rx="6" /><text className="visual-label" x="564" y="168">Unbounded</text><path className="visual-arrow" d="M520 215L608 178" markerEnd="url(#arrow-outcomes)" /><text className="visual-small" x="564" y="236">improving ray</text>
  </svg>
}

function SefVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="A less-than constraint converted to an equality by adding a slack variable">
    <defs><marker id="arrow-sef" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
    <rect className="visual-box visual-box--soft" x="34" y="82" width="238" height="122" rx="6" /><text className="visual-label" x="153" y="117">Capacity constraint</text><text className="visual-math" x="153" y="158">2x₁ + x₂ ≤ 10</text><text className="visual-small" x="153" y="184">some capacity may be unused</text>
    <path className="visual-arrow" d="M286 143H372" markerEnd="url(#arrow-sef)" /><text className="visual-small" x="329" y="126">add slack s</text>
    <rect className="visual-box" x="390" y="66" width="256" height="154" rx="6" /><text className="visual-label" x="518" y="101">Equality form</text><text className="visual-math" x="518" y="142">2x₁ + x₂ + s = 10</text><text className="visual-math visual-accent" x="518" y="176">x₁, x₂, s ≥ 0</text><text className="visual-small" x="518" y="202">s = unused capacity</text>
  </svg>
}

function PolygonVisual({ geometry = false }: { geometry?: boolean }) {
  return <svg viewBox="0 0 680 300" role="img" aria-label="A simplex path moving along the vertices of a feasible polygon">
    {axis}<path className="visual-region" d="M124 232L162 132L282 72L444 92L548 174L492 232Z" />
    <path className="visual-path" d="M124 232L162 132L282 72L444 92" />
    {[[124,232],[162,132],[282,72],[444,92],[548,174],[492,232]].map(([x,y], index) => <circle className={index === 3 ? 'visual-point visual-point--best' : 'visual-point'} cx={x} cy={y} r={index === 3 ? 8 : 5} key={`${x}-${y}`} />)}
    <text className="visual-small" x="124" y="258">start</text><text className="visual-small" x="445" y="70">no improving edge</text>
    {geometry ? <><path className="visual-guide" d="M282 72L282 245M444 92L444 245" /><text className="visual-small" x="362" y="280">one basis change = one edge move</text></> : <text className="visual-small" x="334" y="276">objective improves at every arrow</text>}
  </svg>
}

function PhaseOneVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="Two phases: remove artificial variables, then optimize the original objective">
    <defs><marker id="arrow-phase" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
    <rect className="visual-box visual-box--soft" x="32" y="70" width="176" height="150" rx="6" /><text className="visual-label" x="120" y="104">Temporary basis</text><text className="visual-math" x="120" y="145">[ A  I ]</text><text className="visual-small" x="120" y="176">artificial variables</text><text className="visual-small visual-accent" x="120" y="198">may be positive</text>
    <path className="visual-arrow" d="M218 145H286" markerEnd="url(#arrow-phase)" />
    <rect className="visual-box" x="300" y="42" width="164" height="96" rx="6" /><text className="visual-label" x="382" y="74">Phase I</text><text className="visual-math" x="382" y="104">min 1ᵀa</text><text className="visual-small" x="382" y="125">drive a → 0</text>
    <path className="visual-arrow" d="M382 148V184H482" markerEnd="url(#arrow-phase)" />
    <rect className="visual-box" x="488" y="158" width="160" height="96" rx="6" /><text className="visual-label" x="568" y="190">Phase II</text><text className="visual-math" x="568" y="220">min cᵀx</text><text className="visual-small" x="568" y="241">original problem</text>
  </svg>
}

function DualityVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="Primal quantities on the left and dual resource prices on the right connected by a bound">
    <defs><marker id="arrow-dual" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" /></marker></defs>
    <rect className="visual-box visual-box--soft" x="38" y="54" width="220" height="172" rx="6" /><text className="visual-label" x="148" y="88">Primal</text><text className="visual-math" x="148" y="124">max cᵀx</text><text className="visual-small" x="148" y="153">choose activity quantities x</text><text className="visual-small" x="148" y="181">use limited resources</text><text className="visual-accent" x="148" y="207">lower bound</text>
    <rect className="visual-box" x="422" y="54" width="220" height="172" rx="6" /><text className="visual-label" x="532" y="88">Dual</text><text className="visual-math" x="532" y="124">min bᵀy</text><text className="visual-small" x="532" y="153">choose resource prices y</text><text className="visual-small" x="532" y="181">cover every activity value</text><text className="visual-accent" x="532" y="207">upper bound</text>
    <path className="visual-arrow" d="M270 118H408" markerEnd="url(#arrow-dual)" /><path className="visual-arrow" d="M410 168H272" markerEnd="url(#arrow-dual)" /><text className="visual-small" x="340" y="104">weak duality</text><text className="visual-small" x="340" y="196">equal at optimum</text>
  </svg>
}

function SlacknessVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="Two complementary pairs showing slack times price equals zero">
    <text className="visual-label" x="340" y="38">Each pair has at least one zero</text>
    <rect className="visual-box visual-box--soft" x="42" y="72" width="180" height="72" rx="6" /><text x="132" y="101">unused resource</text><text className="visual-math" x="132" y="126">slack &gt; 0</text>
    <text className="visual-times" x="250" y="118">×</text><rect className="visual-box" x="286" y="72" width="180" height="72" rx="6" /><text x="376" y="101">shadow price</text><text className="visual-math visual-accent" x="376" y="126">y = 0</text><text className="visual-times" x="496" y="118">= 0</text>
    <rect className="visual-box visual-box--soft" x="42" y="176" width="180" height="72" rx="6" /><text x="132" y="205">positive activity</text><text className="visual-math" x="132" y="230">x &gt; 0</text>
    <text className="visual-times" x="250" y="222">×</text><rect className="visual-box" x="286" y="176" width="180" height="72" rx="6" /><text x="376" y="205">dual slack</text><text className="visual-math visual-accent" x="376" y="230">= 0</text><text className="visual-times" x="496" y="222">= 0</text>
  </svg>
}

function IntegerVisual() {
  const points = Array.from({ length: 6 }, (_, row) => Array.from({ length: 12 }, (_, col) => {
    const x = 106 + col * 42; const y = 238 - row * 36
    return <circle key={`${row}-${col}`} className="visual-point" cx={x} cy={y} r="4" />
  }))
  return <svg viewBox="0 0 680 300" role="img" aria-label="Grid points over a polygon, with feasible integer points highlighted">{axis}<path className="visual-region visual-region--light" d="M124 238L166 116L324 58L540 142L502 238Z" />{points}{[[148,202],[190,166],[232,130],[274,130],[316,94],[358,94],[400,130],[442,130],[484,166],[484,202]].map(([x,y]) => <circle key={`${x}-${y}`} className="visual-point visual-point--feasible" cx={x} cy={y} r="7" />)}<text className="visual-small" x="340" y="278">colored dots are feasible integer solutions</text></svg>
}

function ConvexVisual() {
  return <svg viewBox="0 0 680 300" role="img" aria-label="A convex bowl with one global minimum and a line segment staying above the curve">
    {axis}<path className="visual-curve visual-curve--heavy" d="M126 72C200 72 212 232 340 232C468 232 480 72 554 72" /><circle className="visual-point visual-point--best" cx="340" cy="232" r="8" /><text className="visual-small" x="340" y="260">local = global minimum</text>
    <circle className="visual-point" cx="188" cy="116" r="6" /><circle className="visual-point" cx="492" cy="116" r="6" /><path className="visual-guide visual-guide--accent" d="M188 116H492" /><path className="visual-guide" strokeDasharray="5 5" d="M340 116V232" /><text className="visual-small" x="340" y="99">chord lies above the graph</text>
  </svg>
}

function VisualArt({ kind }: { kind: VisualConfig['kind'] }) {
  switch (kind) {
    case 'model': return <ModelVisual />
    case 'domains': return <DomainsVisual />
    case 'outcomes': return <OutcomesVisual />
    case 'sef': return <SefVisual />
    case 'simplex': return <PolygonVisual />
    case 'phase-one': return <PhaseOneVisual />
    case 'geometry': return <PolygonVisual geometry />
    case 'duality': return <DualityVisual />
    case 'slackness': return <SlacknessVisual />
    case 'integer': return <IntegerVisual />
    case 'convex': return <ConvexVisual />
  }
}

export function ConceptVisual({ slug }: { slug: string }) {
  const visual = visuals[slug]
  if (!visual) return null
  return <figure className="concept-visual">
    <figcaption><span>Concept sketch · not to scale</span><h2>{visual.title}</h2></figcaption>
    <div className="concept-visual-art"><VisualArt kind={visual.kind} /></div>
    <p><strong>What to notice:</strong> {visual.takeaway}</p>
  </figure>
}
