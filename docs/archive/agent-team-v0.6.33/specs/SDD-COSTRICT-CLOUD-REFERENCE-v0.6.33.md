# SDD-COSTRICT-CLOUD-REFERENCE｜CoStrict Cloud 后台架构参考子设计

> 文档类型：SDD 子设计 / 架构参考分析  
> 当前基线：v0.6.33.45  
> 适用阶段：阶段 D（Factory Runtime Orchestration）预研参考；阶段 B/C 仅沉淀设计，不提前实现完整 Runtime 调度  
> 来源任务：TF-TEMP-COSTRICT-BACKEND-ARCH-ANALYSIS-01  
> 状态：草案 / 供后续主 SDD 与路线图改进时引用  

---

## 1. 背景与目标

用户提供的 CoStrict Cloud 截图显示：在本机执行 `cs cloud start` 后，会完成数据库迁移、设备注册、设备 token 校验、网关连通性检查和守护进程启动；终端输出包含本地 API 文档地址、Swagger Docs、日志路径和云端 Dashboard 地址。官方文档说明 CoStrict Cloud 是“AI 驱动的云端编程工作空间”，支持通过浏览器远程连接本地 / 私有服务器个人设备，具备对话式 AI 编程、项目文件管理、多会话留存、远程终端协作等能力。

本子设计的目标不是复制 CoStrict Cloud，而是提炼其后台网关与工作空间机制中可借鉴的架构点，用于后续改进“智能软件工厂”的 RuntimeHost / RuntimeNode / OpenCode workspace / agent gateway 设计。

本轮不修改主 SDD 和路线图，只沉淀为子设计，后续再决定是否并入 `SDD-v0.6.33.md` 和 `PLAN-SMART-FACTORY.md`。

---

## 2. CoStrict Cloud 机制复盘

### 2.1 关键链路

```text
用户登录 Cloud Web
  ↓
CLI 在本机 / 私有服务器登录同一账号
  ↓
执行 cs cloud start
  ↓
设备注册 + token 校验 + 网关连通性检查
  ↓
启动本地 / 私有服务器守护进程
  ↓
设备出现在 Cloud Web 的 Device List
  ↓
用户在 Web 上选择设备和项目目录创建 Workspace
  ↓
Workspace 空闲时可连接
  ↓
浏览器通过云端控制面 / 网关连接到设备侧 Workspace 和 AI 编程能力
```

官方文档强调 CLI 端和 Cloud Web 端必须使用同一账号，否则网页端设备列表中无法正常显示设备。官方文档还说明，注册成功后设备会同步展示在网页端设备列表中；创建工作空间时需要选择设备上的本地项目目录，且每个工作空间唯一对应设备上的一个独立项目目录。

### 2.2 关键能力拆分

| 能力 | CoStrict Cloud 表现 | 可抽象对象 |
|---|---|---|
| 设备注册 | `cs cloud start` 后设备自动展示到 Web 设备列表 | RuntimeHost 注册 |
| 设备守护进程 | 本机 / 服务器启动 daemon，并输出 pid、url、docs、logs | RuntimeGateway / RuntimeNode daemon |
| 账号绑定 | CLI 与 Web 使用同一账号 | UserAccount / DeviceBinding |
| 工作空间创建 | Web 选择设备上的项目目录创建 Workspace | WorkspaceBinding |
| 工作空间隔离 | 每个 Workspace 唯一对应独立项目目录 | WorkspaceRoot / ProjectDirectory |
| 远程连接 | 空闲 Workspace 可由浏览器连接 | AgentRoute / SessionRoute |
| 远程协作能力 | AI 对话、文件管理、多会话、远程终端、接口文档 | Web IDE + Agent Session + Tool Gateway |
| 运维诊断 | 输出本地 API docs、swagger docs、logs | HealthEndpoint / LogEndpoint / DebugDocs |
| 异常恢复 | `cs cloud restart`、日志排查、重连 | RestartPolicy / RecoveryAction |

### 2.3 对截图的架构解读

用户截图中的终端输出体现出几个对智能软件工厂很有价值的后台能力：

1. **本地守护进程可观测**：启动成功后明确输出 pid、mode、docs、swagger docs 和 logs。
2. **设备注册与在线状态可见**：Web 端侧边栏显示 Device List，设备在线后可选择。
3. **Workspace 与设备分离展示**：Web 左侧同时有 Workspaces 和 Device List，说明设备和工作空间是不同层级对象。
4. **Workspace 是用户操作入口**：用户不是直接操作 daemon，而是通过 Workspace 连接具体项目目录与 AI 编程环境。
5. **网关启动不等于工作空间创建**：daemon 只提供设备侧能力，具体项目仍由用户在 Web 端创建 Workspace。

---

## 3. 与智能软件工厂现有架构的关系

当前主 SDD 已在阶段 D 预留 `RuntimeHost / RuntimeNode / WorkerRuntimeBinding / Workspace / AgentRoute / ExecutionLease / Heartbeat / AuditLog` 等对象。本子设计建议把 CoStrict Cloud 作为阶段 D 的参考实现之一，但近期不提前做完整 Runtime 调度。

### 3.1 对象映射

| CoStrict 抽象 | 智能软件工厂建议对象 | 说明 |
|---|---|---|
| Device | RuntimeHost | 可代表一台本机、服务器、容器宿主或云端执行节点 |
| Local daemon | RuntimeGateway / RuntimeNode Agent | 设备侧常驻进程，负责本地 API、命令执行、日志、心跳和连接代理 |
| Cloud Web | Factory Control Plane | 项目、团队、任务流、数字员工、工作空间、状态与审计的控制面 |
| Workspace | WorkspaceBinding | 将项目 / 任务 / 数字员工绑定到某个 RuntimeHost 的工作目录 |
| Project directory | WorkspaceRoot | OpenCode 或其他 Agent Runtime 的真实工作目录 |
| Connect workspace | AgentRoute / SessionRoute | 浏览器或 agent-web-kit 连接到具体数字员工 / 工作空间会话 |
| Device status | Heartbeat / RuntimeStatus | online / offline / busy / idle / unhealthy |
| pid / docs / logs | RuntimeDiagnostics | 运行体诊断信息，支持排障和审计 |
| restart | RuntimeRecoveryAction | 重启 daemon、重连、释放 lease、标记异常 |

### 3.2 与当前产品主线的边界

当前项目仍应以 TaskFlow First / Guarded Flow 为主线，不应因为参考 CoStrict Cloud 就提前进入完整 Runtime 工厂化调度。合理边界是：

```text
近期：沉淀 RuntimeGateway / RuntimeHost / WorkspaceBinding / AgentRoute 的设计模型
中期：做最小 RuntimeHost 注册和 Workspace 绑定原型
后期：接入真实 OpenCode runtime、心跳、连接代理、日志、权限和执行租约
```

---

## 4. 可借鉴点

### 4.1 设备 / 主机注册模型

CoStrict Cloud 的设备注册链路说明：Web 控制面不需要预先知道所有机器；设备侧 daemon 启动后向云端注册，Web 侧再显示可用设备。这对智能软件工厂很重要。

建议引入：

```yaml
RuntimeHost:
  hostId: string
  name: string
  ownerUserId: string
  hostType: local | private_server | cloud_vm | container_host
  status: online | offline | unhealthy
  lastHeartbeatAt: datetime
  gatewayEndpointRef: string
  diagnostics:
    pid: string
    localUrl: string
    docsUrl: string
    logsPath: string
```

落地建议：早期可以只做文档模型和模拟数据；等进入阶段 D 时再做真实注册接口。

### 4.2 设备侧 Gateway / Daemon

CoStrict 的 CLI 启动后，本地会有守护进程和 API 文档入口。这种模式适合智能软件工厂，因为数字员工的真实执行环境可能分散在不同机器上，平台不应假设所有 Worker workspace 都在同一服务器。

建议将设备侧能力抽象为：

```text
RuntimeGateway Daemon
  - 注册 / 注销 RuntimeHost
  - 心跳上报 RuntimeStatus
  - 枚举允许暴露的 WorkspaceRoot
  - 创建 / 打开 / 关闭 WorkspaceBinding
  - 启动 / 停止 / 查询 OpenCode 或其他 Agent Runtime
  - 代理 agent-web-kit / Web IDE / CLI 连接
  - 暴露 Health / Logs / Diagnostics 只读接口
```

注意：RuntimeGateway 不是业务 Orchestrator。它只负责设备侧执行与连接代理；任务拆解、状态门禁、验收和审计仍由智能软件工厂 Orchestrator / TaskFlow 层负责。

### 4.3 Workspace 与项目目录一一绑定

CoStrict 文档说明每个工作空间唯一对应设备上的一个独立项目目录。这一点可以直接借鉴：数字员工不应只绑定“一个抽象 agent”，还应绑定其实际工作目录、代码仓库、技能快照和同步状态。

建议引入或细化：

```yaml
WorkspaceBinding:
  workspaceId: string
  projectId: string
  hostId: string
  runtimeNodeId: string
  workspaceDir: string
  repoRef: string
  skillSnapshotId: string
  status: idle | busy | offline | error
  currentTaskFlowId: string | null
  currentTaskTicketId: string | null
```

### 4.4 浏览器连接的是 Workspace，不是裸 Agent

从用户体验看，CoStrict Web 的入口是 Workspace，而不是 daemon 进程。智能软件工厂也应避免让用户直接理解复杂的底层 agent runtime。

建议产品 UI 表达为：

```text
项目 / 工作项
  → 数字员工 / 岗位
    → Workspace
      → 会话 / 文件 / 终端 / 日志 / 任务证据
```

也就是说，用户点击“连接数字员工”时，实际应经过：

```text
DigitalEmployeeId
  → WorkerRuntimeBinding
  → WorkspaceBinding
  → AgentRoute
  → RuntimeGateway
  → OpenCode workspace/session
```

### 4.5 连接状态与执行状态分离

CoStrict 中 Workspace 可有空闲状态，连接动作只在空闲时可触发。智能软件工厂也应区分：

| 状态类型 | 示例 | 说明 |
|---|---|---|
| Runtime 连接状态 | online / offline / unhealthy | 设备或 daemon 是否可用 |
| Workspace 占用状态 | idle / busy / locked | 工作目录是否被某个任务占用 |
| TaskFlow 状态 | running / reviewing / blocked / done | 任务链路状态 |
| DigitalEmployee 状态 | enabled / disabled / busy / idle | 产品侧员工可用性 |

这四类状态不能混为一个字段，否则后续 UI、调度、恢复和审计都会混乱。

### 4.6 运维诊断入口产品化

CoStrict 启动日志中直接暴露 docs / swagger docs / logs，非常适合排障。智能软件工厂也应为每个 RuntimeHost / RuntimeNode 提供受控诊断入口：

```text
Runtime Diagnostics Panel
  - 在线状态 / 最近心跳
  - 当前 pid / runtime version
  - workspaceDir / repoRef
  - 本地或代理后的 API docs
  - 最近日志摘要
  - 最近 TaskEvent / AgentRoute 连接记录
  - restart / reconnect / mark unhealthy 操作
```

权限上，普通用户只能看自己项目相关信息；管理员或运维角色才能看 host 级日志和重启操作。

### 4.7 技能商店 / 子智能体 / MCP 的扩展模型

CoStrict 文档中的技能商店包含 Skill、Subagent、Command、MCP Server 四类能力，并为技能卡片展示分类、风险等级、标签、来源、分值、收藏量和更新时间。这对智能软件工厂的技能资产管理也有借鉴意义。

当前项目已经有“岗位 / AgentTemplate / TemplateSkillMapping / 技能初始化快照”的方向。后续可以进一步补：

```text
SkillAsset
  - skillId / name / category / riskLevel / source / version / updatedAt
SubagentTemplate
  - role / scope / callableBy / requiredTools
CommandTemplate
  - commandId / parameters / riskLevel / allowedRuntimeTypes
McpServerProfile
  - serverId / permissionScope / credentialRef
```

---

## 5. 建议的智能软件工厂参考架构

### 5.1 分层架构

```text
[Factory Web / agent-web-kit]
  - 项目、任务流、数字员工、工作空间、待决策、运行日志
  - Web 对话、文件查看、终端、诊断面板

[Factory Control Plane]
  - Project / WorkItem / TaskFlow / TaskTicket
  - DigitalEmployee / Role / SkillSnapshot
  - RuntimeHost Registry
  - WorkspaceBinding Registry
  - AgentRoute Registry
  - Audit / Evidence / Review / Decision

[Runtime Gateway]
  - host registration / heartbeat
  - workspace discovery / creation
  - opencode process lifecycle
  - local API / logs / diagnostics
  - websocket / HTTP proxy / tunnel

[Agent Runtime]
  - OpenCode workspace
  - Codex / Claude / other CLI runtime
  - skills / memory / rules
  - project files / tools / scripts
```

### 5.2 控制面与数据面分离

建议明确区分两条链路：

```text
控制面：注册、配置、授权、路由、心跳、任务状态、审计
数据面：对话流、文件流、终端流、命令执行流、日志流
```

短期可只做控制面模型，不做真实数据面代理。后续接入 OpenCode 时，再选择 WebSocket、HTTP proxy、反向隧道或本地网关直连方式。

### 5.3 AgentRoute 建议

```yaml
AgentRoute:
  routeId: string
  digitalEmployeeId: string
  workspaceId: string
  hostId: string
  runtimeNodeId: string
  routeStatus: active | inactive | degraded
  connectMode: local_proxy | cloud_tunnel | direct_lan | manual
  endpointRef: string
  lastConnectedAt: datetime
  expiresAt: datetime
```

`agent-web-kit` 后续只需要拿到 `digitalEmployeeId` 或 `routeId`，不直接关心真实 host / workspaceDir / pid。路由解析由 Factory Control Plane 完成。

### 5.4 ExecutionLease 建议

CoStrict 的 Workspace 空闲才能连接，对智能软件工厂的启发是：同一个工作区不能被多个任务随意并发写入。

```yaml
ExecutionLease:
  leaseId: string
  workspaceId: string
  taskFlowId: string
  taskTicketId: string
  holderWorkerId: string
  status: active | released | expired | revoked
  acquiredAt: datetime
  expiresAt: datetime
  reason: string
```

P0/P1 不一定实现数据库锁，但应在设计中明确后续需要 ExecutionLease，避免多个数字员工同时改同一工作目录。

---

## 6. 适配当前路线图的落地建议

### 6.1 不建议立即做的内容

本轮不建议马上实现：

- 完整 RuntimeHost 注册服务；
- 云端隧道 / 反向代理；
- 真实 OpenCode daemon 生命周期管理；
- 多工作区并发调度；
- 细粒度文件系统授权；
- UI 远程终端与文件编辑器。

原因是当前 TaskFlow / TaskTicket / Guarded Flow 正在收口，过早引入 Runtime 会扩大复杂度。

### 6.2 可以先加入主设计的内容

后续改主 SDD 时，建议只补这几类设计口径：

1. **RuntimeGateway 作为设备侧代理层**：不等同于 Orchestrator。
2. **RuntimeHost 注册与 Heartbeat**：用于发现可用执行环境。
3. **WorkspaceBinding 作为项目目录绑定对象**：数字员工实际执行必须落在具体 workspace。
4. **AgentRoute 作为对话 / 文件 / 终端连接入口**：屏蔽底层 host 差异。
5. **Diagnostics 作为排障能力**：每个 RuntimeNode 应有状态、日志和 API 文档入口。
6. **ExecutionLease 作为后续并发保护**：不提前实现，但要明确存在。

### 6.3 建议新增后续工作项

| 候选工作项 | 目标 | 建议优先级 |
|---|---|---:|
| `TF-RUNTIME-GATEWAY-DESIGN-01` | 设计 RuntimeGateway / RuntimeHost / RuntimeNode / AgentRoute 最小模型 | P1 |
| `TF-WORKSPACE-BINDING-01` | 设计 WorkspaceBinding 与 OpenCode workspace 初始化流程 | P1 |
| `TF-FACTORY-UI-RUNTIME-01` | 设计设备列表、工作空间列表、连接动作与诊断面板 | P2 |
| `TF-SKILL-ASSET-MODEL-01` | 设计 Skill / Subagent / Command / MCP 资产模型与风险等级 | P2 |
| `TF-METRICS-OBSERVABILITY-01` | 设计 Runtime 与 AI 提效指标采集、人工校准、下钻维度 | P2 |

---

## 7. 风险与约束

| 风险 | 说明 | 建议处理 |
|---|---|---|
| 过早 Runtime 化 | 当前主线仍是 TaskFlow First / Guarded Flow | 子设计先沉淀，不直接改路线图实现优先级 |
| 权限扩大 | 远程工作空间涉及文件、终端、命令执行 | 需要 ToolPermissionProfile、Workspace allowlist、操作审计 |
| 连接复杂度 | Web 到私有服务器可能涉及 NAT、防火墙、代理 | 后续需独立做 connectMode 设计 |
| 状态混淆 | host 在线、workspace 空闲、任务执行、员工启用是不同状态 | 必须分字段建模 |
| 多用户冲突 | 同一 workspace 被多任务或多员工并发操作 | 后续需要 ExecutionLease / lock / conflict policy |
| 敏感日志 | logs 可能包含路径、命令、密钥或业务数据 | 诊断面板必须做脱敏、权限和留存策略 |

---

## 8. 对主 SDD 和路线图的后续修改建议

后续若用户确认，可以在主文档中做如下增量修改：

1. `SDD-v0.6.33.md` 的阶段 D 中补充 `RuntimeGateway`、`WorkspaceBinding`、`AgentRoute`、`RuntimeDiagnostics` 的定义。
2. `PLAN-SMART-FACTORY.md` 的阶段 G 中增加 `TF-RUNTIME-GATEWAY-DESIGN-01` 作为 Runtime / UI / 自动调度前置设计任务。
3. `REC-MAC-PROD-v0.6.33.md` 中的 Workspace 章节补充“工作空间唯一绑定项目目录”的原则。
4. 原型后续可增加“设备 / RuntimeHost 列表”和“工作空间连接 / 诊断”入口，但不在当前文档任务中实施。
5. `agent-web-kit` 相关设计中增加通过 `digitalEmployeeId → AgentRoute → RuntimeGateway` 解析连接目标的说明。

---

## 9. 参考来源

- CoStrict Cloud 官方文档：https://docs.costrict.ai/cli/product-characteristics/cloud
- 用户提供截图：`cs cloud start` 启动日志与 CoStrict Cloud Web 工作台界面
- 当前项目文档：`docs/specs/SDD-v0.6.33.md`、`docs/recs/REC-MAC-PROD-v0.6.33.md`、`docs/plans/PLAN-SMART-FACTORY.md`
