# TASK_TF-FACTORY-UI-RUNTIME-01C｜团队动态事件流增强

> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: done  
> RecommendedSkill: `task-runner`  
> Mode: PLANNED_INTERACTIVE  
> DependsOn: `TF-FACTORY-UI-RUNTIME-01B`  
> CreatedAt: 2026-06-01

## Goal

将总览页右侧团队动态从普通消息流增强为 WorkItem / Task / DecisionPacket / QA 事件流。

## Scope

- 调整团队动态事件类型和优先级。
- 明确待决策、阻塞、验收、协同、反馈等事件。
- 与 01A / 01B 的动态工作流表达保持一致。

## Out Of Scope

- 不做真实通知系统。
- 不改全局消息中心。
- 不执行 01D-01E。

## Acceptance Criteria

- 团队动态能表达“谁在什么 Task / Step 上发生了什么”。
- DecisionPacket / QA / 阻塞事件能被快速识别。
- 页面截图和浏览器错误检查通过。

## Result

Status: done  
FinishedAt: 2026-06-01 17:10:00 +0800

已在 overview/page.js 增加带类型标签的工作项事件流（DecisionPacket/Task/QA），使用独立 DOM id `typedActivityStream` 避免被 legacy runtime 覆盖，并配合 `installActivityStreamGuard` 在页面切换时重新注入。

## Evidence

- 修改文件：`apps/web/src/features/overview/page.js`、`apps/web/src/styles/prototype.css`
- 新增测试：`apps/web/tests/overview-01c.test.mjs`
- 备份文件：`backup/TF-FACTORY-UI-RUNTIME-01C/apps/web/src/features/overview/page.js.before`
- 截图证据：`tmp/TF-FACTORY-UI-RUNTIME-01C-overview-after.png`
- QA 报告：`docs/reports/QA-TF-FACTORY-UI-RUNTIME-01C.md`
- 执行账本：`.runtime/exec/TF-FACTORY-UI-RUNTIME/TF-FACTORY-UI-RUNTIME-01C.json`
