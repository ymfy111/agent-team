# TASK_TF-TEMP-ORCH-SCHEDULING-RULES-DOC-SYNC-01｜ORCH 调度规则与 Runner 门禁文档同步

> BelongsTo: TEMP  
> Mode: TEMP_INTERACTIVE  
> Status: PASS  
> StartedAt: 2026-06-01 00:52:25 +0800  
> FinishedAt: 2026-06-01 00:52:25 +0800  
> Runner: task-runner v1.0.2

---

## 1. Goal

补齐 ORCH 调度规则文档，明确智能体 / ORCH 调用 `task-runner` 与 `task-batch-runner` 的前置条件、层级边界、上下文注入方式、停止门禁和状态回写规则。

## 2. Scope

- 新增 `docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md`。
- 更新 AI 动态工作流 Guide、Skill 触发模式 Guide、Team Orchestrator SDD、project-memory、doc-nav、中文导航。
- 在 `skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md` 中增加 ORCH 调度门禁引用。
- 生成本任务报告、exec 账本和备份包。
- 不修改 `apps/`。

## 3. Nodes

| Node | Status | Output |
|---|---|---|
| S01 Review current docs | PASS | 已检查 ORCH、runner、AI 动态工作流和导航相关文档。 |
| S02 Draft ORCH scheduling rules | PASS | 已新增 ORCH 调度规则 Guide。 |
| S03 Sync visibility references | PASS | 已同步到 doc-nav、project-memory、runner SKILL 和相关 Guide / SDD。 |
| S04 Validate and package | PASS | 已校验关键词、active skills、apps 未修改，并生成备份包。 |

## 4. Visible Output Compliance

| Item | Status |
|---|---|
| Plan visible before execution | PASS |
| User confirmed plan | PASS |
| Run Summary visible after execution | PASS |
| nodes[] recorded | PASS |
| apps unchanged | PASS |

## 5. Artifacts

- `docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md`
- `docs/reports/RPT-TF-TEMP-ORCH-SCHEDULING-RULES-DOC-SYNC-01.md`
- `.runtime/exec/TEMP/TF-TEMP-ORCH-SCHEDULING-RULES-DOC-SYNC-01.json`
- `skills/task-runner/SKILL.md`
- `skills/task-batch-runner/SKILL.md`
- `docs/doc-nav.md`
- `docs/文档导航.md`
- `docs/project-memory.md`
