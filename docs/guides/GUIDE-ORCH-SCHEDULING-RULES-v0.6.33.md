# GUIDE-ORCH-SCHEDULING-RULES-v0.6.33｜ORCH 调度规则与 Runner 前置门禁

> 文档类型：Guide / ORCH 调度规则  
> 状态：active  
> UpdatedAt：2026-06-01 01:16:27 +0800  
> 更新任务：`TF-TEMP-ORCH-SCHEDULING-RULES-DOC-SYNC-01`  
> 关联执行规则：`docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`  
> 关联触发规则：`docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md`  
> 关联计划规则：`docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`  
> 关联执行器：`skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md`  
> 关联设计：`docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`

---

## 1. 一句话定位

本文件定义 **ORCH / 智能体调用 runner 前必须遵守的调度门禁**。

`task-runner` 和 `task-batch-runner` 是执行器，不是上层调度器。ORCH 或临时充当 ORCH 的智能体，必须先确认 `Plan / Stage / WorkItem / Task / Step` 层级已经满足调度前提，再决定是否调用 runner。

```text
规则源：本文件 + AI 动态工作流执行规则
执行器：task-runner / task-batch-runner
未来实现：Team Orchestrator Service / ORCH 程序
```

---

## 2. 标准层级与调度边界

智能软件工厂的应用生成路径是：

```text
Plan / 计划
  → Stage / 阶段
    → WorkItem / 工作项 / 任务项
      → Task / 任务
        → Step / 步骤
```

调度边界如下：

| 层级 | 谁负责 | 是否可直接调用 runner | 说明 |
|---|---|---:|---|
| Plan | 规划层 / 产品与智能体协同 | 否 | 定义目标、阶段路线、优先级和边界。 |
| Stage | 规划层 / 项目推进 | 否 | 定义阶段目标和验收门槛。 |
| WorkItem | 规划层 / ORCH 监督 | 否 | 启动前必须细化为 `Task[]`。 |
| Task | ORCH / 用户 / batch 调度 | 是 | 最小颗粒度分配单元。 |
| Step | `task-runner` 内部 | 否 | 最小颗粒度活动单元，不被 ORCH 直接派发。 |

强规则：

1. **ORCH 只能派发 Task 或 TaskBatch，不能直接派发 Step。**
2. **WorkItem 未细化 `Task[]` 时，不能调用 `task-runner` 或 `task-batch-runner`。**
3. **Task 是最小分配单元，Step 是最小活动单元。**
4. **`task-runner` 只执行一个明确 Task。**
5. **`task-batch-runner` 只执行同一 WorkItem 下的一组明确 Task。**

---

## 3. Runner 前置门禁

### 3.1 是否允许调用 `task-runner`

调用前必须满足：

```text
[ ] taskId 已明确
[ ] workItemId 已明确；临时任务可使用 TEMP
[ ] goal / scope / outOfScope 已明确
[ ] acceptanceCriteria 已明确
[ ] frozenScope / allowedFiles / stopGates 已明确或显式为空
[ ] 当前输入不是 WorkItem 级模糊目标
[ ] 当前输入不是多个 Task 的批量队列
```

不满足时，必须返回或输出以下之一：

```text
NEED_TASK_PLANNING
NEED_DEPENDENCY
NEED_USER_DECISION
SCOPE_CLARIFICATION_REQUIRED
```

不得自行猜测范围后执行。

### 3.2 是否允许调用 `task-batch-runner`

调用前必须满足：

```text
[ ] batchId 已明确
[ ] workItemId 已明确且唯一
[ ] taskQueue[] 已明确，且所有 Task 属于同一 WorkItem
[ ] 每个 Task 都有 goal / scope / acceptanceCriteria
[ ] continueOn / stopOn 已明确
[ ] evidencePolicy / maxFailurePolicy 已明确或显式为空
[ ] 不跨 WorkItem
[ ] 不把 Step 当作 TaskQueue 项
```

不满足时，必须返回或输出以下之一：

```text
NEED_TASK_PLANNING
NEED_BATCH_SELECTION
NEED_DEPENDENCY
NEED_USER_DECISION
```

---

## 4. ORCH 调度决策树

```text
收到目标 / 用户请求 / 调度事件
  ↓
是否已经有 Plan / Stage / WorkItem？
  否 → 先规划或更新 Plan / WorkItem，不调用 runner
  是 → 继续
  ↓
当前是否要执行某个 WorkItem？
  是 → 检查 WorkItem 是否已有 Task[]
       否 → 先做 WorkItem Task Planning，不调用 runner
       是 → 继续
  ↓
当前执行对象是什么？
  单个 Task → 生成 TaskDispatchPacket → task-runner
  同一 WorkItem 下多个 Task → 生成 TaskBatchDispatchPacket → task-batch-runner
  Step / Node → 不允许直接派发；交给 task-runner 在 Task 内动态生成
```

---


## 4.1 WorkItem Task Planning 门禁

当调度对象仍是 WorkItem，而不是明确 Task / TaskBatch 时，ORCH 或智能体必须先进入 WorkItem Task Planning。

Task Planning 至少应产出：

```text
TaskId / Title / Goal / Scope / OutOfScope
Inputs / ContextDocs / Dependencies
AcceptanceCriteria / ExpectedArtifacts
Risk / StopGates / EvidenceRequired / RecommendedSkill
```

页面类 Task 的 AcceptanceCriteria 必须包含截图验证与智能体自查要求；否则不得进入执行态。

## 5. 三类调度来源

| 来源 | 场景 | 调用方式 | 是否等待用户确认 | 授权来源 |
|---|---|---|---:|---|
| TEMP_INTERACTIVE | 临时单任务 | `task-runner` | 是 | 用户确认 Task Runner Plan |
| PLANNED_INTERACTIVE | 正式单任务 | `task-runner` | 是 | 用户确认 Task Runner Plan |
| BATCH_INTERACTIVE | 正式批次 | `task-batch-runner` | 是 | 用户确认 TaskBatch Runner Plan |
| ORCH_TASK | ORCH 单任务 | `task-runner` | 否 | `TaskDispatchPacket` |
| ORCH_BATCH | ORCH 批次 | `task-batch-runner` | 否 | `TaskBatchDispatchPacket` |

ORCH 模式不等待用户确认，但不能跳过规则。派工包就是授权来源，必须被记录到 Task / exec / batch ledger 中。

---

## 6. TaskDispatchPacket 最小契约

```text
TaskDispatchPacket
  dispatchId
  triggerSource: ORCH
  mode: ORCH_TASK
  planId
  stageId
  workItemId
  taskId
  title
  goal
  scope
  outOfScope
  acceptanceCriteria[]
  frozenScope[]
  allowedFiles[]
  validationCommands[]
  evidenceRequired[]
  contextDocs[]
  stopGates[]
  expectedArtifacts[]
  callback / ledgerPath
```

最小必填字段：

```text
taskId
workItemId
goal
scope
acceptanceCriteria
stopGates
contextDocs
```

缺少必填字段时，`task-runner` 应返回 `NEED_DEPENDENCY` 或 `NEED_USER_DECISION`，不得执行。

---

## 7. TaskBatchDispatchPacket 最小契约

```text
TaskBatchDispatchPacket
  dispatchId
  triggerSource: ORCH
  mode: ORCH_BATCH
  batchId
  planId
  stageId
  workItemId
  taskQueue[]
    - taskId
      title
      goal
      scope
      acceptanceCriteria[]
      expectedArtifacts[]
  continueOn[]
  stopOn[]
  evidencePolicy
  maxFailurePolicy
  contextDocs[]
  callback / batchLedgerPath
```

最小必填字段：

```text
batchId
workItemId
taskQueue[]
stopOn
contextDocs
```

缺少必填字段时，`task-batch-runner` 应返回 `NEED_DEPENDENCY`，不得自行拼装批次。

---

## 8. 状态回写规则

ORCH 调度后必须能回写机器可判定状态。

单 Task 状态：

```text
PASS
FAIL
BLOCKED
NEED_USER_DECISION
NEED_DEPENDENCY
SCOPE_CHANGE_REQUIRED
QUALITY_NOT_CONVERGED
OUTPUT_NON_COMPLIANT
```

TaskBatch 状态：

```text
PASS
PARTIAL
STOPPED_ON_BLOCKED
STOPPED_ON_NEED_USER_DECISION
STOPPED_ON_FAIL
NEED_DEPENDENCY
OUTPUT_NON_COMPLIANT
```

回写位置建议：

```text
.runtime/orch/dispatches.jsonl
.runtime/orch/packets/<TaskId-or-BatchId>.md
.runtime/exec/<WorkItemId>/<TaskId>.json
.runtime/batches/<BatchId>.json
docs/tasks/<WorkItemId>/TASK_<TaskId>.md
docs/reports/<QA-or-RPT>.md
```

---

## 9. 停止门禁

以下情况必须停止自动推进：

```text
P0 / P1 风险
范围变化或需要变更 Plan / WorkItem / Task
缺依赖或派工包字段不足
验证失败且修复不收敛
需要用户确认业务规则、视觉方向、验收口径或安全边界
子 Task 返回 BLOCKED / NEED_USER_DECISION / FAIL / SCOPE_CHANGE_REQUIRED
runner 输出不合规，无法形成可信执行记录
```

停止后应生成 `DecisionPacket` 或等价的待决策记录，而不是继续执行下一 Task。

---

## 10. 智能体如何看到本规则

本规则不能只“放在 docs 里”，必须进入智能体默认读取链路：

### 10.1 文档导航入口

`docs/doc-nav.md` 与 `docs/文档导航.md` 必须把本文件列为任务执行前必读。

### 10.2 项目记忆入口

`docs/project-memory.md` 必须记录强规则：

```text
ORCH / 智能体调用 runner 前，必须先检查 Plan / Stage / WorkItem / Task 层级；
WorkItem 未细化 Task[] 时不能调用 runner；
ORCH 只能派发 Task 或 TaskBatch，不能派发 Step。
```

### 10.3 Skill 前置门禁

`skills/task-runner/SKILL.md` 与 `skills/task-batch-runner/SKILL.md` 必须引用本文件，并把它作为触发前置门禁。

### 10.4 ORCH 派工包上下文

未来 `TaskDispatchPacket` / `TaskBatchDispatchPacket` 应在 `contextDocs[]` 中包含：

```text
docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md
docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md
docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md
docs/workitems/<WorkItemId>.md
```

### 10.5 新会话 / 新智能体交接

新会话或新智能体接手时，读取顺序建议为：

```text
1. docs/doc-nav.md
2. docs/project-memory.md
3. docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md
4. docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md
5. docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md
6. 对应 WorkItem 文档
7. 对应 runner SKILL.md
```

---

## 11. 当前不做

本文件只定义调度规则，不实现真实 ORCH 程序。

当前不做：

- 不新增第三个 `orch-scheduler` skill；
- 不实现后台 Team Orchestrator Service；
- 不实现跨团队、多员工负载均衡；
- 不改 `apps/` 页面；
- 不把 Step 提升为平台级任务对象。

后续如果需要让 ChatGPT / OpenCode 临时模拟 ORCH，可另行设计 `orch-scheduler` 或等价协议；最终产品中的 ORCH 应是后台调度服务，而不是普通 skill。
