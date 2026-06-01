import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('../src/features/overview/page.js', import.meta.url), 'utf8')
const styleSource = readFileSync(new URL('../src/styles/prototype.css', import.meta.url), 'utf8')

assert.ok(
  pageSource.trimStart().startsWith('const OVERVIEW_HTML = String.raw`\n\n<div class="stat-cards-row">'),
  'overview should start with the original stat cards, not extra workflow banners',
)

assert.ok(
  !pageSource.includes('AI 动态工作流总览') && !pageSource.includes('工作项详情抽屉 · TF-FACTORY-UI-RUNTIME'),
  'overview should not render bulky explanatory sections above the dashboard',
)

assert.ok(
  /#page-overview\.page\.active\s*{[^}]*overflow-y:\s*auto/s.test(styleSource),
  'active overview page should allow vertical scrolling',
)
