# TASK_TF-FACTORY-UI-RUNTIME-01C｜团队动态事件流增强

> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: planned  
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
