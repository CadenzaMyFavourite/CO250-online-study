import { useMemo, useState } from 'react'
import { ArrowRight, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { course } from '../data/course'

const milestones = [
  { id: 'formulation', label: 'I can turn a word problem into variables, an objective, and constraints.', unitId: 'unit-01' },
  { id: 'standard-form', label: 'I can convert an LP to standard equality form and identify a basic solution.', unitId: 'unit-04' },
  { id: 'simplex', label: 'I can perform a simplex iteration and recognize optimality or unboundedness.', unitId: 'unit-05' },
  { id: 'duality', label: 'I can write a dual LP and use complementary slackness.', unitId: 'unit-08' },
  { id: 'advanced', label: 'I can work with integer cuts and convex/KKT certificates.', unitId: 'unit-10' },
] as const

export function StartDiagnosticPage() {
  const [confident, setConfident] = useState<string[]>([])
  const firstGap = milestones.find((milestone) => !confident.includes(milestone.id))
  const recommendedUnit = useMemo(() => course.units.find((unit) => unit.id === (firstGap?.unitId ?? 'unit-11')) ?? course.units[0], [firstGap])
  const allReady = !firstGap

  const toggle = (id: string) => setConfident((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <div className="page">
      <PageHeader title="Find your starting point" description="Check only what you can do confidently without notes. The first unchecked skill becomes your recommended starting unit." />
      <div className="diagnostic-layout">
        <section className="diagnostic-checks" aria-labelledby="diagnostic-checks-heading">
          <h2 id="diagnostic-checks-heading">Quick self-check</h2>
          <p>This is not a grade. It only prevents you from starting halfway up the staircase.</p>
          {milestones.map((milestone) => (
            <label key={milestone.id}>
              <input type="checkbox" checked={confident.includes(milestone.id)} onChange={() => toggle(milestone.id)} />
              <span>{milestone.label}</span>
            </label>
          ))}
        </section>
        <aside className="diagnostic-result" aria-live="polite">
          <Compass aria-hidden="true" />
          <span>{allReady ? 'Recommended review' : 'Recommended starting point'}</span>
          <h2>{allReady ? 'Mixed advanced review' : `Unit ${recommendedUnit.number} · ${recommendedUnit.title}`}</h2>
          <p>{allReady ? 'You report confidence across the full path. Use mixed practice to find smaller gaps.' : recommendedUnit.beginnerGuide?.bigIdea ?? recommendedUnit.summary}</p>
          <div className="button-row">
            <Link className="button button--primary" to={allReady ? '/practice?difficulty=beginner' : `/topic/${recommendedUnit.slug}`}>{allReady ? 'Open mixed practice' : 'Start this unit'} <ArrowRight aria-hidden="true" /></Link>
            {!allReady ? <Link className="button button--quiet" to={`/practice?unit=${recommendedUnit.id}&difficulty=beginner`}>Try easy questions</Link> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
