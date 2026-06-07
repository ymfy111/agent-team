# 智能软件工厂系统设计方案

> 版本：v0.6.33  
> 文档更新批次：2026-06-01 00:03:23 +0800 / 生成层定位与五层架构映射同步
> 最新原型安全基线：v0.6.33.45  
> 状态：补充“主智能体任务清单驱动 → 轻量状态约束 → 程序状态机编排 → Runtime 工厂化调度”的分阶段系统设计。

---

## 0. 本次设计调整

本次调整的核心不是引入更复杂的系统，而是明确**分阶段演进边界**，避免一开始就过度设计完整状态机。

设计结论：

```text
第一阶段：主智能体驱动任务清单，系统持久化计划、任务单和任务事件。
第二阶段：引入轻量状态约束，防止任务状态乱跳。
第三阶段：程序状态机逐步接管常规流转，主智能体只在规划、重规划、阻塞判断等关键节点参与。
第四阶段：接入多 RuntimeHost / RuntimeNode，实现工厂化调度、恢复、统计和审计。
```

---

## 1. 架构原则

```text
1. 任务单是协作事实来源，不是聊天记录。
2. 主智能体负责规划、拆解、判断和重规划。
3. 子智能体负责执行、验证、审查等具体任务。
4. 主子智能体可以交换反馈，但反馈必须回写为 TaskEvent、ExecutionResult、ReviewRecord 或 DecisionItem。
5. 程序负责持久化、轻量门禁、状态展示、路由和后续自动调度。
6. Markdown 保留为人和智能体友好的上下文载体，但需要结构化元数据供程序读取。
```


### 1.1 五层架构定位

当前系统设计应纳入 AI 原生应用平台的五层能力体系：

```text
输入层 · 源      业务目标、制度规范、流程、指标、数据接口、知识案例
语义层 · 懂      概念、关系、规则、指标、流程、场景，形成业务本体语义底座
生成层 · 建      应用建模与代码生成，是智能软件工厂当前产品主战场
执行层 · 行      ORCH、task-runner、task-batch-runner、RuntimeGateway、数字员工执行
治理层 · 治      QA、Review、DecisionPacket、Evidence、版本、审计、风险和持续演进
```

智能软件工厂当前应优先做实 **生成层**：通过 `Plan → Stage → WorkItem → Task → Step` 的动态工作流，把业务输入和语义底座转化为应用蓝图、页面、服务、配置、测试和发布准备，并由执行层与治理层持续回写状态。

系统边界因此调整为：RuntimeGateway、OpenCode RuntimeNode、Workspace、日志和诊断是执行层支撑；首页和主业务页面不应退化为 Runtime 资源看板或 Web IDE，而应围绕生成活动、员工活动、生成产物、待决策和验收闭环组织信息。

详见：`docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`。

---

## 2. 分阶段演进架构

### 2.1 阶段 A：Agent-led Task List

主智能体驱动任务清单。

```text
用户目标
→ PlannerAgent 生成 ProjectPlan
→ PlannerAgent 拆解 TaskTicket
→ 系统保存计划和任务清单
→ 程序调用 WorkerAgent 执行任务
→ WorkerAgent 回写 TaskEvent / ExecutionResult
→ PlannerAgent 根据任务反馈维护任务清单变化
```

该阶段的系统重点是持久化、可视化和轻量调用，不做复杂状态机。

### 2.2 阶段 B：Guarded Task Flow

引入轻量状态约束。

最小状态：

```text
TODO
RUNNING
REVIEWING
NEEDS_DECISION
DONE
```

允许的基础流转：

```text
TODO → RUNNING
RUNNING → REVIEWING
REVIEWING → DONE
REVIEWING → RUNNING        # 返工
REVIEWING → NEEDS_DECISION
NEEDS_DECISION → RUNNING / DONE
```

程序在该阶段负责防止非法跳转，例如未审查直接完成、未处理待决策直接完成等。

### 2.3 阶段 C：State-machine Orchestration

程序状态机开始调度常规流程。

```text
PLANNING          调用协同规划岗
RUNNING           调用实现验证岗
REVIEWING         调用交付审查岗
NEEDS_DECISION    推送待决策工作台
REWORK            回到实现验证岗
REPLAN            调用协同规划岗重规划
```

主智能体从“全程调度者”逐步转为“关键判断节点”。

### 2.4 阶段 D：Factory Runtime Orchestration

接入运行体工厂化能力：

```text
RuntimeHost
RuntimeNode
RuntimeGateway
WorkerRuntimeBinding
WorkspaceBinding
SkillSnapshot
Workspace
AgentRoute
RuntimeDiagnostics
ToolPermissionProfile
ExecutionLease
Heartbeat
RetryPolicy
AuditLog
```

该阶段支持多项目、多团队、多数字员工并发、失败恢复、超时处理、工具权限和运行统计。

阶段 D 的设计原则是：**不要把智能软件工厂做成 Web IDE，而是把 Web IDE/Gateway 能力变成数字员工运行体的基础设施**。因此，RuntimeGateway / Workspace / 文件 / 终端 / 日志能力不应成为产品主入口，而应作为 TaskFlow、数字员工、任务证据、故障诊断和执行租约的底层支撑。

阶段 D 可借鉴 CoStrict Cloud 的设备注册、设备侧 daemon、工作空间绑定、连接路由和诊断入口，但必须保持 TaskFlow First：用户先围绕计划、工作项、任务流和数字员工推进交付，必要时才下钻到运行体和工作空间。

---

## 3. 核心数据对象

第一阶段只设计最小对象，避免过度设计。

### 3.1 ProjectPlan

```yaml
planId: PLAN-001
projectId: PROJ-HR-MIGRATION
goal: HR 代码迁移从 Vue2/ElementUI 迁移到 Vue3/Ant Design Vue
assumptions:
  - 保持后端接口不变
  - 先迁移高频页面
createdByAgentId: emp-planner-1
createdAt: 2026-05-21T10:00:00+08:00
updatedAt: 2026-05-21T10:30:00+08:00
```

### 3.2 TaskTicket

```yaml
taskId: TASK-001
projectId: PROJ-HR-MIGRATION
title: 用户管理页面迁移
description: 将用户管理页面迁移到 Vue3 + Ant Design Vue
ownerRole: implementer
ownerAgentId: emp-impl-1-1
status: TODO
priority: P1
nextStep: 执行页面组件迁移
artifactRefs:
  - src/pages/user/UserList.vue
updatedAt: 2026-05-21T10:30:00+08:00
```

### 3.3 TaskEvent

```yaml
eventId: EVT-001
taskId: TASK-001
type: EXECUTION_FEEDBACK
fromAgentId: emp-impl-1-1
toAgentId: emp-planner-1
summary: 已完成页面迁移，分页逻辑待复核
createdAt: 2026-05-21T11:20:00+08:00
```

### 3.4 ReviewRecord

```yaml
reviewId: REV-001
taskId: TASK-001
reviewerAgentId: emp-review-1-1
result: REWORK
issues:
  - 分页边界缺少验证说明
requiredFixes:
  - 补充分页验证记录
createdAt: 2026-05-21T12:00:00+08:00
```

### 3.5 DecisionItem

```yaml
decisionId: DEC-001
taskId: TASK-001
question: 是否保留旧页面导出字段顺序？
options:
  - 保持旧顺序
  - 按新设计排序
recommendation: 保持旧顺序以降低迁移风险
status: OPEN
createdAt: 2026-05-21T12:20:00+08:00
```

---

## 4. 结构化 Markdown 文件设计

### 4.1 原则

```text
Markdown 正文面向人和智能体。
YAML Front Matter 面向程序。
带标记区块面向安全局部更新。
JSONL Event Log 面向追加式事件记录。
```

### 4.2 建议目录

```text
project-workspace/
  plan/
    PLAN.md
  tasks/
    TASK-001.md
    TASK-002.md
  reviews/
    REV-001.md
  decisions/
    DEC-001.md
  events/
    TASK-001.events.jsonl
  artifacts/
    ...
```

### 4.3 程序更新策略

```text
1. 程序读取 Front Matter 字段做筛选、状态判断和路由。
2. 程序只更新 front matter 或带 start/end 标记的区块。
3. 长历史不反复改写 Markdown，追加到 events/*.jsonl。
4. 智能体可以基于 Markdown 正文理解任务上下文。
5. 如后期接入 DB，Markdown 仍作为人和智能体可读视图保留。
```

---

## 5. 主子智能体通讯模型

不采用“自由群聊作为事实来源”的模式。

允许的通讯包括：

```text
任务执行内的澄清
执行结果汇报
审查返工意见
主智能体重规划请求
```

所有通讯必须形成结构化记录：

```text
ClarificationEvent
ExecutionFeedbackEvent
ReviewEvent
ReplanEvent
DecisionEvent
```

不允许：

```text
主智能体口头安排任务但不创建任务单。
子智能体私下完成工作但不回写状态。
审查意见只存在于聊天记录。
待决策事项不进入待决策工作台。
多子智能体自由互相聊天决定全局流程。
```

---

## 6. 与行业参考能力的关系

OpenCode 的 primary agents / subagents、Claude Code Agent Teams / Subagents / Hooks、LangGraph 的长任务状态化执行、Magentic-One 的 Task Ledger / Progress Ledger，都说明业内正在从“单次对话式 Agent”走向“任务清单、状态、编排器、人机门控”的方向。CoStrict Cloud 则从另一个角度说明：Web 控制面可以通过设备侧 Gateway 连接本地 / 私有服务器上的执行体、工作空间、日志与诊断能力。

本系统不直接依赖某一个实现作为核心架构，而是将这些能力抽象为：

```text
Agent Runtime            OpenCode / Claude Code / Codex 等底层执行体
TaskTicket               系统事实来源
TaskEvent                执行反馈与通讯记录
PlannerAgent             协同规划岗
WorkerAgent              实现验证岗
ReviewerAgent            交付审查岗
DecisionWorkbench        用户待决策入口
RuntimeGateway           设备侧执行体接入、连接代理与诊断边界
RuntimeBinding           数字员工到运行体的绑定
WorkspaceBinding         项目 / 数字员工 / 工作目录 / 技能快照绑定
AgentRoute               Web / agent-web-kit 到具体运行体会话的路由
ExecutionLease           后续防止多任务并发写同一工作空间的租约
```

参考资料包括：

```text
OpenCode Agents: https://opencode.ai/docs/agents/
Claude Code Agent Teams: https://code.claude.com/docs/en/agent-teams
Claude Code Hooks: https://code.claude.com/docs/en/hooks
LangGraph Overview: https://docs.langchain.com/oss/python/langgraph/overview
Magentic-One: https://www.microsoft.com/en-us/research/articles/magentic-one-a-generalist-multi-agent-system-for-solving-complex-tasks/
```

---

## 7. 对现有原型的系统设计影响

```text
首页协作全景：保持，解释为任务单状态和团队运行态聚合视图。
项目健康总表：保持，解释为 ProjectTaskLedger / Progress Ledger 视图。
团队详情页：保持，强化“组长维护任务清单”的解释。
待决策工作台：保持，作为 NEEDS_DECISION / Human-in-the-loop 节点。
员工 Runtime 绑定页：保持，作为阶段 D 的运行体编排预留。
岗位 / 技能页：保持，作为 AgentTemplate / TemplateSkillMapping / SkillSnapshot 表达。
Runtime / Gateway 辅助入口：后续可增加 RuntimeHost、WorkspaceBinding、AgentRoute、Diagnostics 和 Lease 冲突视图，但必须服务于任务流和数字员工，不把原型改成 Web IDE。
```

后续原型改动建议采用“任务流优先、运行体辅助”的表达方式：

1. 在协作全景增加运行体健康摘要，如在线主机数、占用工作区、异常运行体。
2. 在数字员工详情 / 抽屉展示 RuntimeHost、WorkspaceBinding、AgentRoute、最近心跳、当前任务绑定。
3. 在待决策面板增加 Runtime 异常、Lease 冲突、Workspace 占用等待处理类型。
4. 在管理视图预留 RuntimeHost 列表和 Diagnostics 面板。
5. 不把首页、员工页或项目页改成文件编辑器 / 终端 / Web IDE 中心。
---

## 8. 结构化 Markdown 文档族

第一阶段不直接以数据库或完整状态机作为唯一事实来源，而采用一组结构化 Markdown 文档作为任务协作载体：

| 文档 | 路径示例 | 程序读取部分 | 人 / 智能体读取部分 |
|---|---|---|---|
| 项目计划 | `plan/PLAN.md` | Front Matter 中的计划状态、当前焦点、任务数量 | 项目目标、关键假设、任务摘要、计划调整记录 |
| 任务单 | `tasks/TASK-001.md` | status、ownerAgentId、priority、nextStep、decisionRequired | 任务说明、输入上下文、执行要求、执行反馈 |
| 待决策 | `decisions/DEC-001.md` | status、priority、recommendedOption、resolvedBy | 问题、选项、推荐方案、风险影响、处理结果 |
| 审查记录 | `reviews/REV-001.md` | result、requiresRework、requiresDecision | 审查对象、发现问题、返工要求、后续流转建议 |
| 事件日志 | `events/*.jsonl` | 追加式事件记录 | 作为审计与恢复材料 |

程序更新原则：

```text
1. 优先更新 Front Matter 和明确标记区块。
2. 不整体重写 Markdown 正文，避免覆盖人和智能体写入的上下文。
3. 状态变化、执行反馈、审查结论和用户决策应追加 TaskEvent / JSONL 事件。
4. 后期如接入数据库，Markdown 仍作为可读视图和 Git 归档物保留。
```

## 9. UI 契约与底层编排解耦

系统设计新增一条约束：**用户界面与底层编排机制解耦**。

UI 层稳定暴露项目、团队、岗位、任务单、产出、审查、待决策与下一步动作；底层可按阶段从 Agent-led Task List 演进到 Guarded Task Flow、State-machine Orchestration 和 Factory Runtime Orchestration。

### 9.1 UI 契约

无论底层处于哪个阶段，前端展示契约保持：

```text
Project -> Team -> Role Output -> TaskTicket -> Review / Decision -> Next Action
```

前端不应依赖具体实现为“主智能体自由调度”还是“程序状态机调度”。后端或 Mock 层只需提供用户可见字段：

- project.health / project.progress / project.nextAction
- team.currentFocus / team.pendingReviews / team.pendingDecisions
- roleOutputs.planner / roleOutputs.implementer / roleOutputs.reviewer
- taskTicket.status / owner / output / nextStep
- decisionItem.question / recommendation / impact

### 9.2 Mock 到真实实现的兼容

v0.6.33.30 原型中的岗位产出与下一步动作字段可由 Mock 数据、结构化 Markdown Front Matter、数据库任务表或状态机执行结果生成。UI 不关心来源，只关心是否能稳定呈现项目推进和岗位产出。

## 10. task / taskflow 技能实践对系统设计的参考

本项目在原型、文档和交付过程中形成了两层技能实践：

```text
task      = 单任务质量闭环
taskflow  = 长程任务清单编排，按节点调用 task(managed)
```

该实践不作为最终产品功能直接照搬，但可作为智能软件工厂运行机制的参考样式。

### 10.1 与智能工厂设计对象的对应关系

| 技能实践 | 智能工厂设计映射 | 说明 |
|---|---|---|
| taskflow | 协同规划岗 / 主智能体维护任务流 | 负责读取任务清单、选择下一任务、控制顺序、更新状态和阶段汇总 |
| task | 单个 TaskTicket 的执行闭环 | 负责一个任务的计划、执行、验证、评审、修复和交付 |
| task(managed) | 被编排的无人值守子任务 | 在任务流内部执行，不逐项中断用户确认 |
| 任务流进度图 | 项目 / 任务流可视化 | 展示全貌、当前节点、完成情况和阻塞位置 |
| 暂停门禁 | 待决策 / 阻塞 / 质量不收敛 | 遇到 P0/P1、范围变更、关键决策、依赖缺失时暂停 |
| 评审追踪表 | ReviewRecord / QualityGate | 记录评审发现、处理决定、实际修改和关闭状态 |
| 前后截图对比 | UI 变更证据 / QA Artifact | 支撑可视化验收和回归判断 |

### 10.2 direct 与 managed 两种任务调用模式

`task` 的两种调用模式可映射为智能工厂的两类任务入口：

```text
direct：用户直接发起一个明确任务，执行前必须确认任务计划。
managed：taskflow / 协同规划岗已确认整体任务流，子任务按计划执行，不逐项中断。
```

这为后续系统设计提供一个重要原则：

> 单任务可以被用户直接发起，也可以被任务流编排器调用；两者使用相同质量闭环，但交互门禁不同。

### 10.3 对 Agent-led Task List 的启发

当前第一阶段仍建议采用 Agent-led Task List，不直接做完整状态机。`taskflow` 实践说明，外层编排可以先由主智能体或流程控制器读取结构化 Markdown 任务清单，按依赖和状态推进任务；每个任务仍由 `task` 风格的质量闭环完成。

最小实现可采用：

```text
FLOW.md           任务流清单，记录节点顺序、依赖、模式、当前状态
TASK-*.md         单任务结构化 Markdown
FLOW-REPORT.md    阶段执行汇总
QA artifacts      截图、对比图、评审追踪表
```

### 10.4 对后续程序状态机的启发

当任务量和并发复杂度上升后，`taskflow` 中的以下规则可逐步产品化：

```text
1. 按依赖选择下一个可执行任务。
2. task 执行结果回写任务流状态。
3. 暂停门禁变为系统状态：BLOCKED / NEEDS_DECISION / QUALITY_NOT_CONVERGED。
4. 评审追踪变为 ReviewRecord。
5. 前后截图和验证结果变为 QA Artifact。
6. 节点流程图变为项目健康和任务流进度视图。
```

### 10.5 约束

该实践只作为设计参考，不应导致 UI 过度技术化。普通用户界面仍应稳定呈现：项目、团队、岗位、任务单、产出、审查、待决策和下一步动作；不直接暴露 `taskflow`、`managed`、状态机、TaskEvent 等实现细节。

## 11. taskflow 暂停/恢复机制与智能工厂待决策参考

`taskflow v0.3` 的暂停/恢复机制进一步验证了智能工厂“待决策”设计的必要性。长程任务在推进过程中并不总是失败或完成，常见情况是：当前节点需要用户补充信息、确认范围、做业务取舍或处理质量门禁。

### 11.1 暂停不是失败

在智能工厂中，任务单进入待决策或阻塞状态时，不应被视为失败，而应视为可恢复的中间状态。

```text
RUNNING → NEEDS_DECISION → WAITING_USER → RUNNING / REVIEWING / REPLAN
```

对应到 `taskflow`：

| taskflow 暂停字段 | 智能工厂设计字段 | 说明 |
|---|---|---|
| pauseReason | DecisionItem.reason / Blocker.reason | 暂停原因 |
| currentNode | TaskTicket.currentStep | 当前任务位置 |
| completedNodes | TaskTicket.completedSteps | 已完成工作 |
| pendingNodes | TaskTicket.pendingSteps | 未完成工作 |
| requiredUserInput | DecisionItem.question | 需要用户补充或确认的信息 |
| resumePoint | TaskTicket.resumePoint | 用户处理后的恢复位置 |

### 11.2 恢复机制

用户处理待决策后，系统应支持从暂停点恢复，而不是重新执行整个任务流。恢复时应保留已完成产物、评审结论和执行记录，仅对受影响节点重新规划或继续执行。

### 11.3 串行技能流与多智能体工厂的边界

`taskflow` 是单智能体依赖技能和结构化任务清单完成长程任务的串行模式；智能工厂是多智能体协同系统，后者需要额外处理：

- 多个数字员工并行执行；
- 同一项目内的任务依赖与冲突；
- 跨团队任务优先级；
- RuntimeHost / RuntimeNode 资源调度；
- 审查队列和返工队列；
- 并发失败恢复与重试。

因此，`taskflow` 只能作为智能工厂“任务流、暂停/恢复、质量门禁、用户决策”的轻量参考，不能直接替代智能工厂完整编排引擎。


## 12. task v0.5.1 / taskflow v0.4.1 对系统设计的补充参考

### 12.1 单任务闭环与任务流编排必须分层

`task v0.5.1` 修正了一个重要边界：用户触发“任务执行”时，只能进入单任务闭环，不应展示任务流节点图；只有触发“任务流执行”时，才进入 taskflow 的工作项编排。

该经验映射到智能软件工厂中，就是：

- 单个 `TaskTicket` 应由一个明确岗位或数字员工完成闭环；
- 跨任务、跨阶段、跨岗位的编排才进入任务流 / 项目流；
- 不应把一个任务内部的简单步骤提升为系统级任务流节点。

### 12.2 SOW 选择对应项目工作项范围确认

`taskflow v0.4.1` 增加了 SOW 选择阶段：当用户未明确任务清单时，先列候选工作项，由用户选择后再生成任务流。

智能工厂可借鉴该机制：项目进入执行前，协同规划岗应先形成本轮工作项边界，系统再持久化为计划和任务单，而不是直接假设所有待办都属于当前执行范围。

### 12.3 节点颗粒度规则对应任务单拆分原则

任务流节点应代表可交付、可评审、可验收的工作项；简单编辑、单文件小修、一次截图等不应成为独立节点。

对应到智能工厂，任务单拆分应满足至少以下条件之一：

- 有独立产物；
- 有独立责任人；
- 需要独立审查；
- 可能触发待决策；
- 失败后需要单独回滚或重做。

### 12.4 暂停/恢复/退出机制对应待决策与阻塞处理

`taskflow` 的暂停机制是可恢复的，适合作为智能工厂“待决策 / 阻塞 / 需补充信息”的轻量参考。

但智能工厂需要进一步处理多智能体并行场景：

- 一个任务暂停时，不一定阻塞其他并行任务；
- 待决策可能影响多个任务单；
- 恢复后可能需要重新规划任务依赖；
- Runtime 状态、工作区和产物版本需要同步。

### 12.5 真实计时与进度可观测

`taskflow v0.4.1` 要求没有真实计时记录时必须写“未精确计时”。这对智能工厂也适用：项目进度、任务耗时、执行状态不应只由智能体总结生成，必须尽量来自任务事件、状态字段或执行记录。


## v0.6.33.33 原型收口与 taskflow v0.6 设计参考

本次设计补充强调两条边界：

1. **用户界面稳定，底层机制演进**：原型继续围绕项目推进、岗位产出、审查、待决策展示，不向普通用户暴露 TaskEvent、状态机、结构化 Markdown 等底层实现词。
2. **taskflow v0.6 作为轻量参考模型**：taskflow 是单智能体串行任务流，智能工厂是多智能体协同系统。两者共享任务清单、质量门禁、暂停/待决策和评审追踪思想，但智能工厂还需要并行调度、资源冲突、审查队列、Runtime 状态同步等能力。

对原型的同步要求：

- 团队页不得继续显示已下架的“系统架构师 / 技术专家岗”作为用户可见岗位；相关评审能力应沉淀到交付审查岗、决策支持或后续后台机制中。
- 团队页应补充“岗位产出”摘要：协同规划岗输出计划和任务拆解，实现验证岗输出实现和验证反馈，交付审查岗输出审查结论与下一步建议。
- 任何任务流或状态机机制只作为设计/运行机制参考，不作为当前普通用户界面的主表达。


---

## 13. TaskFlow First 产品对象模型收口

当前产品对象模型以 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` 为专项设计事实源。主 SDD 保留总体架构口径：

```text
用户侧：计划 / 阶段 / 工作项 / 任务 / 步骤
设计侧：Plan / Stage / WorkItem / TaskFlow / TaskTicket
```

核心边界：

1. 用户与组长智能体对话；组长负责理解目标、解释状态、提出计划和决策建议。
2. Orchestrator 负责把确认后的意图转为结构化任务、消息、评审、决策和状态变更，并负责调度、状态、事件、超时、恢复和升级。
3. 大模型智能体完成真实认知和执行工作，包括需求、设计、计划拆解、任务执行和评审。
4. 软件工厂侧负责 WorkItem → TaskFlow；被指派执行智能体负责 TaskFlow → TaskTicket / 步骤。
5. 对话不是事实源；TaskFlow / TaskTicket / TaskEvent / EvidenceRef / ReviewRecord / DecisionItem / HandoffPackage 才是项目执行事实源。
6. Webhook 只作为加速信号，最终状态应以持久化事件账本和 Orchestrator 对账结果为准。

后续 `TF-LEADER-SKILL`、`TF-RUNTIME-ORCH`、`TF-FACTORY-UI` 应以该对象模型为前置输入。
