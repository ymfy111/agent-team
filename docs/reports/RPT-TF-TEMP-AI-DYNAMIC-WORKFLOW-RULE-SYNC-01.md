# RPT-TF-TEMP-AI-DYNAMIC-WORKFLOW-RULE-SYNC-01｜AI 动态工作流规则同步报告

> Status：PASS  
> FinishedAt：2026-06-01 00:12:55 +0800

## 1. 同步结论

已将用户确认的规则同步到 docs 与 skills：

```text
Plan / Stage / WorkItem 先规划
WorkItem 执行前细化 Task[]
Task 执行时动态生成 Step[] / nodes[]
Task 是最小派工单元
Step 是最小活动单元
```

## 2. 关键文件

| 类型 | 文件 |
|---|---|
| Guide | `docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md` |
| 架构 | `docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md` |
| 页面设计 | `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md` |
| PRD/SDD | `docs/specs/PRD-v0.6.33.md`、`docs/specs/SDD-v0.6.33.md` |
| WorkItem | `docs/workitems/TF-FACTORY-UI-RUNTIME.md` |
| Runner | `skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md` |

## 3. 验证

- 关键词校验：PASS
- active skills 恢复与存在性校验：PASS
- runner version smoke：PASS
- apps 修改：无

## 4. 下一步建议

执行 `TF-FACTORY-UI-RUNTIME-01A` 前，先按本规则确认该 WorkItem 下的具体 Task Dispatch Packet，再由 `task-runner` 动态拆 Step 并完成首页小步改造。
