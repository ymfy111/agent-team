# SMART-FACTORY-ROADMAP v0.6.33.45

> 文档类型：项目总路线图 / 产品理论映射  
> 当前基线：v0.6.33.45  
> 生成任务：TF-PLAN-ALIGN-01  
> 更新时间：2026-05-24T08:06:00Z  
> 核心结论：智能软件工厂的核心不是智能体对话，而是围绕 TaskFlow / TaskTicket 组织计划、执行、协作、验证和交付。

---

## 1. 核心原则：TaskFlow First

智能软件工厂的核心执行对象不是对话会话，而是 `TaskFlow / TaskTicket`。

```text
对话：用户与智能体的交互入口
TaskFlow：项目计划、执行、协作、验证、评审和交付的事实主线
TaskTicket / Node：智能体执行的最小契约
Artifact / Evidence：产物与验收证据
ReviewRecord / DecisionItem / HandoffPackage：质量、决策与交接沉淀
```

因此，多智能体协同不应被理解为“多个聊天窗口互相说话”，而应被理解为：多个智能体围绕同一组任务票据、依赖关系、完成标准、产物和证据链协同推进。

---

## 2. 当前项目即智能软件工厂雏形

当前 `agent-team` 项目本身已经是智能软件工厂的一个简化样本。项目推进过程中形成的文档、任务流、工具脚本、评审报告和交接记录，可以直接映射到软件工厂产品对象。

| 智能软件工厂概念 | 当前项目中的映射 | 当前落地形态 |
|---|---|---|
| Project | agent-team 项目 | GitHub 仓库 + docs 目录 |
| ProjectRepository / 事实源 | GitHub main + 沙箱工作区 | 文档、代码、原型、报告 |
| Stage / Plan | 阶段计划、路线图 | `docs/plans/` |
| WorkPackage / TaskFlowGroup | 一组有序 TaskFlow 的工作包 | `docs/tasks/*.md` 主文档，如 `TF-GF-IMPL` |
| TaskFlow | `TF-DOC-STRUCT`、`TF-POC-MD`、`TF-GF-IMPL-01/02/03/04` | 结构化 Markdown 任务流 / 执行记录 |
| TaskTicket / Node | 每个任务流节点 | Markdown 表格 + `TASKFLOW:STATUS` |
| Worker / Agent | ChatGPT、OpenCode、后续数字员工 | 任务执行者 / 评审者 / 协同规划者 |
| Artifact | 文档、脚本、原型、运行记录 | `docs/specs`、`tools`、`docs/tasks/runs` |
| Evidence | 命令输出、截图、评审报告、QA 结果 | `docs/reports`、验证日志 |
| ReviewRecord | 独立评审与质量结论 | `docs/reports/*Review*.md` |
| DecisionItem / Blocker | 用户确认、关键取舍、阻塞 | 任务流门禁 / 待决策记录 |
| HandoffPackage | 交接说明、阶段总结 | handoff / reports / runs |
| DesignImplementationSync | 设计与实现的双向回写 | TaskEvent / ReviewRecord / DecisionItem / HandoffPackage |

---

## 3. 单智能体工厂与多智能体工厂

### 3.1 单智能体工厂：skill + 文档驱动

对于简单项目或早期 POC，可以使用 `taskflow` skill、结构化 Markdown、运行记录和评审报告形成“单智能体工厂”。

```text
用户目标
  → TaskFlow 计划
  → TaskTicket / Node
  → 单个智能体执行
  → Artifact / Evidence
  → Review / Decision / Handoff
```

这里的 `taskflow` skill 可以视为简化版软件工厂引擎：它不承担完整调度系统职责，但已经具备最小的计划、执行、门禁、证据和审计能力。

### 3.2 多智能体工厂：平台化 TaskFlow 协同

复杂大项目需要进入产品化智能软件工厂，由多个智能体围绕 TaskFlow / TaskTicket 协同推进。

```text
Project / Stage / Plan
  → WorkPackage / TaskFlowGroup
      → TaskFlow
      → TaskTicket A：协同规划岗
      → TaskTicket B：开发与测试岗
      → TaskTicket C：评审 / 验收岗
      → TaskTicket D：专家评审岗
  → TaskEvent / Artifact / Evidence / ReviewRecord / DecisionItem
```

平台层需要补足单智能体 skill 不具备的能力：任务分配、并行依赖、Runtime 状态、超时处理、跨智能体交接、冲突检测和用户验收门禁。

---

## 4. 当前能力建设路线

| 阶段 | 名称 | 目标 | 当前任务流 | 状态 | 对软件工厂的意义 |
|---|---|---|---|---|---|
| A | TaskFlow First 原则收口 | 明确软件工厂核心不是对话，而是任务流 | TF-DOC-MERGE-02 / TF-PLAN-ALIGN-01 | 进行中 | 建立产品设计主线 |
| B | 结构化任务契约 | 让任务可描述、可执行、可验收 | TF-DOC-STRUCT-01 | 已完成 | 建立 TaskFlow / TaskTicket 文档化契约 |
| C | Markdown TaskTicket POC | 验证任务流可被脚本读取、更新、审计 | TF-POC-MD-01 | 已完成，重跑通过 | 证明文档驱动的单智能体工厂可行 |
| D | Guarded Flow 门禁 | 增加依赖、阻塞、决策、验证失败等门禁 | TF-GUARDED-FLOW-01、TF-GF-IMPL-01/02/03 | 进行中 | 让任务流从“清单”变成“受控执行链” |
| E | 恢复与交接 | 记录暂停、恢复、交接和返工过程 | TF-GF-IMPL-04 | 待执行 | 支撑长程任务不中断、不丢上下文 |
| F | 产品化评审 | 把 Markdown POC 映射为产品对象 | TF-GF-REVIEW-01 | 待执行 | 进入多智能体工厂设计 |
| G | Runtime / UI / 自动调度 | 连接真实数字员工、工作区和产品界面 | TF-RUNTIME-DESIGN-01、TF-FACTORY-UI-01 | 后续 | 形成平台级智能软件工厂 |

---

## 5. 当前 plans / tasks 的使用口径

- `docs/plans/TF-GUARDED-FLOW-ROADMAP-v0.6.33.45.md`：作为 Guarded Flow 子路线图，说明阶段目标和能力演进。
- `docs/tasks/TF-GF-IMPL-v0.6.33.45.md`：作为 GF-IMPL 工作包 / TaskFlowGroup，维护 01/02/03/04 的状态、已落地能力和下一步。
- `SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`：作为 TaskFlow / TaskTicket / WorkPackage 产品对象子设计。
- `SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`：作为 skill 经验向产品引擎映射的设计说明。

本次 DOC-CLOSEOUT 后，早期历史建议文件、补丁文件、过程性 run / report 已从 docs 包中清理；可复用内容已沉淀到路线图、工作包、指南、模板和子设计。

---

## 6. 后续推进建议

1. 先完成 `TF-GF-IMPL-04｜恢复记录最小实现`，补齐暂停 / 恢复 / 追加事件能力。
2. 再做 `TF-GF-REVIEW-01｜产品化映射评审`，判断单智能体工厂经验如何进入多智能体软件工厂产品。
3. 然后再进入 Runtime / UI / 多智能体调度设计，避免在 TaskFlow / TaskTicket 未稳定前过早做复杂调度。

---

## 7. 边界

本文不引入新的数据库模型、完整状态机、Runtime 自动调度或任务锁；它只用于说明当前项目计划与智能软件工厂产品理论之间的映射关系，并指导后续任务流优先级。
