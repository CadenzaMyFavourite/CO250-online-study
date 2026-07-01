import { useMemo, useState } from 'react'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SourceReferences } from '../components/SourceReferences'
import { Latex } from '../components/Latex'
import { ConceptVisual } from '../components/ConceptVisual'
import { course, unitBySlug } from '../data/course'

type Tab = 'overview' | 'definitions' | 'results' | 'procedure' | 'mistakes' | 'sources'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'results', label: 'Results' },
  { id: 'procedure', label: 'Procedure' },
  { id: 'mistakes', label: 'Mistakes' },
  { id: 'sources', label: 'Sources' },
]

export function TopicPage() {
  const { slug = '' } = useParams()
  const unit = unitBySlug.get(slug)
  const [tab, setTab] = useState<Tab>('overview')
  const questions = useMemo(() => (unit ? course.questions.filter((question) => question.unitId === unit.id) : []), [unit])

  if (!unit) return <Navigate to="/course-map" replace />
  const workedExamples = unit.workedExamples ?? (unit.workedExample ? [unit.workedExample] : [])

  const content = {
    overview: (
      <>
        {unit.beginnerGuide ? (
          <section className="beginner-guide" aria-labelledby="beginner-guide-heading">
            <span>New to this unit? Start here.</span>
            <h2 id="beginner-guide-heading">The idea before the notation</h2>
            <p className="beginner-big-idea">{unit.beginnerGuide.bigIdea}</p>
            <div className="beginner-guide-grid">
              <div><strong>Everyday picture</strong><p>{unit.beginnerGuide.everydayAnalogy}</p></div>
              <div><strong>First thing to check</strong><p>{unit.beginnerGuide.firstCheck}</p></div>
            </div>
            <Link className="beginner-practice-link" to={`/practice?unit=${unit.id}&difficulty=beginner`}>Try beginner practice for this unit <ArrowRight aria-hidden="true" /></Link>
            <Link className="beginner-practice-link beginner-practice-link--secondary" to="/notation">Need help reading the symbols?</Link>
          </section>
        ) : null}
        <ConceptVisual slug={unit.slug} />
        <section className="reading-section">
          <h2>{unit.procedures[0]?.name ?? 'What this unit establishes'}</h2>
          {unit.procedures[0] ? (
            <ol className="procedure-steps">
              {unit.procedures[0].steps.slice(0, 4).map((step, index) => (
                <li key={step.title}>
                  <span>{index + 1}</span>
                  <div><h3>{step.title}</h3><p>{step.detail}</p></div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="open-copy"><p>{unit.whyItMatters}</p><p>{unit.summary}</p></div>
          )}
        </section>
        {unit.definitions[0] ? (
          <section className="statement-band">
            <span className="statement-kind">Definition</span>
            <h3>{unit.definitions[0].title}</h3>
            <p className="formal-statement">{unit.definitions[0].formalStatement}</p>
            {unit.definitions[0].formalLatex ? <Latex display>{unit.definitions[0].formalLatex}</Latex> : null}
            <div className="simple-words"><strong>In simple words</strong><p>{unit.definitions[0].plainLanguageExplanation}</p></div>
          </section>
        ) : unit.theorems[0] ? (
          <section className="statement-band">
            <span className="statement-kind">{unit.theorems[0].category}</span>
            <h3>{unit.theorems[0].name}</h3>
            <p className="formal-statement">{unit.theorems[0].formalStatement}</p>
            <p>{unit.theorems[0].plainLanguageMeaning}</p>
          </section>
        ) : null}
        {workedExamples.map((workedExample, exampleIndex) => (
          <section className="reading-section worked-example" key={workedExample.id}>
            <h2>{workedExamples.length > 1 ? `Worked example ${exampleIndex + 1}` : 'Worked example'} · {workedExample.title.toLowerCase()}</h2>
            <div className="example-context"><strong>Problem in plain words</strong><p>{workedExample.prompt}</p></div>
            {workedExample.promptLatex ? <Latex display>{workedExample.promptLatex}</Latex> : null}
            {workedExample.matrixView ? (
              <div className="matrix-view" aria-label="Textbook matrix representation">
                <div className="matrix-view-heading">
                  <span>Textbook matrix lens</span>
                  <small>{workedExample.matrixView.dimensions}</small>
                </div>
                <Latex display>{workedExample.matrixView.latex}</Latex>
                <div className="matrix-reading"><strong>How to read it</strong><p>{workedExample.matrixView.plainLanguage}</p></div>
              </div>
            ) : null}
            <ol>{workedExample.steps.map((step, index) => <li key={step}><strong className="step-label">Step {index + 1}</strong><p>{step}</p>{workedExample.stepsLatex?.[index] ? <Latex display>{workedExample.stepsLatex[index]}</Latex> : null}</li>)}</ol>
            {workedExample.finalAnswer ? <div className="example-conclusion"><strong>Answer in plain words</strong><p>{workedExample.finalAnswer}</p>{workedExample.finalAnswerLatex ? <Latex display>{workedExample.finalAnswerLatex}</Latex> : null}</div> : null}
            <SourceReferences references={workedExample.sourceReferences} compact />
          </section>
        ))}
      </>
    ),
    definitions: (
      <section className="reading-section">
        <h2>Definitions</h2>
        {unit.definitions.length ? unit.definitions.map((definition) => (
          <article className="library-detail" key={definition.id}>
            <h3>{definition.title}</h3>
            <p className="formal-statement">{definition.formalStatement}</p>
            {definition.formalLatex ? <Latex display>{definition.formalLatex}</Latex> : null}
            <div className="simple-words"><strong>In simple words</strong><p>{definition.plainLanguageExplanation}</p></div>
            {definition.notation.length ? <p><strong>Notation:</strong> {definition.notation.join(' · ')}</p> : null}
            <SourceReferences references={definition.sourceReferences} compact />
          </article>
        )) : <p className="empty-copy">No standalone formal definitions were identified in this unit; use the results and procedure tabs.</p>}
      </section>
    ),
    results: (
      <section className="reading-section">
        <h2>Theorems and useful results</h2>
        {unit.theorems.length ? unit.theorems.map((theorem) => (
          <article className="library-detail" key={theorem.id}>
            <div className="item-type">{theorem.category}</div>
            <h3>{theorem.name}</h3>
            <p className="formal-statement">{theorem.formalStatement}</p>
            {theorem.formalLatex ? <Latex display>{theorem.formalLatex}</Latex> : null}
            <h4>Assumptions</h4>
            <ul>{theorem.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
            <h4>Why it matters</h4>
            <p>{theorem.whyItMatters}</p>
            <SourceReferences references={theorem.sourceReferences} compact />
          </article>
        )) : <p className="empty-copy">This unit is procedure-led; no theorem-like result is presented as a separate formal statement.</p>}
      </section>
    ),
    procedure: (
      <section className="reading-section">
        <h2>Problem-solving procedures</h2>
        {unit.procedures.length ? unit.procedures.map((procedure) => (
          <article className="library-detail" key={procedure.id}>
            <h3>{procedure.name}</h3>
            <div className="recognition-inline"><strong>Recognition:</strong> {procedure.recognitionSignals.join(' · ')}</div>
            <ol className="numbered-list">{procedure.steps.map((step) => <li key={step.title}><strong>{step.title}.</strong> {step.detail}</li>)}</ol>
            <h4>Checkpoints</h4>
            <ul>{procedure.checkpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul>
          </article>
        )) : <p className="empty-copy">No separate algorithmic procedure is needed for this conceptual unit.</p>}
      </section>
    ),
    mistakes: (
      <section className="reading-section">
        <h2>Common mistakes</h2>
        <ul className="mistake-list">{unit.commonMistakes.map((mistake) => <li key={mistake}><CircleAlert aria-hidden="true" />{mistake}</li>)}</ul>
      </section>
    ),
    sources: (
      <section className="reading-section">
        <h2>Source references</h2>
        <p className="section-intro">Formal statements on this page trace to the supplied files below. Page numbers are PDF page numbers.</p>
        <SourceReferences references={unit.sourceReferences} />
      </section>
    ),
  } satisfies Record<Tab, React.ReactNode>

  return (
    <div className="topic-layout">
      <section className="topic-main">
        <div className="breadcrumbs"><Link to="/course-map">Course map</Link><span>/</span><span>Unit {String(unit.number).padStart(2, '0')}</span></div>
        <header className="topic-header">
          <h1>{unit.title}</h1>
          <p>{unit.summary}</p>
          <div className="topic-source-line">{unit.sourceReferences.map((reference) => reference.fileName.replace('.pdf', '')).join(' · ')}</div>
          <div className="button-row">
            {questions.length ? <Link className="button button--primary" to={`/practice?unit=${unit.id}`}>Practice this topic</Link> : null}
          </div>
        </header>
        <div className="topic-tabs" role="tablist" aria-label="Topic sections">
          {tabs.map((item) => (
            <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>
          ))}
        </div>
        <div role="tabpanel" className="topic-tabpanel">{content[tab]}</div>
        <div className="topic-footer-nav">
          <span>Unit {String(unit.number).padStart(2, '0')} of {course.units.length}</span>
          {course.units[unit.number] ? <Link to={`/topic/${course.units[unit.number].slug}`}>Next · {course.units[unit.number].title}<ArrowRight aria-hidden="true" /></Link> : <Link to="/practice">Review with mixed practice<ArrowRight aria-hidden="true" /></Link>}
        </div>
      </section>
      <aside className="topic-rail">
        <section><h2>Recognition signals</h2><ul>{unit.recognitionSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul></section>
        <section><h2>Why it matters</h2><p>{unit.whyItMatters}</p></section>
        <section><h2>Common miss</h2><p>{unit.commonMistakes[0]}</p></section>
      </aside>
    </div>
  )
}
