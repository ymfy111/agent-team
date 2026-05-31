# TASK_TF-TEMP-AI-DYNAMIC-WORKFLOW-RULE-SYNC-01｜AI 动态工作流层级与执行颗粒度规则同步

> WorkItem：TEMP  
> Status：done  
> StartedAt：2026-06-01 00:12:55 +0800  
> FinishedAt：2026-06-01 00:12:55 +0800  
> Mode：task-runner / document-sync

## 1. 目标

根据用户补充口径，把“Plan / Stage / WorkItem / Task / Step”的规划与执行颗粒度规则同步到项目文档和 runner 规则中。

## 2. 范围

范围内：

- 新增 AI 动态工作流执行规则 Guide；
- 更新生成层架构 SDD、总览页 SDD、PRD、主 SDD；
- 更新当前 Runtime UI WorkItem 和 WorkItem 模板；
- 更新 task-runner / task-batch-runner 的颗粒度规则；
- 更新 project-memory 和文档导航。

范围外：

- 不修改 apps 页面代码；
- 不改变现有页面截图；
- 不执行前端实现任务。

## 3. 动态步骤

| Step | 状态 | 说明 |
|---|---|---|
| S01 | PASS | 理解用户补充的 AI 动态工作流执行路径 |
| S02 | PASS | 新增执行规则 Guide |
| S03 | PASS | 同步规格文档、工作项、模板和 skill 规则 |
| S04 | PASS | 校验关键词、目录和 runner 版本 |
| S05 | PASS | 生成任务记录、报告和 exec 账本 |

## 4. 产物

- `docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`
- `docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`
- `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`
- `docs/specs/PRD-v0.6.33.md`
- `docs/specs/SDD-v0.6.33.md`
- `docs/workitems/TF-FACTORY-UI-RUNTIME.md`
- `skills/task-runner/SKILL.md`
- `skills/task-batch-runner/SKILL.md`

## 5. 结论

PASS。规则已同步：先规划 Plan / Stage / WorkItem；执行 WorkItem 前细化 Task；执行 Task 时动态分配 Step。Task 是最小派工单元，Step 是最小活动单元。
