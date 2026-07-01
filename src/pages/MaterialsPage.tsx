import { ExternalLink, FileText, Mail } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import sourceIndex from '../../data/source-index.json'

const linkedInUrl = 'https://www.linkedin.com/in/jackie-zou-652084382/'
const issuesUrl = 'https://github.com/CadenzaMyFavourite/CO250-online-study/issues'

export function MaterialsPage() {
  return (
    <div className="page page--wide materials-page">
      <PageHeader title="Course PDF materials" description={`${sourceIndex.fileCount} open course sources: the textbook, review sheets, lecture material, and practice exams behind this study guide.`} />
      <div className="materials-summary"><strong>{sourceIndex.uniqueContentCount} unique files</strong><span>One duplicate is retained so the public collection matches the supplied material folder.</span></div>
      <div className="materials-grid">
        {sourceIndex.sources.map((source) => (
          <article className="material-card" key={source.fileName}>
            <FileText aria-hidden="true" />
            <div><span className="item-type">{source.kind}</span><h2>{source.fileName}</h2><p>{source.pages} pages · {(source.bytes / 1_000_000).toFixed(1)} MB</p></div>
            <a href={`/materials/${encodeURIComponent(source.fileName)}`} target="_blank" rel="noreferrer" aria-label={`Open ${source.fileName}`}><ExternalLink aria-hidden="true" /></a>
          </article>
        ))}
      </div>
      <section className="materials-contact">
        <Mail aria-hidden="true" /><div><h2>Found a problem?</h2><p>Contact Jackie Zou about a broken file, correction, or suggestion.</p><div className="contact-links"><a href="mailto:zjiaqi1214@gmail.com">zjiaqi1214@gmail.com</a><a href={linkedInUrl} target="_blank" rel="noreferrer">LinkedIn</a><a href={issuesUrl} target="_blank" rel="noreferrer">GitHub Issues</a></div></div>
      </section>
    </div>
  )
}
