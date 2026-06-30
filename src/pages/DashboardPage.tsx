import { BookOpen, CheckCircle2, FileText, LockKeyhole, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { course } from '../data/course'
import { getUnitStats, useProgress } from '../lib/progress'

export function DashboardPage() {
  const progress = useProgress()
  const hasAttempts = progress.attempts.length > 0
  const correct = progress.attempts.filter((attempt) => attempt.correct).length
  const accuracy = hasAttempts ? Math.round((correct / progress.attempts.length) * 100) : 0
  const attemptedUnits = new Set(progress.attempts.map((attempt) => attempt.unitId))
  const rankedWeak = course.units
    .map((unit) => ({ unit, stats: getUnitStats(progress.attempts, unit.id) }))
    .filter(({ stats }) => stats.attempts > 0)
    .sort((a, b) => b.stats.weakness - a.stats.weakness)
  const nextUnit = rankedWeak[0]?.unit ?? course.units.find((unit) => !progress.completedTopics.includes(unit.id)) ?? course.units[0]

  return (
    <div className="dashboard-layout">
      <section className="dashboard-main">
        <header className="hero-header">
          <h1>Build the model.<br />Prove the answer.</h1>
          <p>A source-grounded path through linear, integer, and nonlinear optimization.</p>
          <div className="button-row">
            <Link className="button button--primary" to={`/topic/${nextUnit.slug}`}>
              Continue · {nextUnit.title}
            </Link>
            <Link className="button button--outline" to="/course-map">Browse course map</Link>
            <Link className="button button--quiet" to="/practice?difficulty=beginner">Start beginner practice</Link>
            <Link className="button button--quiet" to="/start">Find my starting point</Link>
            <Link className="button button--quiet" to="/notation">Decode the symbols</Link>
          </div>
        </header>

        {hasAttempts ? (
          <div className="metric-strip" aria-label="Study progress">
            <div><strong>{progress.attempts.length}</strong><span>questions attempted</span></div>
            <div><strong>{accuracy}%</strong><span>accuracy</span></div>
            <div><strong>{attemptedUnits.size}</strong><span>units practiced</span></div>
          </div>
        ) : null}

        <section className="route-section" aria-labelledby="route-heading">
          <h2 id="route-heading">Your route through CO 250</h2>
          <ol className="course-rail">
            {course.units.map((unit) => {
              const complete = progress.completedTopics.includes(unit.id)
              const current = unit.id === nextUnit.id
              const attempted = attemptedUnits.has(unit.id)
              return (
                <li key={unit.id} className={complete ? 'course-row course-row--complete' : current ? 'course-row course-row--current' : 'course-row'}>
                  <span className="course-node" aria-hidden="true" />
                  <span className="course-number">{String(unit.number).padStart(2, '0')}</span>
                  <Link to={`/topic/${unit.slug}`}>{unit.title}</Link>
                  <span className="course-state">{complete ? 'Complete' : attempted ? 'In progress' : current ? 'Start here' : 'Unstarted'}</span>
                </li>
              )
            })}
          </ol>
        </section>
      </section>

      <aside className="study-rail" aria-label="Study recommendation">
        <section>
          <h2>Start with the structure</h2>
          <ul className="signal-list">
            <li>Define the decision variables</li>
            <li>Write the objective</li>
            <li>Translate every limit into a constraint</li>
          </ul>
        </section>
        <div className="rail-spacer" />
        <section className="rail-status">
          {hasAttempts ? (
            <>
              <Route aria-hidden="true" />
              <div><strong>Recommended next</strong><span>{nextUnit.title}</span></div>
            </>
          ) : (
            <>
              <FileText aria-hidden="true" />
              <span>No practice recorded yet</span>
            </>
          )}
        </section>
        <section className="rail-status">
          <BookOpen aria-hidden="true" />
          <span>{course.metadata.sourceFileCount} local files indexed · {course.metadata.uniqueSourceCount} unique sources</span>
        </section>
        <section className="rail-status">
          <CheckCircle2 aria-hidden="true" />
          <span>{course.metadata.definitionCount} textbook definitions · {course.questions.length} practice questions</span>
        </section>
        <section className="rail-status">
          <LockKeyhole aria-hidden="true" />
          <span>Materials and progress never leave this device</span>
        </section>
      </aside>
    </div>
  )
}
