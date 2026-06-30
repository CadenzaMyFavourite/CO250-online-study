import { readFile } from 'node:fs/promises'
import katex from 'katex'

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))

const definitions = await readJson('../data/course-definitions.json')
const examples = await readJson('../data/course-examples.json')
const definitionPractice = await readJson('../data/definition-practice.json')
const math = await readJson('../data/course-math.json')
const content = await readJson('../data/course-content.json')
const notation = await readJson('../data/notation-guide.json')
const matrices = await readJson('../data/course-matrices.json')

const expressions = []
for (const definition of definitions.definitions) {
  if (definition.formalLatex) expressions.push([`definition ${definition.id}`, definition.formalLatex])
}
for (const example of examples.examples) {
  if (example.promptLatex) expressions.push([`example ${example.id}.promptLatex`, example.promptLatex])
  for (const [index, latex] of (example.stepsLatex ?? []).entries()) expressions.push([`example ${example.id}.stepsLatex[${index}]`, latex])
  if (example.finalAnswerLatex) expressions.push([`example ${example.id}.finalAnswerLatex`, example.finalAnswerLatex])
}
for (const question of definitionPractice.questions) {
  for (const field of ['promptLatex', 'fullSolutionLatex', 'finalAnswerLatex']) {
    if (question[field]) expressions.push([`definition practice ${question.id}.${field}`, question[field]])
  }
}
for (const [id, latex] of Object.entries(math.theorems)) expressions.push([`theorem ${id}`, latex])
for (const entry of notation.entries) expressions.push([`notation ${entry.id}`, entry.latex])
for (const entry of matrices.entries) expressions.push([`matrix view ${entry.exampleId}`, entry.latex])
for (const [id, fields] of Object.entries(math.questions)) {
  for (const [field, latex] of Object.entries(fields)) expressions.push([`question ${id}.${field}`, latex])
}

const errors = []
for (const [label, latex] of expressions) {
  if ([...latex].some((character) => character.charCodeAt(0) < 32)) {
    errors.push(`${label}: contains a control character; check JSON backslash escaping`)
    continue
  }
  try {
    katex.renderToString(latex, { throwOnError: true, displayMode: true, strict: 'error' })
  } catch (error) {
    errors.push(`${label}: ${error.message}`)
  }
}

const theoremIds = new Set(content.units.flatMap((unit) => unit.theorems.map((theorem) => theorem.id)))
const questionIds = new Set(content.questions.map((question) => question.id))
for (const id of Object.keys(math.theorems)) {
  if (!theoremIds.has(id)) errors.push(`math mapping references unknown theorem ${id}`)
}
for (const id of Object.keys(math.questions)) {
  if (!questionIds.has(id)) errors.push(`math mapping references unknown question ${id}`)
}
for (const id of theoremIds) {
  if (!math.theorems[id]) errors.push(`theorem ${id} has no TeX statement`)
}
for (const id of questionIds) {
  if (!math.questions[id]?.finalAnswerLatex) errors.push(`question ${id} has no TeX final answer`)
}

if (errors.length) {
  console.error('Math validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Math validation passed: ${expressions.length} KaTeX expressions`)
}
