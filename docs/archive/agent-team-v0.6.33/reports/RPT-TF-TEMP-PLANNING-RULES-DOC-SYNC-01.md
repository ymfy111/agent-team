# RPT-TF-TEMP-PLANNING-RULES-DOC-SYNC-01｜任务规划规则与截图自查同步报告

> Status: PASS  
> StartedAt: 2026-06-01 01:14:50 +0800  
> FinishedAt: 2026-06-01 01:16:27 +0800  
> Runner: task-runner v1.0.2

## 1. Summary

已完成任务规划规则与页面类任务截图自查规则同步。新增 `GUIDE-TASK-PLANNING-RULES-v0.6.33.md`，并把该规则挂入 AI 动态工作流、ORCH 调度、Skill 触发模式、runner 门禁、project-memory 和文档导航。

## 2. Key Rules Added

```text
Plan / Stage / WorkItem 先规划
WorkItem 启动前细化 Tasks
Task 执行时动态拆 Steps
Task 是最小分配单元
Step 是最小活动单元
```

页面 / 前端 / 原型类 Task 必须包含：

```text
修改前备份
页面修改
启动或确认 Web 服务
Playwright 截图
智能体自己查看截图
必要修复与重新截图
验收截图 / 前后对比图
用户最终验收
```

未完成截图自查的页面类 Task，不允许标记完全 `PASS`。

## 3. Validation

| Check | Result |
|---|---|
| 新 Guide 存在 | PASS |
| doc-nav / project-memory 可见 | PASS |
| task-runner 门禁引用 | PASS |
| task-batch-runner 门禁引用 | PASS |
| active skills 仍只有 task-runner / task-batch-runner | PASS |
| apps 未修改 | PASS |

## 4. Artifacts

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

## 5. Risks / Follow-up

- 后续执行 `TF-FACTORY-UI-RUNTIME-01A` 等前端任务时，Task Runner Plan 必须显式包含截图验证与智能体自查 Step。
- 若运行环境无法截图，必须在 Run Summary 中降级状态并说明原因，不得让用户承担第一轮测试。
