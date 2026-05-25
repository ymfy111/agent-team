# TF-GF-IMPL｜Guarded Flow 最小实现工作项

> 文档类型：WorkItem
> 当前基线：v0.6.33.45
> 所属计划：`docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
> 状态：running
> 当前焦点：`TF-GF-IMPL-04｜恢复记录最小实现`

---

## 1. 工作项定位

本工作项用于把 Guarded Task Flow 的 P0 最小门禁能力逐步落地到结构化 Markdown 与 `taskflow-md.mjs` 中。

它不是单个 TaskFlow，而是一组有序 TaskFlow 的状态清单。已完成 TaskFlow 的关键结论在本文件沉淀；单次运行记录与评审报告只在当前任务需要审计或复盘时保留，沉淀后可清理。

---

## 2. 所属计划

- 总路线图：`docs/plans/PLAN-SMART-FACTORY.md`
- 阶段路线：`docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
- 产品对象子设计：`docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`

---

## 3. TaskFlow 状态清单

| TaskFlow | 状态 | 目标 | 已落地能力 / 命令 | Run | Report | 下一步 |
|---|---|---|---|---|---|---|
| TF-GF-IMPL-01 | done | 依赖检查最小实现 | `validate-dependencies` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-02 | done | Blocker / Decision 检查最小实现 | `validate-gates` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-03 | done | 验证失败状态最小实现 | `validate-statuses` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-04 | ready | 恢复记录最小实现 | `resume-node` / `append-event` 待定 | 待生成 | 待生成 | 下一步候选 |
| TF-GF-REVIEW-01 | planned | Guarded Flow 产品化映射评审 | 待定 | 待生成 | 待生成 | TF-GF-IMPL-04 后执行 |

状态说明：

- `planned`：计划中，尚未满足执行条件；
- `ready`：可执行，适合作为下一步；
- `running`：执行中；
- `done`：执行完成并有 Run / Report 记录；
- `accepted`：已被用户或阶段门禁验收；
- `blocked`：阻塞；
- `deferred`：暂缓；
- `superseded`：已被替代。

---

## 4. 当前焦点

下一步建议：`TF-GF-IMPL-04｜恢复记录最小实现`。

目标：补充节点从 `needs_review / blocked / paused` 等状态恢复继续时的最小事件记录能力。

边界：

- 不做完整状态机；
- 不做 UI；
- 不做 Runtime 自动调度；
- 只补最小命令或事件追加能力，并用结构化 Markdown 运行副本验证。

---

## 5. 暂缓 / 后续

- `TF-GF-REVIEW-01`：Guarded Flow 到产品对象的映射评审；
- Runtime 自动调度：暂缓，等待 TaskFlow / TaskTicket / WorkItem 口径稳定；
- 前端任务流 UI：暂缓，等产品对象和文档结构稳定后再做。

---

## 6. 更新记录

| 时间 | 变更 | 依据 |
|---|---|---|
| 2026-05-24 | 新建 GF-IMPL 工作项文档，统一管理 01/02/03/04 状态 | WorkItem 层级收口 |
| 2026-05-24 | DOC-CLOSEOUT：清理已完成任务的历史 run/report，保留本工作项状态摘要作为当前入口 | 文档瘦身与事实源收口 |
