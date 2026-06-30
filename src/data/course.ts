import rawBeginnerGuides from '../../data/beginner-guides.json'
import rawContent from '../../data/course-content.json'
import rawDefinitions from '../../data/course-definitions.json'
import rawDefinitionPractice from '../../data/definition-practice.json'
import rawExamples from '../../data/course-examples.json'
import rawMath from '../../data/course-math.json'
import rawMatrices from '../../data/course-matrices.json'
import rawMap from '../../data/course-map.json'
import type { CourseContent, Definition, PracticeQuestion, Procedure, SourceReference, Theorem, WorkedExample } from '../types/content'

type TextbookDefinition = {
  id: string
  unitId: string
  title: string
  formalStatement: string
  formalLatex?: string
  plainLanguageExplanation: string
  textbookSection: string
  textbookPage: number
}

type TextbookExample = {
  id: string
  unitId: string
  title: string
  prompt: string
  promptLatex?: string
  steps: string[]
  stepsLatex?: string[]
  finalAnswer: string
  finalAnswerLatex?: string
  textbookSection: string
  textbookPage: number
}

type DefinitionPracticeItem = {
  id: string
  unitId: string
  type: string
  difficulty: number
  estimatedMinutes: number
  prompt: string
  promptLatex?: string
  hints: string[]
  fullSolution: string
  fullSolutionLatex?: string
  finalAnswer: string
  finalAnswerLatex?: string
  learningObjective: string
  textbookSection: string
  textbookPage: number
}

const baseCourse = rawContent as unknown as CourseContent
const definitionFile = rawDefinitions as unknown as {
  metadata: { definitionCount: number }
  definitions: TextbookDefinition[]
}
const exampleFile = rawExamples as unknown as {
  metadata: { exampleCount: number }
  examples: TextbookExample[]
}
const definitionPracticeFile = rawDefinitionPractice as unknown as {
  metadata: { questionCount: number }
  questions: DefinitionPracticeItem[]
}
const beginnerGuideFile = rawBeginnerGuides as unknown as {
  metadata: { guideCount: number }
  guides: { unitId: string; bigIdea: string; everydayAnalogy: string; firstCheck: string }[]
}
const mathFile = rawMath as unknown as {
  theorems: Record<string, string>
  questions: Record<string, {
    promptLatex?: string
    fullSolutionLatex?: string
    finalAnswerLatex?: string
  }>
}
const matrixFile = rawMatrices as unknown as {
  metadata: { entryCount: number }
  entries: { exampleId: string; dimensions: string; latex: string; plainLanguage: string }[]
}
const matrixByExample = new Map(matrixFile.entries.map((entry) => [entry.exampleId, {
  dimensions: entry.dimensions,
  latex: entry.latex,
  plainLanguage: entry.plainLanguage,
}]))

const textbookFileName = 'A Gentle Introduction to Optimization'
const beginnerGuideByUnit = new Map(beginnerGuideFile.guides.map((guide) => [guide.unitId, {
  bigIdea: guide.bigIdea,
  everydayAnalogy: guide.everydayAnalogy,
  firstCheck: guide.firstCheck,
}]))

const toDefinition = (item: TextbookDefinition): Definition => {
  const reference: SourceReference = {
    sourceId: 'src-textbook',
    fileName: textbookFileName,
    chapter: item.textbookSection.split('.')[0],
    section: item.textbookSection,
    page: item.textbookPage,
    confidence: 'high',
  }

  return {
    id: item.id,
    title: item.title,
    formalStatement: item.formalStatement,
    formalLatex: item.formalLatex,
    plainLanguageExplanation: item.plainLanguageExplanation,
    notation: [],
    prerequisites: [],
    examples: [],
    nonExamples: [],
    commonMistakes: [],
    sourceReferences: [reference],
    reviewStatus: 'textbook-checked',
  }
}

const definitionsByUnit = new Map<string, Definition[]>()
for (const item of [...definitionFile.definitions].sort((left, right) =>
  left.unitId.localeCompare(right.unitId)
  || left.textbookPage - right.textbookPage
  || left.title.localeCompare(right.title))) {
  const definitions = definitionsByUnit.get(item.unitId) ?? []
  definitions.push(toDefinition(item))
  definitionsByUnit.set(item.unitId, definitions)
}

const examplesByUnit = new Map<string, WorkedExample[]>()
for (const item of exampleFile.examples) {
  const examples = examplesByUnit.get(item.unitId) ?? []
  examples.push({
    id: item.id,
    title: item.title,
    prompt: item.prompt,
    promptLatex: item.promptLatex,
    steps: item.steps,
    stepsLatex: item.stepsLatex,
    finalAnswer: item.finalAnswer,
    finalAnswerLatex: item.finalAnswerLatex,
    matrixView: matrixByExample.get(item.id),
    sourceReferences: [{
      sourceId: 'src-textbook',
      fileName: textbookFileName,
      chapter: item.textbookSection.split('.')[0],
      section: item.textbookSection,
      page: item.textbookPage,
      confidence: 'high',
    }],
  })
  examplesByUnit.set(item.unitId, examples)
}

const definitionPracticeQuestions: PracticeQuestion[] = definitionPracticeFile.questions.map((item) => ({
  id: item.id,
  unitId: item.unitId,
  topicIds: [],
  type: item.type,
  difficulty: item.difficulty,
  estimatedMinutes: item.estimatedMinutes,
  prompt: item.prompt,
  promptLatex: item.promptLatex,
  prerequisites: [],
  learningObjectives: [item.learningObjective],
  hints: item.hints,
  solutionOutline: [item.fullSolution],
  fullSolution: item.fullSolution,
  fullSolutionLatex: item.fullSolutionLatex,
  finalAnswer: item.finalAnswer,
  finalAnswerLatex: item.finalAnswerLatex,
  rubric: [{ item: 'Correct conclusion with definition-based justification', points: 1 }],
  commonWrongAnswers: [],
  sourceReferences: [{
    sourceId: 'src-textbook',
    fileName: textbookFileName,
    chapter: item.textbookSection.split('.')[0],
    section: item.textbookSection,
    page: item.textbookPage,
    confidence: 'high',
  }],
  origin: 'adapted',
  validationMethod: 'checked against the cited textbook definition and direct algebra',
  validationStatus: 'source-verified',
}))

export const course: CourseContent = {
  ...baseCourse,
  metadata: {
    ...baseCourse.metadata,
    definitionCount: definitionFile.metadata.definitionCount,
    reviewNote: 'Definitions and formal mathematics are textbook-first. Review sheets determine unit order and emphasis; generated practice remains labelled as generated.',
  },
  units: baseCourse.units.map((unit) => {
    const importedExamples = examplesByUnit.get(unit.id) ?? []
    const baseExamples = unit.workedExample ? [{
      ...unit.workedExample,
      matrixView: matrixByExample.get(unit.workedExample.id),
    }] : []
    const workedExamples = [...baseExamples, ...importedExamples]
    return {
      ...unit,
      definitions: definitionsByUnit.get(unit.id) ?? [],
      theorems: unit.theorems.map((theorem) => ({
        ...theorem,
        formalLatex: mathFile.theorems[theorem.id],
      })),
      workedExample: workedExamples[0] ?? null,
      workedExamples,
      beginnerGuide: beginnerGuideByUnit.get(unit.id),
    }
  }),
  questions: [
    ...baseCourse.questions.map((question) => ({
      ...question,
      ...mathFile.questions[question.id],
    })),
    ...definitionPracticeQuestions,
  ],
}
export const courseMap = rawMap

export const unitById = new Map(course.units.map((unit) => [unit.id, unit]))
export const unitBySlug = new Map(course.units.map((unit) => [unit.slug, unit]))
export const questionById = new Map(course.questions.map((question) => [question.id, question]))

export type LibraryItem =
  | ({ resultType: 'definition'; unitId: string } & Definition)
  | ({ resultType: 'theorem'; unitId: string } & Theorem)
  | ({ resultType: 'procedure'; unitId: string } & Procedure)

export const libraryItems: LibraryItem[] = course.units.flatMap((unit) => [
  ...unit.definitions.map((item) => ({ ...item, resultType: 'definition' as const, unitId: unit.id })),
  ...unit.theorems.map((item) => ({ ...item, resultType: 'theorem' as const, unitId: unit.id })),
  ...unit.procedures.map((item) => ({ ...item, resultType: 'procedure' as const, unitId: unit.id })),
])

export const getItemTitle = (item: LibraryItem) =>
  item.resultType === 'definition' ? item.title : item.name
