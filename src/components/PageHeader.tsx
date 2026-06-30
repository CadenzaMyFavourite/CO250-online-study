import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  meta,
  actions,
}: {
  title: string
  description?: string
  meta?: string
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {meta ? <div className="page-meta">{meta}</div> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  )
}

