# SDD-TASKFLOW-SKILL-PRODUCT-MAPPING v0.6.33

> 文档类型：系统设计子文档  
> 对应任务流：TF-GOV-02  
> 当前产品基线：v0.6.33.45 / TF-P0B-05  
> 目的：把当前 `taskflow` 执行技能中的有效经验，转译为“智能软件工厂”后续可产品化的任务流 / 任务单 / 待决策 / 证据机制。

---

## 1. 设计结论

`taskflow` skill 已经验证了一套有效的长程任务执行闭环：

```text
先确认工作项范围 → 固定节点清单 → 逐节点执行 → 节点内验证与修复 → 可见进度 → 证据记录 → 最终总结
```

但它不能被原样复制成普通用户可见 UI。产品化时应将内部执行术语转译为用户可理解的项目推进能力：

| skill 术语 | 产品化术语 | 用户心智 |
|---|---|---|
| taskflow | 项目推进计划 / 工作项流 | 这个项目按哪些阶段推进 |
| node | 可验收工作项 / 阶段任务 | 当前正在完成哪块成果 |
| task-runner | 数字员工执行闭环 | 谁负责把这件事做完并验证 |
| pause gate | 待决策 / 阻塞 / 风险门禁 | 哪些地方需要用户或负责人拍板 |
| Node Repair Loop | 节点内修复循环 | 失败后先自动修，不轻易打断用户 |
| visible-summary | 阶段进展报告 | 我能看到完整进展与证据 |
| evidence | 验证证据 / 交付产物 | 为什么说这个节点完成了 |

---

## 2. 产品化分层

### 2.1 当前技能层

当前 `taskflow` skill 适合继续作为智能体执行协议：

```text
- 控制任务流启动格式；
- 约束节点粒度；
- 记录节点开始 / 完成 / 验证 / 评审；
- 遇到可修复问题时进入节点内修复循环；
- 形成最终进展总结。
```

### 2.2 POC 产品层：Agent-led Task List

第一阶段产品能力不做复杂状态机，先实现：

```text
SOW / WorkItem：定义本轮工作范围；
ProjectPlan：主智能体生成阶段计划；
TaskTicket：结构化任务单；
TaskEvent：任务状态和反馈事件；
ReviewRecord：交付审查记录；
DecisionItem / Blocker：待决策与阻塞事项；
EvidenceRef：截图、验证日志、文档、代码变更等证据引用。
```

### 2.3 后续平台层：Guarded Task Flow / Runtime Orchestration

等 Agent-led Task List 稳定后再逐步加入：

```text
状态约束；
并行调度；
RuntimeHost / RuntimeNode / WorkerRuntimeBinding；
执行租约与超时处理；
跨任务冲突检测；
多数字员工协作与审查队列。
```

---

## 3. 核心对象映射

### 3.1 SOW / WorkItem

用于承接 taskflow 启动前的“本轮工作范围”。

```yaml
sowId: SOW-001
projectId: PROJ-001
title: taskflow 机制治理与项目后续推进规划
goal: 完善任务流执行协议，并明确后续项目推进路径
baseline: v0.6.33.45 / TF-P0B-05
mode: delegated_acceptance
scope:
  include:
    - taskflow skill 治理
    - 产品化映射设计
    - 后续任务流建议
  exclude:
    - 前端源码修改
    - 产品版本号提升
freezeItems:
  - 不把内部 taskflow 术语直接暴露给普通用户 UI
  - 修改 skill 必须同步配套文档
createdByAgentId: emp-planner-001
status: CONFIRMED
```

设计要点：

```text
1. SOW 是“本轮做什么 / 不做什么”的边界，不等同于完整项目计划。
2. taskflow 未给出明确 SOW 时，应先让用户选择候选工作项。
3. SOW 通过后，才能生成 TaskTicket 或 WorkItem nodes。
```

### 3.2 TaskFlowPlan / WorkItemNode

承接 taskflow 节点表格格式。

```yaml
flowId: FLOW-001
title: taskflow 机制治理与项目后续推进规划
baseline: v0.6.33.45 / TF-P0B-05
acceptanceMode: delegated
currentNodeId: FLOW-001-N03
nodes:
  - nodeId: FLOW-001-N01
    name: 当前机会复核
    goal: 判断哪些工作现在适合做
    acceptance: 输出立即可做、暂缓、依赖缺失清单
    estimatedEffort: low
    status: DONE
  - nodeId: FLOW-001-N02
    name: taskflow 配套文档同步规则
    goal: 固化启动节点清单表格和文档同步规则
    acceptance: skill 与配套文档均同步
    estimatedEffort: low_to_medium
    status: DONE
```

设计要点：

```text
1. 产品中节点不应过碎，应代表可交付、可验收的工作项。
2. 简单编辑、单次检查、局部修复不应单独成为 WorkItemNode，应归入节点内部执行步骤。
3. 节点表格的“目标 / 验收点 / 预计耗时”可直接成为产品任务流字段。
```

### 3.3 TaskTicket

TaskTicket 是单个可执行任务单，通常由 WorkItemNode 拆出。

```yaml
taskId: TASK-001
flowId: FLOW-001
nodeId: FLOW-001-N02
title: 固化 taskflow 启动清单格式
ownerRole: 协同规划岗
ownerAgentId: emp-planner-001
status: REVIEWING
priority: P1
inputs:
  - skills/taskflow/SKILL.md
  - skills/taskflow/README.md
outputs:
  - docs/guides/TASKFLOW-GOVERNANCE-v0.9.11.md
acceptanceCriteria:
  - 启动清单格式固定为表格
  - README 与文档导航同步
  - 工具 list 输出可生成同格式表格
```

设计要点：

```text
1. TaskTicket 承载实际执行，不要求用户看到 taskflow 内部执行细节。
2. 任务单必须能记录输入、输出、验收标准、负责人和状态。
3. 后续可由程序根据 ownerAgentId 分派到具体数字员工。
```

### 3.4 TaskEvent

TaskEvent 记录事实变化，不依赖聊天记录作为事实源。

```yaml
eventId: EVT-001
taskId: TASK-001
flowId: FLOW-001
nodeId: FLOW-001-N02
type: NODE_COMPLETED
fromAgentId: emp-planner-001
summary: 已同步 SKILL.md、README、文档导航和治理指南
createdAt: 2026-05-24T20:05:00+08:00
evidenceRefs:
  - docs/guides/TASKFLOW-GOVERNANCE-v0.9.11.md
  - _local/taskflow/TF-GOV-02-N02-list-output.md
```

建议事件类型：

| 类型 | 含义 |
|---|---|
| FLOW_CREATED | 创建任务流 |
| NODE_STARTED | 节点开始 |
| NODE_COMPLETED | 节点完成 |
| NODE_REPAIR_STARTED | 节点内修复开始 |
| NODE_REPAIR_COMPLETED | 节点内修复完成 |
| VALIDATION_PASSED | 验证通过 |
| REVIEW_PASSED | 独立评审通过 |
| BLOCKED | 阻塞 |
| DECISION_REQUESTED | 发起待决策 |
| RESUMED | 从暂停点恢复 |

### 3.5 DecisionItem / Blocker

暂停门禁不应只停留在智能体提示里，应结构化为待决策或阻塞。

```yaml
decisionId: DEC-001
flowId: FLOW-001
nodeId: FLOW-001-N03
question: 是否把 taskflow 内部节点术语直接显示到普通用户界面？
context: 技能中使用 node/taskflow，但普通用户更理解项目阶段、工作项和待决策
options:
  - 保留内部术语
  - 转译为项目推进和岗位产出
recommendation: 转译为项目推进和岗位产出
status: OPEN
impact:
  - UI 文案
  - 产品模型命名
  - 培训和交接文档
```

```yaml
blockerId: BLK-001
flowId: FLOW-001
nodeId: FLOW-001-N04
type: DEPENDENCY_MISSING
summary: 沙箱缺完整 apps/web 源码，不能继续前端 TF-P0B-06
requiredAction: 上传或同步完整 apps/web 包
status: OPEN
```

设计要点：

```text
1. 需要用户选择的问题进入 DecisionItem。
2. 缺依赖、环境不可用、源码不完整进入 Blocker。
3. DecisionItem 解决后任务恢复；Blocker 补齐依赖后恢复。
```

### 3.6 EvidenceRef

用于把“截图/文件/QA 结果/文档”从描述变成可追踪证据。

```yaml
evidenceId: EVD-001
type: DOC
path: docs/guides/TASKFLOW-GOVERNANCE-v0.9.11.md
relatedTaskId: TASK-001
summary: taskflow 启动清单格式与文档同步治理指南
createdAt: 2026-05-24T20:05:00+08:00
```

前端节点的 EvidenceRef 应优先包含截图、DOM 检查、浏览器控制台错误、图片完整性检查等。

---

## 4. 状态与暂停门禁映射

| skill 执行情况 | 产品状态建议 | 说明 |
|---|---|---|
| 节点未开始 | TODO | 已计划但未执行 |
| 节点执行中 | RUNNING | 数字员工正在执行 |
| 节点自测/评审中 | REVIEWING | 进入交付审查或自检 |
| 节点验证失败但可修 | RUNNING / REWORK | 节点内部修复循环，不立即打断用户 |
| 需要用户决策 | NEEDS_DECISION | 进入待决策工作台 |
| 依赖缺失 | BLOCKED | 等待源码、权限、环境、接口或资料 |
| 节点完成 | DONE | 具备证据和验收结论 |
| 任务流无法继续 | EXITED / PAUSED | 输出中断报告并等待新 SOW |

---

## 5. 产品 UI 表达原则

```text
1. 用户界面展示“项目推进 / 阶段任务 / 岗位产出 / 待决策 / 风险阻塞 / 验证证据”。
2. 不直接暴露 taskflow、node、visible-summary、render-pending 等技能内部术语。
3. 管理后台或开发者视图可以显示更接近执行协议的字段。
4. 普通用户首先看到结论和下一步，展开后再看证据和事件。
```

示例转译：

| 内部字段 | 用户 UI 文案 |
|---|---|
| currentNode | 当前推进阶段 |
| evidenceRefs | 验证证据 |
| repairLoop | 自动修复记录 |
| pauseReason | 需要决策 / 依赖阻塞 |
| actualDuration | 实际耗时记录 |

---

## 6. 分阶段落地建议

### 阶段 1：结构化 Markdown POC

```text
- 先定义 SOW / FLOW / TASK / DECISION / REVIEW Markdown 模板；
- 使用 YAML Front Matter + 标记区块 + JSONL 事件日志；
- 主智能体负责生成和维护任务清单；
- 程序只做读取、局部更新和轻量校验。
```

### 阶段 2：Guarded Task Flow

```text
- 引入状态约束；
- 拒绝非法状态跳转；
- 待决策处理后恢复任务；
- 审查结果驱动 DONE / REWORK / NEEDS_DECISION。
```

### 阶段 3：Runtime Orchestration

```text
- 将任务分派到具体 WorkerRuntimeBinding；
- 支持 RuntimeHost / RuntimeNode 状态上报；
- 加入执行租约、超时处理和冲突检测；
- 项目健康总表展示真实任务流推进状态。
```

---

## 7. 风险与控制

| 风险 | 控制方式 |
|---|---|
| 过早实现复杂状态机 | 第一阶段只做 Agent-led Task List 和轻量字段校验 |
| taskflow 内部术语污染用户 UI | 产品文案做语义转译 |
| 任务拆得过碎 | WorkItemNode 只代表可验收工作项，内部步骤由数字员工自主管理 |
| 进度与事实不一致 | TaskEvent / EvidenceRef 作为事实源，不依赖聊天上下文 |
| 智能体长期卡住 | 引入 Blocker、ExecutionLease、超时和中断报告 |
| skill 改了但文档没同步 | v0.9.11 规则要求同步 README、导航、版本说明或交接说明 |

---

## 8. 与现有计划的对应关系

本设计对应现有 WBS 与计划中的以下方向：

```text
B 组：结构化 Markdown 任务体系
C 组：Agent-led Task List POC
D 组：Guarded Task Flow
H / I / J 组：task/taskflow 机制参考任务与产品化预研
```

建议后续优先把本设计转化为结构化 Markdown 模板和最小读写工具，再进入前端或 Runtime 编排。
