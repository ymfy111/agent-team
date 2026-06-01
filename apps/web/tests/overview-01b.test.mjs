import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/features/overview/page.js', import.meta.url), 'utf8')

const requiredCopy = [
  '工作项详情抽屉',
  'TaskBatch 批次',
  'Task / Step 清单',
  '执行与验收',
  '停止策略',
  '等待决策暂停',
]

for (const text of requiredCopy) {
  assert.ok(source.includes(text), `overview page should include ${text}`)
}
