import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { unitBySlug } from '../data/course'

const siteUrl = 'https://co250-online-study.vercel.app'
const siteName = 'CO250 Study Guide'
const defaultDescription = 'A free CO250 study guide for linear programming, simplex, duality, integer programming, and convex optimization, with definitions, worked examples, and practice.'

type SeoMetadata = {
  title: string
  description: string
  canonicalPath: string
  index: boolean
  kind: 'website' | 'article'
}

const pageMetadata: Record<string, Omit<SeoMetadata, 'canonicalPath'>> = {
  '/': {
    title: 'CO250 Study Guide | Optimization Notes, Examples & Practice',
    description: defaultDescription,
    index: true,
    kind: 'website',
  },
  '/course-map': {
    title: 'CO250 Course Map | Complete Optimization Study Guide',
    description: 'Follow a complete CO250 learning path from LP formulation through simplex, duality, integer programming, and convex optimization.',
    index: true,
    kind: 'website',
  },
  '/library': {
    title: 'CO250 Definitions and Theorems | Searchable Study Library',
    description: 'Search textbook-grounded CO250 definitions, theorems, certificates, simplex terminology, duality results, and optimization procedures.',
    index: true,
    kind: 'website',
  },
  '/notation': {
    title: 'CO250 Math Notation Guide | Matrices, LP and Optimization Symbols',
    description: 'Learn how to read CO250 matrix notation, LP symbols, basis matrices, inequalities, gradients, cones, and optimization expressions in plain language.',
    index: true,
    kind: 'article',
  },
  '/procedures': {
    title: 'CO250 Problem-Solving Procedures | Simplex, Duality and KKT',
    description: 'Step-by-step CO250 procedures for LP formulation, simplex pivots, two-phase simplex, duality, complementary slackness, cutting planes, and KKT.',
    index: true,
    kind: 'article',
  },
  '/practice': {
    title: 'CO250 Practice Problems | Linear and Convex Optimization',
    description: 'Practice CO250 optimization with guided problems on LP formulation, certificates, simplex, duality, integer programming, and convex optimization.',
    index: true,
    kind: 'website',
  },
  '/start': {
    title: 'Where to Start Studying CO250 | Optimization Diagnostic',
    description: 'Use a short CO250 prerequisite check to find the right starting unit in the optimization study guide.',
    index: true,
    kind: 'website',
  },
  '/exam': {
    title: 'CO250 Question Set Builder | Practice with Answers',
    description: 'Build a CO250 practice question set by topic, then reveal detailed answers and textbook-grounded solutions without an account.',
    index: true,
    kind: 'website',
  },
  '/materials': {
    title: 'CO250 Course PDFs | Textbook, Reviews and Practice Exams',
    description: 'Browse the open CO250 textbook, course review sheets, practice exams, and source PDFs used by this study guide.',
    index: true,
    kind: 'website',
  },
}

export function getSeoMetadata(pathname: string): SeoMetadata {
  const topicMatch = pathname.match(/^\/topic\/([^/]+)$/)
  if (topicMatch) {
    const unit = unitBySlug.get(topicMatch[1])
    if (unit) {
      return {
        title: `${unit.title} | CO250 Study Guide`,
        description: `${unit.summary} Learn the definitions, matrix form, worked examples, common mistakes, and practice for this CO250 topic.`,
        canonicalPath: `/topic/${unit.slug}`,
        index: true,
        kind: 'article',
      }
    }
  }

  const metadata = pageMetadata[pathname] ?? pageMetadata['/']
  return { ...metadata, canonicalPath: pathname in pageMetadata ? pathname : '/' }
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = getSeoMetadata(pathname)
    const canonicalUrl = `${siteUrl}${metadata.canonicalPath}`
    document.title = metadata.title

    setMeta('meta[name="description"]', 'name', 'description', metadata.description)
    setMeta('meta[name="robots"]', 'name', 'robots', metadata.index ? 'index, follow' : 'noindex, follow')
    setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', metadata.kind)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    let structuredData = document.head.querySelector<HTMLScriptElement>('#seo-structured-data')
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.id = 'seo-structured-data'
      structuredData.type = 'application/ld+json'
      document.head.appendChild(structuredData)
    }
    structuredData.text = JSON.stringify(metadata.kind === 'article' ? {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: metadata.title,
      description: metadata.description,
      url: canonicalUrl,
      educationalLevel: 'University',
      learningResourceType: 'Study guide',
      about: ['CO250', 'Operations research', 'Mathematical optimization'],
      isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
    } : {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      alternateName: ['CO250 Field Guide', 'CO250 Online Study'],
      description: defaultDescription,
      url: siteUrl,
    })
  }, [pathname])

  return null
}
