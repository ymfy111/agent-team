# RPT-TF-TEMP-SKILL-TRIGGER-RULE-SYNC-01｜Skill 触发条件与调度模式同步报告

> 状态：PASS_WITH_WARNINGS  
> StartedAt：2026-06-01 00:25:56 +0800  
> FinishedAt：2026-06-01 00:25:56 +0800  
> 范围：docs / skills only  

## 1. Review

评审通过。方案把触发条件收敛为两个正式 runner 和三类调度场景：

1. 临时任务：`TEMP_INTERACTIVE`，通常由 `task-runner` 执行；
2. 计划任务用户交互确认：`PLANNED_INTERACTIVE` / `BATCH_INTERACTIVE`；
3. ORCH 非交互调度：`ORCH_TASK` / `ORCH_BATCH`，由结构化派工包授权。

## 2. Changes

- 新增：`docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md`
- 更新：`skills/task-runner/SKILL.md`
- 更新：`skills/task-batch-runner/SKILL.md`
- 更新：`docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`
- 更新：`skills/README.md`
- 更新：`docs/doc-nav.md`、`docs/文档导航.md`
- 更新：`docs/project-memory.md`
- 更新：`docs/workitems/TF-FACTORY-UI-RUNTIME.md`

## 3. Validation

- 关键触发 Mode 已覆盖：`TEMP_INTERACTIVE`、`PLANNED_INTERACTIVE`、`BATCH_INTERACTIVE`、`ORCH_TASK`、`ORCH_BATCH`。
- `task-runner` / `task-batch-runner` 版本脚本可运行。
- 未修改 `apps/`。

## 4. Issues

- 本轮用户授权方式为“评审通过就执行”，因此没有单独等待二次确认；已在 visibleOutputCompliance 中记录为 `conditional_user_approval`。
- 未单独输出完整代码块 Plan，故报告状态为 `PASS_WITH_WARNINGS`，不影响文档产物有效性。

## 5. Next

后续开始 `TF-FACTORY-UI-RUNTIME-01A` 时，应先确认该 WorkItem 下 Task 清单，再对单个 Task 输出完整 `Task Runner Plan`。
