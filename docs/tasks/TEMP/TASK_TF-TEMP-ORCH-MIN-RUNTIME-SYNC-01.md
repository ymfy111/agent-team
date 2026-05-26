# TASK_TF-TEMP-ORCH-MIN-RUNTIME-SYNC-01｜ORCH 最小运行态目录评审与同步

> 文档类型：Task / 正式任务记录  
> 所属工作项：TEMP  
> 当前基线：v0.6.33.45  
> 结果：PASS  
> 日期：2026-05-26  

---

## 0. 执行计划快照

```text
Goal: 评审 ORCH 最小运行态目录方案，并同步相关文档。
Scope: 只同步文档和路径口径，不重构 orchestrator 程序。
```

---

## 1. Overview

Current: 已完成 ORCH 最小运行态目录独立评审，并将 state / dispatches / packets 三件套同步到调度器子设计、POC 工作项、Orchestrator README、project-memory、文档导航和总路线图。taskflow skill 的文档输出路径口径也已从旧 `docs/workitems/runs/` 调整为 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`。

---

## 2. Steps

| Step | 状态 | 产出 |
|---|---:|---|
| N01 独立评审 | PASS | 结论：ORCH 初版只保留 `.runtime/orch/state.json`、`.runtime/orch/dispatches.jsonl`、`.runtime/orch/packets/<TaskId>.md`，避免过度设计。 |
| N02 文档定位 | PASS | 定位并更新 SDD-TEAM-ORCHESTRATOR、TF-RUNTIME-ORCH-POC、Orchestrator README、project-memory、文档导航、PLAN。 |
| N03 输出路径同步 | PASS | 正式 Task 记录路径收口为 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`；运行态收口为 `.runtime/orch/` 与 `.runtime/exec/`。 |
| N04 验证收口 | PASS | 关键术语和路径检查通过。 |

---

## 3. Issues

- 无 P0/P1 阻塞。
- P2：当前 `tools/orchestrator` 代码仍可能保留旧 `.taskflow/` 与 `docs/workitems/runs/` 实现细节；本轮按计划先同步设计与文档，代码迁移建议另开任务。

---

## 4. Actual Artifacts

- `docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`
- `docs/workitems/TF-RUNTIME-ORCH-POC.md`
- `tools/orchestrator/README.md`
- `docs/plans/PLAN-SMART-FACTORY.md`
- `docs/project-memory.md`
- `docs/文档导航.md`
- `docs/tasks/TF-TEMP-ORCH-MIN-RUNTIME-SYNC-01/TASK_TF-TEMP-ORCH-MIN-RUNTIME-SYNC-01.md`

---

## 5. Next

建议下一步单独执行 `TF-TEMP-ORCH-CODE-PATH-MIGRATION-01`：将 POC 代码中的 `.taskflow/`、`docs/workitems/runs/`、`--taskflow` 等历史实现细节迁移到 `.runtime/orch/`、`docs/tasks/`、`--task` 口径。
