# TASK_TF-FACTORY-UI-RUNTIME-01A｜总览页动态工作流表达增强

> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: done  
> RecommendedSkill: `task-runner`  
> Mode: PLANNED_INTERACTIVE  
> Scope: `apps/web/src/features/overview/**` 及必要 mock / QA 证据  
> CreatedAt: 2026-06-01

## Goal

把总览页从静态团队 / 员工看板增强为 AI 动态工作流总览，突出 `Plan → Stage → WorkItem → Task → Step`、员工活动、生成产物、待决策与验收反馈。

## Scope

- 备份将修改的 overview 页面文件。
- 调整总览页核心信息表达和 mock 数据。
- 员工活动必须绑定到具体 Task / Step。
- 保留现有导航和页面可运行状态。
- 输出前后截图和浏览器错误检查结果。

## Out Of Scope

- 不重构全站导航。
- 不改真实后端或 RuntimeGateway API。
- 不把首页改成 Web IDE / 终端 / 文件树主入口。
- 不连续执行 01B-01E。

## Acceptance Criteria

- 首页出现清晰的 Plan / Stage / WorkItem / Task / Step 层级表达。
- 员工活动能落到具体 Task / Step 或验收/协同状态。
- 页面启动成功，浏览器截图可读，`agent-browser errors` 无新增 JS 错误。
- 生成验收截图并记录到 QA / Run Summary。

## Context Docs

- `docs/workitems/TF-FACTORY-UI-RUNTIME.md`
- `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`
- `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`

## Expected Evidence

- `tmp/` 下前后截图或验收截图。
- `.runtime/exec/TF-FACTORY-UI-RUNTIME/TF-FACTORY-UI-RUNTIME-01A.json`
- `docs/reports/QA-TF-FACTORY-UI-RUNTIME-01A.md`

## Result

Status: done  
FinishedAt: 2026-06-01 16:32:14 +0800

已在 `apps/web/src/features/overview/page.js` 增加 AI 动态工作流总览区，展示 `Plan → Stage → WorkItem → Task → Step / Gate`，并补充员工活动到 Task / Step 的绑定、生成产物和 DecisionPacket / 验收反馈入口表达。

## Evidence

- 修改文件：`apps/web/src/features/overview/page.js`
- 备份文件：`backup/TF-FACTORY-UI-RUNTIME-01A/apps/web/src/features/overview/page.js.before`
- 截图证据：`tmp/TF-FACTORY-UI-RUNTIME-01A-overview-after.png`
- QA 报告：`docs/reports/QA-TF-FACTORY-UI-RUNTIME-01A.md`
- 执行账本：`.runtime/exec/TF-FACTORY-UI-RUNTIME/TF-FACTORY-UI-RUNTIME-01A.json`
