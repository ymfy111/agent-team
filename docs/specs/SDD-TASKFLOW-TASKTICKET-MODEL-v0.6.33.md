# TaskFlow / TaskTicket 层级模型与 P0 文档化落地约定

> 文件：`docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`  
> 版本口径：v0.6.33 / v0.6.33.45 文档补充  
> 状态：P0 子设计，作为 `SDD-v0.6.33.md` 的细化补充，不替代主 SDD。  
> 适用范围：TaskFlow / TaskTicket 层级模型、字段映射、Artifact / Evidence 口径、P0 文档化落地约定。

---

## 0. 设计定位

本子设计用于补齐 `TaskFlow / TaskTicket` 在 P0 阶段的产品化口径。它承接主 SDD 中“Agent-led Task List → Guarded Task Flow → State-machine Orchestration → Runtime 工厂化调度”的分阶段架构，不提前引入复杂数据库、完整状态机、Runtime 自动调度或任务锁。

主文档引用建议：

> TaskFlow / TaskTicket 层级模型、字段映射和 P0 文档化落地约定详见 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`。

---

## 1. 层级模型

推荐层级保持为：

```text
Project
  └── Stage / Plan
        └── WorkPackage / TaskFlowGroup
              └── TaskFlow
                    └── TaskTicket / Node
                          └── Artifact / Evidence
```

P0 阶段的约定：

```text
TaskFlow Node = TaskTicket 的文档化视图与轻量实现形式
```

也就是说，当前结构化 Markdown 中的节点不是新的平行对象，而是 TaskTicket 在 TaskFlow 文档里的轻量表达。后续如果进入数据库或服务端持久化阶段，可以把 Node 拆解为正式 TaskTicket 记录，TaskFlow 文档仍保留为人和智能体友好的视图。

### 1.1 WorkPackage / TaskFlowGroup

`WorkPackage / TaskFlowGroup` 是 `Stage / Plan` 与 `TaskFlow` 之间的组织层，用于承接一个计划目标下的一组有序任务流。

```text
Plan / Roadmap
  └── WorkPackage / TaskFlowGroup
        ├── TaskFlow-01
        ├── TaskFlow-02
        └── TaskFlow-03
```

P0 阶段的约定：

- 一个 WorkPackage 可以包含多个有顺序、有状态、有依赖关系的 TaskFlow；
- WorkPackage 维护任务流组状态清单、当前焦点、阻塞项、运行记录链接和评审报告链接；已完成任务若结论已沉淀，原始运行记录/评审报告可清理，仅保留摘要；
- WorkPackage 不承载每次执行的详细日志，详细过程按需放入 `docs/tasks/runs/` 和 `docs/reports/`，沉淀后可清理；
- P0 文档化阶段，`docs/tasks/*.md` 的主文档可作为 WorkPackage / TaskFlowGroup 的轻量表现；
- 不提前引入数据库任务锁、复杂排期算法、Runtime 自动调度或完整工作流引擎。


---

## 2. P0 最小字段建议

### 2.1 TaskFlow

P0 阶段 TaskFlow 用于表达一组可执行、可追踪、可恢复的任务节点。

建议字段：

```yaml
flowId: TF-EXAMPLE-001
title: 示例任务流
projectId: agent-team
stage: P0
mode: batch-auto-summary
status: running | done | needs_review | blocked
currentNode: TF-EXAMPLE-001-N01
progress: 1/4
ownerRole: 协同规划岗
createdAt: 2026-05-24T00:00:00Z
updatedAt: 2026-05-24T00:10:00Z
```


### 2.1.1 WorkPackage / TaskFlowGroup

P0 阶段 WorkPackage 用于管理一组有序 TaskFlow，避免 `docs/tasks/` 中出现大量散乱的单任务流文档。

建议字段：

```yaml
workPackageId: TF-GF-IMPL
title: Guarded Flow 最小实现工作包
parentPlan: docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md
status: running | done | accepted | blocked | deferred
currentTaskFlow: TF-GF-IMPL-04
taskFlows:
  - flowId: TF-GF-IMPL-01
    status: done
    goal: 依赖检查最小实现
    runRef: 已清理，结论沉淀于工作包摘要
    reportRef: 已清理，结论沉淀于工作包摘要
  - flowId: TF-GF-IMPL-04
    status: ready
    goal: 恢复记录最小实现
```

设计要点：

1. `plans/` 指向 WorkPackage，不直接管理所有 01/02/03 子任务流。
2. WorkPackage 只维护状态摘要和必要链接，详细执行过程按需进入 `runs/` 与 `reports/`；任务完成并沉淀后可清理原始过程文件。
3. WorkPackage 是组织层，不是新的执行层；真正执行的仍是 TaskFlow 与 TaskTicket / Node。

### 2.2 TaskTicket / Node

P0 阶段 TaskTicket / Node 至少具备以下字段：

```yaml
nodeId: TF-EXAMPLE-001-N01
title: 输入复核
goal: 复核输入资料、冻结项和验收口径
ownerRole: 协同规划岗
status: todo | running | done | accepted | needs_review | blocked
priority: P0 | P1 | P2
dependencies:
  - TF-EXAMPLE-001-N00
inputArtifacts:
  - docs/specs/SDD-v0.6.33.md
outputArtifacts:
  - docs/reports/example-review.md
artifactRefs:
  - docs/reports/example-review.md
evidenceRefs:
  - EVD-001
decisionItems: []
blockers: []
doneCriteria:
  - 输入资料路径明确
  - 冻结项已确认
  - 任务范围与不做范围已记录
actualStartedAt: 2026-05-24T00:00:00Z
actualCompletedAt: 2026-05-24T00:02:00Z
actualDuration: 2m
nextAction: 进入下一节点
```

`doneCriteria` 是 P0 建议字段。它用于表达节点完成判定标准，P0 不要求结构化系统字段，可先使用 Markdown bullet 表达。

---

## 3. Artifact / Evidence 口径

### 3.1 Artifact / Change Reference

Artifact / Change Reference 指向“产物或变更对象”，用于回答“改了什么、产出了什么、在哪里”。

典型项：

- commit hash
- 文档路径
- 代码路径
- 原型 HTML
- QA 报告路径
- 运行记录路径
- 交接包路径

### 3.2 Evidence

Evidence 指向“验证或审查证据”，用于回答“为什么可以认为它完成、通过、可信”。

典型项：

- 测试输出
- 截图
- `brokenImages=0 / pageErrors=0 / httpErrors=0`
- 交付审查结论
- 独立评审报告中的 PASS / WARN / FAIL 结论
- `validate-*` 命令输出

### 3.3 口径修正

commit hash 更适合作为 Artifact / Change Reference，不应单独作为 Evidence 示例。commit 可以证明“变更进入事实源”，但不能单独证明“已验证 / 已验收”。

---

## 4. 对现有对象的挂载关系

| 对象 | 关系 | P0 落地方式 |
|---|---|---|
| ProjectPlan / Stage / Plan | WorkPackage / TaskFlowGroup 所属计划或阶段 | Front Matter 或文档正文引用 |
| WorkPackage / TaskFlowGroup | 一个计划目标下的一组有序 TaskFlow | `docs/tasks/*.md` 工作包主文档 |
| TaskFlow | 一组 TaskTicket / Node 的编排视图 | 结构化 Markdown |
| TaskTicket / Node | 最小可执行、可验证任务单元 | Markdown 表格 + 标记区块 |
| TaskEvent | 状态变化、执行反馈、恢复记录 | JSONL 追加记录 |
| ReviewRecord | 审查结论、返工建议、质量门禁 | 评审报告或 Review 区块 |
| DecisionItem | 需要用户 / 协同规划岗裁决的问题 | Decision 区块或独立文档 |
| HandoffPackage | 任务流或任务集合的交接材料 | Markdown 交接文档 |
| Artifact / Evidence | 产物引用与验证证据 | 分开记录，避免混用 |

### 4.1 DesignImplementationSync 的挂载关系

DesignImplementationSync 不是独立执行层，而是围绕 TaskFlow / TaskTicket 发生的设计-实施同步流程。

```text
设计侧输出 / 更新设计
→ 进入 ProjectRepository / Artifact
→ 触发或更新 TaskFlow / TaskTicket
→ 实施侧执行并回写 TaskEvent / Evidence
→ 审查或决策形成 ReviewRecord / DecisionItem
→ 阶段性结果沉淀为 HandoffPackage
```

同步结果应回写为：

- TaskEvent：同步动作、状态变化、执行反馈；
- ReviewRecord：实施偏差、质量审查、返工建议；
- DecisionItem：需要裁决的范围、方案或优先级取舍；
- HandoffPackage：阶段性交接包和接手说明。

---

## 5. project-memory.md 多方写入暂不纳入本设计

`project-memory.md` 被多方写入时是否需要分区、合并策略或审查门禁，属于 Workspace / 事实源 / 记忆分层设计问题。本子设计只记录边界，不把它并入 TaskFlow / TaskTicket 子设计。

---

## 6. P0 不做范围

当前子设计不引入以下能力：

- 不实现完整数据库模型；
- 不实现完整状态机；
- 不实现 Runtime 自动调度；
- 不实现任务锁或文件锁；
- 不实现完整 Artifact Store；
- 不把 Markdown Node 与数据库 TaskTicket 强行拆成两套对象。

---

## 7. 三文档口径一致性矩阵

| 概念 | SDD 正文口径 | recs 口径 | 本子设计口径 | 结论 |
|---|---|---|---|---|
| TaskTicket | 系统事实来源 / 最小任务对象 | TaskTicket First，所有协作围绕任务单沉淀 | Node 是 TaskTicket 文档化视图 | 一致 |
| WorkPackage / TaskFlowGroup | 主 SDD 原有层级未显式展开 | 一组相关 TaskFlow 的工作包清单 | Plan 与 TaskFlow 之间的组织层 | 已补齐 |
| TaskFlow | Agent-led Task List / Guarded Task Flow 的编排载体 | 用户口头任务和文档清单应产品化 | 一组 TaskTicket / Node 的编排视图 | 一致 |
| ProjectPlan / Stage / Plan | PlannerAgent 生成 ProjectPlan | 计划进入 TaskTicket | TaskFlow 挂载到 Stage / Plan | 一致 |
| TaskEvent | 执行反馈与通讯记录 | 执行结果必须回写 | 状态变化、反馈、恢复均追加 TaskEvent | 一致 |
| ReviewRecord | 审查记录 | Review / Acceptance 挂 TaskTicket | 审查结论和返工建议 | 一致 |
| DecisionItem | 待决策对象 | ChangeRequest / DecisionItem | 关键取舍、阻塞升级 | 一致 |
| HandoffPackage | 阶段性交接材料 | 交接文档逐步结构化 | TaskFlow / TaskTicket 集合交接 | 一致 |
| Artifact / Evidence | QA Artifact / 产物引用 | Git 仓库事实源，需证据标签 | Artifact 指产物；Evidence 指验证 | 已修正冲突 |
| doneCriteria | 主 SDD 原有字段不足 | 需要可执行、可验证任务单 | P0 建议字段，Markdown bullet 表达 | 已补齐 |
| DesignImplementationSync | 设计/实施同步需回写事件 | P0 流程建议 | 非独立执行层，回写 TaskEvent 等 | 已补齐 |

---

## 8. 合并检查结论

本子设计仅补齐 TaskFlow / TaskTicket 的层级与字段口径，不改变主 SDD 的分阶段演进策略。后续如进入产品化实现，应优先保持 P0 文档化落地，不提前复杂化。
