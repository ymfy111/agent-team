# GUIDE-SKILL-TRIGGER-MODES-v0.6.33｜task-runner / task-batch-runner 触发条件与调度模式

> 文档类型：Guide / Skill 触发规则  
> 状态：active  
> UpdatedAt：2026-06-01 01:16:27 +0800  
> 更新任务：`TF-TEMP-SKILL-TRIGGER-RULE-SYNC-01`  
> 关联执行规则：`docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`  
> 关联计划规则：`docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`  
> 关联执行器：`skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md`

---

## 1. 总原则

`task-runner` 与 `task-batch-runner` 只在 **Task 颗粒度已经明确** 后触发。若输入仍停留在目标、计划、阶段或 WorkItem 层级，应先规划或细化，不应直接进入 runner 执行。

```text
Plan / Stage / WorkItem 还没明确
  → 先规划，不进入 runner

WorkItem 已明确，但 Task[] 尚未细化
  → 先做 WorkItem Task Planning，不进入 runner

已有一个明确 Task
  → task-runner

已有同一 WorkItem 下多个明确 Task
  → task-batch-runner
```

核心边界：

- `Task` 是最小颗粒度分配单元。
- `Step / Node` 是最小颗粒度活动单元。
- `task-runner` 执行一个 Task，并在执行时动态生成 Step / Node。
- `task-batch-runner` 执行一个 TaskBatch，顺序调度同一 WorkItem 下的 Task[]，不直接管理 Step。

---

## 2. 场景分类

### 2.1 临时任务 / TEMP

临时任务用于短小、明确、不需要纳入正式 WorkItem 任务清单的补丁、验证、文档同步或纠偏。

典型触发语：

```text
用临时任务补一下文档
临时修一下这个问题
临时验证一下
补一个报告
把这个同步到文档
先做个小修复
```

触发规则：

| 输入情况 | 触发 | Mode | 说明 |
|---|---|---|---|
| 一个明确临时任务 | `task-runner` | `TEMP_INTERACTIVE` | 先输出 Plan，用户确认后执行 |
| 多个强耦合临时动作 | `task-runner` | `TEMP_INTERACTIVE` | 合并成一个 Task，内部动态拆 Steps |
| 多个独立临时任务 | 通常逐个 `task-runner` | `TEMP_INTERACTIVE` | 不默认 batch，除非用户明确要求连续处理 |

要求：

- TaskId 使用 `TF-TEMP-*`。
- `BelongsTo` 使用 `TEMP`。
- 仍然必须生成 Task 记录、Report/QA、`.runtime/exec/TEMP/<TaskId>.json`。
- 如果执行中发现临时任务会影响主线计划，应暂停并建议转为正式 WorkItem / Task。

---

### 2.2 计划任务 / 用户交互确认调度

计划任务属于某个 Plan / Stage / WorkItem，是当前人机协作推进研发的主要方式。

触发规则：

| 输入情况 | 触发 | Mode | 说明 |
|---|---|---|---|
| 用户要执行某个 WorkItem，但 Task[] 未细化 | WorkItem Task Planning | `PLANNING` | 先给候选 Tasks，等待确认 |
| 用户指定一个明确 Task | `task-runner` | `PLANNED_INTERACTIVE` | 先 Plan，确认后执行 |
| 用户指定同一 WorkItem 下多个 Tasks | `task-batch-runner` | `BATCH_INTERACTIVE` | 先 Batch Plan，确认后连续执行 |
| 用户说“继续下一个任务” | 先定位 next Task | `PLANNED_INTERACTIVE` 或 `BATCH_INTERACTIVE` | 必须先展示选择依据和 Plan |

WorkItem Task Planning 输出至少应包含：

```text
WorkItem: <WorkItemId>
Candidate Tasks:
  01 <TaskId>｜<title>｜Goal｜Scope｜Acceptance｜ExpectedArtifacts
  02 <TaskId>｜<title>｜Goal｜Scope｜Acceptance｜ExpectedArtifacts

请选择：执行单个 Task / 执行一批 Tasks / 暂不执行。
```

---

### 2.3 ORCH 调度 / 非交互调度

未来 ORCH 调度程序可以直接调用 runner。ORCH 模式不等待用户确认，但必须携带结构化派工包，并保留同等 Plan / nodes[] / Summary / evidence 记录。

| 输入情况 | 触发 | Mode | 说明 |
|---|---|---|---|
| ORCH 发单个 TaskDispatchPacket | `task-runner` | `ORCH_TASK` | 不等待用户确认，直接执行一个 Task |
| ORCH 发 TaskBatchDispatchPacket | `task-batch-runner` | `ORCH_BATCH` | 不等待用户确认，按 TaskBatch 队列执行 |

ORCH TaskDispatchPacket 最少字段：

```text
TaskDispatchPacket
  taskId
  workItemId
  planId / stageId
  goal / scope / outOfScope
  acceptanceCriteria
  frozenScope
  allowedFiles
  validationCommands
  evidenceRequired
  stopGates
```

ORCH TaskBatchDispatchPacket 最少字段：

```text
TaskBatchDispatchPacket
  batchId
  workItemId
  taskQueue[]
  continueOn
  stopOn
  evidencePolicy
  maxFailurePolicy
```

ORCH 模式输出状态必须机器可判定：

```text
PASS
FAIL
BLOCKED
NEED_USER_DECISION
NEED_DEPENDENCY
SCOPE_CHANGE_REQUIRED
QUALITY_NOT_CONVERGED
```

---

## 3. 推荐 Mode 命名

| Mode | 适用对象 | 是否等待用户确认 | 说明 |
|---|---|---|---|
| `TEMP_INTERACTIVE` | 临时单 Task | 是 | 用户确认后执行 |
| `PLANNED_INTERACTIVE` | 正式单 Task | 是 | 用户确认后执行 |
| `BATCH_INTERACTIVE` | 正式 TaskBatch | 是 | 用户确认后连续执行 |
| `ORCH_TASK` | ORCH 单 Task | 否 | 由派工包授权 |
| `ORCH_BATCH` | ORCH TaskBatch | 否 | 由派工包授权 |

兼容字段：

```text
Mode: Interactive / ORCH
TaskType: TEMP / PLANNED_TASK / PLANNED_BATCH
```

在对话可见输出中可以使用更易懂的 `Mode: Interactive / ORCH`，在 `.runtime/exec` 或 `.runtime/batches` 中记录更细的 `triggerMode`。

---

## 4. 决策树

```text
输入是否为纯问答 / 分析 / 解释？
  是 → 不触发 runner
  否 → 继续

是否只是规划 Plan / Stage / WorkItem？
  是 → 做规划文档，不触发 runner
  否 → 继续

是否已有明确 Task？
  否 → 先做 WorkItem Task Planning
  是 → 继续

是否是一组同一 WorkItem 下的明确 Tasks？
  是 → task-batch-runner
  否 → task-runner

调度来源是谁？
  用户自然语言 → Interactive，必须 Plan 后确认
  ORCH 派工包 → ORCH，必须有结构化授权，不等待用户确认
```

---

## 5. 合规检查

- Interactive 模式缺 Plan、缺用户确认、缺代码块 Summary，状态不得标记完全 PASS。
- ORCH 模式缺派工包、缺 Plan 记录、缺 nodes[]、缺 Summary、缺机器状态，状态不得标记完全 PASS。
- WorkItem 未细化 Task[] 时，不能直接启动 batch。
- Batch 不跨 WorkItem。
- 临时任务不得无限扩大；需要主线调整时升级为正式 Task / WorkItem。


## 5.1 页面类任务计划门禁

页面 / 前端 / 原型类 Task 触发 `task-runner` 前，Task Runner Plan 必须包含截图验证与智能体自查 Step。

最低要求：

```text
备份修改文件
修改页面
启动或确认 Web 服务
Playwright 截图
智能体查看截图并自查
必要修复与重新截图
提供验收截图 / 前后对比图
```

缺少截图自查 Step 的页面类 Task，不得标记完全 PASS。

