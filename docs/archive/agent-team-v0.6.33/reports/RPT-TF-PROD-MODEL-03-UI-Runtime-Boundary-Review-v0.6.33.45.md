# RPT-TF-PROD-MODEL-03｜UI 信息架构与 Runtime 边界评审

> 文档类型：ReviewRecord / 独立评审报告  
> 任务：TF-PROD-MODEL-03  
> 工作项：TF-PROD-MODEL  
> 当前基线：v0.6.33.45  
> 结论：PASS

---

## 1. 评审结论

本轮设计结论通过。当前方案清楚地区分了用户对话、组长智能体、Orchestrator、执行智能体和产品事实源之间的边界。

核心判断成立：

```text
大模型智能体做真正的认知和执行工作；
Orchestrator 负责调度、状态、事件、可靠性和协同控制；
用户主要和组长智能体对话；
组长通过 Orchestrator 推进项目；
对话不是事实源，TaskFlow / TaskEvent 才是事实源。
```

---

## 2. 通过点

| 评审项 | 结论 | 说明 |
|---|---:|---|
| 命名与层级 | PASS | 延续计划 / 阶段 / 工作项 / 任务 / 步骤，未引入新冲突。 |
| UI 信息架构 | PASS | 已明确总览、阶段、工作项、任务、步骤、待决策、评审、交接、组长对话框的对象映射。 |
| Orchestrator 边界 | PASS | Orchestrator 不替代大模型思考，只做调度、状态、事件、可靠性和恢复。 |
| 组长对话机制 | PASS | 组长是协同界面，负责理解、解释、建议和决策材料组织；状态变更通过 Orchestrator。 |
| 一线 / 二线处理 | PASS | 小问题由执行智能体一线处理；重大范围、验收、架构、风险问题升级。 |
| 可靠性设计 | PASS | Webhook 不作为唯一事实源，补充 reconcile / watchdog / heartbeat / lease / idempotency。 |

---

## 3. 风险与遗留

| 类型 | 级别 | 内容 | 建议 |
|---|---:|---|---|
| 后续实现风险 | P2 | leader-orchestrator skill 尚未设计，组长如何使用 Orchestrator 仍需细化。 | 建议后续单独立项 `TF-LEADER-SKILL`。 |
| 后端设计风险 | P2 | Orchestrator、AgentMailbox、WorkerRuntimeBinding、Lease、Reconcile 还未形成后端最小设计。 | 建议后续立项 `TF-RUNTIME-ORCH`。 |
| UI 落地风险 | P2 | 迁移后网站尚未按照任务流优先信息架构调整。 | 对象模型稳定后进入 `TF-FACTORY-UI`。 |

---

## 4. 处理决定

本轮不实现任何代码、数据库、Runtime 或 UI；仅把边界沉淀到设计文档和工作项中。下一步优先执行 `TF-PROD-MODEL-04`，做主 SDD、recs、plan、workitem 的跨文档一致性收口。
