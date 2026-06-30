import { useSyncExternalStore } from 'react'
import type { Attempt, MistakeType } from '../types/content'

const STORAGE_KEY = 'co250-field-guide-progress-v1'
const EXAM_KEY = 'co250-field-guide-exam-v1'

export type ProgressState = {
  version: 1
  attempts: Attempt[]
  completedTopics: string[]
  updatedAt: string | null
}

export type ExamSession = {
  id: string
  questionIds: string[]
  timeLimitMinutes: number
  startedAt: string
  endsAt: string
  answers: Record<string, string>
  pausedAt?: string
  submittedAt?: string
}

const emptyProgress: ProgressState = {
  version: 1,
  attempts: [],
  completedTopics: [],
  updatedAt: null,
}

let cachedRaw: string | null | undefined
let cachedProgress: ProgressState = emptyProgress
const listeners = new Set<() => void>()

function readProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyProgress
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedProgress
  cachedRaw = raw
  if (!raw) {
    cachedProgress = emptyProgress
    return cachedProgress
  }
  try {
    const parsed = JSON.parse(raw) as ProgressState
    cachedProgress = parsed.version === 1 ? parsed : emptyProgress
  } catch {
    cachedProgress = emptyProgress
  }
  return cachedProgress
}

function writeProgress(next: ProgressState) {
  const raw = JSON.stringify(next)
  window.localStorage.setItem(STORAGE_KEY, raw)
  cachedRaw = raw
  cachedProgress = next
  listeners.forEach((listener) => listener())
}

export function useProgress() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    readProgress,
    () => emptyProgress,
  )
}

export function recordAttempt(input: {
  questionId: string
  unitId: string
  correct: boolean
  hintsUsed: number
  confidence: number
  mistakeType?: MistakeType
  secondsSpent: number
}) {
  const current = readProgress()
  const attempt: Attempt = {
    ...input,
    id: `${input.questionId}-${Date.now()}`,
    completedAt: new Date().toISOString(),
  }
  writeProgress({
    ...current,
    attempts: [...current.attempts, attempt],
    updatedAt: attempt.completedAt,
  })
}

export function markTopicComplete(unitId: string) {
  const current = readProgress()
  if (current.completedTopics.includes(unitId)) return
  writeProgress({
    ...current,
    completedTopics: [...current.completedTopics, unitId],
    updatedAt: new Date().toISOString(),
  })
}

export function resetProgress() {
  writeProgress(emptyProgress)
  window.localStorage.removeItem(EXAM_KEY)
}

export function saveExam(session: ExamSession) {
  window.localStorage.setItem(EXAM_KEY, JSON.stringify(session))
}

export function readExam(): ExamSession | null {
  const raw = window.localStorage.getItem(EXAM_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Omit<ExamSession, 'answers' | 'endsAt'> & { answers?: Record<string, string>; endsAt?: string }
    const startedAt = Date.parse(parsed.startedAt)
    const fallbackEndsAt = new Date(startedAt + parsed.timeLimitMinutes * 60_000).toISOString()
    return { ...parsed, answers: parsed.answers ?? {}, endsAt: parsed.endsAt ?? fallbackEndsAt }
  } catch {
    return null
  }
}

export function clearExam() {
  window.localStorage.removeItem(EXAM_KEY)
}

export function getExamRemainingSeconds(session: ExamSession, now = Date.now()) {
  const reference = session.pausedAt ? Date.parse(session.pausedAt) : now
  return Math.max(0, Math.ceil((Date.parse(session.endsAt) - reference) / 1000))
}

export function pauseExamTimer(session: ExamSession, pausedAt = new Date().toISOString()): ExamSession {
  return session.pausedAt ? session : { ...session, pausedAt }
}

export function resumeExamTimer(session: ExamSession, resumedAt = new Date().toISOString()): ExamSession {
  if (!session.pausedAt) return session
  const pausedMilliseconds = Math.max(0, Date.parse(resumedAt) - Date.parse(session.pausedAt))
  const { pausedAt: _pausedAt, ...rest } = session
  return { ...rest, endsAt: new Date(Date.parse(session.endsAt) + pausedMilliseconds).toISOString() }
}

export function extendExamTimer(session: ExamSession, minutes: number, now = Date.now()): ExamSession {
  if (!Number.isFinite(minutes) || minutes <= 0) throw new RangeError('extension minutes must be positive')
  const extensionBase = Math.max(Date.parse(session.endsAt), session.pausedAt ? Date.parse(session.pausedAt) : now)
  return { ...session, endsAt: new Date(extensionBase + minutes * 60_000).toISOString() }
}

export const mistakeLabels: Record<MistakeType, string> = {
  definition: 'Did not know the definition',
  recognition: 'Did not recognize the question type',
  'wrong-theorem': 'Chose the wrong theorem',
  'missed-assumption': 'Missed an assumption',
  algebra: 'Algebra or arithmetic error',
  algorithm: 'Algorithm execution error',
  'proof-gap': 'Proof gap',
  misread: 'Misread the question',
  time: 'Time-management problem',
  other: 'Other',
}

export type UnitStats = {
  attempts: number
  correct: number
  accuracy: number
  hintRate: number
  averageConfidence: number
  repeatedMistakes: number
  weakness: number
}

export function getUnitStats(attempts: Attempt[], unitId: string): UnitStats {
  const rows = attempts.filter((attempt) => attempt.unitId === unitId)
  if (!rows.length) {
    return { attempts: 0, correct: 0, accuracy: 0, hintRate: 0, averageConfidence: 0, repeatedMistakes: 0, weakness: 0 }
  }
  const correct = rows.filter((row) => row.correct).length
  const accuracy = correct / rows.length
  const hintRate = rows.filter((row) => row.hintsUsed > 0).length / rows.length
  const averageConfidence = rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length
  const mistakeCounts = new Map<string, number>()
  rows.forEach((row) => {
    if (row.mistakeType) mistakeCounts.set(row.mistakeType, (mistakeCounts.get(row.mistakeType) ?? 0) + 1)
  })
  const repeatedMistakes = [...mistakeCounts.values()].filter((count) => count > 1).length
  const ageDays = Math.max(0, (Date.now() - Date.parse(rows.at(-1)?.completedAt ?? new Date().toISOString())) / 86_400_000)
  const recency = Math.min(ageDays / 30, 1)
  const weakness = Math.round(
    (1 - accuracy) * 40 +
      hintRate * 20 +
      Math.min(repeatedMistakes / 2, 1) * 15 +
      recency * 10 +
      (1 - averageConfidence / 5) * 15,
  )
  return { attempts: rows.length, correct, accuracy, hintRate, averageConfidence, repeatedMistakes, weakness }
}
