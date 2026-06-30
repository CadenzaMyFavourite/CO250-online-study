import { BookOpen, ExternalLink } from 'lucide-react'
import type { SourceReference } from '../types/content'

export function SourceReferences({ references, compact = false }: { references: SourceReference[]; compact?: boolean }) {
  return (
    <div className={compact ? 'source-list source-list--compact' : 'source-list'}>
      {references.map((reference, index) => (
        <div className="source-reference" key={`${reference.sourceId}-${reference.page ?? reference.section ?? index}`}>
          <BookOpen aria-hidden="true" size={17} strokeWidth={1.75} />
          <div>
            <strong>{reference.fileName}</strong>
            <span>
              {reference.chapter ? `Chapter ${reference.chapter}` : ''}
              {reference.section ? `${reference.chapter ? ' · ' : ''}§${reference.section}` : ''}
              {reference.sections ? `§§${reference.sections}` : ''}
              {reference.page ? ` · p. ${reference.page}` : ''}
              {reference.pages ? ` · pp. ${reference.pages}` : ''}
              {' · '}
              {reference.confidence} confidence
            </span>
          </div>
          {!compact ? <ExternalLink aria-hidden="true" size={15} strokeWidth={1.75} /> : null}
        </div>
      ))}
    </div>
  )
}
