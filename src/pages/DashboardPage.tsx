import { BookOpen, CheckCircle2, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { course } from '../data/course'

export function DashboardPage() {
  const firstUnit = course.units[0]
  return (
    <div className="dashboard-layout">
      <section className="dashboard-main">
        <header className="hero-header">
          <h1>Build the model.<br />Prove the answer.</h1>
          <p>A source-grounded path through linear, integer, and nonlinear optimization.</p>
          <div className="button-row">
            <Link className="button button--primary" to={`/topic/${firstUnit.slug}`}>Start · {firstUnit.title}</Link>
            <Link className="button button--outline" to="/course-map">Browse course map</Link>
            <Link className="button button--quiet" to="/practice?difficulty=beginner">Practice questions</Link>
            <Link className="button button--quiet" to="/exam">Build a question set</Link>
            <Link className="button button--quiet" to="/materials">Open PDF materials</Link>
          </div>
        </header>
        <section className="route-section" aria-labelledby="route-heading">
          <h2 id="route-heading">Your route through CO 250</h2>
          <ol className="course-rail">{course.units.map((unit) => <li key={unit.id} className={unit.number === 1 ? 'course-row course-row--current' : 'course-row'}><span className="course-node" aria-hidden="true" /><span className="course-number">{String(unit.number).padStart(2, '0')}</span><Link to={`/topic/${unit.slug}`}>{unit.title}</Link><span className="course-state">Unit {unit.number}</span></li>)}</ol>
        </section>
      </section>
      <aside className="study-rail" aria-label="Study recommendation">
        <section><h2>Start with the structure</h2><ul className="signal-list"><li>Define the decision variables</li><li>Write the objective</li><li>Translate every limit into a constraint</li></ul></section>
        <div className="rail-spacer" />
        <section className="rail-status"><FileText aria-hidden="true" /><span>Questions and answers are available without an account.</span></section>
        <section className="rail-status"><BookOpen aria-hidden="true" /><span>{course.metadata.sourceFileCount} public PDF files · {course.metadata.uniqueSourceCount} unique sources</span></section>
        <section className="rail-status"><CheckCircle2 aria-hidden="true" /><span>{course.metadata.definitionCount} textbook definitions · {course.questions.length} practice questions</span></section>
      </aside>
    </div>
  )
}
