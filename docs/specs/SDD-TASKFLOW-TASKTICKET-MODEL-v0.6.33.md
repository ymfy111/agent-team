# TaskFlow / TaskTicket 模型子设计（v0.6.33）

> 文档定位：本文是 `SDD-v0.6.33.md` 的子设计 / 补充设计，用于收敛智能软件工厂中“阶段计划、任务流、任务单、证据”的核心领域模型。  
> 当前阶段：P0 / Agent-led Task List。  
> 设计原则：先用轻量文档与命名规范跑通，不急于实现复杂数据库、完整状态机或 Runtime 自动调度。

**与 SDD 正文关系：** 本文是 SDD §3.2 现有 TaskTicket 定义的补充与扩展，不替代原定义。P0 阶段的 TaskFlow Node 是 TaskTicket 的文档化视图与轻量实现形式，字段语义与 SDD 保持一致，并新增 P0 专用扩展字段（详见 §4 字段映射表）。

---

## 1. 背景与问题

当前 `agent-team` 项目已经形成多轮任务流实践，例如：

```text
TF-P0B-01：结构化前端工程收口
TF-P0B-02：前端源码基线校准
TF-P0B-03：第一个 DOM 模板化试点
TF-P0B-04：第二个 DOM 模板化试点
TF-P0B-05：头像 Base64 Fallback 移除与资源路径回归
```

这些实践证明：软件工厂不应先围绕“多智能体自由聊天”建模，而应先把所有协作收敛到可执行、可验证、可交接的任务结构中。

需要明确：

```text
TaskFlow 是什么？
TaskTicket 是什么？
Project / Stage / Plan 如何承载多个 TaskFlow？
Artifact / Evidence 应挂到哪里？
P0 阶段如何轻量落地？
```

---

## 2. 核心收敛结论

推荐模型：

```text
Project
  └── Stage / Plan
        └── TaskFlow
              └── TaskTicket / Node
                    └── Artifact / Evidence
```

一句话定义：

```text
Project 管长期目标和事实源；
Stage / Plan 管阶段目标、范围和验收边界；
TaskFlow 管一组任务单的编排；
TaskTicket / Node 是最小可执行、可验证工作单元；
Artifact / Evidence 是任务交付与验收依据。
```

P0 阶段原则：

```text
TaskFlow Node = TaskTicket 的最小实现
```

即当前不需要单独实现复杂 TaskTicket 系统，可先把任务流节点直接视为任务单。

---

## 3. 层级定义

### 3.1 Project

Project 表示一个长期项目，例如：

```text
agent-team / 智能软件工厂
```

职责：

```text
- 长期产品目标
- 当前版本基线
- 项目事实源（ProjectRepository）
- 文档导航与项目记忆
- 阶段计划集合
```

### 3.2 Stage / Plan

Stage / Plan 表示项目中的阶段或计划。

示例：

```text
P0B 前端工程化
P0C Taskflow UI 对齐
P1 Runtime 绑定
```

职责：

```text
- 阶段目标
- 范围边界
- 不做范围
- 验收口径
- 包含哪些 TaskFlow
```

Stage / Plan 解决的问题是：Project 太大，TaskFlow 太细，需要一层承载阶段目标与边界。

**与 SDD `ProjectPlan` 的关系：** Stage / Plan 对应或扩展 SDD 中的 `ProjectPlan` 概念。一个 Project 可包含多个 Stage / Plan；一个 Stage / Plan 可包含多个 TaskFlow。

### 3.3 TaskFlow

TaskFlow 表示一条可执行任务流，负责组织多个 TaskTicket / Node。

示例：

```text
TF-P0B-05：Avatar Base64 Fallback 移除与资源路径回归
```

职责：

```text
- 任务流目标
- 节点顺序
- 节点依赖
- 整体进度
- 任务流级交接包
- 任务流级风险与待决策
```

### 3.4 TaskTicket / Node

TaskTicket 是最小可执行、可验证任务单。P0 阶段可以直接使用 TaskFlow Node 作为 TaskTicket。

示例：

```text
TF-P0B-05-N04：运行图片完整性验证
```

职责：

```text
- 明确目标
- 指定负责人 / 岗位
- 记录输入产物
- 记录输出产物
- 记录验证证据
- 记录审查结论
- 记录待决策项
- 指向下一步
```

### 3.5 Artifact / Evidence

Artifact 是任务产物，Evidence 是证明任务完成或质量达标的证据。

示例：

```text
Artifact:
- 文档
- 代码
- 原型 HTML
- 图片资源
- QA 报告

Evidence:
- commit hash
- 测试输出
- 截图
- brokenImages=0 / pageErrors=0 / httpErrors=0
- 交付审查结论
```

建议区分：

```text
交付物 ≠ 验证证据
```

不要只说“已修改代码”，还要说明“用什么证据证明修改有效”。

**判定规则：**

```text
Artifact = 产出物本身或其引用（文档、代码文件、原型 HTML、图片资源、QA 报告路径）。
Evidence = 证明产出物满足质量标准的记录（测试输出、截图、审查结论、指标数值）。

commit hash → 更适合作为 artifact 引用或变更引用，记录「改了什么」。
测试输出 / 截图 / 审查结论 → 才是 evidence，记录「改得有没有效 / 对不对」。
```

即：同一 commit hash 可同时出现在 outputArtifacts（作为引用）和 verificationEvidence（作为变更追踪），但两者语义不同，不应混淆。

---

## 4. P0 最小字段集

P0 阶段的 TaskTicket / Node 至少包含：

```text
taskId / nodeId
title
goal
ownerRole
ownerWorker（可选）
status
inputArtifacts[]
outputArtifacts[]
verificationEvidence[]
decisionItems[]
nextAction
```

建议可选字段：

```text
stageId
taskFlowId
dependsOn[]
startedAt
completedAt
artifactConfidence: Committed / Verified / Accepted
```

P0 不要求一次性实现所有字段的系统化存储，可以先通过结构化 Markdown、任务流文档、QA 报告和交接文档表达。

### 4.1 字段映射表：SDD 字段 vs 本文字段

| SDD 字段（§3.2） | 本文字段 | 说明 |
|---|---|---|
| taskId | taskId / nodeId | nodeId 为层级别名，可与 taskId 并存 |
| projectId | projectId（可由项目上下文隐含） | P0 文档可不逐条填写；进入持久化后应显式保存 |
| title | title | 相同 |
| description | goal | 本文用 goal 更聚焦执行目标 |
| ownerRole | ownerRole | 相同 |
| ownerAgentId | ownerWorker | 本文可选，指向具体 agent/worker |
| status | status | 复用 SDD 主线状态枚举 |
| priority | —（可选扩展字段） | P0 暂不强制 |
| nextStep | nextAction | 本文用 nextAction，语义一致 |
| artifactRefs | inputArtifacts[] / outputArtifacts[] | 本文拆分输入/输出，为扩展字段 |
| updatedAt | completedAt / startedAt | 本文拆分为可选扩展字段 |
| — | stageId / taskFlowId | P0 扩展字段，用于表达阶段与任务流归属 |
| — | verificationEvidence[] | P0 扩展字段，用于承载验证证据 |
| — | decisionItems[] | P0 扩展字段，用于承载待决策项 |

> 标注"扩展字段"表示 P0 新增，不在 SDD §3.2 原始定义中；标注"派生字段"表示从层级 ID 可推导，无需单独存储。

---

## 5. ID 命名规范建议

推荐采用可读、可追溯的层级 ID：

```text
<TaskFlowId>-N<序号>
```

示例：

```text
TF-P0B-05
TF-P0B-05-N01
TF-P0B-05-N02
TF-P0B-05-N03
TF-P0B-05-N04
TF-P0B-05-N05
```

其中：

```text
TF = TaskFlow
P0B = Stage / Plan
05 = TaskFlow 编号
N04 = Node / TaskTicket 编号
```

这个命名方式能在不引入复杂数据库的情况下，表达 Project → Stage → TaskFlow → TaskTicket 的层级关系。

**与 SDD taskId 的关系：**

```text
TASK-001        → SDD 系统/全局 ID 示例，适用于持久化与跨系统引用。
TF-P0B-05-N04   → 人可读层级别名（nodeId），用于文档与会话中定位节点。
```

两者可并存：

```text
- P0 文档化阶段：可只使用层级 ID（nodeId）。
- Runtime / 持久化阶段：建议同时保留全局 taskId 和层级 nodeId，nodeId 作为别名挂在 taskId 下。
```

**边界规则：**

```text
- Stage ID 格式：<项目代号><阶段代号>，例如 P0B、P0C、P1。
- TaskFlow 编号按 Stage 内递增：TF-P0B-01、TF-P0B-02 …；不同 Stage 可复用序号（TF-P0C-01 与 TF-P0B-01 不冲突）。
- Node 编号在 TaskFlow 内递增，插入节点优先追加新序号，不重排已有编号。
- 必要时可使用 N03a 作为插入节点后缀，但不推荐；长期应迁移为追加编号。
```

---

## 6. 状态与检查点

TaskTicket / Node 状态复用 SDD 主线状态：

```text
TODO
RUNNING
REVIEWING
NEEDS_DECISION
DONE
```

不建议在 P0 阶段新增平行状态机。

以下概念作为检查点或证据标签，而不是主状态：

```text
BASELINE_CHECKED
  接手前已完成基线复核。

COMMITTED
  产物已进入项目事实源。

VERIFIED
  产物已通过 QA / 截图 / 审查等证据验证。

ACCEPTED
  产物已被用户、协同规划岗或交付审查岗确认。
```

**P0 记录方式：** 检查点标签可在 TaskTicket / Node 的 Markdown 文档中以字段或标签形式记录（例如 `verificationEvidence` 条目中注明 `[VERIFIED]`），也可在节点标题后附加标签。检查点不作为主状态字段，不替代 TaskEvent 机制。

---

## 7. 对现有对象的挂载关系

建议关系：

```text
TaskFlow
  挂载：阶段目标、节点列表、整体风险、任务流交接包。

TaskTicket / Node
  挂载：执行目标、负责人、输入输出、验证证据、审查记录、待决策项。

Artifact
  默认挂到 TaskTicket；必要时也可被 TaskFlow 汇总引用。

ReviewRecord
  默认挂到 TaskTicket。

DecisionItem
  可挂到 TaskTicket；若影响整个任务流或阶段，则上升到 TaskFlow / Stage。

HandoffPackage
  默认挂到 TaskFlow，可引用多个 TaskTicket。

BaselineCheckTask
  是接手前的特殊 TaskTicket / Node，也可作为 TaskFlow 的前置节点。
```

---

## 8. 与当前项目实践的映射

以 TF-P0B-05 为例：

```text
Project:
  agent-team / 智能软件工厂

Stage / Plan:
  P0B 前端工程化

TaskFlow:
  TF-P0B-05 Avatar Base64 Fallback 移除与资源路径回归

TaskTicket / Node:
  TF-P0B-05-N01 盘点头像 data-uri 来源
  TF-P0B-05-N02 生成 slim 原型
  TF-P0B-05-N03 替换 apps/web 头像路径
  TF-P0B-05-N04 运行图片完整性验证
  TF-P0B-05-N05 提交报告与交接

Artifact / Evidence:
  docs/prototypes/agent-team-v0.6.33.45-prototype.html
  apps/web/src/legacy/prototype-runtime.js
  docs/reports/TF-P0B-05-Image-Check-v0.6.33.45.md
  brokenImages=0 / pageErrors=0 / httpErrors=0
```

---

## 8.1 P0 文档化落地约定

P0 阶段推荐以 Markdown 文件落地 TaskFlow，无需数据库或自动化工具。

**推荐路径与文件名：**

```text
docs/tasks/taskflows/TF-P0B-05.md       ← 独立 TaskFlow 文档
docs/tasks/plans/P0B-plan.md            ← Stage 计划（可内嵌多个 TaskFlow WBS）
```

也可将 TaskFlow 内嵌到阶段计划文档或 WBS 表格中，二者均可接受。

**Markdown 记录方式：**

```text
- 每个 TaskFlow 文档包含：任务流目标、节点列表（含字段）、整体进度、交接包。
- 每个 Node 以二级或三级标题标识，字段以 key: value 列表或表格形式记录。
- verificationEvidence 和 decisionItems 各自单独列出。
```

**状态维护责任：**

```text
- 执行智能体（@fixer 等）在完成节点后更新对应 Node 的 status 和 verificationEvidence。
- TaskFlow 整体进度由调度方（overmind）在交接时更新。
- 当前不强制迁移历史任务流文档；新建 TaskFlow 从本约定起执行。
```

---

## 9. 当前阶段不做范围

P0 阶段不建议做：

```text
1. 不做完整数据库表设计。
2. 不做复杂状态机。
3. 不做自动 Runtime 调度。
4. 不做任务级/文件级锁。
5. 不做复杂权限模型。
6. 不要求所有历史任务流立刻补齐字段。
```

当前优先级是让后续任务流按该模型逐步收敛，而不是回填全部历史资料。

---

## 10. 后续需要继续收敛的问题

1. TaskTicket 的 P0 最小字段是否需要加入 `doneCriteria`？
2. `ownerRole` 与 `ownerWorker` 是否必须同时存在？
3. BaselineCheckTask 是否总是 TaskFlow 的第一个节点？
4. HandoffPackage 是 TaskFlow 级对象，还是 Stage 级对象？
5. `artifactConfidence` 是否只保留 Committed / Verified / Accepted 三层？
6. Stage / Plan 是否需要独立状态？
7. 任务流并行执行时，TaskTicket 依赖关系如何表达？
8. TaskFlow 之间是否需要声明依赖或前置关系？（例如 TF-P0B-05 是否需要显式声明依赖 TF-P0B-04 完成）

这些问题可在后续几轮设计中继续完善。
