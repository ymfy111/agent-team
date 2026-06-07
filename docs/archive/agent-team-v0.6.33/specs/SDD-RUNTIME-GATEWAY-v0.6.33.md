# SDD-RUNTIME-GATEWAY｜RuntimeGateway 最小对象模型与接口设计

> 文档类型：SDD 子设计 / RuntimeGateway 设计  
> 当前基线：v0.6.33.45  
> 适用阶段：阶段 G｜Runtime / Gateway / UI / 自动调度  
> 状态：设计草案，供后续 POC / 后端实现 / 前端原型改造使用  

---

## 1. 背景与目标

智能软件工厂已经确定：**不要把智能软件工厂做成 Web IDE，而是把 Web IDE/Gateway 能力变成数字员工运行体的基础设施**。

进一步澄清后的运行边界是：

```text
平台后台 / 控制面
  只联系 RuntimeGateway API
    ↓
RuntimeGateway 在服务器本地执行实际动作
  - 拉取 / 更新项目
  - 准备 Project Workspace
  - 启动 TeamOrchestratorSession
  - 启动 / 初始化 OpenCode RuntimeNode
  - 下发 skills / MCP / AGENTS.md / memory snapshot
  - 上报心跳、状态、日志和诊断
```

本子设计的目标是定义 RuntimeGateway 的最小对象模型和接口草案，为后续 `TF-RUNTIME-GATEWAY-DESIGN`、`TF-RUNTIME-ORCH-POC`、`TF-FACTORY-UI-RUNTIME` 提供统一设计依据。

---

## 2. 设计原则

1. **平台保存期望状态，Gateway 落地运行状态**  
   平台保存 Project、AgentTeam、DigitalEmployee、TeamProjectAssignment 等元数据；Gateway 根据平台指令在本地拉取项目、创建工作区、启动编排器和运行体。

2. **平台后台不直接操作本地文件系统和 OpenCode**  
   所有本地动作都通过 RuntimeGateway API 执行，避免平台后台与具体机器路径、进程和权限耦合。

3. **TeamProjectAssignment 是平台侧对象**  
   AgentTeam 与 Project 不绑死。项目绑定关系由平台侧 `TeamProjectAssignment` 管理，不在项目目录中强制建立 `bindings/` 目录。

4. **Project Workspace 分为共享事实源和源代码区**  
   共享事实源维护计划、阶段、工作项、任务流、运行账本、运行日志、项目记忆和设计决策；源代码区维护代码、测试、构建和交付产物。

5. **TeamOrchestrator 逻辑属于 Assignment，物理由 Gateway 承载**  
   编排器不是永久属于某个网关的固定对象，而是某个 TeamProjectAssignment 激活期间的运行会话。

6. **OpenCode RuntimeNode 是数字员工的具体执行壳**  
   数字员工可独立创建，但只有加入 AgentTeam，且该 Team 绑定可用 RuntimeGateway 后，才能初始化具体 OpenCode RuntimeNode。

7. **Team 绑定 Gateway，成员运行体隐式初始化**  
   一个 RuntimeGateway 可以服务多个 AgentTeam；当前版本推荐一个 Team 默认绑定一个 RuntimeGateway。Team 成员加入后，由平台和 Gateway 隐式完成 RuntimeSandbox 分配、OpenCodeRuntimeNode 启动、DigitalEmployeeRuntimeBinding 建立，以及 skills / rules / MCP / memory 同步。

8. **网关注册是持久资源台账，心跳只更新状态**  
   RuntimeGateway 注册后不因心跳异常自动消失；离线或不可用时在界面置灰并保留关联关系。删除必须由用户手动触发，并检查 Team、RuntimeSandbox、OC、数字员工绑定和运行记录。

9. **先做最小可运行闭环，再扩展多智能体和异常流**  
   初期先支持一个团队、一个项目、一个默认执行者、一个 TeamOrchestrator 正向流程。多智能体派发、DecisionPacket、复杂权限和跨网关调度后续逐步增加。

---

## 3. 核心对象模型

### 3.1 RuntimeGateway

RuntimeGateway 是运行体承载层，负责接收平台控制面指令，并在本地服务器上执行项目准备、编排器启动、OpenCode 初始化、状态上报和诊断。

```yaml
gatewayId: gateway-001
name: team-a-gateway
hostLabel: dev-server-01
status: online | offline | degraded | error
version: 0.1.0
lastHeartbeatAt: 2026-05-26T03:40:00+08:00
capabilities:
  - opencode
  - nodejs
  - git
  - filesystem
workspaceRoot: /srv/agent-factory/projects
runtimeRoot: /srv/agent-factory/runtime
maxRuntimeNodes: 8
activeAssignments:
  - tpa-agent-team-demo-001
diagnostics:
  logsPath: /srv/agent-factory/runtime/gateway/logs
  apiDocsUrl: http://127.0.0.1:50110/api/v1/docs
```

### 3.2 TeamProjectAssignment

TeamProjectAssignment 是平台侧对象，表示某个团队在某段时间服务某个项目。

```yaml
assignmentId: tpa-agent-team-demo-001
projectId: proj-demo
agentTeamId: team-core
runtimeGatewayId: gateway-001
status: active | paused | completed | released | error
projectSource:
  type: git | local | uploaded
  repoUrl: git@github.com:ymfy111/agent-team.git
  branch: main
permissionScope:
  allowWriteSharedFacts: true
  allowWriteSource: true
  requireReviewForSourceMerge: true
currentBaseline: v0.6.33.45
createdAt: 2026-05-26T03:40:00+08:00
```

> 说明：该对象不要求写入项目目录。Gateway 可以在本地 runtime 目录保存 assignment manifest，但不应污染项目共享事实源和源代码区。

### 3.3 ProjectWorkspace

ProjectWorkspace 是 Gateway 本地准备出来的项目工作空间，逻辑上分为共享事实源与源代码区。

```yaml
projectWorkspaceId: pw-proj-demo-001
assignmentId: tpa-agent-team-demo-001
rootPath: /srv/agent-factory/projects/proj-demo
sharedFactsPath: /srv/agent-factory/projects/proj-demo/docs
taskflowLedgerPath: /srv/agent-factory/projects/proj-demo/.taskflow
sourcePath: /srv/agent-factory/projects/proj-demo/source
repoMode: mono-repo | split-shared-source | local-only
status: ready | preparing | error
```

当前 `agent-team` 仓库可作为逻辑分区处理：

```text
Project Workspace
├── docs/                  # 共享事实源
├── .runtime/              # 执行期运行态，默认不提交 Git
├── apps/                  # 源代码区
├── packages/              # 源代码区
└── tools/                 # 平台 / 联调工具，POC 阶段可存在，产品化时归 Gateway / 平台侧
```

### 3.4 ProjectContextSnapshot

ProjectContextSnapshot 是 Gateway 启动 TeamOrchestrator 和 OpenCode RuntimeNode 时注入的项目上下文。

```yaml
snapshotId: pcs-tpa-agent-team-demo-001-001
assignmentId: tpa-agent-team-demo-001
projectId: proj-demo
projectName: Demo Project
sharedFactsPath: /srv/agent-factory/projects/proj-demo/docs
workItemEntry: docs/workitems/
taskRecordPath: docs/tasks/<WorkItemId>/
projectMemoryPath: docs/project-memory.md
sourceCodePath: /srv/agent-factory/projects/proj-demo/source
currentBaseline: v0.6.33.45
permissions:
  canReadSharedFacts: true
  canWriteSharedFacts: true
  canWriteSource: true
```

### 3.5 TeamOrchestratorSession

TeamOrchestratorSession 是某个 TeamProjectAssignment 激活期间的团队级执行监督 / 循环驱动会话。

```yaml
orchestratorSessionId: orch-tpa-agent-team-demo-001
assignmentId: tpa-agent-team-demo-001
gatewayId: gateway-001
status: starting | running | paused | blocked | error | stopped
mode: single-agent | multi-agent
currentWorkItem: TF-RUNTIME-ORCH-POC
currentTaskFlow: TF-RUNTIME-ORCH-POC-01
defaultRuntimeNodeId: orn-leader-001
loopDriver:
  enabled: true
  maxRounds: 20
  stopTokens:
    - TASK_FLOW_DONE
    - NEED_USER_DECISION
    - BLOCKED
lastEventAt: 2026-05-26T03:40:00+08:00
```

### 3.6 RuntimeSandbox / OpenCodeWorkspace

RuntimeSandbox 是 RuntimeGateway 下的独立运行工位，也可称 OpenCodeWorkspace。它不是项目事实源本身，而是某台服务器上用于承载 OpenCodeRuntimeNode 的隔离工作区。

```yaml
sandboxId: rs-dev-001
gatewayId: gateway-001
name: p1-dev
directoryPath: /srv/agent-factory/runtime/sandboxes/p1-dev
status: available | bound | running | stopped | pending-reset | resetting | error | retired
boundEmployeeId: emp-dev-001
boundRuntimeNodeId: orn-dev-001
boundTeamId: team-core
boundProjectId: proj-demo
boundExecutionSessionId: pes-demo-001
createdAt: 2026-05-28T10:00:00+08:00
lastActiveAt: 2026-05-28T10:25:00+08:00
```

关键规则：

```text
RuntimeGateway 代表服务器级生产线资源；
RuntimeSandbox 代表生产线上的独立工位；
一个 RuntimeSandbox 同一时刻最多绑定一个 active OpenCodeRuntimeNode；
解绑后的沙箱不能直接复用，必须进入 pending-reset / resetting，清理旧员工状态后才能重新 available。
```

### 3.7 OpenCodeRuntimeNode

OpenCodeRuntimeNode 是某个数字员工对应的具体执行壳。

```yaml
runtimeNodeId: orn-dev-001
gatewayId: gateway-001
sandboxId: rs-dev-001
employeeId: emp-dev-001
assignmentId: tpa-agent-team-demo-001
status: idle | busy | blocked | offline | error
workspaceDir: /srv/agent-factory/projects/proj-demo/.workers/dev-001
projectContextSnapshotId: pcs-tpa-agent-team-demo-001-001
skillSnapshotVersion: skill-dev-v1
mcpSnapshotVersion: mcp-dev-v1
agentsMdSnapshotVersion: agents-dev-v1
memorySnapshotVersion: mem-dev-v1
currentTaskTicketId: null
lastHeartbeatAt: 2026-05-26T03:40:00+08:00
```

### 3.8 DigitalEmployeeRuntimeBinding

DigitalEmployeeRuntimeBinding 表示数字员工与具体 RuntimeSandbox / OpenCodeRuntimeNode 的运行绑定。

```yaml
bindingId: derb-emp-dev-001
employeeId: emp-dev-001
agentTeamId: team-core
assignmentId: tpa-agent-team-demo-001
gatewayId: gateway-001
sandboxId: rs-dev-001
runtimeNodeId: orn-dev-001
workspaceDir: /srv/agent-factory/projects/proj-demo/.workers/dev-001
status: active | inactive | migrating | error
boundAt: 2026-05-26T03:40:00+08:00
```

### 3.9 RuntimeDiagnostics

```yaml
diagnosticsId: diag-orn-dev-001
runtimeNodeId: orn-dev-001
status: healthy | warning | error
logs:
  - type: gateway
    path: /srv/agent-factory/runtime/gateway/logs/app.log
  - type: opencode
    path: /srv/agent-factory/projects/proj-demo/.workers/dev-001/logs/opencode.log
apiDocsUrl: http://127.0.0.1:50110/api/v1/docs
recentErrors: []
```

---

## 4. 最小启动流程

### 4.1 Assignment 激活

```text
1. 平台创建 / 激活 TeamProjectAssignment
2. 平台选择 RuntimeGateway
3. 平台向 Gateway 下发 activate-assignment 指令
4. Gateway 拉取或更新项目
5. Gateway 准备 ProjectWorkspace
6. Gateway 生成 ProjectContextSnapshot
7. Gateway 启动 TeamOrchestratorSession
8. Gateway 按团队成员初始化 OpenCodeRuntimeNode
9. RuntimeNode 注入 skills / MCP / AGENTS.md / memory snapshot / ProjectContextSnapshot
10. Gateway 上报 assignment-ready
```

### 4.2 TeamOrchestrator 正向闭环

```text
TeamOrchestrator
  → 读取共享事实源 docs/workitems / .taskflow
  → 找到下一个可执行 TaskFlow / TaskTicket
  → 创建或确认 ExecutionLease
  → 发送 Task Packet 给默认 OpenCodeRuntimeNode
  → 监听 TASK_DONE / TASK_FLOW_DONE
  → 更新 .taskflow 账本
  → 生成 docs/tasks/<WorkItemId>/TASK_<TaskId>.md
  → 继续或停止
```

### 4.3 停止与释放

```text
1. 平台下发 stop-assignment / pause-assignment
2. Gateway 通知 TeamOrchestrator 进入暂停或停止
3. TeamOrchestrator 完成当前安全点记录
4. Gateway 停止或挂起 OpenCodeRuntimeNode
5. Gateway 上传状态摘要和诊断信息
6. 平台更新 Assignment 状态
```

---

## 5. Gateway API 草案

> 本节为接口草案，不代表最终后端实现。当前目标是统一平台后台与 Gateway 的边界。

### 5.1 注册与心跳

```http
POST /api/v1/gateway/register
POST /api/v1/gateway/heartbeat
GET  /api/v1/gateway/status
```

示例：

```json
{
  "gatewayId": "gateway-001",
  "version": "0.1.0",
  "status": "online",
  "capabilities": ["opencode", "git", "nodejs"],
  "maxRuntimeNodes": 8,
  "activeRuntimeNodes": 2,
  "activeAssignments": ["tpa-agent-team-demo-001"]
}
```

### 5.2 Assignment 生命周期

```http
POST /api/v1/assignments/{assignmentId}/activate
POST /api/v1/assignments/{assignmentId}/pause
POST /api/v1/assignments/{assignmentId}/resume
POST /api/v1/assignments/{assignmentId}/stop
GET  /api/v1/assignments/{assignmentId}/status
```

`activate` 请求示例：

```json
{
  "assignmentId": "tpa-agent-team-demo-001",
  "project": {
    "projectId": "proj-demo",
    "sourceType": "git",
    "repoUrl": "git@github.com:ymfy111/agent-team.git",
    "branch": "main"
  },
  "agentTeam": {
    "agentTeamId": "team-core",
    "employeeIds": ["emp-leader-001", "emp-dev-001"]
  },
  "policy": {
    "mode": "single-agent",
    "defaultEmployeeId": "emp-leader-001"
  }
}
```

### 5.3 Project Workspace

```http
POST /api/v1/workspaces/prepare
POST /api/v1/workspaces/sync
GET  /api/v1/workspaces/{projectWorkspaceId}/status
```

返回：

```json
{
  "projectWorkspaceId": "pw-proj-demo-001",
  "status": "ready",
  "sharedFactsPath": "/srv/agent-factory/projects/proj-demo/docs",
  "taskflowLedgerPath": "/srv/agent-factory/projects/proj-demo/.taskflow",
  "sourceCodePath": "/srv/agent-factory/projects/proj-demo/source"
}
```

### 5.4 TeamOrchestratorSession

```http
POST /api/v1/orchestrators/start
POST /api/v1/orchestrators/{sessionId}/pause
POST /api/v1/orchestrators/{sessionId}/resume
POST /api/v1/orchestrators/{sessionId}/stop
GET  /api/v1/orchestrators/{sessionId}/status
GET  /api/v1/orchestrators/{sessionId}/events
```

### 5.5 OpenCode RuntimeNode

```http
POST /api/v1/runtime-nodes/start
POST /api/v1/runtime-nodes/{runtimeNodeId}/stop
POST /api/v1/runtime-nodes/{runtimeNodeId}/restart
GET  /api/v1/runtime-nodes/{runtimeNodeId}/status
GET  /api/v1/runtime-nodes/{runtimeNodeId}/logs
```

`start` 请求示例：

```json
{
  "employeeId": "emp-dev-001",
  "assignmentId": "tpa-agent-team-demo-001",
  "projectContextSnapshotId": "pcs-tpa-agent-team-demo-001-001",
  "runtimeProfileSnapshot": {
    "skillSnapshotVersion": "skill-dev-v1",
    "mcpSnapshotVersion": "mcp-dev-v1",
    "agentsMdSnapshotVersion": "agents-dev-v1",
    "memorySnapshotVersion": "mem-dev-v1"
  }
}
```

### 5.6 Diagnostics

```http
GET /api/v1/diagnostics/gateway
GET /api/v1/diagnostics/runtime-nodes/{runtimeNodeId}
GET /api/v1/diagnostics/orchestrators/{sessionId}
GET /api/v1/logs/{logId}
```

诊断接口必须做权限和脱敏，不应直接暴露密钥、token、`.env`、完整终端历史或敏感业务数据。

---

## 6. 状态模型

### 6.1 Gateway 状态

```text
offline → online → degraded / error → online
```

### 6.2 Assignment 状态

```text
created → activating → active → paused / completed / released / error
```

### 6.3 Orchestrator 状态

```text
starting → running → paused / blocked / error / stopped
```

### 6.4 RuntimeNode 状态

```text
initializing → idle → busy → idle / blocked / error / offline
```

### 6.5 RuntimeSandbox 状态

```text
available → bound → running / stopped → unbinding → pending-reset → resetting → available
```

说明：沙箱解绑后必须进入 `pending-reset` 或 `resetting`，不得直接作为干净工位分配给新员工。

### 6.6 状态不能混用

必须避免把以下状态混成一个字段：

- Gateway 是否在线；
- Assignment 是否激活；
- Orchestrator 是否运行；
- RuntimeSandbox 是否可复用；
- RuntimeNode 是否可用；
- DigitalEmployee 是否启用；
- TaskTicket 是否完成；
- Workspace 是否准备好。

---

## 7. 本地文件系统建议

产品化后，调度程序属于 Gateway / 平台运行层，不应要求每个业务项目内置一份 `tools/orchestrator`。POC 阶段可把工具打进 demo project 方便联调。

```text
/srv/agent-factory/
├── gateways/
│   └── gateway-001/
│       ├── gateway.config.json
│       ├── logs/
│       ├── diagnostics/
│       └── runtime-manifests/
├── projects/
│   └── proj-demo/
│       ├── docs/                 # 共享事实源
│       ├── .runtime/exec/            # 执行期账本
│       ├── source/               # 源代码区，可映射到 apps/packages/services
│       └── .workers/             # 员工本地运行缓存 / worktree，可由 Gateway 管理
└── platform-cache/
    ├── skill-snapshots/
    ├── mcp-snapshots/
    ├── agents-md-snapshots/
    └── memory-snapshots/
```

---

## 8. 前端展示建议

Gateway 相关前端页面应是运行基础设施监控和下钻入口，而不是 Web IDE 主入口。

### 8.1 运行网关页当前产品口径

运行网关页定位为服务器级生产资源监控页：

```text
左侧：已注册网关列表。离线网关置灰但保留。
右侧：所选网关监控区，展示注册时间、运行时长、沙箱数量、CPU / 内存使用率。
中部：Team 筛选，默认全部 Team。
下方：沙箱 / OC 卡片，穿透查看员工、Team、OC 状态、当前任务和最近活动。
```

该页面只做监控与穿透查看，不承担 Team 绑定 Gateway、员工换沙箱、Skill/MCP/Rules/Memory 同步和任务调度主操作。


建议 Gateway 详情页展示：

- Gateway 基本状态：在线、版本、心跳、资源占用；
- 当前 TeamProjectAssignment；
- TeamOrchestratorSession 列表与当前工作项；
- OpenCodeRuntimeNode 列表、员工绑定、当前任务、Lease 状态；
- ProjectWorkspace 路径与共享事实源 / 源代码区状态；
- Diagnostics / Logs / API Docs 下钻入口。

---

## 9. 安全与权限边界

1. 平台下发指令必须带 assignmentId / gatewayId / 权限范围。  
2. Gateway 不应执行未绑定 Assignment 的任意命令。  
3. RuntimeNode 初始化时必须使用快照版本，不使用未审计的临时配置。  
4. 日志与诊断必须脱敏。  
5. 员工记忆同步必须经过策略过滤，不同步 token、`.env`、私钥、完整终端历史和构建缓存。  
6. 写源代码区前应通过 ExecutionLease 或后续 branch / worktree / patch 机制避免冲突。  

---

## 10. 分阶段落地建议

| 阶段 | 任务 | 目标 |
|---|---|---|
| G-01 | `TF-RUNTIME-GATEWAY-DESIGN-01` | 完成本子设计，统一 Gateway 对象和接口草案。 |
| G-02 | `TF-RUNTIME-ORCH-POC-01/02` | 沙箱 mock 闭环与本地 OpenCode Adapter 骨架。 |
| G-03 | `TF-RUNTIME-ORCH-POC-03` | 加入 DecisionPacket / 异常处理。 |
| G-04 | `TF-RUNTIME-GATEWAY-POC-01` | 做一个最小 Gateway 服务，能启动 orchestrator 和 mock/opencode adapter。 |
| G-05 | `TF-FACTORY-UI-RUNTIME-01/02` | 前端表达 Gateway、Orchestrator、RuntimeNode、Diagnostics。 |

---

## 11. 风险与未决问题

| 风险 | 说明 | 处理建议 |
|---|---|---|
| 过早网关产品化 | Gateway 涉及进程、文件、权限、日志、连接代理 | 先做对象与接口草案，再做本地 POC。 |
| 调度器与 Gateway 边界混淆 | Gateway 负责承载，Orchestrator 负责任务层判断 | 文档和 API 中明确分层。 |
| 项目目录污染 | 不应把 TeamProjectAssignment 绑定目录写进项目事实源 | 绑定关系放平台侧，本地 manifest 放 Gateway runtime 目录。 |
| 多员工写冲突 | 多个 OpenCode 可能并发修改源代码区 | 后续引入 ExecutionLease、worktree、branch、patch。 |
| 日志泄露 | logs 可能包含敏感命令和路径 | 诊断接口必须做权限、脱敏和留存策略。 |

---

## 12. 与相关文档关系

- `docs/specs/SDD-v0.6.33.md`：主设计保留阶段 D/G 的总体口径。
- `docs/specs/SDD-COSTRICT-CLOUD-REFERENCE-v0.6.33.md`：提供 CoStrict Cloud 网关机制参考。
- `docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`：定义 TeamOrchestrator / Task Loop Driver 的任务层机制。
- `docs/workitems/TF-RUNTIME-ORCH-POC.md`：当前 orchestrator POC 工作项。
- `docs/workitems/TF-RUNTIME-GATEWAY-DESIGN.md`：本子设计对应工作项。
- `docs/workitems/TF-FACTORY-UI-RUNTIME.md`：前端 Runtime / Gateway 表达工作项。
