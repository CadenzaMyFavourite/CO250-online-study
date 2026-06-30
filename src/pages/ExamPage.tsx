import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Latex } from '../components/Latex'
import { course, questionById, unitById } from '../data/course'
import { clearExam, extendExamTimer, getExamRemainingSeconds, pauseExamTimer, readExam, resumeExamTimer, saveExam, type ExamSession } from '../lib/progress'

export function ExamPage() {
  const [selectedUnits, setSelectedUnits] = useState<string[]>(course.units.slice(0, 5).map((unit) => unit.id))
  const [count, setCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(60)
  const [session, setSession] = useState<ExamSession | null>(() => readExam())
  const [submitted, setSubmitted] = useState(Boolean(session?.submittedAt))
  const [showSolutions, setShowSolutions] = useState(Boolean(session?.submittedAt))
  const [answers, setAnswers] = useState<Record<string, string>>(() => session?.answers ?? {})
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!session || session.submittedAt || session.pausedAt) return
    const updateClock = () => setNow(Date.now())
    updateClock()
    const interval = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(interval)
  }, [session?.id, session?.pausedAt, session?.submittedAt])

  const pool = useMemo(() => course.questions.filter((question) => selectedUnits.includes(question.unitId)), [selectedUnits])
  const sessionQuestions = session?.questionIds.map((id) => questionById.get(id)).filter(Boolean) ?? []
  const remainingSeconds = session ? getExamRemainingSeconds(session, now) : 0
  const remainingText = remainingSeconds >= 3600
    ? `${Math.floor(remainingSeconds / 3600)}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
    : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((current) => current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId])
  }

  const buildExam = () => {
    const selected = [...pool].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id)).slice(0, Math.min(count, pool.length))
    const startedAt = new Date()
    const next: ExamSession = { id: `exam-${Date.now()}`, questionIds: selected.map((question) => question.id), timeLimitMinutes: timeLimit, startedAt: startedAt.toISOString(), endsAt: new Date(startedAt.getTime() + timeLimit * 60_000).toISOString(), answers: {} }
    saveExam(next)
    setSession(next)
    setSubmitted(false)
    setShowSolutions(false)
    setAnswers({})
    setNow(startedAt.getTime())
  }

  const submit = () => {
    if (!session) return
    const next = { ...session, answers, submittedAt: new Date().toISOString() }
    saveExam(next)
    setSession(next)
    setSubmitted(true)
  }

  const updateAnswer = (questionId: string, value: string) => {
    const nextAnswers = { ...answers, [questionId]: value }
    setAnswers(nextAnswers)
    if (session) {
      const nextSession = { ...session, answers: nextAnswers }
      setSession(nextSession)
      saveExam(nextSession)
    }
  }

  const updateTimer = (next: ExamSession) => {
    setSession(next)
    saveExam(next)
    setNow(Date.now())
  }

  const toggleTimer = () => {
    if (!session) return
    updateTimer(session.pausedAt ? resumeExamTimer(session) : pauseExamTimer(session))
  }

  const addExtraTime = () => {
    if (!session) return
    updateTimer(extendExamTimer(session, 15))
  }

  const buildAnotherExam = () => {
    clearExam()
    setSession(null)
    setSubmitted(false)
    setShowSolutions(false)
    setAnswers({})
  }

  if (session && !showSolutions) {
    const timerActions = (
      <div className="timer-actions">
        <div className={remainingSeconds === 0 ? 'timer-display timer-display--expired' : 'timer-display'} role="timer" aria-label={remainingSeconds === 0 ? 'Time expired' : session.pausedAt ? `${remainingText} paused` : `${remainingText} remaining`}>
          <Clock3 aria-hidden="true" /> {remainingSeconds === 0 ? 'Time expired' : session.pausedAt ? `${remainingText} paused` : `${remainingText} remaining`}
        </div>
        {!submitted ? <div className="timer-controls">
          <button className="button button--quiet" onClick={toggleTimer} disabled={remainingSeconds === 0}>{session.pausedAt ? 'Resume timer' : 'Pause timer'}</button>
          <button className="button button--quiet" onClick={addExtraTime}>Add 15 minutes</button>
        </div> : null}
      </div>
    )
    return (
      <div className="page exam-session">
        <PageHeader title="Exam in progress" description="Solutions remain hidden until submission. Draft answers and timer state stay on this device." actions={timerActions} />
        <div className="exam-questions">
          {sessionQuestions.map((question, index) => question ? (
            <article key={question.id}>
              <div className="question-meta"><span>Question {index + 1}</span><span>{unitById.get(question.unitId)?.title}</span><span>{question.estimatedMinutes} min</span></div>
              <h2>{question.prompt}</h2>
              {question.promptLatex ? <Latex display>{question.promptLatex}</Latex> : null}
              <textarea aria-label={`Answer for question ${index + 1}`} rows={5} value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question.id, event.target.value)} placeholder="Record your answer…" />
            </article>
          ) : null)}
        </div>
        <div className="exam-submit"><button className="button button--primary" onClick={submit}>Submit exam</button></div>
        {submitted ? <div className="submit-confirm"><CheckCircle2 aria-hidden="true" /><div><strong>Exam submitted</strong><span>Your answers remain on this device.</span></div><button className="button button--outline" onClick={() => setShowSolutions(true)}>Show solutions</button></div> : null}
      </div>
    )
  }

  if (session && showSolutions) {
    return (
      <div className="page">
        <PageHeader title="Exam review" description="Compare your reasoning with each detailed solution, then record topic practice separately when useful." actions={<button className="button button--outline" onClick={buildAnotherExam}>Build another exam</button>} />
        <div className="exam-review">
          {sessionQuestions.map((question, index) => question ? <article key={question.id}><div className="question-meta"><span>Question {index + 1}</span><span>{question.type}</span></div><h2>{question.prompt}</h2>{question.promptLatex ? <Latex display>{question.promptLatex}</Latex> : null}<div className="your-answer"><strong>Your answer</strong><p>{answers[question.id] || 'No answer recorded in this session.'}</p></div><div className="solution-panel"><strong>Solution</strong><p>{question.fullSolution}</p>{question.fullSolutionLatex ? <Latex display>{question.fullSolutionLatex}</Latex> : null}</div></article> : null)}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Exam builder" description="Assemble a local mixed exam. The builder never reveals solutions before submission." />
      <div className="exam-builder">
        <section>
          <h2>1. Choose topics</h2>
          <div className="checkbox-list">{course.units.map((unit) => <label key={unit.id}><input type="checkbox" checked={selectedUnits.includes(unit.id)} onChange={() => toggleUnit(unit.id)} /><span><strong>{String(unit.number).padStart(2, '0')}</strong>{unit.title}</span></label>)}</div>
        </section>
        <section className="exam-options">
          <h2>2. Set the paper</h2>
          <label><span>Number of questions</span><input type="number" min="1" max={Math.max(pool.length, 1)} value={count} onChange={(event) => setCount(Number(event.target.value))} /></label>
          <label><span>Time limit</span><select value={timeLimit} onChange={(event) => setTimeLimit(Number(event.target.value))}><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></label>
          <div className="exam-summary"><strong>{Math.min(count, pool.length)} questions available</strong><span>from {selectedUnits.length} selected units</span></div>
          <button className="button button--primary button--full" disabled={!pool.length} onClick={buildExam}>Build exam</button>
        </section>
      </div>
    </div>
  )
}
