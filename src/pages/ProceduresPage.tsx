import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { SourceReferences } from '../components/SourceReferences'
import { course, unitById } from '../data/course'

export function ProceduresPage() {
  const procedures = useMemo(() => course.units.flatMap((unit) => unit.procedures.map((procedure) => ({ ...procedure, unitId: unit.id }))), [])
  const [openId, setOpenId] = useState(procedures[0]?.id ?? '')

  return (
    <div className="page">
      <PageHeader title="What should I do?" description="Recognition-first guides for the major problem types in the supplied course material." />
      <div className="procedure-index">
        {procedures.map((procedure) => {
          const open = openId === procedure.id
          const unit = unitById.get(procedure.unitId)
          return (
            <article className={open ? 'procedure-row procedure-row--open' : 'procedure-row'} key={procedure.id}>
              <button onClick={() => setOpenId(open ? '' : procedure.id)} aria-expanded={open}>
                <span><small>Unit {unit?.number} · {procedure.problemTypes[0]}</small><strong>{procedure.name}</strong></span>
                {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
              </button>
              {open ? (
                <div className="procedure-body">
                  <section><h3>Recognition signals</h3><ul>{procedure.recognitionSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul></section>
                  <section><h3>General procedure</h3><ol>{procedure.steps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.detail}</span></li>)}</ol></section>
                  <div className="procedure-columns">
                    <section><h3>Checkpoints</h3><ul>{procedure.checkpoints.map((item) => <li key={item}>{item}</li>)}</ul></section>
                    <section><h3>Common mistakes</h3><ul>{procedure.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></section>
                  </div>
                  <SourceReferences references={procedure.sourceReferences} compact />
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}
