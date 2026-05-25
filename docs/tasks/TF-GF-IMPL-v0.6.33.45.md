# TF-GF-IMPL｜Guarded Flow 最小实现工作包

> 文档类型：TaskFlow Group / WorkPackage
> 当前基线：v0.6.33.45
> 所属计划：`docs/plans/TF-GUARDED-FLOW-ROADMAP-v0.6.33.45.md`
> 状态：running
> 当前焦点：`TF-GF-IMPL-04｜恢复记录最小实现`

---

## 1. 工作包定位

本工作包用于把 Guarded Task Flow 的 P0 最小门禁能力逐步落地到结构化 Markdown 与 `taskflow-md.mjs` 中。

它不是单个 TaskFlow，而是一组有序 TaskFlow 的状态清单。每个 TaskFlow 的真实执行记录写入 `docs/tasks/runs/`，评审和验证结论写入 `docs/reports/`。

---

## 2. 所属计划

- 总路线图：`docs/plans/SMART-FACTORY-ROADMAP-v0.6.33.45.md`
- 阶段路线：`docs/plans/TF-GUARDED-FLOW-ROADMAP-v0.6.33.45.md`
- 产品对象子设计：`docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`

---

## 3. TaskFlow 状态清单

| TaskFlow | 状态 | 目标 | 已落地能力 / 命令 | Run | Report | 下一步 |
|---|---|---|---|---|---|---|
| TF-GF-IMPL-01 | done | 依赖检查最小实现 | `validate-dependencies` | `docs/tasks/runs/TF-GF-IMPL-01-RUN-v0.6.33.45.md` | `docs/reports/TF-GF-IMPL-01-Dependency-Check-Review-v0.6.33.45.md` | 已完成 |
| TF-GF-IMPL-02 | done | Blocker / Decision 检查最小实现 | `validate-gates` | `docs/tasks/runs/TF-GF-IMPL-02-RUN-v0.6.33.45.md` | `docs/reports/TF-GF-IMPL-02-Blocker-Decision-Check-Review-v0.6.33.45.md` | 已完成 |
| TF-GF-IMPL-03 | done | 验证失败状态最小实现 | `validate-statuses` | `docs/tasks/runs/TF-GF-IMPL-03-RUN-v0.6.33.45.md` | `docs/reports/TF-GF-IMPL-03-Validation-Failure-State-Review-v0.6.33.45.md` | 已完成 |
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
- Runtime 自动调度：暂缓，等待 TaskFlow / TaskTicket / WorkPackage 口径稳定；
- 前端任务流 UI：暂缓，等产品对象和文档结构稳定后再做。

---

## 6. 更新记录

| 时间 | 变更 | 依据 |
|---|---|---|
| 2026-05-24 | 新建 GF-IMPL 工作包文档，统一管理 01/02/03/04 状态 | WorkPackage / TaskFlowGroup 层级收口 |
