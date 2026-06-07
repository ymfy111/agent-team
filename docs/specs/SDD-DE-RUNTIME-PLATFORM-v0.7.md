# SDD-DE-RUNTIME-PLATFORM｜数字员工运行平台设计

> 文档类型：SDD / 子设计
> 版本：v0.7.0
> 状态：草案（Draft）
> UpdatedAt：2026-06-07
> 归位：DEOS 2F 运行层 · 运行支撑
> 关联架构：`docs/specs/SDD-DEOS-ARCHITECTURE-v0.7.md`
> 关联需求：`docs/specs/PRD-v0.7.md` §5
> 关联计划：`docs/specs/PLAN-DEOS-SUBDESIGNS-v0.7.md` M1

---

## 0. 核心结论

数字员工运行平台对应架构图 2F 底部的**运行支撑**带：

```text
任务调度 · 任务编排  ──▶  动态工作流引擎  ──▶  服务注册 · 服务发现
```

它是两类数字员工的共同运行底座：

- 构建型数字员工通过它运行版本制流程（`Plan / Stage / WorkItem / Task / Step`）。
- 应用型数字员工通过它运行任务制快循环（`AppTask / AppSession / Step / Checkpoint`）。

范围边界必须保持清楚：**运行平台不包含能力库、管理平台、运营平台、业务系统和用户终端**。它只负责调度、编排、注册、发现、路由与运行态记录。

---

## 1. 定位与范围

### 1.1 一句话定位

> 数字员工运行平台是驱动两类数字员工执行任务的运行支撑底座。

### 1.2 包含范围

| 能力 | 说明 |
|---|---|
| 动态工作流引擎 | 流程中枢、调度大脑，承载任务编排与运行推进 |
| 任务调度 | 决定任务何时运行、由谁运行、优先级如何处理 |
| 任务编排 | 把任务拆成可执行步骤，并维护步骤间依赖 |
| 服务注册 | 注册可运行的数字员工实例、能力服务、连接器服务 |
| 服务发现 | 在运行时发现可调用实例 / 服务，并完成路由 |
| 运行管理 | 实例心跳、路由、绑定、生命周期与运行账本 |
| 运行态可观测 | 为 3F 运营平台输出状态、日志、调用记录和指标 |

### 1.3 不包含范围

| 不包含 | 原因 | 对应子设计 |
|---|---|---|
| 能力库治理 | 能力库是 2F 并列组件，不属于运行平台 | 本文件只定义能力调用契约章节；高级治理后续按复杂度决定是否独立 |
| 数字员工编制管理 | 属 3F 管理平台 | `SDD-DE-MANAGEMENT-PLATFORM-v0.7.md` |
| 运行监控看板 / 成本分析 | 属 3F 运营平台，消费运行平台数据 | `SDD-DE-OPERATIONS-PLATFORM-v0.7.md` |
| 业务系统连接器设计 | 属 3F 业务系统集成 | `SDD-BIZ-SYSTEM-INTEGRATION-v0.7.md` |
| 应用侧 UI | 属 4F 用户终端 | 先纳入运营平台的应用侧运营视图章节，复杂后再独立 |

---

## 2. 与两类数字员工的关系

### 2.1 构建型数字员工

构建型数字员工以版本制流程运行，既有实现已覆盖主要闭环：

```text
Plan / Stage / WorkItem / Task / Step
  → 构建型数字员工执行
  → 验收 / 审查 / 决策
  → 产出应用与能力
```

运行平台对构建侧的责任：

- 维护任务执行账本。
- 支撑构建型数字员工实例注册与路由。
- 支撑多数字员工编排与任务派发。
- 把运行态数据供给运营平台。

### 2.2 应用型数字员工

应用型数字员工以任务制快循环运行，是 v0.7 增量：

```text
AppTask / AppSession / Step / Checkpoint
  → 应用型数字员工执行
  → 人机协同
  → 执行反馈 / 本体回流
```

运行平台对应用侧的责任：

- 支持事件、定时、人工指派、上游任务四类触发源。
- 支持应用型数字员工常驻实例注册与心跳。
- 支持短周期任务并发调度。
- 支持人机协同节点暂停、恢复、接管。
- 支持运行结果和指标输出。

---

## 3. 逻辑架构

```text
触发源 / 用户指令
   │
   ▼
任务调度 ──▶ 任务编排 ──▶ 动态工作流引擎
   │             │              │
   │             │              ├── 调用服务发现
   │             │              ├── 推进运行状态
   │             │              └── 写运行账本
   │             │
   ▼             ▼
运行队列       Step / Checkpoint
   │
   ▼
服务注册 / 服务发现 ──▶ 数字员工实例 / 能力服务 / 连接器服务
   │
   ▼
运行态可观测 ──▶ 3F 运营平台
```

---

## 4. 核心模块设计

### 4.1 动态工作流引擎

职责：

1. 接收调度后的任务。
2. 解析任务对应的执行流程。
3. 推进 Step 状态。
4. 在 Checkpoint 暂停并等待人机协同。
5. 记录运行账本。
6. 输出运行事件供运营平台消费。

引擎必须同时支持两类流程：

| 流程 | 特征 | 说明 |
|---|---|---|
| 构建侧版本制流程 | 长周期、阶段化、可审查 | 兼容既有 TaskFlow / Task Runner / ORCH 口径 |
| 应用侧任务制流程 | 短周期、可并发、常驻运行 | 先由本文件「应用型任务制」相关章节承载，复杂后再独立 |

### 4.2 任务调度

任务调度决定任务进入运行队列的方式。

| 调度来源 | 用于 | 说明 |
|---|---|---|
| 用户指令 | 构建型 / 应用型 | 人工发起任务 |
| 计划任务 | 构建型 | Plan / Stage 推进 |
| 业务事件 | 应用型 | 外部业务系统触发 |
| 定时任务 | 应用型 | 周期性巡检、提醒、汇总 |
| 上游任务 | 应用型 | 一个业务任务触发后续任务 |

调度输出：

```text
RuntimeTaskEnvelope
  id
  type: build | app
  priority
  trigger
  contextRef
  targetPolicy
```

> `RuntimeTaskEnvelope` 是运行平台内部任务信封，不替代构建侧 `TaskTicket` 或应用侧 `AppTask`。它用于统一进入运行队列。

### 4.3 任务编排

任务编排把任务组织为可执行步骤。

| 输入 | 输出 |
|---|---|
| 构建侧 Task / Step | 构建侧执行步骤序列 |
| 应用侧 AppTask | 应用侧 Step / Checkpoint 序列 |

编排原则：

1. 运行平台只维护运行态，不定义业务语义。
2. 业务规则来自 1F 业务本体。
3. 可执行能力来自 2F 能力库。
4. 人机协同节点只记录运行态，协同规则先由本文件的人机协同检查点章节承载，复杂后再独立。

### 4.4 服务注册

服务注册用于声明运行时可用资源。

| 注册对象 | 示例 | 说明 |
|---|---|---|
| 数字员工实例 | 构建型 DE、应用型 DE | 运行中的数字员工实例 |
| 能力服务 | 技能、工具、接口 | 能力库暴露的可调用能力 |
| 连接器服务 | ERP Connector、MES Connector | 业务系统连接器 |
| 运行节点 | RuntimeGateway、RuntimeNode | 执行承载节点 |

注册信息最小字段：

```text
ServiceRegistration
  serviceId
  serviceType
  endpoint
  capabilities
  owner
  health
  lastHeartbeatAt
```

### 4.5 服务发现

服务发现用于在运行时找到可调用资源。

发现依据：

```text
能力类型 / 权限 / 健康状态 / 负载 / 版本 / 业务上下文
```

输出：

```text
ServiceRoute
  serviceId
  endpoint
  authContextRef
  timeoutPolicy
  retryPolicy
```

### 4.6 运行管理

运行管理负责实例级运行状态：

- 实例注册。
- 心跳。
- 路由。
- 绑定。
- 生命周期。
- 异常隔离。
- 执行账本。

历史实现参考：`docs/archive/agent-team-v0.6.33/specs/SDD-RUNTIME-GATEWAY-v0.6.33.md`。

---

## 5. 数据与事件模型

### 5.1 RuntimeTaskEnvelope

运行平台统一任务信封。

| 字段 | 说明 |
|---|---|
| `id` | 运行任务 ID |
| `type` | `build` 或 `app` |
| `trigger` | 触发来源 |
| `priority` | 调度优先级 |
| `contextRef` | 业务 / 项目上下文引用 |
| `targetPolicy` | 选择数字员工或服务的策略 |

### 5.2 RuntimeSession

一次任务运行会话。

| 字段 | 说明 |
|---|---|
| `id` | 运行会话 ID |
| `taskEnvelopeId` | 对应 RuntimeTaskEnvelope |
| `status` | running / waiting / done / failed / takeover |
| `steps` | 执行步骤 |
| `checkpoints` | 人机协同检查点 |
| `startedAt` / `endedAt` | 时间 |

### 5.3 RuntimeEvent

运行平台输出给运营平台、审计、本体回流的事件。

| 事件 | 说明 |
|---|---|
| `task.scheduled` | 任务进入运行队列 |
| `task.started` | 任务开始运行 |
| `step.started` | 步骤开始 |
| `step.completed` | 步骤完成 |
| `checkpoint.waiting` | 等待人机协同 |
| `task.completed` | 任务完成 |
| `task.failed` | 任务失败 |
| `task.takeover` | 人工接管 |

### 5.4 RuntimeEvent 完整字段定义

每条 RuntimeEvent 包含以下字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 事件唯一 ID |
| `type` | enum | 事件类型（`task.scheduled` / `task.started` / `step.started` / `step.completed` / `checkpoint.waiting` / `checkpoint.resumed` / `task.completed` / `task.failed` / `task.takeover`） |
| `taskEnvelopeId` | string | 所属 RuntimeTaskEnvelope |
| `sessionId` | string | 所属 RuntimeSession |
| `stepIndex` | number? | 如果是 step 级事件，步骤索引；非 step 级事件为空 |
| `checkpointId` | string? | 如果是 checkpoint 级事件，检查点 ID；非 checkpoint 级事件为空 |
| `timestamp` | ISO8601 | 事件产生时间 |
| `payload` | object | 事件扩展数据（step 执行结果、失败原因、接管人等，不同事件类型各自扩展） |
| `actorId` | string | 触发此事件的数字员工 / 人类 / 系统 ID |
| `traceId` | string | 分布式追踪 ID，贯穿同一任务的全部事件 |

> `stepIndex` 和 `checkpointId` 均为可选字段，仅在对应事件类型中有意义；运营平台消费时按 `type` 判断是否读取这两个字段。

### 5.5 运营指标映射（RuntimeEvent → 运营平台指标）

运营平台通过消费 RuntimeEvent 流计算以下核心指标：

| 运营指标 | 计算来源 | 说明 |
|---|---|---|
| 任务吞吐量 | `COUNT(task.completed)` per time | 单位时间完成任务数，反映平台处理能力 |
| 平均任务耗时 | `AVG(task.completed.timestamp − task.started.timestamp)` | 从任务开始到完成的端到端耗时 |
| 步骤成功率 | `COUNT(step.completed) / COUNT(step.started)` | 步骤级执行可靠性，可按数字员工维度拆分 |
| 人机协同等待时长 | `AVG(checkpoint.resumed.timestamp − checkpoint.waiting.timestamp)` | 反映人工响应效率，可按检查点类型拆分 |
| 接管率 | `COUNT(task.takeover) / COUNT(task.started)` | 反映数字员工自主执行程度，越低自主性越高 |
| 任务失败率 | `COUNT(task.failed) / COUNT(task.started)` | 反映系统可靠性，高失败率触发告警 |
| 数字员工利用率 | 有活跃 RuntimeSession 的时间占比 | 反映数字员工实例资源利用率，按实例 / 类型可拆 |

> 所有指标的原始数据来源均为 RuntimeEvent；运营平台不直接读取运行平台内部数据库，保持解耦。

### 5.6 应用型任务入口转换（AppTask → RuntimeTaskEnvelope → RuntimeSession）

应用型任务从外部触发到进入运行会话的完整转换链路如下：

```text
[外部触发 / 用户指令]
       │
       ▼
    AppTask          ─── 应用侧业务级任务对象（含业务语义、触发上下文）
       │
       │ 调度层包装
       ▼
 RuntimeTaskEnvelope ─── 运行平台统一信封（type=app，屏蔽业务差异）
       │
       │ 引擎创建
       ▼
  RuntimeSession     ─── 运行会话（含 Steps + Checkpoints，维护运行态）
       │
       │ 执行 → 事件
       ▼
  RuntimeEvent[]     ─── 运行事件流（供运营平台、审计、本体回流消费）
```

字段映射说明：

| AppTask 字段 | 映射到 RuntimeTaskEnvelope | 映射到 RuntimeSession | 说明 |
|---|---|---|---|
| `id` | `contextRef` | — | AppTask ID 作为业务上下文引用 |
| `type` / `bizType` | `type=app` | — | 统一标记为 app 类型 |
| `priority` | `priority` | — | 直接透传调度优先级 |
| `trigger` | `trigger` | — | 触发来源（事件/定时/人工/上游） |
| `assignee` / `targetPolicy` | `targetPolicy` | — | 目标数字员工选择策略 |
| — | `id` | `taskEnvelopeId` | 信封 ID 由调度层生成，关联到 Session |
| — | — | `id` | 会话 ID 由引擎创建 |
| `steps` / `checkpoints` 定义 | — | `steps` / `checkpoints` | 编排层解析 AppTask 结构生成运行态列表 |

### 5.7 RuntimeSession 状态机

RuntimeSession 在生命周期内经历以下状态：

```text
                ┌─────────────────────────────────────┐
                │                                     ▼
 [created] ──▶ [running] ──▶ [waiting] ──▶ [running] ──▶ [done]
                  │               │                        ▲
                  │               └── [takeover] ──────────┘
                  │
                  └── [failed]
```

状态与转移说明：

| 状态 | 含义 | 进入条件 | 离开条件 |
|---|---|---|---|
| `created` | 会话已创建，待开始执行 | RuntimeTaskEnvelope 被引擎接收 | 引擎开始推进第一个 Step |
| `running` | 会话正在执行 Step | 从 `created` 初始启动；或从 `waiting` 恢复；或从 `takeover` 完成接管 | 命中 Checkpoint（→ `waiting`）；全部 Step 完成（→ `done`）；Step 执行失败（→ `failed`）；人工发起接管（→ `takeover`） |
| `waiting` | 会话在 Checkpoint 暂停，等待人机协同 | 执行到人机协同 Checkpoint | 人工确认 / 审核（→ `running`）；人工主动接管（→ `takeover`）；超时且策略为自动降级（→ `running`）；超时且策略为失败（→ `failed`） |
| `takeover` | 人工接管，数字员工暂停执行 | 人工在 `waiting` 或 `running` 状态主动接管 | 人工完成处理并提交结果（→ `done`）；人工交还给数字员工继续（→ `running`） |
| `done` | 会话正常完成 | 所有 Step 成功执行完毕；或人工在接管后提交完成 | 终态 |
| `failed` | 会话异常终止 | Step 执行失败且重试耗尽；或 Checkpoint 超时且策略为失败 | 终态 |

---

## 6. 与其他子设计的接口

| 对方 | 方向 | 接口关系 |
|---|---|---|
| 本文件应用型运行时章节 | 双向 | 应用型运行时提交 AppTask，运行平台返回 RuntimeSession 与事件。 |
| 本文件能力库调用契约章节 | 运行平台 → 能力库 | 通过服务发现获取能力路由，按能力契约调用。 |
| 本文件安全基线章节 | 横切 | 调度、服务发现、代执行都必须携带授权上下文与审计信息。 |
| `SDD-DE-OPERATIONS-PLATFORM` | 运行平台 → 运营平台 | 输出 RuntimeEvent、运行指标和调用账本。 |
| 本文件人机协同检查点章节 | 双向 | Checkpoint 暂停/恢复/接管协议。 |
| `SDD-BIZ-SYSTEM-INTEGRATION` | 运行平台 → 连接器 | 通过服务发现路由到业务系统连接器。 |

---

## 7. M1 最小闭环

M1 不追求完整平台，而是先形成可验证闭环。

### 7.1 最小能力

```text
接收 RuntimeTaskEnvelope
创建 RuntimeSession
执行 Step
命中 Checkpoint 后暂停
恢复后完成任务
输出 RuntimeEvent
```

### 7.2 最小 Demo

```text
触发：人工指派一个“库存异常提醒”模拟 AppTask
执行：调用一个 mock 能力生成处理建议
协同：进入确认 Checkpoint
反馈：用户确认后完成任务，输出 task.completed 事件
```

### 7.3 M1 Done 条件

| 条件 | 说明 |
|---|---|
| 能表达两类任务进入同一运行平台 | build/app 通过 RuntimeTaskEnvelope 区分 |
| 能表达应用型任务端到端链路 | 触发→调度→编排→执行→协同→反馈 |
| 能表达服务注册 / 发现 | mock 能力通过 ServiceRegistration / ServiceRoute 表达 |
| 能输出运行事件 | 至少输出 task.scheduled / task.started / checkpoint.waiting / task.completed |
| 能支撑后续子设计 | APP-DE-RUNTIME、OPERATIONS、HIC 有明确接口入口 |

---

## 8. 人机协同检查点协议

本章节定义运行平台中人机协同检查点（Checkpoint）的完整协议，供动态工作流引擎实现和运营平台消费。

### 8.1 Checkpoint 数据结构

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 检查点唯一 ID |
| `sessionId` | string | 所属 RuntimeSession |
| `taskEnvelopeId` | string | 所属 RuntimeTaskEnvelope |
| `type` | enum | 检查点类型（见 §8.3） |
| `stepIndex` | number | 检查点所在步骤索引 |
| `title` | string | 人工可读的检查点标题 |
| `description` | string? | 附加说明，帮助人工理解需要确认的内容 |
| `payload` | object | 需要人工处理的上下文数据（如建议方案、待审核内容等） |
| `requestedBy` | string | 触发本检查点的数字员工 ID |
| `assignedTo` | string? | 指定响应人员 ID；为空则由平台按权限规则分配 |
| `status` | enum | `pending` / `resolved` / `takeover` / `timeout` |
| `createdAt` | ISO8601 | 检查点创建时间（对应 `checkpoint.waiting` 事件时间） |
| `resolvedAt` | ISO8601? | 人工完成响应的时间（对应 `checkpoint.resumed` 事件时间） |
| `resolution` | object? | 人工响应结果（confirm/reject/修改内容等，依 type 而定） |
| `timeoutPolicy` | object | 超时策略（见 §8.4） |

### 8.2 暂停 / 恢复 / 接管操作定义

| 操作 | 触发方 | 说明 |
|---|---|---|
| **暂停**（pause） | 动态工作流引擎 | 执行到 Checkpoint 节点时自动暂停，Session 状态切换为 `waiting`，发出 `checkpoint.waiting` 事件 |
| **恢复**（resume） | 人工 / 系统 | 人工完成确认或审核后，通过运营平台 / API 提交 resolution，引擎接收后恢复执行，Session 切换回 `running`，发出 `checkpoint.resumed` 事件 |
| **接管**（takeover） | 人工 | 人工判断数字员工无法继续处理，主动接管整个会话，Session 切换为 `takeover`，发出 `task.takeover` 事件；接管后由人工完成处理或交还 |

> 恢复操作必须携带 `resolution` 对象；运行平台校验 resolution 格式后才推进下一个 Step。

### 8.3 Checkpoint 类型

| 类型 | 说明 | 典型场景 |
|---|---|---|
| `confirm` | 二值确认（继续 / 取消） | 发送通知前确认、执行高风险操作前确认 |
| `review` | 人工审核内容后提交修改或通过 | 生成内容审核、报告审核 |
| `decision` | 多选决策，人工从候选方案中选择 | 异常处理方案选择、资源分配决策 |
| `escalation` | 问题升级，需要更高权限人员处理 | 金额超限审批、安全事件上报 |

### 8.4 超时策略

每个 Checkpoint 可配置独立的超时策略，字段如下：

| 字段 | 类型 | 说明 |
|---|---|---|
| `timeoutSeconds` | number | 等待超时时间（秒）；为 0 表示永不超时 |
| `onTimeout` | enum | 超时后的处置策略（见下表） |
| `notifyBefore` | number? | 超时前提前通知的秒数；为空不提前通知 |

超时处置策略：

| `onTimeout` 值 | 行为 |
|---|---|
| `auto_continue` | 以默认 resolution 自动恢复执行（适用于低风险确认） |
| `fail` | 会话标记为 `failed`，发出 `task.failed` 事件 |
| `escalate` | 升级为 `escalation` 类型，重新分配给上级人员 |
| `takeover` | 自动触发人工接管流程 |

---

## 9. 能力调用契约

本章节定义运行平台调用能力库所暴露能力的统一契约。运行平台通过此契约调用能力，不直接依赖能力实现细节，保持运行层与能力层的解耦。

### 9.1 调用请求格式（CapabilityCallRequest）

| 字段 | 类型 | 说明 |
|---|---|---|
| `requestId` | string | 请求唯一 ID，用于去重和追踪 |
| `capabilityId` | string | 目标能力 ID（由服务注册表维护） |
| `capabilityVersion` | string? | 指定能力版本；为空则由服务发现选择最优版本 |
| `sessionId` | string | 调用来源 RuntimeSession ID |
| `taskEnvelopeId` | string | 调用来源 RuntimeTaskEnvelope ID |
| `actorId` | string | 发起调用的数字员工实例 ID |
| `traceId` | string | 分布式追踪 ID |
| `authContext` | object | 授权上下文（权限令牌、业务域、数据权限范围） |
| `input` | object | 能力调用输入参数（结构由能力契约定义） |
| `timeoutMs` | number | 调用超时时间（毫秒） |
| `retryPolicy` | object? | 调用级重试策略（见 §9.3） |

### 9.2 调用响应格式（CapabilityCallResponse）

| 字段 | 类型 | 说明 |
|---|---|---|
| `requestId` | string | 对应请求 ID |
| `status` | enum | `success` / `failed` / `timeout` / `rejected` |
| `output` | object? | 能力执行结果（status=success 时有值） |
| `errorCode` | string? | 错误码（status 非 success 时有值，见 §9.3） |
| `errorMessage` | string? | 错误描述（人可读） |
| `executedBy` | string | 实际执行该能力的服务实例 ID |
| `durationMs` | number | 能力实际执行耗时（毫秒） |
| `traceId` | string | 分布式追踪 ID（与请求一致） |

### 9.3 错误码与重试策略

标准错误码：

| 错误码 | 含义 | 是否可重试 |
|---|---|---|
| `CAP_NOT_FOUND` | 能力 ID 不存在或未注册 | 否 |
| `CAP_VERSION_MISMATCH` | 指定版本不可用 | 否 |
| `CAP_UNAUTHORIZED` | 授权上下文权限不足 | 否 |
| `CAP_INPUT_INVALID` | 输入参数校验失败 | 否 |
| `CAP_TIMEOUT` | 能力执行超时 | 是（指数退避） |
| `CAP_RATE_LIMITED` | 能力调用频率超限 | 是（等待后重试） |
| `CAP_INTERNAL_ERROR` | 能力内部错误 | 是（有限次数） |
| `CAP_UNAVAILABLE` | 能力服务暂时不可用 | 是（等待后重试） |

重试策略字段（`retryPolicy`）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `maxAttempts` | number | 最大尝试次数（含首次），建议不超过 3 |
| `backoffType` | enum | `fixed` / `exponential` |
| `initialDelayMs` | number | 首次重试等待时间（毫秒） |
| `maxDelayMs` | number | 最大重试等待时间（毫秒） |
| `retryOn` | string[] | 允许重试的错误码列表 |

> 运行平台通过此契约调用能力库暴露的能力，不直接依赖能力实现细节；能力库服务实现可在不影响此契约的前提下独立演进。

---

## 10. 待决问题

| # | 问题 | 影响 | 处置 |
|---|---|---|---|
| Q1 | App Task Runner 复用 task-runner 还是新建 | 应用型运行时落地形态 | 在本文件后续应用型任务制章节中通过 PoC 决策 |
| Q2 | RuntimeTaskEnvelope 是否落成统一对象 | 两类任务是否共入口 | M1 demo 验证 |
| Q3 | RuntimeEvent 是否作为运营平台唯一输入 | 影响运营平台指标设计 | `SDD-DE-OPERATIONS-PLATFORM-v0.7.md` 细化 |
| Q4 | 服务发现是否承载能力库和连接器统一路由 | 影响能力库/业务集成 | M1 先定义抽象，后续子设计落细 |

---

## 11. 下一步

本设计完成后，建议继续补充本文件内的应用型运行时章节，并启动管理/运营平台主子设计：

```text
docs/specs/SDD-DE-MANAGEMENT-PLATFORM-v0.7.md
docs/specs/SDD-DE-OPERATIONS-PLATFORM-v0.7.md
```

能力库调用契约、安全基线、人机协同检查点先作为本文件章节承载，不单独拆成 SDD；如后续复杂度上升，再按 `PLAN-DEOS-SUBDESIGNS-v0.7.md` 的规则独立成文。
