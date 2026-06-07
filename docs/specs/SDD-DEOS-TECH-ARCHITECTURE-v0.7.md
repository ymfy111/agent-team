# SDD-DEOS-TECH-ARCHITECTURE｜数字员工操作系统技术实现架构

> 文档类型：System Architecture Design / 技术实现视图
> 版本：v0.7.0
> 状态：草案（Draft，待评审）
> UpdatedAt：2026-06-07
> 归位：DEOS 物理实现 / 部署视图，横切 2F 运行层与 3F 系统层
> 关联逻辑架构：`docs/specs/SDD-DEOS-ARCHITECTURE-v0.7.md`
> 关联运行平台：`docs/specs/SDD-DE-RUNTIME-PLATFORM-v0.7.md`
> 评审依据：本设计经 oracle 架构评审，P0/P1 修正已纳入

---

## §0 核心结论

本文件是 DEOS 的**技术实现视图 / 物理部署视图**，与逻辑架构互补：

- `SDD-DEOS-ARCHITECTURE-v0.7.md` 定义"是什么 / 分哪几层"；
- `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 定义运行平台的逻辑对象模型；
- **本文件** 定义"用什么技术、进程怎么拆、中间件什么关系、部署什么拓扑"。

**核心技术决策三句话：**

1. **动态工作流**：PostgreSQL 任务表 + Scheduler 驱动，不引入 Temporal。DEOS 的动态可调（运行中改任务表）与 Temporal 的确定性重放模型有根本张力，且当前阶段不需要 Temporal 核心价值。
2. **事件总线**：NATS JetStream，快路径派发 + 慢路径 PG 轮询双保险。
3. **控制面/执行面分离**：中心控制面管 Device 生命周期，分布式 Device 各自承载 Scheduler + 沙箱 + LiteLLM，任务派发在 Device 本地闭环，不经网关转发。

**一句话本质：** DEOS 的动态工作流是「任务表驱动 + 事件推进 + 人 / DE 随时可调整」，不是 DAG 静态编排，不是确定性重放引擎。

---

## §1 技术选型决策

### §1.1 选型汇总表

| 组件 | 选型 | 理由 | 备选 | 何时升级 |
|---|---|---|---|---|
| 动态工作流引擎 | 自研 Scheduler + PG 任务表 | 任务表强结构天然契合 PG，动态可调需求与 DAG 重放不符 | Temporal（见 §1.2） | 满足 §1.2 退出条件三连时可切换为可替换后端 |
| 事件总线 / 消息 | NATS JetStream | 轻量、嵌入式可行、内置持久化与消费组、Push/Pull 并存 | Kafka（数据量大时）、Redis Streams（极小规模） | 单集群消息 TPS > 10 万 / 秒或需要严格有序消费时评估 Kafka |
| 主数据库 | PostgreSQL（+ JSONB） | 任务表强结构 + 动态 payload 混合，JSONB 教科书匹配；ACID 事务保障 CAS 正确性 | MySQL（功能不及 PG）、TiDB（复杂度高） | 单库 QPS > 5 万或需要水平写扩展时评估分库或 TiDB |
| 缓存 / 状态 | Redis | 热状态缓存、分布式锁、并发上限控制 | Memcached（功能不及） | 高可用时加 Redis Sentinel / Cluster |
| 大模型网关 | LiteLLM（每台 Device 本地一个实例） | 本地路由多模型、统一 OpenAI 兼容接口、成本统计；避免沙箱直连外部模型 API | 中心化 LiteLLM（网络延迟高）、直连模型 API（无统一管控） | Device > 50 台且需要统一 key 管理时考虑中心 + 边缘两级架构 |
| 服务注册 / 发现 | NATS 内置服务发现 + PG 注册表补充 | NATS 原生支持服务注册协议，PG 补充持久化服务清单 | Consul、etcd | 多数据中心场景评估 Consul |
| 可观测 | OpenTelemetry → Prometheus + Grafana | OTel 厂商中立，Prometheus + Grafana 生态成熟 | Datadog（成本高）、Jaeger（仅追踪） | 按需叠加 Jaeger（追踪）、Loki（日志） |
| 容器化 | Docker（部署方式 M1 待定） | M1 先以 Docker 镜像形态交付，Compose 本地开发 | K8s（M2/M3 规模化时） | Device 数 > 20 或需要编排自动伸缩时评估 K8s |

### §1.2 为什么 M1 不用 Temporal

Temporal 是优秀的确定性工作流引擎，但与 DEOS M1 的核心需求存在根本性张力：

#### 张力一：动态可调 vs 确定性重放

Temporal 的核心设计是"代码即工作流、历史事件确定性重放"——同一次工作流必须始终重放出相同结果，这要求工作流代码本身不可在运行中修改。

DEOS 的核心诉求恰恰相反：规划岗数字员工可以**运行中修改任务表**（调整分工、改变步骤、提前结束某 WorkItem），这是"动态工作流"的本质。在 Temporal 中运行中改流程逻辑最别扭，必须通过 Signal + 版本门控绕行，工程复杂度远超直接维护任务表。

#### 张力二：PRD 红线 vs Temporal 核心价值

PRD-v0.7 §282 已明确当前阶段不做以下能力：

> 完整复杂状态机引擎 / 多级任务依赖图 / 全自动多 Runtime 调度 / 复杂失败重试

Temporal 的核心价值点（Saga 补偿、复杂 DAG、崩溃后精确重放）正好全部落在这条红线外。引入 Temporal 等于为当前阶段不需要的能力付出高昂的运维复杂度。

#### 张力三：数据模型契合度

DEOS 的任务对象强结构（Plan / Stage / WorkItem / Task / Step 明确父子关系、状态机、指派策略），PostgreSQL + JSONB 是教科书级匹配，天然支持复杂查询、复合索引、事务保障。Temporal 在数据层面反而要求另建持久化适配器。

#### Temporal 退出条件表（三连）

满足以下任一条件时重新评估引入 Temporal 作为可替换后端：

| 条件 | 描述 | 量级参考 |
|---|---|---|
| 真正出现 Saga 补偿需求 | 一个任务失败需要回滚 N 个跨系统副作用（如跨系统的库存扣减 + 支付 + 物流联动）；当前 DEOS 失败任务仅需标记 + 人工介入，无跨系统回滚 | 出现第一个需要自动多系统 rollback 的场景 |
| 长时定时器密集 + 确定性重放强诉求 | 金融级场景：「3 天后未审批自动撤单且崩溃后需要精确恢复到毫秒」；当前 Checkpoint 超时策略已覆盖普通超时，无精确恢复要求 | 出现"系统崩溃后需精确恢复工作流状态"的 SLA 要求 |
| 单流程极深分支 + 可视化追踪诉求 | 单任务步骤数 > 数十、分支深度 > 5 层且需要可视化 DAG 追踪；当前 DEOS Step 链路扁平，无此复杂度 | 单 Task 步骤数稳定超过 30 步且出现追踪困难的反馈 |

**护栏**：即便未来引入 Temporal，也作为「动态工作流引擎」的**可替换后端**纳入，PG 任务表仍是事实数据源，Temporal 仅作执行引擎，不替代数据主权。

---

## §2 进程拓扑与部署视图

### §2.1 全局拓扑图

```text
╔══════════════════════════════════════════════════════════════════════╗
║                        中心基础设施层                                ║
║                                                                      ║
║   ┌──────────────────┐  ┌──────────────┐  ┌──────────────────────┐  ║
║   │  PostgreSQL       │  │ NATS JetStream│  │  Redis               │  ║
║   │  ─ tasks 表       │  │  ─ 事件总线   │  │  ─ 热状态缓存        │  ║
║   │  ─ sessions 表    │  │  ─ 调度信号   │  │  ─ 分布式锁          │  ║
║   │  ─ events 表      │  │  ─ 注册事件   │  │  ─ 并发上限          │  ║
║   │  ─ checkpoints 表 │  │              │  │                      │  ║
║   │  ─ plans/stages等 │  │              │  │                      │  ║
║   └──────────────────┘  └──────────────┘  └──────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════╝
              ▲                    ▲                    ▲
              │                    │                    │
╔═════════════╪════════════════════╪════════════════════╪═════════════╗
║             │  中心控制面         │                    │             ║
║    ┌─────────────────────────────────────────────────────────────┐  ║
║    │  Runtime Gateway（中心）                                     │  ║
║    │  · Device 注册 / 注销 / 心跳汇总                             │  ║
║    │  · 全局 Device 状态视图（Device-A online, Device-B offline）  │  ║
║    │  · 下发沙箱启停 / 配置更新指令给目标 Device Daemon             │  ║
║    │  · 孤儿任务回收触发（Device 离线时）                          │  ║
║    │  · 服务路由（ServiceRouting）：能力 endpoint 发现              │  ║
║    │  ⚠ 不做任务派发（TaskDispatch 由各 Device Scheduler 本地完成） │  ║
║    └─────────────────────────────────────────────────────────────┘  ║
╚═════════════════════════════════════════════════════════════════════╝
              │  NATS 指令通道           │  NATS 指令通道
              ▼                          ▼
╔══════════════════════╗    ╔══════════════════════╗
║  Device-A            ║    ║  Device-B            ║    ...更多 Device
║                      ║    ║                      ║
║  ┌─────────────────┐ ║    ║  ┌─────────────────┐ ║
║  │ Sandbox Daemon  │ ║    ║  │ Sandbox Daemon  │ ║
║  │ · 沙箱生命周期  │ ║    ║  │ · 沙箱生命周期  │ ║
║  │ · 接网关指令    │ ║    ║  │ · 接网关指令    │ ║
║  │ · 心跳上报      │ ║    ║  │ · 心跳上报      │ ║
║  └────────┬────────┘ ║    ║  └────────┬────────┘ ║
║           │           ║    ║           │           ║
║  ┌────────▼────────┐ ║    ║  ┌────────▼────────┐ ║
║  │   Scheduler     │ ║    ║  │   Scheduler     │ ║
║  │ · 订阅 NATS     │ ║    ║  │ · 订阅 NATS     │ ║
║  │ · 轮询 PG       │ ║    ║  │ · 轮询 PG       │ ║
║  │ · CAS 领取任务  │ ║    ║  │ · CAS 领取任务  │ ║
║  │ · 送达沙箱      │ ║    ║  │ · 送达沙箱      │ ║
║  │ · Checkpoint 扫描│ ║    ║  │ · Checkpoint 扫描│ ║
║  └────────┬────────┘ ║    ║  └────────┬────────┘ ║
║           │           ║    ║           │           ║
║  ┌────────▼────────┐ ║    ║  ┌────────▼────────┐ ║
║  │   LiteLLM       │ ║    ║  │   LiteLLM       │ ║
║  │ · 本机模型网关  │ ║    ║  │ · 本机模型网关  │ ║
║  │ · 成本统计上报  │ ║    ║  │ · 成本统计上报  │ ║
║  └─────────────────┘ ║    ║  └─────────────────┘ ║
║                       ║    ║                       ║
║  ┌──────┐ ┌──────┐   ║    ║  ┌──────┐ ┌──────┐   ║
║  │ DE-1 │ │ DE-2 │   ║    ║  │ DE-3 │ │ DE-4 │   ║
║  │沙箱  │ │沙箱  │   ║    ║  │沙箱  │ │沙箱  │   ║
║  └──────┘ └──────┘   ║    ║  └──────┘ └──────┘   ║
╚══════════════════════╝    ╚══════════════════════╝
```

### §2.2 单 Device 内部进程关系图

```text
                     ┌─────────────────────────────┐
                     │       Device 内部             │
                     │                               │
   网关指令 ──────▶  │  ┌──────────────────────┐    │
   心跳上报 ◀──────  │  │    Sandbox Daemon     │    │
                     │  │  · 接收启停配置指令    │    │
                     │  │  · 管理沙箱进程生命周期 │    │
                     │  │  · 向网关上报心跳/状态  │    │
                     │  └────────────┬───────────┘    │
                     │               │ 启停 / 配置     │
                     │               ▼                 │
   NATS 订阅 ──────▶ │  ┌──────────────────────┐    │
   PG 轮询 ◀───────  │  │      Scheduler        │    │
   PG 写回 ──────▶  │  │  · NATS 快路径感知     │    │
                     │  │  · PG 慢路径轮询兜底   │    │
                     │  │  · CAS 原子领取任务     │    │
                     │  │  · Checkpoint 超时巡检  │    │
                     │  └──────┬───────┬──────────┘    │
                     │         │分发    │查询能力路由    │
                     │         ▼        ▼               │
                     │  ┌────────┐  ┌──────────────┐   │
                     │  │ DE 沙箱│  │   LiteLLM    │   │
                     │  │ (×N)  │◀─│  · 统一模型   │   │
                     │  │       │  │    接口       │   │
                     │  └────────┘  └──────────────┘   │
                     └─────────────────────────────────┘
```

### §2.3 进程职责表

| 角色 | 位置 | 职责 | 不做什么 |
|---|---|---|---|
| Runtime Gateway | 中心 | Device 注册 / 注销 / 心跳汇总；全局 Device 状态视图；向 Device Daemon 下发启停 / 配置指令；孤儿任务回收触发；服务路由（能力 endpoint 发现） | **不做任务派发**；不直接操作任务表（任务派发由各 Device Scheduler 本地完成） |
| Sandbox Daemon | 每台 Device | 接收网关启停 / 配置指令；管理本机沙箱进程生命周期（启动 / 停止 / 重启）；定期向网关上报心跳和本机沙箱状态 | 不参与任务调度；不读写任务表；不感知业务逻辑 |
| Scheduler | 每台 Device | NATS 快路径订阅感知新任务；PG 轮询慢路径兜底；CAS 原子领取任务（`ready→running`）；将任务送达对应沙箱；依赖解除后推进 blocked 任务；Checkpoint 超时巡检与处置 | 不做跨 Device 任务迁移；不直接调用模型；不感知沙箱内部执行细节 |
| LiteLLM | 每台 Device | 本机大模型调用的统一网关；多模型路由（OpenAI 兼容接口）；token 和成本统计上报为 RuntimeEvent / metrics | 不做任务调度；不持久化任务状态；不做跨 Device 流量转发 |
| DE 沙箱 | 每台 Device（×N） | 在隔离环境中执行具体 Task 的 Steps；通过语义化 REST API 与运行平台交互；写 Checkpoint；调用 LiteLLM 调用模型能力 | **无 PG 直连凭据**（安全红线，见 §7）；不感知其他 DE 的任务；不直接读写任务表 |

---

## §3 对象映射层

本章是连接物理设计与 `SDD-DE-RUNTIME-PLATFORM` 逻辑对象模型的桥梁，确保物理实现与逻辑设计精确对应。

### §3.1 PG 物理 schema 与逻辑对象映射表

| PG 物理 schema | 对应 SDD 逻辑对象 | 说明 |
|---|---|---|
| `tasks` 表 | `AppTask`（业务语义层）+ `RuntimeTaskEnvelope`（M1 物理合并落库） | `assignee`（由 `target_policy` 实现）/ `depends_on`（依赖列表）/ `status`（状态机）/ `payload`（JSONB 扩展数据）均在此表；`type` 字段区分 `build` / `app`（对应 `RuntimeTaskEnvelope.type`） |
| `sessions` 表 | `RuntimeSession`（状态机见 SDD §5.7） | 一条任务运行会话，含 `status`（created/running/waiting/takeover/done/failed）、`steps`（JSONB）、`startedAt` / `endedAt` |
| `events` 表 / NATS RuntimeEvent 主题 | `RuntimeEvent`（字段见 SDD §5.4，必须含 `traceId`） | 对外审计 / 运营 / 本体回流事件；`events` 表为持久化账本，NATS 为广播通道；运营平台消费此流，不读取运行平台内部表 |
| `checkpoints` 表 | `Checkpoint`（字段见 SDD §8.1） | 人机协同节点；含 `status`（pending/resolved/takeover/timeout）、`timeoutPolicy`、`resolution` |
| `plans` / `stages` / `work_items` 表 | DEOS 层级结构（Plan / Stage / WorkItem） | 构建型数字员工任务的父级容器；应用型 `AppTask` 可挂靠 `work_items` 或直接关联 `plans` |
| `devices` 表 | SDD-DE-RUNTIME-PLATFORM §4.6 运行管理 Device / 运行节点 | Runtime Gateway 通过心跳维护 Device 在线状态；孤儿任务回收依赖 `last_heartbeat_at` 判离线 |
| `de_instances` 表 | SDD-DE-RUNTIME-PLATFORM §4.4 服务注册 — 数字员工实例 | 运行侧 DE 实例注册副本；`team_id` / `role` 权威主表在管理平台（SDD-DE-MANAGEMENT-PLATFORM），此表仅作运行引用 |
| `service_registrations` 表 | SDD-DE-RUNTIME-PLATFORM §4.4 ServiceRegistration（能力服务 / 连接器服务 / 运行节点） | 对齐最小字段（serviceId / serviceType / endpoint / capabilities / owner / health / lastHeartbeatAt）；NATS 内置发现 + 此表持久化服务清单（见 §1.1） |
| `sessions.steps`（JSONB 字段） | SDD Step（运行态步骤明细） | M1 阶段 Step 存入 `sessions.steps` JSONB，不建独立表；理由见 §4.3（Step 存储形态决策） |
| `ServiceRoute`（SDD §4.5） | 服务发现输出对象 | **运行时动态计算，不落表**；服务发现查询 `service_registrations` 表 + NATS 发现后即时生成 ServiceRoute，不持久化 |

### §3.2 物理合并 / 逻辑分层说明

**AppTask 与 RuntimeTaskEnvelope 的合并策略：**

M1 阶段 `AppTask`（应用侧业务语义）与 `RuntimeTaskEnvelope`（运行平台调度信封）物理上合并为 `tasks` 表的一条记录，以降低实现复杂度。但逻辑层面仍严格区分两层：

- `AppTask` 字段集：`biz_type`（业务类型）、`trigger`（触发来源）、`context_ref`（业务上下文引用）、`priority`
- `RuntimeTaskEnvelope` 字段集：`type`（build/app）、`target_policy`（jsonb，调度策略）、`status`、`depends_on`

未来出现以下场景时可拆分为独立表：
- build / app 双入口流量差异大，需要独立路由逻辑；
- 多租户场景，不同租户的 AppTask 路由到不同 RuntimeTaskEnvelope 处理池；
- 运行平台需要无感知业务语义层独立演进。

### §3.3 build 和 app 两类任务共表策略

`tasks` 表通过 `type` 字段（枚举：`build` / `app`）区分两类任务，**对齐 SDD §5.1 RuntimeTaskEnvelope 的 type 字段**，直接回应 DEOS「两类共底座」命题：

- `type = build`：构建型数字员工任务，属于版本制流程（Plan/Stage/WorkItem/Task/Step）
- `type = app`：应用型数字员工任务，属于任务制快循环（AppTask/AppSession/Step/Checkpoint）

两类任务共享同一调度引擎、同一状态机、同一事件模型，通过 `type` 字段在查询层面分流。

---

## §4 PG 数据模型

### §4.1 数据层级

```text
Plan（计划）
  └── Stage（阶段）×N
        └── WorkItem（工作项）×N
              └── Task（任务）×N      ← AppTask / build task 均在此层
                     └── Step（步骤）×N  ← 运行时动态生成，M1 存 sessions.steps JSONB（见 §4.3）
```

全部层级靠 PG 外键维护，**事实数据源唯一在 PG**，不在内存或缓存中重构层级关系。

### §4.2 各表 Schema 骨架

#### plans 表

```sql
CREATE TABLE plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL,                    -- 'build' | 'app'
  title         text NOT NULL,
  description   text,
  owner_de_id   text,                             -- 规划岗 DE ID
  team_id       text,                             -- 所属团队
  status        text NOT NULL DEFAULT 'active',   -- active | archived | done
  context_ref   jsonb,                            -- 业务上下文引用
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

#### stages 表

```sql
CREATE TABLE stages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     uuid NOT NULL REFERENCES plans(id),
  title       text NOT NULL,
  seq         int  NOT NULL,                       -- 顺序编号
  status      text NOT NULL DEFAULT 'pending',     -- pending | active | done | skipped
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

#### work_items 表

```sql
CREATE TABLE work_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id    uuid NOT NULL REFERENCES stages(id),
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'pending',     -- pending | active | done | cancelled
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

#### tasks 表

```sql
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id    uuid REFERENCES work_items(id),  -- 可选，直接触发的 AppTask 可为 null
  type            text NOT NULL,                    -- 'build' | 'app'
  biz_type        text,                             -- 业务类型（应用侧用）
  title           text NOT NULL,
  description     text,
  -- 调度字段
  status          text NOT NULL DEFAULT 'created',
  -- 状态枚举: created | ready | running | waiting | blocked | takeover | done | failed
  -- blocked: 依赖未解（前置 task 未完成，DE 间依赖阻塞）
  -- waiting: 等待人机协同 Checkpoint（等人响应）
  -- 两者语义不同，严格区分，见 §4.3
  target_policy   jsonb NOT NULL,
  -- M1: {"type":"direct","deId":"de-xxx"}
  -- 预留: {"type":"queue","role":"executor","team":"team-xxx"}
  --       {"type":"balanced","pool":"pool-xxx"}
  depends_on      uuid[],                           -- 前置 task id 列表
  priority        int NOT NULL DEFAULT 50,          -- 0-100，越大越优先
  trigger         text,                             -- 'manual'|'event'|'schedule'|'upstream'
  context_ref     jsonb,                            -- 业务上下文引用
  payload         jsonb,                            -- 任务执行参数（结构化）
  -- 追踪字段
  trace_id        text,                             -- 分布式追踪 ID
  actor_id        text,                             -- 创建者 DE / 人员 ID
  -- 时间字段
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  started_at      timestamptz,
  completed_at    timestamptz
);
```

#### sessions 表

```sql
CREATE TABLE sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id             uuid NOT NULL REFERENCES tasks(id),
  -- 对应 SDD RuntimeSession，状态机见 SDD §5.7
  status              text NOT NULL DEFAULT 'created',
  -- 枚举: created | running | waiting | takeover | done | failed
  steps               jsonb,           -- 步骤列表（结构同 SDD Step 定义）
  current_step_index  int DEFAULT 0,
  trace_id            text,
  started_at          timestamptz,
  ended_at            timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
```

#### checkpoints 表

```sql
CREATE TABLE checkpoints (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid NOT NULL REFERENCES sessions(id),
  task_id           uuid NOT NULL REFERENCES tasks(id),
  type              text NOT NULL,       -- 'confirm'|'review'|'decision'|'escalation'
  step_index        int,
  title             text NOT NULL,
  description       text,
  payload           jsonb,               -- 需人工处理的上下文
  requested_by      text NOT NULL,       -- 触发检查点的 DE ID
  assigned_to       text,                -- 指定响应人员 ID
  status            text NOT NULL DEFAULT 'pending',
  -- 枚举: pending | resolved | takeover | timeout
  timeout_policy    jsonb,
  -- {"timeoutSeconds":3600,"onTimeout":"auto_continue","notifyBefore":300}
  -- onTimeout: auto_continue | fail | escalate | takeover（对齐 SDD §8.4）
  resolution        jsonb,               -- 人工响应结果
  created_at        timestamptz NOT NULL DEFAULT now(),
  resolved_at       timestamptz
);
```

#### events 表

```sql
CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL,
  -- 枚举: task.scheduled | task.started | step.started | step.completed
  --       checkpoint.waiting | checkpoint.resumed | task.completed
  --       task.failed | task.takeover（对齐 SDD §5.4）
  task_id           uuid REFERENCES tasks(id),
  session_id        uuid REFERENCES sessions(id),
  step_index        int,
  checkpoint_id     uuid REFERENCES checkpoints(id),
  actor_id          text NOT NULL,       -- 触发事件的 DE / 人员 / 系统 ID
  trace_id          text NOT NULL,       -- 分布式追踪 ID（必须字段，对齐 SDD §5.4）
  payload           jsonb,               -- 事件扩展数据
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

#### devices 表

> 对应 SDD-DE-RUNTIME-PLATFORM §4.6 运行管理的 Device / 运行节点。Runtime Gateway 通过心跳维护 Device 在线状态；孤儿任务回收依赖 `last_heartbeat_at` 判离线。

```sql
CREATE TABLE devices (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname            text NOT NULL,                    -- 节点主机名
  status              text NOT NULL DEFAULT 'offline',
  -- 枚举: online | offline | draining
  -- draining: 节点正在优雅退出，不再接受新任务但已有任务继续执行
  ip_endpoint         text,                             -- 节点可达地址（含端口），如 192.168.1.10:7700
  capacity            jsonb,
  -- 资源容量描述，如 {"max_sandboxes":4,"cpu_cores":8,"mem_gb":16}
  last_heartbeat_at   timestamptz,                      -- 最近一次心跳时间，离线判定依据
  registered_at       timestamptz,                      -- 首次注册时间
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
```

#### de_instances 表

> 对应 SDD-DE-RUNTIME-PLATFORM §4.4 服务注册 — 数字员工实例。此表是运行侧的 DE 实例注册副本，Scheduler 依此派发任务。`team_id` / `role` 的权威主表在管理平台（SDD-DE-MANAGEMENT-PLATFORM），运行侧仅做引用副本，不做写回。

```sql
CREATE TABLE de_instances (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  de_id               text NOT NULL,                    -- 业务级 DE 标识，target_policy.deId 引用的就是它
  device_id           uuid REFERENCES devices(id),      -- 所在运行节点
  team_id             text,
  -- 所属团队（权威在管理平台 SDD-DE-MANAGEMENT-PLATFORM，此处为运行侧引用副本）
  role                text,
  -- DE 角色（权威在管理平台），如 planner | executor | reviewer
  type                text NOT NULL,                    -- 'build' | 'app'（对齐 RuntimeTaskEnvelope.type）
  status              text NOT NULL DEFAULT 'idle',
  -- 枚举: active | idle | busy | offline
  -- idle: 已注册待命，可接收任务
  -- busy: 正在执行任务
  -- offline: 心跳超时，标记下线
  sandbox_ref         text,                             -- 沙箱实例引用（容器ID 或沙箱标识）
  last_heartbeat_at   timestamptz,                      -- 最近一次心跳时间
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
```

#### service_registrations 表

> 对应 SDD-DE-RUNTIME-PLATFORM §4.4 ServiceRegistration（能力服务 / 连接器服务 / 运行节点）。字段对齐 SDD 最小字段集（serviceId / serviceType / endpoint / capabilities / owner / health / lastHeartbeatAt）。
>
> **注意：** SDD §4.5 `ServiceRoute`（服务发现输出对象）是查询时动态计算的路由结果，不落表；服务发现查询本表 + NATS 内置发现后即时生成 `ServiceRoute`，不持久化。

```sql
CREATE TABLE service_registrations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id          text NOT NULL,                    -- 服务唯一标识（对齐 SDD serviceId）
  service_type        text NOT NULL,
  -- 枚举: de_instance | capability | connector | runtime_node
  -- 对齐 SDD §4.4 注册对象分类
  endpoint            text,                             -- 服务可达地址
  capabilities        jsonb,                            -- 能力描述，如 {"skills":["code-gen","review"]}
  owner               text,                             -- 所属 DE / 节点 / 团队标识
  health              text NOT NULL DEFAULT 'unknown',
  -- 枚举: healthy | unhealthy | unknown
  version             text,                             -- 服务版本号
  last_heartbeat_at   timestamptz,                      -- 最近一次心跳时间（对齐 SDD lastHeartbeatAt）
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
```

> **M1 指令下发策略：** 网关向 Device Daemon 下发指令（启停 / 配置沙箱）通过 NATS 请求/回复直接下发，不落持久化账本。M1 阶段 NATS 请求/回复的即时响应语义已满足操作确认需求，无需 `device_commands` 表。待后续出现跨 Device 批量操作审计、指令失败重试、合规审计等需求时，再补 `device_commands` 表（字段预留：`id` / `device_id` / `command_type(start_sandbox/stop_sandbox/configure)` / `payload jsonb` / `status(pending/acked/done/failed)` / `issued_by` / `created_at` / `acked_at`）。

### §4.3 Step 存储形态决策

**决策：M1 阶段 Step 存储于 `sessions.steps` JSONB 字段，不建独立 `steps` 表。**

**理由：**

1. Step 是运行态明细，生命周期完全绑定 Session——Session 结束则该批 Steps 归档，无跨 Session 查询单个 Step 的业务需求。
2. 「步骤成功率」等运营指标来自 `events` 表的 `step.started` / `step.completed` 事件聚合，不依赖独立 `steps` 表。
3. JSONB 足够表达 Step 序列，避免表数量膨胀，降低 M1 实现复杂度。

**`sessions.steps` JSONB 内部结构示例（单个 Step 对象）：**

```json
{
  "index": 0,
  "title": "分析需求并拆解子任务",
  "status": "done",
  "result": { "summary": "已拆解为 3 个子任务", "artifacts": [] },
  "started_at": "2026-06-07T10:00:00Z",
  "completed_at": "2026-06-07T10:02:30Z"
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `index` | int | Step 在本 Session 中的顺序编号，从 0 起 |
| `title` | text | Step 标题，对齐 SDD Step 概念 |
| `status` | text | `running` \| `done` \| `failed` |
| `result` | jsonb | Step 执行结果（结构化，可为 null） |
| `started_at` | timestamptz（ISO8601 字符串） | Step 开始时间 |
| `completed_at` | timestamptz（ISO8601 字符串） | Step 完成时间，未完成时为 null |

**演进门（预留）：** 未来若出现以下任一需求，迁移为独立 `steps` 表：
- Step 级复杂查询（如跨 Session 统计特定 title 的 Step 耗时）；
- Step 级独立重试（需要对单个 Step 做状态机驱动和依赖管理）。

---

### §4.4 状态字段语义区分（blocked vs waiting）

以下两个状态语义不同，**严格区分，不可混用**：

| 状态 | 语义 | 触发条件 | 解除条件 | 典型场景 |
|---|---|---|---|---|
| `blocked` | 依赖未解，DE 间依赖阻塞 | 前置 task（`depends_on`）中存在未完成的任务 | 所有前置 task 变为 `done` | Task-B 依赖 Task-A，Task-A 未完成时 Task-B 处于 blocked |
| `waiting` | 等待人机协同 Checkpoint | 执行进入人机协同节点，DE 主动发起 Checkpoint | 人工 resolve Checkpoint 或超时按策略处置 | 执行岗发现异常，创建 Checkpoint 等规划岗/人工确认处理方案 |

**混用的危害**：运营平台「人机协同等待时长」指标基于 `checkpoint.waiting` → `checkpoint.resumed` 事件对计算，若 `blocked` 状态被误判为 `waiting`，等待时长指标失真，无法反映人工响应效率。

### §4.5 关键索引设计

```sql
-- 任务派发核心索引：Scheduler 查询待执行任务
CREATE INDEX idx_tasks_target_policy_status
  ON tasks USING gin (target_policy)
  WHERE status IN ('ready', 'blocked', 'waiting');

-- 部分索引（热数据），仅包含活跃状态任务，减少索引大小
CREATE INDEX idx_tasks_active_status
  ON tasks (status)
  WHERE status IN ('created', 'ready', 'running', 'waiting', 'blocked', 'takeover');

-- 依赖解除查询：查找某 task 完成后需要解除阻塞的下游任务
CREATE INDEX idx_tasks_depends_on
  ON tasks USING gin (depends_on);

-- Checkpoint 超时巡检索引
CREATE INDEX idx_checkpoints_pending_timeout
  ON checkpoints (created_at)
  WHERE status = 'pending';

-- 审计查询：按 traceId 聚合事件
CREATE INDEX idx_events_trace_id
  ON events (trace_id);

-- 运营平台消费：按 type + 时间查询 RuntimeEvent
CREATE INDEX idx_events_type_created
  ON events (type, created_at);

-- Scheduler 查本机活跃 DE 实例
CREATE INDEX idx_de_instances_device_status
  ON de_instances (device_id, status);

-- target_policy.deId 反查 DE 实例
CREATE INDEX idx_de_instances_de_id
  ON de_instances (de_id);

-- 网关查离线 Device（孤儿任务回收依据）
CREATE INDEX idx_devices_status_heartbeat
  ON devices (status, last_heartbeat_at);

-- 服务发现查健康服务（按 service_type + health 过滤）
CREATE INDEX idx_service_registrations_type_health
  ON service_registrations (service_type, health);
```

**冷热分离策略**：`tasks.status` 为 `done` / `failed` 的终态记录定期（建议每日）归档到 `tasks_history` 表，主表仅保留活跃数据，保障 Scheduler 轮询查询性能。

---

## §5 任务派发机制

### §5.1 任务写入（规划岗 DE 视角）

规划岗 DE 写入任务时执行双写：**① 写 PG（权威事实源）→ ② 发 NATS 调度信号（加速派发）**。

```python
# 伪代码：规划岗 DE 写任务
def create_task(task_data: dict, target_de_id: str):
    # 步骤1：写 PG（权威事实源，事务保障）
    task = db.execute("""
        INSERT INTO tasks (type, title, target_policy, status, depends_on, payload, trace_id, actor_id)
        VALUES (%s, %s, %s, 'ready', %s, %s, %s, %s)
        RETURNING id
    """, (
        task_data['type'],
        task_data['title'],
        json.dumps({"type": "direct", "deId": target_de_id}),  # M1 直接指名
        task_data.get('depends_on', []),
        json.dumps(task_data.get('payload', {})),
        generate_trace_id(),
        current_actor_id()
    ))

    # 步骤2：发 NATS 调度信号（加速，非必达）
    # 使用内部调度信号主题，区别于 RuntimeEvent 主题（见 §5.4）
    nats.publish(
        subject=f"scheduler.dispatch.{target_device_id}",
        data={"taskId": task.id, "deId": target_de_id}
    )

    # 步骤3：写 RuntimeEvent（必达，落 events 表）
    emit_runtime_event("task.scheduled", task.id, actor_id=current_actor_id())

    return task.id
```

### §5.2 任务感知（Device Scheduler 视角）

Scheduler 同时维护快路径（NATS）和慢路径（PG 轮询）双保险：

```python
# 伪代码：Device Scheduler 主循环
class DeviceScheduler:

    async def run(self):
        # 快路径：订阅 NATS 调度信号（毫秒级响应）
        asyncio.create_task(self.subscribe_nats())
        # 慢路径：PG 轮询兜底（2~5 秒，防消息丢失）
        asyncio.create_task(self.poll_pg_periodically())
        # Checkpoint 超时巡检
        asyncio.create_task(self.scan_checkpoint_timeouts())

    async def subscribe_nats(self):
        async for msg in nats.subscribe(f"scheduler.dispatch.{self.device_id}"):
            task_id = msg.data['taskId']
            await self.try_acquire_task(task_id)

    async def poll_pg_periodically(self, interval_seconds=3):
        while True:
            await asyncio.sleep(interval_seconds)
            tasks = db.execute("""
                SELECT id FROM tasks
                WHERE status = 'ready'
                  AND target_policy @> %s  -- jsonb 包含查询：deId 匹配本机 DE
                ORDER BY priority DESC, created_at ASC
                LIMIT 20
            """, (json.dumps({"deId": self.de_id}),))
            for task in tasks:
                await self.try_acquire_task(task.id)

    async def try_acquire_task(self, task_id: str):
        # CAS 原子领取（见 §5.3），防止 NATS + 轮询双触发
        acquired = db.execute("""
            UPDATE tasks
            SET status = 'running', started_at = now(), updated_at = now()
            WHERE id = %s AND status = 'ready'
            RETURNING id
        """, (task_id,))
        if acquired:
            await self.dispatch_to_sandbox(task_id)
```

### §5.3 幂等保障（CAS + SKIP LOCKED）

这是**正确性要求，不是性能优化**：NATS 快路径与 PG 慢路径可能同时感知同一任务，必须用数据库层面的原子性防止双执行。

```sql
-- 方式一：条件更新 CAS（单任务领取，推荐）
UPDATE tasks
SET status = 'running', started_at = now(), updated_at = now()
WHERE id = $1 AND status = 'ready'  -- 只有 ready 状态才能被领取，保证幂等
RETURNING id;
-- 返回空集 = 已被其他路径领取，本次忽略

-- 方式二：FOR UPDATE SKIP LOCKED（批量竞争领取场景）
SELECT id FROM tasks
WHERE status = 'ready'
  AND target_policy @> $1
ORDER BY priority DESC, created_at ASC
LIMIT 5
FOR UPDATE SKIP LOCKED;  -- 其他并发 Scheduler 领取的行直接跳过，不等锁
```

**幂等保障路径**：

```text
NATS 信号到达  ──┐
                   ├──▶ try_acquire_task(task_id)
PG 轮询触发    ──┘             │
                               ▼
                    UPDATE WHERE status='ready'
                               │
               ┌───────────────┴────────────────┐
               │ 成功（返回行）                  │ 失败（返回空）
               ▼                                 ▼
         分配给沙箱执行                    已被领取，忽略本次
```

### §5.4 依赖解除机制

**同 Device 内依赖**：前置 task 全部 `done` → Scheduler 本地查询解除 `blocked→ready`。

**跨 Device 依赖**：

```text
Device-A 中 Task-1 完成
   │
   ├── 1. 写 PG：Task-1 status = 'done'
   ├── 2. 查询依赖 Task-1 的下游 task（SELECT id FROM tasks WHERE depends_on @> ARRAY[task_1_id]）
   ├── 3. 对满足全部依赖的下游 task：UPDATE status = 'blocked' → 'ready'
   └── 4. 发 NATS 事件广播（subject: scheduler.dependency.resolved）
            │
            ▼
       Device-B Scheduler 订阅 dependency.resolved 事件
            │
            └── 即时感知到 Task-2（位于 Device-B）可以推进，调用 try_acquire_task
                （不只靠轮询，减少跨 Device 依赖延迟）
```

### §5.5 调度信号与 RuntimeEvent 两条流分离

两条流在物理上可共走 NATS，但 **subject 命名空间和语义必须严格分开**：

| 流 | NATS Subject 命名 | 语义 | 可靠性要求 | 消费方 |
|---|---|---|---|---|
| 内部调度信号 | `scheduler.dispatch.*` / `scheduler.dependency.*` | 加速派发 / 依赖解除通知，属于运行平台内部协调机制 | **可丢可补**（PG 轮询兜底保障最终一致） | 仅 Device Scheduler |
| RuntimeEvent 事件流 | `runtime.events.*` | 审计 / 运营 / 本体回流事件，对外契约 | **必达**（同时落 PG events 表，NATS 为广播通道） | 运营平台、审计系统、本体回流 |

运营平台**只消费 RuntimeEvent 流**（`runtime.events.*`），不读取内部调度信号，也不直接读取运行平台内部数据库（对齐 SDD §5.5）。

---

## §6 任务指派与团队模型

### §6.1 团队结构示意

```text
Team: team-supply-chain（供应链团队）
  ├── DE-规划岗-001（device-A，沙箱 #1）
  │     职责：拆任务、写任务表、协调依赖、处理 Checkpoint
  ├── DE-执行岗-002（device-A，沙箱 #2）
  │     职责：执行具体任务步骤，调用能力
  ├── DE-执行岗-003（device-B，沙箱 #1）
  │     职责：执行具体任务步骤，调用能力（跨 Device 分布）
  └── DE-执行岗-004（device-B，沙箱 #2）
        职责：执行具体任务步骤，调用能力
```

团队配置存储在管理平台（`SDD-DE-MANAGEMENT-PLATFORM`），运行平台在任务派发时通过 `target_policy` 引用 DE ID / 团队 / 角色。

### §6.2 M1 直接指名策略

M1 阶段规划岗 DE 通过**直接指名**写入 `target_policy`：

```json
{
  "type": "direct",
  "deId": "de-executor-003"
}
```

Scheduler 在 PG 轮询时用 `target_policy @> '{"deId":"de-executor-003"}'` JSONB 包含查询精确匹配。

### §6.3 直接指名的局限与演进路径

直接指名在以下场景会产生问题：

| 局限 | 影响 | target_policy 演进方向 |
|---|---|---|
| DE 下线或扩缩容 | 指名 DE 不可用时任务卡死（需孤儿任务回收机制，见 §10） | `{"type":"queue","role":"executor","team":"team-xxx"}` — 按角色 / 团队排队 |
| 负载不均衡 | 某 DE 被大量直接指名，其他 DE 空闲 | `{"type":"balanced","pool":"pool-xxx"}` — 在池内按负载均衡选取 |
| 跨团队权限边界 | 直接指名可能突破团队权限边界 | 管理平台在写任务时校验 `deId` 是否在调用方有权限的团队范围内 |

**M1 不实现 queue / balanced 模式，但 `target_policy` 字段预留扩展 JSONB 结构**，未来无需改 schema 即可支持间接指派。

---

## §7 安全与隔离

### §7.1 架构红线：DE 沙箱无 PG 直连凭据

**DE 沙箱不得持有 PostgreSQL 连接凭据，所有数据操作必须通过语义化 REST API 进行。**

这是安全模型的根基，不是优化项。原因：

- 沙箱运行 DE 的 AI 生成代码，若持有 PG 凭据，一旦沙箱被注入恶意指令，整个数据库暴露。
- PG 直连意味着 DE 可以绕过归属校验（任何 DE 都能改其他 DE 的任务），权限模型形同虚设。
- 通过 API 层可以统一注入 authContext、做归属校验、产 RuntimeEvent 审计，直连无法做到。

**凭据分配规则**：

| 角色 | 对 PG 的访问方式 |
|---|---|
| DE 沙箱 | 无 PG 凭据，只能调用 REST API |
| Scheduler（进程级，受信任） | 持有 PG 只读 + 有限写权限（仅 tasks/sessions/events 表） |
| API 服务 | 持有 PG 完整读写权限，对 DE 沙箱提供语义化接口 |
| Runtime Gateway | 持有 PG 只读权限（读 Device 注册表）+ 写心跳表 |

### §7.2 API 层鉴权与归属校验

每条 API 调用必须携带 `authContext`（对齐 SDD §9.1 CapabilityCallRequest 的 `authContext` 字段）：

```text
authContext = {
  actorId: "de-executor-003",     // 调用方 DE 或人员 ID
  teamId: "team-supply-chain",    // 所属团队
  role: "executor",               // 岗位角色
  sessionToken: "...",            // 运行平台颁发的运行时令牌
}
```

**归属校验规则**：

| 操作 | 规则 |
|---|---|
| 执行岗 DE 读取任务 | 只能读 `target_policy.deId == actorId` 的任务（自己的任务） |
| 执行岗 DE 更新任务状态 | 只能更新自己的任务，且只能更新 `status`（不能改 `target_policy`） |
| 规划岗 DE 读取 / 写入任务 | 只能操作 `team_id == authContext.teamId` 范围内的任务 |
| 规划岗 DE 修改指派 | 只能将任务指派给同团队的 DE |

### §7.3 审计与高权限操作降级

所有任务表写操作（创建 / 状态变更 / 指派修改 / 取消）产生 `RuntimeEvent`（含 `actorId`）落 `events` 表，形成不可篡改的审计账本。

高权限操作自动触发 `escalation` 类型 Checkpoint，由人工确认后执行：

| 操作 | 触发条件 |
|---|---|
| 规划岗批量取消 WorkItem 下任务 | 一次取消 > 5 个任务 |
| 规划岗将任务重新指派给其他团队的 DE | 跨团队指派 |
| 任何角色强制接管他人任务 | takeover 操作 |

Checkpoint 类型为 `escalation`，对齐 SDD §8.3，人工确认后执行，人工拒绝后取消操作。

---

## §8 DE 操作接口（语义化 REST API）

数字员工通过以下 API 操作任务系统，**不通过 SQL 直连**。API 按资源层级组织，所有接口需携带 `authContext`。

### §8.1 计划 / 阶段 / 工作项查看

```
GET  /api/plans                          -- 查看有权限的计划列表
GET  /api/plans/:id                      -- 查看单个计划详情
GET  /api/plans/:id/stages               -- 查看计划下的阶段列表
GET  /api/stages/:id                     -- 查看单个阶段详情
GET  /api/stages/:id/workitems           -- 查看阶段下的工作项列表
GET  /api/workitems/:id                  -- 查看单个工作项详情
GET  /api/workitems/:id/tasks            -- 查看工作项下的任务列表
```

### §8.2 任务查看

```
GET  /api/tasks/mine                     -- 查看指派给我的任务（target_policy.deId == me）
GET  /api/tasks/team/:teamId             -- 查看团队任务（规划岗权限）
GET  /api/tasks/:id                      -- 查看单个任务详情
```

### §8.3 任务增改

```
POST   /api/tasks                        -- 新建任务（规划岗权限）
PATCH  /api/tasks/:id                    -- 修改任务（受归属校验限制）
DELETE /api/tasks/:id                    -- 取消任务（规划岗权限，高影响操作触发 Checkpoint）

POST   /api/tasks/batch                  -- 批量新建任务（规划岗权限）
PATCH  /api/tasks/batch                  -- 批量修改任务（规划岗权限，> 5 条触发 escalation Checkpoint）
```

### §8.4 快捷状态动作

```
POST  /api/tasks/:id/start               -- 开始执行（执行岗，触发 CAS: ready→running）
POST  /api/tasks/:id/complete            -- 标记完成（执行岗）
POST  /api/tasks/:id/fail                -- 标记失败（执行岗，需附 errorDetail）
POST  /api/tasks/:id/block               -- 标记阻塞（执行岗，需附 blockReason）
```

### §8.5 Checkpoint 操作

```
POST  /api/checkpoints                   -- 创建人机协同节点（执行岗，触发 session→waiting）
POST  /api/checkpoints/:id/resolve       -- resolve Checkpoint（人工 / 规划岗，触发 waiting→running）
POST  /api/checkpoints/:id/takeover      -- 接管（人工，触发 running/waiting→takeover）
```

### §8.6 上下文查询

```
GET  /api/team/:teamId/workload          -- 查看团队任务负载分布（规划岗）
GET  /api/plans/:id/progress             -- 查看计划进度汇总
GET  /api/stages/:id/progress            -- 查看阶段进度汇总
GET  /api/tasks/:id/events               -- 查看任务的 RuntimeEvent 列表（审计）
```

### §8.7 权限分层表

| 操作 | 人（UI） | 规划岗 DE | 执行岗 DE |
|---|---|---|---|
| 查看自己任务 | ✓ | ✓ | ✓ |
| 查看团队任务 | ✓ | ✓（限本团队） | 仅限 mine |
| 新增任务 | ✓ | ✓ | ✗ |
| 修改指派（target_policy） | ✓ | ✓（限本团队） | ✗ |
| 更新自己任务状态 | ✓ | ✓ | ✓（限 mine） |
| 取消 WorkItem | ✓ | 需 escalation Checkpoint | ✗ |
| 跨团队重指派 | ✓（管理员） | 需 escalation Checkpoint | ✗ |
| resolve Checkpoint | ✓ | ✓（限本团队范围） | ✗ |
| 接管（takeover） | ✓ | ✓ | ✗ |

---

## §9 关键场景时序

### §9.1 场景一：规划岗拆任务并派发

```text
[T1] 规划岗 DE（Device-A）调用 POST /api/tasks，指定 target_policy.deId = "de-executor-003"（Device-B）
[T2] API 服务写 PG：INSERT INTO tasks（status='ready'）；产 RuntimeEvent(task.scheduled)
[T3] API 服务发 NATS 内部调度信号：scheduler.dispatch.device-b（含 taskId）
[T4] Device-B Scheduler 收到 NATS 信号（毫秒级）
[T5] Scheduler 执行 CAS：UPDATE tasks SET status='running' WHERE id=? AND status='ready'
     → 成功：分配给 Device-B 中的 DE-executor-003 沙箱
     → 失败（被 PG 轮询先抢到）：忽略
[T6] 沙箱 DE-executor-003 开始执行 Steps；产 RuntimeEvent(task.started)
[T7] 执行完成：更新 tasks.status='done'；产 RuntimeEvent(task.completed)
[T8] Scheduler 查询依赖此任务的下游 tasks（depends_on @> ARRAY[task_id]）
[T9] 满足全部依赖的下游 task：UPDATE status='blocked'→'ready'
[T10] 发 NATS 事件：scheduler.dependency.resolved；下游 Device Scheduler 即时推进
```

### §9.2 场景二：执行中阻塞与人机协同

```text
[T1] 执行岗 DE（Device-B，沙箱 #1）执行中遇到无法自主决策的异常
[T2] 执行岗 DE 调用 POST /api/checkpoints，创建 type='decision' Checkpoint
     含 payload: {context: "...", options: ["方案A", "方案B", "上报"]}
[T3] API 服务写 checkpoints 表（status='pending'）；更新 sessions.status='waiting'
[T4] 产 RuntimeEvent(checkpoint.waiting)；通知规划岗 DE / 人工（via NATS 通知或推送）
[T5] 规划岗 DE 或人工读取 Checkpoint payload，做出决策
[T6] 调用 POST /api/checkpoints/:id/resolve，携带 resolution: {choice: "方案A"}
[T7] API 服务更新 checkpoints.status='resolved'；更新 sessions.status='running'
[T8] 产 RuntimeEvent(checkpoint.resumed)
[T9] Scheduler 感知到 session 恢复（via NATS 事件或轮询），通知沙箱继续执行
[T10] 沙箱从断点继续执行后续 Steps；最终产 RuntimeEvent(task.completed)
```

**注意**：步骤 [T3] 用的是 `waiting` 状态（等待人机协同），而非 `blocked`（等待 DE 间依赖）。状态语义严格区分，运营平台「人机协同等待时长」指标不会混入 blocked 时间。

### §9.3 场景三：规划岗动态调整计划

```text
[T1] 规划岗 DE 发现某 WorkItem 需要拆出一个新任务，调用 POST /api/tasks
[T2] 规划岗 DE 将原 Task-X（尚未开始）的 target_policy 从 DE-003 改为 DE-004
     调用 PATCH /api/tasks/:id，归属校验通过（同团队）
[T3] PG 任务表立即更新；产 RuntimeEvent(task.reassigned)
[T4] Device-A Scheduler 下一轮轮询（或 NATS 信号）感知到 Task-X target_policy 变更
[T5] Device-B 的 DE-004 Scheduler 在下一轮查询中拿到 Task-X，正常领取执行
[T6] 规划岗 DE 将 WorkItem 从 Stage-1 移动至 Stage-2
     调用 PATCH /api/workitems/:id（work_item.stage_id 变更）
[T7] 关联的任务状态不受影响（跨 Stage 移动仅改父级关联，不影响任务执行状态）
```

### §9.4 场景四：沙箱生命周期管理

```text
[T1] 管理员（人工或管理平台）向 Runtime Gateway 发送"在 Device-B 上启动 DE-005 沙箱"指令
[T2] Gateway 校验 Device-B 在线（心跳正常）
[T3] Gateway 通过 NATS 向 Device-B Sandbox Daemon 下发 sandbox.start 指令
     含 {sandboxConfig: {...}, deId: "de-005", deType: "executor"}
[T4] Device-B Sandbox Daemon 拉取 DE-005 镜像，启动沙箱进程
[T5] 沙箱启动后调用 API 服务注册自身（POST /api/de/register），写 PG 服务注册表
[T6] Sandbox Daemon 向 Gateway 上报沙箱启动成功心跳
[T7] Gateway 更新全局 Device 状态视图：Device-B 新增 DE-005 可用
[T8] DE-005 现在可被 target_policy.deId = "de-005" 的任务路由到
[T9] 沙箱停止时：Sandbox Daemon 发 sandbox.stopped 事件；
     Gateway 触发孤儿任务回收（见 §10.3）
```

---

## §10 网关职责边界辨析

### §10.1 服务路由 vs 任务派发的根本区分

Runtime Gateway 在 DEOS 中扮演**控制面（Control Plane）**角色，不扮演**数据面（Data Plane）**角色：

| 维度 | 服务路由（ServiceRouting） | 任务派发（TaskDispatch） |
|---|---|---|
| 负责方 | Runtime Gateway | 各 Device Scheduler |
| 解决的问题 | "调用某能力应该打到哪个 endpoint？" | "这个任务应该给哪个 DE 执行？" |
| 数据来源 | 服务注册表（PG + NATS） | tasks 表 target_policy |
| 运行时机 | 能力调用时实时查询 | 任务创建 + Scheduler 轮询 |
| 与任务的关系 | 无关（能力路由不感知任务） | 直接（按 target_policy 将任务送达 DE） |

**PRD §188「RuntimeGateway 路由能力」的含义**是服务发现意义的实例 / 调用路由（即服务路由），**不是**任务派发意义的"把任务分给哪个 DE"。两者字面都有"路由"但语义完全不同，本设计明确区分，防止实现时职责混淆。

### §10.2 网关职责清单

| 职责 | 是否属于网关 | 说明 |
|---|---|---|
| Device 注册 / 注销 | ✓ | Device 启动时向网关注册，下线时注销 |
| Device 心跳汇总 | ✓ | 汇总全局 Device 健康状态 |
| 向 Device Daemon 下发指令 | ✓ | 启停沙箱、更新配置 |
| 服务路由（能力 endpoint 发现） | ✓ | 运行时发现可调用能力的 endpoint |
| 孤儿任务回收触发 | ✓ | Device 离线时触发回收，见 §10.3 |
| **任务派发（把任务给 DE）** | **✗** | 由各 Device Scheduler 本地完成 |
| **直接读写 tasks 表** | **✗** | tasks 表操作全部通过 API 层，网关不直接操作 |

### §10.3 孤儿任务回收策略

当 Device 心跳超时（M1 默认 30 秒无心跳判定下线），网关触发孤儿任务回收流程：

```text
[T1] Gateway 检测 Device-B 心跳超时，判定 Device-B 离线
[T2] Gateway 向 API 服务发送 "device.offline" 事件（含 deviceId）
[T3] API 服务查询 PG：
     SELECT id FROM tasks
     WHERE status IN ('ready', 'running')
       AND target_policy->>'deId' IN (
         SELECT de_id FROM de_instances WHERE device_id = 'device-b'
       )
[T4] 对 status='running' 的任务（正在执行被中断）：
     UPDATE tasks SET status = 'failed'（或 'ready'，取决于 M1 策略，见下）
[T5] 对 status='ready' 的任务（尚未开始）：
     UPDATE tasks SET status = 'ready'（保持待领取状态，等待重新指派）
[T6] 产 RuntimeEvent(task.orphaned) 写入 events 表
[T7] M1 策略：标记 + 发通知，由人工介入重指派（规划岗 DE 或人工通过 API 修改 target_policy）
```

**M1 孤儿任务处置策略**：

| 任务状态 | 处置方式 | 原因 |
|---|---|---|
| `ready`（未开始） | 保持 `ready`，等待人工重指派 | 未执行，无副作用，可安全重指派 |
| `running`（执行中被中断） | 改为 `failed` + 产审计事件 + 通知规划岗 | 执行状态不确定，贸然重执行可能导致副作用重复，由人工判断是否重做 |

**M1 明确不做自动重分配**（避免引入未知副作用），但基础设施（事件 + API）已就位，后续可升级为自动重分配策略。

### §10.4 Checkpoint 超时巡检

Scheduler 兼职承担 Checkpoint 超时巡检职责（不依赖外部 cron 或独立进程）：

```python
# 伪代码：Checkpoint 超时巡检
async def scan_checkpoint_timeouts(self, interval_seconds=30):
    while True:
        await asyncio.sleep(interval_seconds)
        # 查询超时的 pending Checkpoint
        expired_checkpoints = db.execute("""
            SELECT c.id, c.session_id, c.timeout_policy, c.type
            FROM checkpoints c
            WHERE c.status = 'pending'
              AND c.timeout_policy->>'timeoutSeconds' != '0'
              AND c.created_at + (c.timeout_policy->>'timeoutSeconds')::int * interval '1 second'
                  < now()
        """)
        for cp in expired_checkpoints:
            on_timeout = cp.timeout_policy.get('onTimeout', 'fail')
            if on_timeout == 'auto_continue':
                # 自动恢复，以默认 resolution 推进
                await self.auto_resume_checkpoint(cp)
            elif on_timeout == 'fail':
                # 会话标记失败
                await self.fail_session_for_checkpoint(cp)
            elif on_timeout == 'escalate':
                # 升级为 escalation 类型
                await self.escalate_checkpoint(cp)
            elif on_timeout == 'takeover':
                # 触发接管
                await self.trigger_takeover_for_checkpoint(cp)
            # 产 RuntimeEvent 记录超时处置
            emit_runtime_event(f"checkpoint.timeout.{on_timeout}", cp.session_id)
```

超时处置策略对齐 SDD §8.4 `onTimeout` 枚举（`auto_continue` / `fail` / `escalate` / `takeover`）。

---

## §11 已知限制与演进

| 限制 | M1 现状 | 演进触发线 | 演进方向 |
|---|---|---|---|
| PG / NATS / Redis 单点 | M1 接受单点，降低初期运维复杂度 | 任一组件出现不可接受的停机时长 SLA 要求 | PG 主从 + Patroni；NATS 3 节点集群；Redis Sentinel |
| Scheduler 轮询性能 | M1 每 2~5 秒轮询 + 复合索引 + SKIP LOCKED，够用 | Device > 100 或活跃任务 > 10 万行时 | 引入 PG LISTEN/NOTIFY 或 NATS 消费组，减少轮询开销 |
| 直接指名 target_policy | M1 只支持 `{type:"direct",deId:"..."}` | 负载不均衡反馈 / DE 扩缩容冲突出现 | 扩展 queue / balanced 模式（schema 已预留，无需改表） |
| 不引入 Temporal | M1 自研 Scheduler + PG | 满足 §1.2 退出条件三连中任一条 | Temporal 作为可替换后端，PG 仍为事实源 |
| LiteLLM 各自分散 | 每台 Device 独立 LiteLLM 实例 | 需要统一 key 管理或 Device > 50 台 | 中心 + 边缘两级 LiteLLM 架构，边缘做本地路由 |
| LiteLLM 成本统计 | 本地 token 统计，未聚合到运营平台 | 运营平台需要成本看板时 | 各 LiteLLM 实例将调用统计上报为 RuntimeEvent（type=`llm.usage`）或 metrics，聚合后供运营平台消费 |
| 背压 / 限流 | 无 | 出现 DE 资源争抢 / 沙箱 OOM 问题 | Redis 做每 DE 并发任务上限 + 每 Device 沙箱数上限；超限任务回 `ready` 队列 |
| 冷热分离 | M1 未做 | tasks 表行数 > 100 万且查询开始变慢 | 定期归档 `done` / `failed` 终态到 `tasks_history`，主表只保留活跃数据 |
| 孤儿任务 | M1 标记 + 人工介入 | 频繁 Device 宕机场景 | 自动重分配（含幂等保障，防止重复执行副作用） |

---

## §12 与其他文档的关系

| 文档 | 关系 | 本文件的角色 |
|---|---|---|
| `SDD-DEOS-ARCHITECTURE-v0.7.md`（逻辑四层总纲） | 本文件是其物理实现视图；逻辑四层的 2F 运行层与 3F 系统层对应本文件的 Device + 控制面部署 | 不替代逻辑架构，与之互补；逻辑架构说「分哪层」，本文件说「用什么技术、怎么部署」 |
| `SDD-DE-RUNTIME-PLATFORM-v0.7.md`（运行平台逻辑对象模型） | 本文件的 §3 对象映射层是两者的桥梁；逻辑对象（RuntimeTaskEnvelope / RuntimeSession / RuntimeEvent / Checkpoint）在本文件中有完整的 PG schema 对应 | 本文件落实逻辑对象的物理存储；SDD-DE-RUNTIME-PLATFORM 定义「是什么」，本文件定义「怎么存、怎么跑」 |
| `SDD-DE-MANAGEMENT-PLATFORM-v0.7.md`（管理平台，M2） | 管理平台读取本文件定义的 Device 注册表、DE 实例表做编制管理；团队 / 岗位配置由管理平台写入，本文件的 `target_policy` 消费 | 上游关系：管理平台依赖本文件的运行数据；管理平台不做任务调度 |
| `SDD-DE-OPERATIONS-PLATFORM-v0.7.md`（运营平台，M2） | 运营平台通过消费本文件定义的 RuntimeEvent 流（`events` 表 + NATS `runtime.events.*`）计算所有运营指标；不直接读取运行平台内部数据库 | 下游关系：运营平台消费本文件产出的事件流；事件字段定义以 SDD-DE-RUNTIME-PLATFORM §5.4 为准 |
| `SDD-BIZ-SYSTEM-INTEGRATION-v0.7.md`（业务系统集成，M3） | 业务系统通过触发 AppTask（POST /api/tasks）接入运行平台；连接器服务通过本文件的服务注册 / 发现机制接入能力调用链路 | 入站触发和出站调用均通过本文件定义的 REST API 和服务注册 / 发现机制实现 |

---

*文档结束*
