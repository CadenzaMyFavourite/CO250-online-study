import notationData from '../../data/notation-guide.json'
import { Latex } from '../components/Latex'
import { PageHeader } from '../components/PageHeader'

type NotationEntry = { id: string; category: string; title: string; latex: string; readAloud: string; meaning: string }
const entries = notationData.entries as NotationEntry[]
const categories = [...new Set(entries.map((entry) => entry.category))]

export function NotationPage() {
  return (
    <div className="page">
      <PageHeader title="Read the symbols" description="A beginner’s translation guide for the notation used in definitions, examples, and proofs." />
      <div className="notation-intro"><strong>Reading rule</strong><p>Say the expression aloud first, then translate it into a sentence. Vector inequalities such as x≥0 and Ax≤b are componentwise unless the course says otherwise.</p></div>
      {categories.map((category) => (
        <section className="notation-section" key={category}>
          <h2>{category}</h2>
          <div className="notation-grid">
            {entries.filter((entry) => entry.category === category).map((entry) => (
              <article key={entry.id}>
                <h3>{entry.title}</h3>
                <Latex display>{entry.latex}</Latex>
                <div><strong>Say it aloud</strong><p>{entry.readAloud}</p></div>
                <div><strong>What it means</strong><p>{entry.meaning}</p></div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
