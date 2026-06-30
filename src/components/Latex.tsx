import katex from 'katex'
import 'katex/dist/katex.min.css'

export function Latex({ children, display = false }: { children: string; display?: boolean }) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: display,
    strict: false,
  })
  return <span className={display ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />
}
