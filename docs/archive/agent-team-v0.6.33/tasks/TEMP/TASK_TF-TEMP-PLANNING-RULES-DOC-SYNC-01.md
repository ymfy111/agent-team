# TASK_TF-TEMP-PLANNING-RULES-DOC-SYNC-01｜任务规划规则与页面截图自查规则同步

> Type: TEMP Task  
> Status: PASS  
> Mode: TEMP_INTERACTIVE  
> StartedAt: 2026-06-01 01:14:50 +0800  
> FinishedAt: 2026-06-01 01:16:27 +0800  
> BelongsTo: TEMP  
> Runner: task-runner v1.0.2

## 1. Goal

把“怎么写计划 / 怎么拆任务 / 怎么设计步骤 / 页面类任务必须截图自查”的执行经验沉淀到项目规则文档和 runner 门禁中，避免后续智能体盲编码、漏验证或让用户承担第一轮测试。

## 2. Scope

- 新增任务规划与 Step 设计规则 Guide。
- 更新 AI 动态工作流、ORCH 调度、Skill 触发模式文档。
- 更新 `task-runner` 与 `task-batch-runner` 的页面类任务截图自查门禁。
- 更新 `project-memory`、`doc-nav`、中文文档导航和 skills README。
- 不修改 `apps/`。

## 3. Nodes

| Node | Status | Summary |
|---|---|---|
| S01 Review current rule docs | PASS | 检查 AI 动态工作流、ORCH 调度、触发模式和 runner 文档。 |
| S02 Add planning rules | PASS | 新增任务规划与 Step 设计规则 Guide，并补充 Plan/WorkItem/Task/Step 分层规则。 |
| S03 Add frontend screenshot self-check rule | PASS | 在 Guide 与 runner 门禁中加入页面类 Task 的 Playwright 截图和智能体自查硬规则。 |
| S04 Sync visibility | PASS | 同步 doc-nav、中文导航、project-memory、skills README 和 runner SKILL.md 引用。 |
| S05 Validate | PASS | 校验关键文件、关键词覆盖、active skills 和 apps 未修改。 |

## 4. Acceptance

- [x] 文档明确“怎么写计划 / 怎么拆任务 / 怎么设计 Steps”。
- [x] 页面类任务明确“截图验证与智能体自查”是必选 Step。
- [x] 未截图自查的页面类任务不得标记 PASS。
- [x] 规则能通过 doc-nav、project-memory、skill 门禁被新智能体看到。
- [x] `apps/` 无修改。

## 5. Artifacts

- `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`
- `docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`
- `docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md`
- `docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md`
- `skills/task-runner/SKILL.md`
- `skills/task-batch-runner/SKILL.md`
- `docs/project-memory.md`
- `docs/doc-nav.md`
- `docs/文档导航.md`
- `docs/tasks/TEMP/TASK_TF-TEMP-PLANNING-RULES-DOC-SYNC-01.md`
- `docs/reports/RPT-TF-TEMP-PLANNING-RULES-DOC-SYNC-01.md`
- `.runtime/exec/TEMP/TF-TEMP-PLANNING-RULES-DOC-SYNC-01.json`

## 6. Notes

本任务为规则文档同步任务，不执行真实页面修改，不需要页面截图验证；但它新增的规则会约束后续所有页面 / 前端 / 原型类 Task。
