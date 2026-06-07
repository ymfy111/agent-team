# doc-nav｜DEOS 文档导航统一入口

> 当前同步批次：DEOS-v0.7 / agent-team 历史资料归档。
> 当前阶段：DEOS 数字员工操作系统顶层架构、产品需求、应用侧子设计立项。
> 当前事实主线：DEOS = 4F 用户终端 / 3F 系统层 / 2F 运行层 / 1F 业务本体 + 安全合规；2F 数字员工运行平台对应「运行支撑」带。
> 维护提示：本文件是当前导航唯一完整入口；中文入口 `docs/文档导航.md` 只保留关键入口摘要。

---

## 1. 文档清单

| 类别 | 具体文件 | 用途说明 |
|---|---|---|
| `docs/` 项目事实 | `docs/project-memory.md` | 项目长期事实源：当前基线、关键结论、目录口径和下一步。 |
| `docs/specs/` 架构总纲 | `docs/specs/SDD-DEOS-ARCHITECTURE-v0.7.md` | DEOS 四层总体架构（v0.7.0）；统领当前 specs 下各 SDD 子设计。 |
| `docs/specs/` 产品需求 | `docs/specs/PRD-v0.7.md` | DEOS 产品需求规格（v0.7.0）；保留构建侧 + 新增应用侧 + 显式化运行平台。 |
| `docs/specs/` 子设计计划 | `docs/specs/PLAN-DEOS-SUBDESIGNS-v0.7.md` | DEOS 后续主子设计矩阵与 M1–M4 分期计划；采用少数主文档 + 章节承载细分内容。 |
| `docs/specs/` 子设计 | `docs/specs/SDD-DE-RUNTIME-PLATFORM-v0.7.md` | M1 首个子设计；定义 2F 运行支撑：动态工作流引擎、任务调度/编排、服务注册/发现、RuntimeEvent 指标映射、人机协同检查点与能力调用契约。 |
| `docs/specs/` 子设计 | `docs/specs/SDD-DE-MANAGEMENT-PLATFORM-v0.7.md` | M2 管理平台子设计；定义 3F 集中管理：团队/岗位/数字员工编制 CRUD、RBAC 权限、PG 管理侧 6 张表 schema、AuthContext 颁发、NATS 运行侧同步契约。 |
| `docs/specs/` 技术架构 | `docs/specs/SDD-DEOS-TECH-ARCHITECTURE-v0.7.md` | 技术实现 / 物理部署视图；技术选型（不用 Temporal，PG 任务表+Scheduler+NATS）、进程拓扑、PG schema 与逻辑对象映射、安全红线、关键场景时序。经 oracle 评审。 |
| `docs/specs/` 应用侧索引 | `docs/specs/SDD-APPLICATION-DE-v0.7.md` | 应用型数字员工概述与索引；具体子设计统一归入 DEOS 子设计计划。 |
| `docs/specs/` 叙事规范 | `docs/specs/SPEC-NARRATIVE-TERMINOLOGY.md` | 对外材料统一口径：产品名 DEOS、两类数字员工口号、建造型/运营型命名。 |
| `docs/specs/` 图稿规范 | `docs/specs/02-four-layer-architecture-image-prompt.md` | DEOS 四层架构图相关提示词与图稿约束。 |
| `docs/specs/` 图稿规范 | `docs/specs/03-tech-architecture-image-prompt.md` | DEOS 技术架构图：ASCII 蓝本（精确版）+ GPT-Image-2 提示词，配套技术架构 SDD。 |
| `docs/archive/` 历史归档 | `docs/archive/agent-team-v0.6.33/README.md` | 旧 agent-team / v0.6.33 / v0.6.33.45 文档整体归档入口。 |

---

## 2. 当前目录使用规则

| 目录 | 当前用途 | 维护规则 |
|---|---|---|
| `docs/specs/` | 当前 DEOS PRD / SDD / 规范 / 图稿提示词 | 只放当前有效设计事实源；历史 v0.6 文档已归档。 |
| `docs/archive/agent-team-v0.6.33/` | 旧 agent-team 历史资料 | 只作历史查证，不作为新设计默认依据。 |
| `docs/doc-nav.md` | 当前完整导航 | 新增/移动 docs 后必须同步。 |
| `docs/文档导航.md` | 中文兼容入口 | 只保留关键入口摘要，避免双导航漂移。 |
| `docs/project-memory.md` | 项目长期事实源 | 记录 DEOS 当前基线和关键决策。 |

---

## 3. 当前文档结构摘要

```text
docs/
├── doc-nav.md
├── 文档导航.md
├── project-memory.md
├── specs/
│   ├── SDD-DEOS-ARCHITECTURE-v0.7.md
│   ├── PRD-v0.7.md
│   ├── PLAN-DEOS-SUBDESIGNS-v0.7.md
│   ├── SDD-DE-RUNTIME-PLATFORM-v0.7.md
│   ├── SDD-DE-MANAGEMENT-PLATFORM-v0.7.md
│   ├── SDD-DEOS-TECH-ARCHITECTURE-v0.7.md
│   ├── SDD-APPLICATION-DE-v0.7.md
│   ├── SPEC-NARRATIVE-TERMINOLOGY.md
│   ├── 02-four-layer-architecture-image-prompt.md
│   └── 03-tech-architecture-image-prompt.md
└── archive/
    └── agent-team-v0.6.33/
```

---

## 4. 维护约定

1. 新文档、新设计、新任务默认围绕 DEOS v0.7 展开。
2. 旧 agent-team 文档默认不参与新设计，除非明确标注「历史参考」。
3. 每次新增或移动 docs 后，必须同步 `docs/doc-nav.md`、`docs/文档导航.md` 和 `docs/project-memory.md`。
4. 当前 docs 根目录保持轻量：只留导航、项目记忆、当前 specs、历史 archive。

---

## 5. 近期同步记录

### DEOS 架构总纲升格（2026-06-07）

- 新增顶层架构总纲：`docs/specs/SDD-DEOS-ARCHITECTURE-v0.7.md`。
- 产品主体从 agent-team（智能软件工厂）升格为 DEOS（数字员工操作系统）。
- 既有 `SDD-*-v0.6.33` 降为历史参考，分层 / 术语冲突时以 DEOS 总纲为准。

### DEOS 产品需求升格（2026-06-07）

- 新增产品需求文档：`docs/specs/PRD-v0.7.md`。
- 保留构建侧需求，新增应用型数字员工需求骨架，并显式化 2F 数字员工运行平台（运行支撑）。

### DEOS 应用侧子设计立项（2026-06-07）

- 新增应用侧设计总纲：`docs/specs/SDD-APPLICATION-DE-v0.7.md`。
- 新增子设计推进计划：`docs/specs/PLAN-DEOS-SUBDESIGNS-v0.7.md`。
- 子设计矩阵收敛为运行平台、管理平台、运营平台、业务系统集成四份主文档；能力契约、安全、人机协同、本体回流等先作为章节承载。
- 应用侧概述文档降为索引；具体内容统一归入 DEOS 主子设计矩阵。
- 运行平台口径：数字员工运行平台对应架构图 2F 的「运行支撑」带；能力库是并列共享组件，不纳入运行平台范围。

### M1 数字员工运行平台子设计（2026-06-07）

- 新增运行平台子设计：`docs/specs/SDD-DE-RUNTIME-PLATFORM-v0.7.md`。
- 关键口径：运行平台只覆盖 2F 运行支撑，不含能力库、管理平台、运营平台、业务系统和用户终端。
- 定义最小运行对象：`RuntimeTaskEnvelope`、`RuntimeSession`、`RuntimeEvent`，并补齐 RuntimeEvent 字段、运营指标映射、应用型任务入口转换、RuntimeSession 状态机、人机协同检查点协议和能力调用契约，作为后续应用型运行时和运营平台的接口基础。

### DEOS 技术实现架构（2026-06-07）

- 新增技术架构文档：`docs/specs/SDD-DEOS-TECH-ARCHITECTURE-v0.7.md`，定位技术实现 / 物理部署视图，与逻辑架构互补。
- 核心技术决策：动态工作流用 PG 任务表 + Scheduler 驱动（不引入 Temporal）；事件总线 NATS JetStream；中心控制面（Runtime Gateway 管 Device 生命周期，不做任务派发）+ 分布式 Device 执行面（Sandbox Daemon + Scheduler + LiteLLM + DE 沙箱）。
- 经 oracle 架构评审，已纳入 P0/P1 修正：PG schema ↔ SDD 逻辑对象映射层、DE 沙箱无 PG 直连凭据（安全红线）、CAS+SKIP LOCKED 幂等、孤儿任务回收策略、状态机区分 blocked（依赖）/waiting（人机协同）、target_policy 字段预留间接指派、网关 ServiceRouting 与 TaskDispatch 辨析。
- 配套图稿：`docs/specs/03-tech-architecture-image-prompt.md`，含 ASCII 架构蓝本（精确版）+ GPT-Image-2 提示词。

### M2 数字员工管理平台子设计（2026-06-07）

- 新增管理平台子设计：`docs/specs/SDD-DE-MANAGEMENT-PLATFORM-v0.7.md`（828 行）。
- 定义 3F 管理平台核心：团队/岗位/数字员工编制对象模型 + 两类员工编制治理差异 + PG 管理侧 6 张权威主表（mgmt schema）+ 8 组 RESTful API + RBAC 权限 + AuthContext 颁发 + NATS 管理→运行同步契约。
- 关键设计决策：管理侧与运行侧跨 schema 逻辑外键（不建物理外键）；permissions 多态关联；de_configs 三级优先级（default/team/individual）；管理侧为数据权威，运行侧引用副本最终一致。

### agent-team 历史资料归档（2026-06-07）

- 旧 `plans/`、`workitems/`、`tasks/`、`reports/`、`guides/`、`recs/`、`templates/`、`prototypes/`、`changes/` 已迁入 `docs/archive/agent-team-v0.6.33/`。
- 旧 `docs/specs/*.md` 中除当前 DEOS v0.7、叙事术语和架构图提示词外，均迁入 `docs/archive/agent-team-v0.6.33/specs/`。
