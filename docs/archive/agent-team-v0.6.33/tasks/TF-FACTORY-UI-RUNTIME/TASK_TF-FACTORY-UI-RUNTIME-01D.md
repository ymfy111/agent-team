# TASK_TF-FACTORY-UI-RUNTIME-01D｜员工活动与 Task / Step 绑定

> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: planned  
> RecommendedSkill: `task-runner`  
> Mode: PLANNED_INTERACTIVE  
> DependsOn: `TF-FACTORY-UI-RUNTIME-01C`  
> CreatedAt: 2026-06-01

## Goal

让总览页员工活动不再只是在线 / 忙碌状态，而是绑定到具体 Task / Step、协同动作、审查动作或阻塞状态。

## Scope

- 调整员工活动卡片或列表的信息字段。
- 展示当前 Task / Step、角色动作、状态和下一步。
- 保持与团队动态和 WorkItem 详情一致。

## Out Of Scope

- 不重做员工详情页。
- 不接真实员工运行体 API。
- 不执行 01E。

## Acceptance Criteria

- 用户能看出每个关键员工当前参与哪个 Task / Step。
- 协同、验证、阻塞、待决策等状态有明确表达。
- 页面截图和浏览器错误检查通过。
