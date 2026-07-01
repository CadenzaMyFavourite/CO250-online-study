import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { course, unitById } from '../data/course'
import { PageHeader } from '../components/PageHeader'

export function CourseMapPage() {
  return (
    <div className="page page--wide">
      <PageHeader title="Course map" description="Eleven source-backed units, ordered by the supplied course material." meta="Everything is open. Prerequisites are study guidance, not gates." />
      <ol className="unit-map">{course.units.map((unit) => <li key={unit.id} className="unit-map-row"><div className="unit-map-number">{String(unit.number).padStart(2, '0')}</div><div className="unit-map-body"><div className="unit-map-heading"><div><Link to={`/topic/${unit.slug}`}>{unit.title}</Link><p>{unit.summary}</p></div><span className="status-text">Open unit</span></div><div className="topic-line">{unit.topics.join(' · ')}</div>{unit.prerequisites.length ? <div className="prereq-line"><LockKeyhole aria-hidden="true" size={15} />Helpful first: {unit.prerequisites.map((id) => unitById.get(id)?.title).join(', ')}</div> : null}</div></li>)}</ol>
    </div>
  )
}
