import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'
import { ExamPage } from '../pages/ExamPage'
import { LibraryPage } from '../pages/LibraryPage'
import { PracticePage } from '../pages/PracticePage'
import { StartDiagnosticPage } from '../pages/StartDiagnosticPage'
import { NotationPage } from '../pages/NotationPage'
import { getSeoMetadata } from '../components/Seo'
import { course, libraryItems } from '../data/course'
import { extendExamTimer, getExamRemainingSeconds, pauseExamTimer, resumeExamTimer, type ExamSession } from '../lib/progress'

afterEach(cleanup)

describe('CO 250 Field Guide', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('renders a real empty dashboard before practice data exists', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /build the model/i })).toBeInTheDocument()
    expect(screen.getByText('No practice recorded yet')).toBeInTheDocument()
    expect(screen.getByText('89 textbook definitions · 40 practice questions')).toBeInTheDocument()
    expect(screen.queryByText(/% accuracy/i)).not.toBeInTheDocument()
  })

  it('searches formal content in the library', async () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>)
    const search = screen.getByPlaceholderText(/search weak duality/i)
    fireEvent.change(search, { target: { value: 'Slater' } })
    expect(await screen.findByText('KKT theorem (course convex form)')).toBeInTheDocument()
  })

  it('normalizes common math notation in library search', async () => {
    render(<MemoryRouter><LibraryPage /></MemoryRouter>)
    const search = screen.getByPlaceholderText(/search weak duality/i)
    fireEvent.change(search, { target: { value: 'A^T' } })
    expect(await screen.findByText('Dual linear program')).toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'Aᵀ' } })
    expect(await screen.findByText('Dual linear program')).toBeInTheDocument()
    expect(screen.queryByText('106 results')).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'transpose' } })
    expect(await screen.findByText('Dual linear program')).toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'BFS' } })
    expect(await screen.findByText('Basic feasible solution')).toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'SEF' } })
    expect(await screen.findByText('Standard equality form')).toBeInTheDocument()
  })

  it('reveals hints progressively in practice', () => {
    render(<MemoryRouter initialEntries={['/practice?unit=unit-01']}><PracticePage /></MemoryRouter>)
    expect(screen.queryByText('What quantities can the bakery choose?')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal hint 1/i }))
    expect(screen.getByText('What quantities can the bakery choose?')).toBeInTheDocument()
  })

  it('opens a beginner practice preset with only easy questions', () => {
    render(<MemoryRouter initialEntries={['/practice?difficulty=beginner']}><PracticePage /></MemoryRouter>)
    expect(screen.getByText('Beginner practice')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Difficulty' })).toHaveValue('beginner')
    expect(screen.getByText(/Difficulty [12]\/5/)).toBeInTheDocument()
  })

  it('recommends the first missing prerequisite in the start diagnostic', () => {
    render(<MemoryRouter><StartDiagnosticPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Unit 1 · LP formulation' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'I can turn a word problem into variables, an objective, and constraints.' }))
    expect(screen.getByRole('heading', { name: 'Unit 4 · Standard equality form' })).toBeInTheDocument()
  })

  it('translates common notation into beginner language', () => {
    render(<MemoryRouter><NotationPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Read the symbols' })).toBeInTheDocument()
    expect(screen.getByText('c transpose x')).toBeInTheDocument()
    expect(screen.getByText(/returns the point or points that achieve the smallest value/i)).toBeInTheDocument()
  })

  it('persists exam draft answers across a reload', () => {
    render(<MemoryRouter><ExamPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Build exam' }))
    const firstAnswer = screen.getByRole('textbox', { name: 'Answer for question 1' })
    fireEvent.change(firstAnswer, { target: { value: 'My local draft' } })
    cleanup()

    render(<MemoryRouter><ExamPage /></MemoryRouter>)
    expect(screen.getByRole('textbox', { name: 'Answer for question 1' })).toHaveValue('My local draft')
  })

  it('pauses, resumes, and extends the persisted exam clock', () => {
    const session: ExamSession = {
      id: 'timer-test',
      questionIds: [],
      timeLimitMinutes: 1,
      startedAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-01T00:01:00.000Z',
      answers: {},
    }
    expect(getExamRemainingSeconds(session, Date.parse('2026-01-01T00:00:15.000Z'))).toBe(45)
    const paused = pauseExamTimer(session, '2026-01-01T00:00:15.000Z')
    expect(getExamRemainingSeconds(paused, Date.parse('2026-01-01T00:00:45.000Z'))).toBe(45)
    const resumed = resumeExamTimer(paused, '2026-01-01T00:00:45.000Z')
    expect(getExamRemainingSeconds(resumed, Date.parse('2026-01-01T00:00:45.000Z'))).toBe(45)
    expect(getExamRemainingSeconds(extendExamTimer(resumed, 15, Date.parse('2026-01-01T00:00:45.000Z')), Date.parse('2026-01-01T00:00:45.000Z'))).toBe(945)
    const expired = { ...session, endsAt: '2025-12-31T23:59:00.000Z' }
    expect(getExamRemainingSeconds(extendExamTimer(expired, 15, Date.parse('2026-01-01T00:00:00.000Z')), Date.parse('2026-01-01T00:00:00.000Z'))).toBe(900)
  })

  it('loads the textbook-first definition and worked-example coverage', () => {
    expect(course.metadata.definitionCount).toBe(89)
    expect(libraryItems.filter((item) => item.resultType === 'definition')).toHaveLength(89)
    expect(course.units.every((unit) => unit.definitions.length > 0)).toBe(true)
    expect(course.units.every((unit) => unit.workedExample !== null)).toBe(true)
    expect(course.units.every((unit) => Boolean(unit.beginnerGuide?.bigIdea && unit.beginnerGuide.everydayAnalogy && unit.beginnerGuide.firstCheck))).toBe(true)
    expect(course.units.every((unit) => (unit.workedExamples?.length ?? 0) >= 2)).toBe(true)
    expect(course.units.flatMap((unit) => unit.workedExamples ?? []).every((example) => Boolean(example.matrixView?.latex && example.matrixView.plainLanguage))).toBe(true)
    expect(course.questions).toHaveLength(40)
    expect(course.units.every((unit) => course.questions.filter((question) => question.unitId === unit.id).length >= 3)).toBe(true)
    expect(course.units.every((unit) => course.questions.filter((question) => question.unitId === unit.id && question.difficulty <= 2).length >= 2)).toBe(true)
  })

  it('attaches TeX to every formal result and practice answer', () => {
    expect(course.units.flatMap((unit) => unit.theorems).every((theorem) => Boolean(theorem.formalLatex))).toBe(true)
    expect(course.questions.every((question) => Boolean(question.finalAnswerLatex))).toBe(true)
  })

  it('publishes descriptive SEO metadata for searchable course pages', () => {
    expect(getSeoMetadata('/').title).toContain('CO250 Study Guide')
    expect(getSeoMetadata('/notation').description).toContain('matrix notation')
    expect(getSeoMetadata('/topic/two-phase-simplex')).toMatchObject({
      canonicalPath: '/topic/two-phase-simplex',
      index: true,
      kind: 'article',
    })
    expect(getSeoMetadata('/progress').index).toBe(false)
  })

  it('adds textbook-style matrix data to the two-phase examples', () => {
    const phaseUnit = course.units.find((unit) => unit.slug === 'two-phase-simplex')
    expect(phaseUnit?.workedExamples).toHaveLength(2)
    expect(phaseUnit?.workedExamples?.[0].matrixView?.latex).toContain('[A\\ I]')
    expect(phaseUnit?.workedExamples?.[1].matrixView?.plainLanguage).toMatch(/auxiliary identity block/i)
  })
})
