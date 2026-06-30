import { AlertCircle, BarChart3, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { course, questionById, unitById } from '../data/course'
import { getUnitStats, mistakeLabels, resetProgress, useProgress } from '../lib/progress'

export function ProgressPage() {
  const progress = useProgress()
  const hasAttempts = progress.attempts.length > 0
  const correct = progress.attempts.filter((attempt) => attempt.correct).length
  const ranked = course.units.map((unit) => ({ unit, stats: getUnitStats(progress.attempts, unit.id) })).filter((row) => row.stats.attempts).sort((a, b) => b.stats.weakness - a.stats.weakness)
  const mistakes = [...progress.attempts.filter((attempt) => !attempt.correct && attempt.mistakeType)].reverse()

  return (
    <div className="page">
      <PageHeader title="Progress" description="Evidence from your local attempts—no streaks, leaderboards, or decorative scoring." actions={hasAttempts ? <button className="button button--quiet" onClick={() => { if (window.confirm('Reset all locally stored progress?')) resetProgress() }}><RotateCcw aria-hidden="true" /> Reset progress</button> : null} />
      {!hasAttempts ? (
        <div className="progress-empty">
          <BarChart3 aria-hidden="true" />
          <h2>No learning record yet</h2>
          <p>Complete a practice question and save your reflection. Accuracy, hints, confidence, and mistakes will appear here.</p>
          <Link className="button button--primary" to="/practice">Start topic practice</Link>
        </div>
      ) : (
        <>
          <div className="progress-summary">
            <div><strong>{progress.attempts.length}</strong><span>attempts</span></div>
            <div><strong>{Math.round((correct / progress.attempts.length) * 100)}%</strong><span>accuracy</span></div>
            <div><strong>{progress.attempts.filter((attempt) => attempt.hintsUsed > 0).length}</strong><span>used hints</span></div>
            <div><strong>{progress.completedTopics.length}</strong><span>topics complete</span></div>
          </div>
          <section className="progress-section">
            <div className="section-heading"><div><h2>Weak-topic review</h2><p>Highest score means review sooner.</p></div></div>
            <div className="weakness-formula"><strong>Formula</strong><span>(1 − accuracy) × 40 + hint rate × 20 + repeated mistakes × 15 + recency × 10 + low confidence × 15</span></div>
            <div className="weak-topic-list">
              {ranked.map(({ unit, stats }) => <article key={unit.id}><div><span className="weakness-score">{stats.weakness}</span><div><h3>{unit.title}</h3><p>{stats.attempts} attempts · {Math.round(stats.accuracy * 100)}% accurate · confidence {stats.averageConfidence.toFixed(1)}/5</p></div></div><Link to={`/practice?unit=${unit.id}`}>Review</Link></article>)}
            </div>
          </section>
          <section className="progress-section">
            <h2>Recent mistakes</h2>
            {mistakes.length ? <div className="mistake-history">{mistakes.slice(0, 8).map((attempt) => <article key={attempt.id}><AlertCircle aria-hidden="true" /><div><strong>{questionById.get(attempt.questionId)?.prompt}</strong><span>{attempt.mistakeType ? mistakeLabels[attempt.mistakeType] : ''} · {unitById.get(attempt.unitId)?.title}</span></div></article>)}</div> : <p className="empty-copy">No mistakes have been classified yet.</p>}
          </section>
        </>
      )}
    </div>
  )
}
