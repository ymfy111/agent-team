# RPT-TF-TEMP-ORCH-SCHEDULING-RULES-DOC-SYNC-01｜ORCH 调度规则与 Runner 门禁同步报告

> Status: PASS  
> StartedAt: 2026-06-01 00:52:25 +0800  
> FinishedAt: 2026-06-01 00:52:25 +0800  
> Scope: docs + skills gate references only  
> AppsModified: false

---

## 1. Review Result

评审结论：PASS。

理由：ORCH 调度规则属于上层前置门禁，当前应优先沉淀为文档和 runner 引用，而不是立即新增第三个 skill。最终产品中的 ORCH 应是后台调度服务；当前 ChatGPT / OpenCode 若临时模拟调度，也必须遵守同一规则。

## 2. Synced Rules

- `Plan / Stage / WorkItem` 先规划。
- WorkItem 启动前必须细化为 `Task[]`。
- Task 是最小颗粒度分配单元。
- Step 是最小颗粒度活动单元。
- ORCH 只能派发 Task 或 TaskBatch。
- ORCH 不能直接派发 Step。
- WorkItem 未细化 Task[] 时不能调用 `task-runner` 或 `task-batch-runner`。
- 派工包必须携带 `contextDocs[]`，让智能体看到 ORCH 调度规则。

## 3. Updated Files

- `docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md`
- `docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`
- `docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md`
- `docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`
- `docs/project-memory.md`
- `docs/doc-nav.md`
- `docs/文档导航.md`
- `skills/task-runner/SKILL.md`
- `skills/task-batch-runner/SKILL.md`
- `skills/README.md`
- `skills/FILELIST.txt`

## 4. Validation

| Check | Result |
|---|---|
| ORCH guide exists | PASS |
| doc-nav references ORCH guide | PASS |
| project-memory references ORCH gate | PASS |
| task-runner references ORCH guide | PASS |
| task-batch-runner references ORCH guide | PASS |
| active skills remain only task-runner/task-batch-runner | PASS |
| apps unchanged | PASS |

## 5. Notes

备份目录：`/mnt/data/agent-team-backups/orch-scheduling-rules-doc-sync-20260601-005225`。

后续进入首页改造前，应先细化 `TF-FACTORY-UI-RUNTIME` 下的 Task 清单；执行单个 Task 时再由 `task-runner` 动态拆 Step。
