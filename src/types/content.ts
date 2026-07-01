export type Confidence = 'high' | 'medium' | 'low'

export type SourceReference = {
  sourceId: string
  fileName: string
  chapter?: string
  section?: string
  sections?: string
  page?: number
  pages?: number
  label?: string
  confidence: Confidence
}

export type Definition = {
  id: string
  title: string
  formalStatement: string
  formalLatex?: string
  plainLanguageExplanation: string
  notation: string[]
  prerequisites: string[]
  examples: string[]
  nonExamples: string[]
  commonMistakes: string[]
  sourceReferences: SourceReference[]
  reviewStatus: string
}

export type Theorem = {
  id: string
  name: string
  category: string
  formalStatement: string
  formalLatex?: string
  assumptions: string[]
  conclusion: string
  plainLanguageMeaning: string
  whyItMatters: string
  whenToUse: string[]
  whenNotToUse: string[]
  prerequisites: string[]
  proofIdea?: string
  examples: string[]
  commonMisuses: string[]
  relatedResults: string[]
  sourceReferences: SourceReference[]
  reviewStatus: string
}

export type ProcedureStep = { title: string; detail: string }

export type Procedure = {
  id: string
  name: string
  problemTypes: string[]
  recognitionSignals: string[]
  requiredInputs: string[]
  prerequisites: string[]
  steps: ProcedureStep[]
  checkpoints: string[]
  failureCases: string[]
  commonMistakes: string[]
  alternativeMethods: string[]
  workedExamples: string[]
  sourceReferences: SourceReference[]
}

export type WorkedExample = {
  id: string
  title: string
  prompt: string
  promptLatex?: string
  steps: string[]
  stepsLatex?: string[]
  finalAnswer?: string
  finalAnswerLatex?: string
  matrixView?: {
    dimensions: string
    latex: string
    plainLanguage: string
  }
  sourceReferences: SourceReference[]
}

export type BeginnerGuide = {
  bigIdea: string
  everydayAnalogy: string
  firstCheck: string
}

export type Unit = {
  id: string
  number: number
  title: string
  slug: string
  summary: string
  whyItMatters: string
  prerequisites: string[]
  status: string
  recognitionSignals: string[]
  topics: string[]
  definitions: Definition[]
  theorems: Theorem[]
  procedures: Procedure[]
  workedExample: WorkedExample | null
  workedExamples?: WorkedExample[]
  beginnerGuide?: BeginnerGuide
  commonMistakes: string[]
  sourceReferences: SourceReference[]
}

export type PracticeQuestion = {
  id: string
  unitId: string
  topicIds: string[]
  type: string
  difficulty: number
  estimatedMinutes: number
  prompt: string
  promptLatex?: string
  prerequisites: string[]
  learningObjectives: string[]
  hints: string[]
  hintsLatex?: string[]
  solutionOutline: string[]
  fullSolution: string
  fullSolutionLatex?: string
  finalAnswer: string
  finalAnswerLatex?: string
  rubric: { item: string; points: number }[]
  commonWrongAnswers: { answer: string; explanation: string }[]
  sourceReferences: SourceReference[]
  origin: 'source' | 'adapted' | 'generated'
  validationMethod: string
  validationStatus: string
}

export type Source = {
  id: string
  fileName: string
  pages: number
  kind: string
  extractionQuality: string
  status: string
}

export type CourseContent = {
  metadata: {
    course: string
    termContext: string
    sourceFileCount: number
    uniqueSourceCount: number
    contentVersion: number
    reviewNote: string
    definitionCount?: number
  }
  sources: Source[]
  units: Unit[]
  questions: PracticeQuestion[]
}
