import { AlertTriangle, Check, Circle, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { course, unitById } from '../data/course'
import { useProgress } from '../lib/progress'
import { PageHeader } from '../components/PageHeader'

export function CourseMapPage() {
  const progress = useProgress()
  const attemptedUnits = new Set(progress.attempts.map((attempt) => attempt.unitId))

  return (
    <div className="page page--wide">
      <PageHeader
        title="Course map"
        description="Eleven source-backed units, ordered by the structure in the supplied review material."
        meta="All units are visible. Prerequisites are guidance, not gates."
      />
      <div className="map-legend" aria-label="Status legend">
        <span><Check aria-hidden="true" /> Complete</span>
        <span><Circle aria-hidden="true" /> In progress</span>
        <span><LockKeyhole aria-hidden="true" /> Prerequisites outstanding</span>
        <span><AlertTriangle aria-hidden="true" /> Coverage note</span>
      </div>
      <ol className="unit-map">
        {course.units.map((unit) => {
          const complete = progress.completedTopics.includes(unit.id)
          const attempted = attemptedUnits.has(unit.id)
          const missingPrereqs = unit.prerequisites.filter((id) => !progress.completedTopics.includes(id))
          return (
            <li key={unit.id} className="unit-map-row">
              <div className="unit-map-number">{String(unit.number).padStart(2, '0')}</div>
              <div className="unit-map-body">
                <div className="unit-map-heading">
                  <div>
                    <Link to={`/topic/${unit.slug}`}>{unit.title}</Link>
                    <p>{unit.summary}</p>
                  </div>
                  <span className={complete ? 'status-text status-text--complete' : attempted ? 'status-text status-text--progress' : 'status-text'}>
                    {complete ? 'Complete' : attempted ? 'In progress' : 'Unstarted'}
                  </span>
                </div>
                <div className="topic-line">{unit.topics.join(' · ')}</div>
                {missingPrereqs.length ? (
                  <div className="prereq-line">
                    <LockKeyhole aria-hidden="true" size={15} />
                    Review first: {missingPrereqs.map((id) => unitById.get(id)?.title).join(', ')}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
