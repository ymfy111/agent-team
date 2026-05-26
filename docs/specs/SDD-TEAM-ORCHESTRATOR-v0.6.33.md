# SDD-TEAM-ORCHESTRATOR｜Team Orchestrator / 调度器子设计

> 文档类型：SDD 子设计 / 调度器与任务循环驱动设计  
> 当前基线：v0.6.33.45  
> 适用阶段：阶段 G｜Team Orchestrator / Task Loop Driver POC  
> 来源任务：TF-TEMP-ORCHESTRATOR-DESIGN-REVIEW-01  
> 状态：草案 / 作为后续实现 POC 与主 SDD 更新依据  

---

## 1. 背景与目标

智能软件工厂已确定以 `Task` 为事实主线，并引入 `Project Workspace` 的逻辑分区：共享事实源与源代码区。共享事实源解决了多智能体“看同一套事实”的问题，但还需要一个运行机制把被动智能体转成可持续推进任务的执行闭环。

本子设计关注 `Team Orchestrator / 调度器`：它不是大模型本身，而是围绕共享事实区、OpenCode RuntimeNode、TaskFlow Ledger 和运行日志构建的执行监督与循环驱动机制。

本设计目标：

1. 明确 Team Orchestrator 与 RuntimeGateway、OpenCode RuntimeNode、AgentTeam、Project 的关系。
2. 拆分调度器的两个能力：执行监督与智能体派发。
3. 先以单智能体正向流程 POC 跑通闭环，再逐步扩展异常处理、Decision Packet、OpenCode 本地联调和多智能体派发。
4. 避免过早进入复杂多智能体调度、完整状态机和 Web IDE 化。

---

## 2. 核心结论

### 2.1 调度器的职责拆分

Team Orchestrator 的调度能力分为两层：

```text
1. Execution Monitor / 执行监督器
   负责盯住计划、阶段、工作项、TaskFlow、TaskTicket 是否按状态推进，
   判断依赖是否满足、任务是否完成、是否阻塞、是否需要继续、是否需要用户决策。

2. Agent Dispatcher / 智能体派发器
   负责在多个数字员工之间选择合适执行者。
```

POC 阶段先实现执行监督闭环，派发策略简化为固定目标智能体，即所有可执行任务默认交给同一个 OpenCode RuntimeNode。待单智能体自动推进闭环稳定后，再扩展为按岗位、能力、负载、Lease、评审规则进行多智能体分配。

### 2.2 主动性来自运行机制，不来自模型本身

大模型本身是被动的，智能软件工厂中的“主动智能体”由运行时机制实现。

```text
大模型 = 被动大脑
OpenCode RuntimeNode = 具体执行壳
RuntimeGateway = 本地运行入口与承载层
TeamOrchestrator / Loop Driver = 定时或事件触发、读取任务、推动继续的主动机制
共享事实源 = 智能体醒来后读取的任务、状态、证据和上下文
```

因此，所谓“主动协同”不是让模型脱离控制自由行动，而是在共享事实源、任务约束、租约、权限和调度器控制下，让数字员工自动发现、领取、执行、交接任务。

### 2.3 先做单智能体正向闭环

第一阶段不做复杂分配，先验证最小闭环：

```text
共享事实源
  → Team Orchestrator 读取 WorkItem / TaskFlow
  → 选择下一个可执行节点
  → 发给默认 OpenCode / mock worker
  → 监听节点完成事件或约定口令
  → 更新 .taskflow 账本
  → 生成 TASK_<TaskId>.md
  → 继续下一个节点
```

该闭环跑通后，再逐步加入异常处理、Decision Packet、OpenCode Adapter、本地联调、Team / Gateway 承载关系和多智能体分配。

---

## 3. 与 Gateway / Project / AgentTeam 的关系

### 3.1 平台只联系 RuntimeGateway

平台后台不直接操作项目目录、不直接启动 OpenCode、不直接接触本地文件系统。平台保存“谁服务哪个项目”的期望状态，并向 RuntimeGateway 下发指令。

```text
Platform Control Plane
  → RuntimeGateway API
    → Gateway 本地拉取项目 / 准备工作区
    → Gateway 启动 TeamOrchestrator
    → Gateway 启动和初始化 OpenCode RuntimeNode
```

### 3.2 TeamOrchestrator 的归属与承载

TeamOrchestrator 逻辑上属于 `TeamProjectAssignment`，物理上由某个 `RuntimeGateway` 承载运行。

```text
TeamProjectAssignment
  - teamId
  - projectId
  - gatewayId
  - permissionScope
  - projectRepoUrl / projectSource
  - baseline
  - activeEmployees
  ↓
RuntimeGateway 启动 TeamOrchestratorSession
```

也就是说，编排器不是“永远属于某个网关的固定进程”，而是某个团队服务某个项目期间的运行会话。早期实现可以是一个团队级常驻/半常驻进程；后续产品化可由平台调度服务统一承载多个 Orchestrator Session。

### 3.3 Project Workspace 的逻辑分区

项目目录不保存团队绑定关系本身；TeamProjectAssignment 是平台侧对象。Gateway 可在本地运行目录保存 assignment/runtime manifest，但不应污染项目共享事实源和源代码区。

```text
Project Workspace
├── 共享事实源
│   ├── docs/project-memory.md
│   ├── docs/plans/
│   ├── docs/workitems/
│   ├── docs/tasks/<WorkItemId>/
│   ├── docs/reports/
│   ├── docs/specs/
│   └── .runtime/
└── 源代码区
    ├── apps/
    ├── packages/
    ├── services/
    ├── tests/
    └── build artifacts
```

项目记忆跟项目走，员工记忆跟员工走，运行账本跟任务走。

---

## 4. 关键对象

### 4.1 TeamOrchestratorSession

```yaml
TeamOrchestratorSession:
  sessionId: ORCH-001
  assignmentId: TPA-001
  teamId: TEAM-CORE
  projectId: PROJ-AGENT-TEAM
  gatewayId: GW-LOCAL-001
  projectWorkspacePath: /srv/agent-factory/projects/agent-team
  sharedFactsPath: /srv/agent-factory/projects/agent-team/docs
  taskflowLedgerPath: /srv/agent-factory/projects/agent-team/.taskflow
  status: running | paused | blocked | stopped | error
  mode: single_agent_poc | multi_agent
  defaultRuntimeNodeId: opencode-main-01
  heartbeatAt: datetime
```

### 4.2 TaskLoopDriver

Task Loop Driver 是 TeamOrchestrator 内的循环推进组件，负责监听 OpenCode RuntimeNode 的结构化事件，根据 TaskFlow 状态、Lease、完成标准和停止口令判断是否继续，并以协议化 continue 指令推动模型进入下一节点。

```yaml
TaskLoopDriver:
  driverId: LOOP-001
  orchestratorSessionId: ORCH-001
  targetRuntimeNodeId: opencode-main-01
  maxRounds: 20
  maxDurationMinutes: 120
  stopTokens:
    - TASK_FLOW_DONE
    - NEED_USER_DECISION
    - BLOCKED
    - FAILED
```

### 4.3 TaskDispatchPacket

普通任务执行时发送给智能体的结构化任务包。

```yaml
TaskDispatchPacket:
  workItemId: TF-RUNTIME-ORCH-POC
  taskId: TF-RUNTIME-ORCH-POC-01
  assignee: p1
  recommendedSkill: taskflow
  goal: 完成单智能体正向流程闭环
  scope: 只执行当前 Task，不执行下一个 Task，不扩大范围
  inputRefs:
    - docs/workitems/TF-RUNTIME-ORCH-POC.md
  expectedEvidence:
    - .runtime/exec/TF-RUNTIME-ORCH-POC/TF-RUNTIME-ORCH-POC-01.json
    - docs/tasks/TF-RUNTIME-ORCH-POC/TASK_TF-RUNTIME-ORCH-POC-01.md
  stopToken: TASK_DONE
```

### 4.4 DecisionPacket

当任务卡住时，编排器推进的对象不再是普通 Task，而是 DecisionItem。

```yaml
DecisionPacket:
  decisionId: DEC-TF-RUNTIME-ORCH-POC-01-001
  belongsTo: TF-RUNTIME-ORCH-POC-01 / N03
  reason: 当前实现需要选择是否引入 opencode-adapter skeleton，可能超出原 mock-only 范围
  context:
    - 原计划只做 mock adapter
    - 后续需要本地接 OpenCode 联调
    - 新增 adapter skeleton 不引入真实 OpenCode 依赖
  options:
    A: 本轮只做 mock adapter
    B: 同时加入 opencode-adapter skeleton
    C: 暂停等待用户确认
  recommend: B
  expectedOutput:
    - decision: choose_option_B
    - nextAction: resume N03
  stopToken: DECISION_RESOLVED
```

### 4.5 WorkerAdapter

WorkerAdapter 把编排器与具体执行者解耦。

```text
mock-adapter      沙箱内模拟执行，用于闭环验证
opencode-adapter  本地联调 OpenCode，用于真实执行
```

最小接口：

```text
sendTask(taskPacket)
waitForResult()
detectStatus()
writeEvidence()
```

---

## 5. 调度流转

### 5.1 正常任务流

```text
1. Orchestrator 读取共享事实源中的 WorkItem / TaskFlow
2. 找到依赖满足且未完成的下一个节点
3. 创建或更新 ExecutionLease
4. 生成 TaskDispatchPacket
5. 发送给默认 OpenCode RuntimeNode 或 mock worker
6. 监听 TASK_DONE / READY_FOR_NEXT
7. 更新 .taskflow 账本、TaskEvent、Evidence
8. 继续下一节点
9. 全部完成后生成 docs/tasks/<WorkItemId>/TASK_<TaskId>.md
```

### 5.2 决策处理流

```text
TaskTicket running
  ↓
blocked / decision_needed
  ↓
DecisionItem created
  ↓
Leader / Orchestrator receives DecisionPacket
  ↓
Decision resolved
  ↓
产生三种结果之一：
  1. resume 原任务
  2. adjust 修改原任务计划
  3. spawn 生成新任务 / 临时任务
```

单智能体 POC 中，普通 TaskDispatchPacket 和 DecisionPacket 都可发送给同一个默认智能体；区别在于 prompt 类型、完成标准、输出口令不同。

---

## 6. POC 演进路径

| 阶段 | 目标 | 说明 |
|---|---|---|
| POC-01 | 单智能体正向闭环 | 不接 OpenCode，使用 mock adapter，跑通读取任务、执行节点、账本、RUN。 |
| POC-02 | OpenCode Adapter 本地联调骨架 | 保留 mock 可跑，新增 opencode-adapter skeleton，用户本地接 OpenCode。 |
| POC-03 | 异常处理与 DecisionPacket | 支持 blocked / NEED_USER_DECISION / scope_change，生成 DecisionItem。 |
| POC-04 | Task Loop Driver | 监听结构化状态，自动发送 continue，直到完成或停止。 |
| POC-05 | Gateway 承载与启动协议 | 将 OrchestratorSession 作为 Gateway 承载对象，定义启动/停止/状态 API。 |
| POC-06 | 多智能体派发策略 | 从固定 default agent 扩展到按岗位、能力、负载、Lease 派发。 |

---

## 7. 边界与风险

### 7.1 当前不做

- 不做完整分布式调度系统。
- 不做多智能体并发执行。
- 不做 Web UI。
- 不直接接真实 OpenCode，除非进入本地联调任务。
- 不让编排器无约束地“无限自动聊天”。

### 7.2 必须控制

- 每次自动 continue 必须绑定明确 TaskFlow / Node / 完成标准 / 停止条件。
- 遇到 `NEED_USER_DECISION / BLOCKED / FAILED / maxRoundsExceeded / timeout` 必须停止自动推进。
- DecisionItem 不是普通任务，输出应是决策结果或下一步调整，而不是直接产物。
- POC 阶段所有任务默认派给一个目标智能体，避免过早引入多智能体调度复杂度。

---

## 8. 与后续文档和原型的关系

本子设计是 `TF-RUNTIME-ORCH-POC` 的设计依据。后续如果进入前端原型更新，可在 Runtime / Gateway / Team 相关页面增加：

- TeamOrchestratorSession 状态。
- 当前 WorkItem / TaskFlow / Node。
- 当前 default target agent。
- Loop Driver 状态、轮次、停止原因。
- DecisionItem 待处理入口。
- RUN 记录和 Diagnostics 下钻。

但前端仍应坚持 TaskFlow First，不能把主界面做成 Web IDE 或后台进程管理器。
