import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/features/overview/page.js', import.meta.url), 'utf8')

// 01C: The activity stream should contain typed event items with task/decision/QA labels
const requiredEventTypes = [
  'event-type-decision',
  'event-type-task',
  'event-type-qa',
]

for (const cls of requiredEventTypes) {
  assert.ok(source.includes(cls), `overview page should include event class "${cls}"`)
}

// Events should mention specific Task/Step/DecisionPacket context
const requiredContext = [
  'DecisionPacket',
  'Task ',
  'QA',
  '阻塞',
  '待决策',
]

for (const text of requiredContext) {
  assert.ok(source.includes(text), `overview event stream should mention "${text}"`)
}
