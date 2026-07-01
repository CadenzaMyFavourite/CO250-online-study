import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Latex } from '../components/Latex'
import { SourceReferences } from '../components/SourceReferences'
import { course, unitById } from '../data/course'

export function ExamPage() {
  const [selectedUnits, setSelectedUnits] = useState<string[]>(course.units.slice(0, 5).map((unit) => unit.id))
  const [count, setCount] = useState(5)
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const pool = useMemo(() => course.questions.filter((question) => selectedUnits.includes(question.unitId)), [selectedUnits])
  const questions = questionIds.map((id) => course.questions.find((question) => question.id === id)).filter(Boolean)
  const toggleUnit = (unitId: string) => setSelectedUnits((current) => current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId])
  const buildSet = () => { setQuestionIds([...pool].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id)).slice(0, Math.min(count, pool.length)).map((q) => q.id)); setRevealed(new Set()) }
  const reveal = (id: string) => setRevealed((current) => new Set(current).add(id))

  if (questions.length) return <div className="page"><PageHeader title="CO250 question set" description="Work each question, then reveal its answer. Nothing is saved or scored." actions={<button className="button button--outline" onClick={() => setQuestionIds([])}>Build another set</button>} /><div className="exam-review">{questions.map((question, index) => question ? <article key={question.id}><div className="question-meta"><span>Question {index + 1}</span><span>{unitById.get(question.unitId)?.title}</span><span>{question.type.replaceAll('-', ' ')}</span></div><h2>{question.prompt}</h2>{question.promptLatex ? <Latex display>{question.promptLatex}</Latex> : null}{revealed.has(question.id) ? <div className="solution-panel"><strong><CheckCircle2 aria-hidden="true" /> Answer and solution</strong><p>{question.fullSolution}</p>{question.fullSolutionLatex ? <Latex display>{question.fullSolutionLatex}</Latex> : null}<div className="final-answer"><strong>Final answer</strong><span>{question.finalAnswer}</span>{question.finalAnswerLatex ? <Latex display>{question.finalAnswerLatex}</Latex> : null}</div><SourceReferences references={question.sourceReferences} compact /></div> : <button className="button button--primary" onClick={() => reveal(question.id)}>Reveal answer</button>}</article> : null)}</div></div>

  return <div className="page"><PageHeader title="Question set builder" description="Choose topics and generate a stateless set of questions with revealable answers." /><div className="exam-builder"><section><h2>1. Choose topics</h2><div className="checkbox-list">{course.units.map((unit) => <label key={unit.id}><input type="checkbox" checked={selectedUnits.includes(unit.id)} onChange={() => toggleUnit(unit.id)} /><span><strong>{String(unit.number).padStart(2, '0')}</strong>{unit.title}</span></label>)}</div></section><section className="exam-options"><h2>2. Set the questions</h2><label><span>Number of questions</span><input type="number" min="1" max={Math.max(pool.length, 1)} value={count} onChange={(event) => setCount(Number(event.target.value))} /></label><div className="exam-summary"><strong>{Math.min(count, pool.length)} questions</strong><span>from {selectedUnits.length} selected units</span></div><button className="button button--primary button--full" disabled={!pool.length} onClick={buildSet}>Create question set</button><p className="empty-copy">No login, timer, draft storage, or progress tracking.</p></section></div></div>
}
