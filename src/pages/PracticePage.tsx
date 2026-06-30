import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Latex } from '../components/Latex'
import { SourceReferences } from '../components/SourceReferences'
import { course, unitById } from '../data/course'
import { mistakeLabels, recordAttempt } from '../lib/progress'
import type { MistakeType } from '../types/content'

export function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [unitId, setUnitId] = useState(searchParams.get('unit') ?? 'all')
  const [type, setType] = useState('all')
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') ?? 'all')
  const [index, setIndex] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)
  const [solutionShown, setSolutionShown] = useState(false)
  const [scratch, setScratch] = useState('')
  const [confidence, setConfidence] = useState(3)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [mistake, setMistake] = useState<MistakeType | ''>('')
  const [saved, setSaved] = useState(false)
  const startedAt = useRef(Date.now())

  const filtered = useMemo(() => course.questions.filter((question) =>
    (unitId === 'all' || question.unitId === unitId) &&
    (type === 'all' || question.type === type) &&
    (difficulty === 'all' || (difficulty === 'beginner' ? question.difficulty <= 2 : question.difficulty === Number(difficulty))),
  ), [unitId, type, difficulty])

  const question = filtered[index % Math.max(filtered.length, 1)]
  const questionTypes = [...new Set(course.questions.map((row) => row.type))].sort()

  useEffect(() => {
    setIndex(0)
    setHintsShown(0)
    setSolutionShown(false)
    setScratch('')
    setSaved(false)
    startedAt.current = Date.now()
    if (unitId === 'all') {
      searchParams.delete('unit')
    } else {
      searchParams.set('unit', unitId)
    }
    if (difficulty === 'all') {
      searchParams.delete('difficulty')
    } else {
      searchParams.set('difficulty', difficulty)
    }
    setSearchParams(searchParams, { replace: true })
  }, [unitId, type, difficulty])

  const resetQuestionState = () => {
    setHintsShown(0)
    setSolutionShown(false)
    setScratch('')
    setConfidence(3)
    setCorrect(null)
    setMistake('')
    setSaved(false)
    startedAt.current = Date.now()
  }

  const nextQuestion = () => {
    setIndex((current) => (current + 1) % filtered.length)
    resetQuestionState()
  }

  const save = () => {
    if (!question || correct === null) return
    recordAttempt({
      questionId: question.id,
      unitId: question.unitId,
      correct,
      hintsUsed: hintsShown,
      confidence,
      mistakeType: !correct && mistake ? mistake : undefined,
      secondsSpent: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
    })
    setSaved(true)
  }

  return (
    <div className="page practice-page">
      <PageHeader title="Practice" description="Choose a topic, work from memory, then reveal only as much support as you need." />
      {difficulty === 'beginner' ? <div className="beginner-practice-banner"><div><strong>Beginner practice</strong><p>Only level 1–2 questions are shown. Start from the definition, use a hint if needed, and explain the answer in your own words.</p></div><Link to="/topic/lp-formulation">Review Unit 1 first</Link></div> : null}
      <div className="practice-filters">
        <label><span>Unit</span><select value={unitId} onChange={(event) => setUnitId(event.target.value)}><option value="all">Mixed topics</option>{course.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.number}. {unit.title}</option>)}</select></label>
        <label><span>Question type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option>{questionTypes.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label>
        <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">Any difficulty</option><option value="beginner">Beginner · levels 1–2</option>{[1,2,3,4,5].map((level) => <option key={level} value={level}>Level {level}</option>)}</select></label>
      </div>

      {!question ? (
        <div className="empty-state"><h2>No questions match these filters</h2><p>Broaden one filter to continue.</p></div>
      ) : (
        <div className="practice-workspace">
          <section className="question-panel">
            <div className="question-meta">
              <span>{unitById.get(question.unitId)?.title}</span>
              <span>{question.type.replaceAll('-', ' ')}</span>
              <span>Difficulty {question.difficulty}/5</span>
              <span>~{question.estimatedMinutes} min</span>
            </div>
            <h2>{question.prompt}</h2>
            {question.promptLatex ? <Latex display>{question.promptLatex}</Latex> : null}
            <div className="objective-line"><strong>Learning objective:</strong> {question.learningObjectives.join(' · ')}</div>
            <label className="scratch-label">
              <span>Scratch notes <small>stored only in this tab</small></span>
              <textarea value={scratch} onChange={(event) => setScratch(event.target.value)} placeholder="Work the problem here…" rows={8} />
            </label>
            <div className="hint-stack">
              {question.hints.slice(0, hintsShown).map((hint, hintIndex) => (
                <div className="hint" key={hint}><Lightbulb aria-hidden="true" /><div><strong>Hint {hintIndex + 1}</strong><p>{hint}</p></div></div>
              ))}
            </div>
            <div className="button-row">
              {hintsShown < question.hints.length ? <button className="button button--outline" onClick={() => setHintsShown((count) => count + 1)}><Lightbulb aria-hidden="true" /> Reveal hint {hintsShown + 1}</button> : null}
              {!solutionShown ? <button className="button button--quiet" onClick={() => setSolutionShown(true)}>Reveal solution</button> : null}
            </div>
          </section>

          <aside className="practice-side">
            {solutionShown ? (
              <section className="solution-panel" aria-live="polite">
                <div className="item-type">Detailed solution</div>
                <p>{question.fullSolution}</p>
                {question.fullSolutionLatex ? <Latex display>{question.fullSolutionLatex}</Latex> : null}
                <div className="final-answer"><strong>Final answer</strong><span>{question.finalAnswer}</span>{question.finalAnswerLatex ? <Latex display>{question.finalAnswerLatex}</Latex> : null}</div>
                <div className="validation-line"><CheckCircle2 aria-hidden="true" /> {question.validationStatus.replaceAll('-', ' ')} · {question.validationMethod}</div>
                <SourceReferences references={question.sourceReferences} compact />
              </section>
            ) : (
              <section className="support-note"><h3>Guided reveal</h3><p>Hints progress from recognition toward the first step. The full solution stays hidden until you choose to see it.</p></section>
            )}

            {solutionShown ? (
              <section className="reflection-panel">
                <h3>Record this attempt</h3>
                <fieldset><legend>Was your answer correct?</legend><label><input type="radio" name="correct" checked={correct === true} onChange={() => setCorrect(true)} /> Yes</label><label><input type="radio" name="correct" checked={correct === false} onChange={() => setCorrect(false)} /> Not yet</label></fieldset>
                <label><span>Confidence · {confidence}/5</span><input type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
                {correct === false ? <label><span>What went wrong?</span><select value={mistake} onChange={(event) => setMistake(event.target.value as MistakeType)}><option value="">Choose a category</option>{Object.entries(mistakeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : null}
                {saved ? <div className="save-confirmation"><CheckCircle2 aria-hidden="true" /> Attempt saved locally</div> : <button className="button button--primary button--full" disabled={correct === null || (correct === false && !mistake)} onClick={save}>Save attempt</button>}
              </section>
            ) : null}
            <button className="next-question" disabled={filtered.length < 2} onClick={nextQuestion}><span>Next question</span><ArrowRight aria-hidden="true" /></button>
            <button className="reset-question" onClick={resetQuestionState}><RotateCcw aria-hidden="true" /> Reset this view</button>
          </aside>
        </div>
      )}
    </div>
  )
}
