# TF-GF-IMPL｜Guarded Flow 最小实现工作项

> 文档类型：WorkItem / 工作项  
> 当前基线：v0.6.33.45  
> 所属计划：`docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`  
> 状态：accepted  
> 当前焦点：Guarded Flow P0 最小实现已完成，下一步进入产品对象最小模型或 UI / Runtime 边界评审。

---

## 1. 工作项定位

本工作项用于把 Guarded Task Flow 的 P0 最小门禁能力落地到结构化 Markdown、`taskflow-md.mjs` 与 taskflow skill 中。

它不是单个任务，而是一个 WorkItem / 工作项，管理一组有序 TaskFlow / 任务。每个任务执行完成后，运行记录写入 `docs/workitems/runs/`，评审与复盘写入 `docs/reports/`；长期结论沉淀在本工作项、设计文档、指南和 project-memory 中。

---

## 2. 所属计划与设计依据

- 总路线图：`docs/plans/PLAN-SMART-FACTORY.md`
- 阶段路线：`docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
- 产品对象子设计：`docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
- skill 产品化映射：`docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
- DDD 规范：`docs/guides/GUIDE-DOC-DRIVEN-DEVELOPMENT.md`

---

## 3. 任务状态清单

| 任务 | 状态 | 目标 | 已落地能力 / 命令 | Run | Report | 下一步 |
|---|---|---|---|---|---|---|
| TF-GF-IMPL-01 | done | 依赖检查最小实现 | `validate-dependencies` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-02 | done | Blocker / Decision 检查最小实现 | `validate-gates` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-03 | done | 验证失败状态最小实现 | `validate-statuses` | 已清理，结论沉淀于本表 | 已清理，结论沉淀于本表 | 已完成 |
| TF-GF-IMPL-04 | done | 恢复记录最小实现 | `resume-node` / `append-event` | `docs/workitems/runs/TF-GF-IMPL-04-RUN-v0.6.33.45.md` | `docs/reports/RPT-TF-GF-IMPL-04-Review-v0.6.33.45.md` | 已完成 |
| TF-GF-REVIEW-01 | accepted | Guarded Flow 产品化映射评审 | 产品对象映射结论 | `docs/workitems/runs/TF-GF-REVIEW-01-RUN-v0.6.33.45.md` | `docs/reports/RPT-TF-GF-REVIEW-01-Product-Mapping-Review-v0.6.33.45.md` | 已验收，转入后续产品对象 / UI / Runtime 边界任务 |

状态说明：

- `planned`：计划中，尚未满足执行条件；
- `ready`：可执行，适合作为下一步；
- `running`：执行中；
- `done`：执行完成并有 Run / Report 记录或结论已沉淀；
- `accepted`：已被用户或阶段门禁验收；
- `blocked`：阻塞；
- `deferred`：暂缓；
- `superseded`：已被替代。

---

## 4. 已完成能力

| 能力 | 说明 | 验证口径 |
|---|---|---|
| 依赖检查 | 启动任务前检查前置任务 / 步骤是否完成 | `validate-dependencies` |
| Blocker / Decision 门禁 | 存在 open blocker / decision 时阻止继续推进 | `validate-gates` |
| 验证失败状态 | 验证失败进入 `needs_review` 或 `blocked`，不误标为完成 | `validate-statuses` |
| 恢复记录 | 支持 `resume-node` 与 `append-event`，记录恢复原因与事件 | `NODE_RESUMED` / TaskEvent |
| 执行报告生成 | `render-report` 根据运行记录生成主对话 4 段式报告 | 执行概览 / 步骤摘要 / 问题与遗留 / 产物与下一步 |

---

## 5. 后续建议

- `TF-PROD-MODEL-01`：TaskFlow First 产品对象最小模型；
- UI 信息架构评审：用户侧展示“计划 / 阶段 / 工作项 / 任务 / 步骤”；
- Runtime 边界评审：明确多智能体执行与 WorkItem / TaskFlow / TaskTicket 的绑定关系。

---

## 6. 更新记录

| 时间 | 变更 | 依据 |
|---|---|---|
| 2026-05-24 | 建立 Guarded Flow 最小实现工作项，统一管理 TF-GF-IMPL-01/02/03/04 | TaskFlow First 路线图 |
| 2026-05-24 | 完成 TF-GF-IMPL-04 与 TF-GF-REVIEW-01，工作项状态更新为 accepted | Guarded Flow P0 最小能力完成 |
| 2026-05-25 | 路径收口为 `docs/workitems/`，用户侧命名统一为计划 / 阶段 / 工作项 / 任务 / 步骤 | DDD 规范与命名收口 |
