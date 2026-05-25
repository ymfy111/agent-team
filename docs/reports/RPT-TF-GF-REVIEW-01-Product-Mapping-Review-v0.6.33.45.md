# RPT-TF-GF-REVIEW-01｜Guarded Flow 产品化映射评审

> 文档类型：评审报告 / 产品化映射评审  
> 对应任务流：TF-GF-REVIEW-01  
> 基线：v0.6.33.45 / taskflow v0.9.27  
> 结论：PASS，建议进入产品对象与 UI / Runtime 分层设计前的准备阶段。

---

## 1. 评审结论

当前 `taskflow skill + 结构化 Markdown + taskflow-md.mjs` 已经具备“单智能体软件工厂引擎”的 P0 雏形能力：它能以任务流为事实主线，把计划拆成工作项、任务流和任务节点，并围绕节点记录事件、证据、阻塞、决策、验证和恢复。

但这套能力不应直接等同于完整软件工厂产品。产品化时应将其抽象为：

```text
计划 / 阶段 / 工作项 / 任务流 / 任务节点（任务票）
Plan / Stage / WorkItem / TaskFlow / TaskTicket(Node)
```

当前适合进入下一步产品化映射和对象边界设计，不建议立即做 Runtime 自动调度或复杂状态机。

---

## 2. 产品对象映射

| 当前文档 / skill 能力 | 产品化对象 | 映射结论 |
|---|---|---|
| `docs/plans/PLAN-SMART-FACTORY.md` | Plan / Roadmap | 项目级路线图，回答为什么做和能力演进方向。 |
| `docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md` | Stage / Plan 子阶段 | Guarded Flow 阶段目标与能力路线。 |
| `docs/workitems/TF-GF-IMPL.md` | WorkItem | 一组有序 TaskFlow 的工作项状态看板。 |
| `docs/workitems/runs/TF-*-RUN*.md` | TaskFlow Run / TaskEvent Ledger | 单次任务流执行记录与生命周期审计。 |
| `TASKFLOW:NODES` | TaskTicket / Node 计划视图 | 节点目标、验收点、依赖和暂停门禁。 |
| `TASKFLOW:STATUS` | TaskTicket 状态视图 | 节点状态、实际开始/完成时间、结果和耗时。 |
| `TASKFLOW:EVENTS` JSONL | TaskEvent | 节点开始、完成、恢复、状态变化等事实事件。 |
| `TASKFLOW:BLOCKERS` | Blocker | 阻塞项与暂停门禁的结构化表达。 |
| `TASKFLOW:DECISIONS` | DecisionItem | 需要用户或协同规划岗裁决的结构化事项。 |
| `TASKFLOW:EVIDENCE` | EvidenceRef | 验证输出、评审报告、截图、QA 结果等证据引用。 |
| `docs/reports/RPT-*.md` | ReviewRecord | 独立评审、验证复盘和交付审查记录。 |
| `project-memory.md` / 交接包 | HandoffPackage / ProjectMemory | 阶段性事实沉淀和新会话接手入口。 |

---

## 3. 已具备的 P0 能力

| 能力 | 当前实现 | 产品化意义 |
|---|---|---|
| 工作项看板 | `TF-GF-IMPL.md` | 避免任务流文件过多，形成计划到执行的中间组织层。 |
| 依赖门禁 | `validate-dependencies` / `start-node` 依赖检查 | 防止任务无序推进。 |
| Blocker / Decision 门禁 | `validate-gates` | 防止带着阻塞或待决策继续执行。 |
| 验证失败状态 | `needs_review` / `blocked` | 防止失败节点被伪装成完成。 |
| 恢复记录 | `resume-node` / `append-event` | 记录节点从阻塞、暂停、需评审中恢复的依据。 |
| 证据链 | `EVIDENCE` + reports / runs | 让“完成”有可复查依据，而不是只靠对话声明。 |
| 执行报告 | `render-report` | 从运行记录生成对话框摘要，减少模型手工整理。 |

---

## 4. 产品化差距

| 差距 | 级别 | 建议处理 |
|---|---:|---|
| Markdown ID / 路径仍是轻量引用，不是正式对象 ID | P1 | 产品化时引入对象 ID 与路径引用的映射。 |
| 当前执行由单智能体 / ChatGPT 驱动，不具备多运行体调度 | P1 | 后续 Runtime 设计再接 WorkerRuntimeBinding / ExecutionLease。 |
| TaskEvent 仅在 Markdown JSONL 中追加 | P1 | 产品化时迁移为可查询事件表或事件流。 |
| 报告和证据主要是文档路径 | P2 | 后续补 EvidenceRef 类型、targetArtifact 和校验结果字段。 |
| UI 尚未表达 WorkItem / TaskFlow / TaskTicket 层级 | P2 | 进入产品 UI 设计时补任务流看板和执行报告视图。 |
| 状态流仍是 P0 最小语义，不是完整状态机 | P2 | 当前不扩展，等产品对象稳定后再引入状态机。 |

---

## 5. 下一步建议

建议下一阶段不要继续堆工具命令，而是进入“产品对象 + 界面 + Runtime 边界”的分层评审：

1. **TF-PROD-MODEL-01｜TaskFlow First 产品对象最小模型**  
   明确 WorkItem、TaskFlow、TaskTicket、TaskEvent、EvidenceRef、ReviewRecord、DecisionItem 的最小字段和关系。

2. **TF-FACTORY-UI-01｜任务流优先 UI 信息架构评审**  
   评审首页、项目页、员工页、协作全景如何从“对话入口”转向“任务流推进看板”。

3. **TF-RUNTIME-BINDING-01｜运行体绑定边界评审**  
   明确什么时候才需要从 Markdown/skill 引擎进入多智能体 Runtime 编排。

---

## 6. 评审结论

| 维度 | 结论 | 说明 |
|---|---|---|
| 产品方向 | PASS | TaskFlow First 与 WorkItem 层级能支撑软件工厂主线。 |
| 当前 P0 能力 | PASS | 依赖、门禁、状态失败、恢复、证据和审计能力已形成闭环。 |
| 复杂度控制 | PASS | 仍保持 P0 文档化和脚本化边界，未提前引入完整调度系统。 |
| 产品化准备度 | WARN | 对象 ID、事件查询、UI 表达和 Runtime 绑定仍需后续设计。 |
| 是否继续主线 | PASS | 可进入产品对象 / UI / Runtime 边界评审阶段。 |
