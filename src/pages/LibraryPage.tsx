import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { SourceReferences } from '../components/SourceReferences'
import { getItemTitle, libraryItems, unitById } from '../data/course'

const normalizeMathSearch = (value: string) => value
  .replaceAll('ᵀ', '^T')
  .replaceAll('⊤', '^T')
  .replaceAll('≥', '>=')
  .replaceAll('≤', '<=')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/\\(?:mathsf|operatorname|text)/g, '')
  .replace(/[\\{}\s]/g, '')

const searchAliases: Record<string, string[]> = {
  transpose: ['^t'],
  transposed: ['^t'],
  bfs: ['basicfeasiblesolution'],
  sef: ['standardequalityform'],
  cs: ['complementaryslackness'],
  complementarity: ['complementaryslackness'],
  rhs: ['right-handside', 'righthandside'],
  kkt: ['karush-kuhn-tucker', 'karushkuhntucker'],
}

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [unit, setUnit] = useState('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const normalizedNeedle = normalizeMathSearch(query.trim())
    const normalizedNeedles = [normalizedNeedle, ...(searchAliases[normalizedNeedle] ?? [])]
    return libraryItems.filter((item) => {
      const itemUnit = unitById.get(item.unitId)
      const text = JSON.stringify(item).toLowerCase()
      const normalizedText = normalizeMathSearch(`${text} ${itemUnit?.title ?? ''}`)
      return (type === 'all' || item.resultType === type)
        && (unit === 'all' || item.unitId === unit)
        && (!needle || text.includes(needle) || itemUnit?.title.toLowerCase().includes(needle) || normalizedNeedles.some((candidate) => normalizedText.includes(candidate)))
    })
  }, [query, type, unit])

  return (
    <div className="page">
      <PageHeader title="Definition & theorem library" description="Search formal statements, plain-language explanations, procedures, mistakes, and source references." />
      <div className="library-controls">
        <label className="search-field"><Search aria-hidden="true" /><span className="sr-only">Search library</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search weak duality, basis, Slater…" /></label>
        <label><span>Type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All items</option><option value="definition">Definitions</option><option value="theorem">Theorems & results</option><option value="procedure">Procedures</option></select></label>
        <label><span>Unit</span><select value={unit} onChange={(event) => setUnit(event.target.value)}><option value="all">All units</option>{[...unitById.values()].map((row) => <option key={row.id} value={row.id}>{row.number}. {row.title}</option>)}</select></label>
      </div>
      <div className="result-count" aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'}</div>
      <div className="library-results">
        {results.map((item) => {
          const rowUnit = unitById.get(item.unitId)
          const summary = item.resultType === 'definition' ? item.plainLanguageExplanation : item.resultType === 'theorem' ? item.plainLanguageMeaning : item.recognitionSignals.join(' · ')
          return (
            <article key={item.id} className="library-row">
              <div className="item-type">{item.resultType}</div>
              <div>
                <h2>{getItemTitle(item)}</h2>
                <p>{summary}</p>
                {rowUnit ? <Link to={`/topic/${rowUnit.slug}`}>Unit {rowUnit.number} · {rowUnit.title}</Link> : null}
              </div>
              <SourceReferences references={item.sourceReferences.slice(0, 1)} compact />
            </article>
          )
        })}
        {!results.length ? <div className="empty-state"><h2>No matching result</h2><p>Try a concept, theorem name, common mistake, or source filename.</p></div> : null}
      </div>
    </div>
  )
}
