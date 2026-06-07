# TASK_TF-FACTORY-UI-RUNTIME-01B｜总览页工作项详情抽屉增强

> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: done  
> RecommendedSkill: `task-runner`  
> Mode: PLANNED_INTERACTIVE  
> DependsOn: `TF-FACTORY-UI-RUNTIME-01A`  
> CreatedAt: 2026-06-01

## Goal

增强总览页 WorkItem 详情抽屉，让用户能看到当前工作项下的 TaskBatch、Task、Step、执行状态、验收状态和停止策略。

## Scope

- 补充详情抽屉字段和 mock 数据。
- 展示 Task 列表、Step 摘要、执行 / 验收 / 阻塞状态。
- 保持总览页主布局稳定。

## Out Of Scope

- 不接真实 ORCH API。
- 不实现跨页面工作项编辑器。
- 不执行 01C-01E。

## Acceptance Criteria

- 点击或查看 WorkItem 详情时能理解当前任务拆解和执行状态。
- 停止门禁、待决策、验收反馈有明确展示位置。
- 页面截图和浏览器错误检查通过。

## Result

Status: done  
FinishedAt: 2026-06-01 16:43:26 +0800

已在 `apps/web/src/features/overview/page.js` 增加 WorkItem 详情抽屉式详情区，展示 `TaskBatch 批次`、`Task / Step 清单`、`执行与验收`、`停止策略`，并保留总览页主布局。

## Evidence

- 修改文件：`apps/web/src/features/overview/page.js`
- 新增结构测试：`apps/web/tests/overview-01b.test.mjs`
- 备份文件：`backup/TF-FACTORY-UI-RUNTIME-01B/apps/web/src/features/overview/page.js.before`
- 截图证据：`tmp/TF-FACTORY-UI-RUNTIME-01B-overview-after.png`
- QA 报告：`docs/reports/QA-TF-FACTORY-UI-RUNTIME-01B.md`
- 执行账本：`.runtime/exec/TF-FACTORY-UI-RUNTIME/TF-FACTORY-UI-RUNTIME-01B.json`
