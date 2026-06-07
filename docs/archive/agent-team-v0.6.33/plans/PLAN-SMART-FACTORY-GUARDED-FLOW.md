# PLAN-SMART-FACTORY-GUARDED-FLOW｜Guarded Flow 阶段路线图

> 文件：`docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`  
> 目的：解释当前 Guarded Flow 相关任务流编号、已完成项和后续项，避免后续只依赖对话上下文理解进展。

## 0. 与 WorkPackage / TaskFlowGroup 的关系

本文属于 `docs/plans/`，用于说明 Guarded Flow 的阶段目标和能力路线。具体执行清单由 `docs/workitems/TF-GF-IMPL.md` 维护。

```text
Plan / Roadmap：docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md
  → WorkPackage / TaskFlowGroup：docs/workitems/TF-GF-IMPL.md
    → TaskFlow：TF-GF-IMPL-01/02/03/04
      → Run：docs/tasks/<WorkItemId>/TF-GF-IMPL-xx-RUN-v0.6.33.45.md（按需生成；沉淀后可清理）
```

## 1. 阶段关系

| 阶段 | 任务流 | 状态 | 目的 | 当前产物 | 下一步 |
|---|---|---|---|---|---|
| 结构化基础 | TF-DOC-STRUCT-01 | 已完成 | 建立结构化 Markdown 任务流模板 | `docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md` | 已进入 POC |
| Markdown POC | TF-POC-MD-01 | 已完成，重跑后通过 | 验证 Markdown 可读写任务流 | `tools/taskflow/taskflow-md.mjs` | 已进入 Guarded Flow |
| Guarded Flow 设计 | TF-GUARDED-FLOW-01 | 已完成 | 设计依赖、阻塞、决策、验证失败、恢复等最小约束 | `docs/guides/TASKFLOW-GUARDED-FLOW-v0.6.33.45.md` | 已进入 GF-IMPL |
| GF 实现 01 | TF-GF-IMPL-01 | 已完成 | 依赖检查最小实现 | `validate-dependencies` | 已完成 |
| GF 实现 02 | TF-GF-IMPL-02 | 已完成 | Blocker / Decision 检查最小实现 | `validate-gates` | 已完成 |
| GF 实现 03 | TF-GF-IMPL-03 | 已完成 | 验证失败状态最小实现 | `validate-statuses` | 已完成 |
| GF 实现 04 | TF-GF-IMPL-04 | 已完成 | 恢复记录最小实现 | `resume-node` / `append-event` | 已完成 |
| 产品化评审 | TF-GF-REVIEW-01 | 待执行 | 映射到产品对象 TaskTicket / TaskEvent / Blocker / DecisionItem | 待评审 | 下一步候选 |

## 2. GF-IMPL 编号说明

`GF` = Guarded Flow，表示带轻量门禁的任务流。  
`IMPL` = implementation，表示从设计进入最小实现。

| 编号 | 名称 | 解决的问题 |
|---|---|---|
| TF-GF-IMPL-01 | 依赖检查最小实现 | 防止后置节点在前置节点未完成时启动。 |
| TF-GF-IMPL-02 | Blocker / Decision 检查最小实现 | 防止存在未处理阻塞或待决策时继续推进。 |
| TF-GF-IMPL-03 | 验证失败状态最小实现 | 防止验证失败节点被错误标记为完成。 |
| TF-GF-IMPL-04 | 恢复记录最小实现 | 记录被阻塞、暂停、需评审节点如何恢复继续。 |
| TF-GF-REVIEW-01 | 产品化映射评审 | 判断 Markdown POC 能力如何进入智能软件工厂产品模型。 |

## 3. 约束

- 不提前引入复杂数据库、完整状态机、Runtime 自动调度或任务锁。
- Markdown Node 当前仍是 TaskTicket 的文档化视图与轻量实现形式。
- 每轮 GF-IMPL 只解决一个主问题，避免过度设计。
