import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/features/overview/page.js', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles/prototype.css', import.meta.url), 'utf8')

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

assert.ok(source.includes('activity-card'), 'team activity should use card-style event items')
assert.ok(source.includes('重点动态 Top 5'), 'team activity should expose a Top 5 capsule')
assert.ok(source.includes('OVERVIEW_WORK_ITEMS'), 'overview should use shared work item mock data')
assert.ok(source.includes('openOverviewWorkItemDrawer'), 'overview should provide a matching work item drawer')
assert.ok(source.includes('overview-workitem-drawer'), 'drawer should use the target work item drawer layout')
assert.ok(source.includes('installTeamDecisionDrawerHandler'), 'team card decisions should open the same work item drawer')
assert.ok(source.includes('openDrawerForTeamCard'), 'team card drawer handler should derive data from the clicked card')
assert.ok(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), 'team overview should use a two-column grid')
assert.ok(css.includes('.activity-card.decision-card'), 'decision event card style should be defined')
