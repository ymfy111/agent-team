# GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33｜AI 动态工作流规划与执行颗粒度规则

> 文档类型：Guide / 执行规则  
> 状态：active  
> UpdatedAt：2026-06-01 01:16:27 +0800  
> 关联架构：`docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`  
> 关联计划规则：`docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`  
> 关联执行器：`skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md`

---

## 1. 核心规则

智能软件工厂按 **AI 驱动动态工作流** 推进应用生成。智能体执行时必须遵循以下层级：

```text
Plan / 计划
  → Stage / 阶段
    → WorkItem / 工作项 / 任务项
      → Task / 任务
        → Step / 步骤
```

对应执行原则：

1. **先规划 Plan 与 WorkItem**：智能体接到目标后，应先明确计划、阶段和工作项，不应直接跳到零散文件修改。
2. **WorkItem 启动前细化 Tasks**：执行某个 WorkItem 前，必须先把该 WorkItem 细化为可独立派工、可独立验收的 `Task[]`。
3. **Task 执行时动态拆 Steps**：具体执行某个 Task 时，`task-runner` 应根据任务目标、输入、当前工程状态和验证结果，动态生成 `Step[] / nodes[]`。
4. **Task 是最小颗粒度的分配单元**：平台、ORCH、TaskBatch、数字员工之间的派工边界是 Task，而不是 Step。
5. **Step 是最小颗粒度的活动单元**：Step 只存在于单个 Task 的执行过程，用于记录执行、验证、修复、评审等活动，不应被提升为跨员工派工对象。

---

## 2. 各层责任边界

| 层级 | 中文口径 | 责任 | 生成时机 | 不应承担 |
|---|---|---|---|---|
| Plan | 计划 | 定义总体目标、阶段路线、优先级和边界 | 项目/阶段规划时 | 不写具体执行步骤 |
| Stage | 阶段 | 承接计划中的阶段目标和验收门槛 | 计划拆解时 | 不承载运行日志 |
| WorkItem | 工作项/任务项 | 承接阶段内一个可交付、可验收的工作包 | 阶段启动或阶段规划时 | 不直接记录每一步操作 |
| Task | 任务 | WorkItem 下最小派工单元，可由一个数字员工/runner 独立执行与验收 | WorkItem 启动前细化 | 不再拆成跨员工长期子任务，除非提升为新 Task |
| Step | 步骤 | 单个 Task 内最小活动单元，记录执行、验证、修复和证据 | Task 开始执行时动态生成 | 不作为平台级派工单元 |

---

## 3. 执行流程

### 3.1 规划阶段

智能体应先输出或维护：

```text
Plan：目标、阶段、路线、当前焦点
Stage：阶段目标、验收门槛、关联 WorkItem
WorkItem：工作项目标、范围、状态、待细化 Task 清单
```

### 3.2 WorkItem 启动前

WorkItem 即将执行时，应先细化 `Task[]`：

```text
TaskId / TaskTitle / Goal / Scope / OutOfScope
Inputs / Dependencies / Acceptance / ExpectedArtifacts
Risk / StopGates / AssigneeRole / RecommendedSkill
```

若 WorkItem 的 Task 清单尚未细化，不能直接进入批次执行；应先生成或更新 WorkItem 的 Task 清单，再由用户或上层调度确认是否执行。

### 3.3 Task 执行时

单个 Task 被分配给 `task-runner` 后，runner 应动态分配 Steps：

```text
S01 理解上下文与确认基线
S02 最小范围修改或产物生成
S03 验证 / 截图 / 测试
S04 独立评审与必要修复
S05 总结、记录、回写 WorkItem 状态
```

Step 清单可以根据执行中发现的问题调整，但调整必须记录在 `nodes[]`、Task 文档或 exec 账本中。

### 3.4 TaskBatch 执行时

`task-batch-runner` 只能执行同一 WorkItem 下已经计划好的 `Task[]`：

```text
TaskBatch -> Task[] -> 每个 Task 由 task-runner 动态生成 Step[]
```

Batch 不应把多个 Task 合并成一个 Task，也不应直接管理 Step。

---


## 3.5 Task Plan 编写与页面截图自查

Task Plan 不应只写“修改/实现”，必须覆盖上下文、备份、最小改动、验证、自查、必要修复和交付证据。详细规则见 `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`。

页面 / 前端 / 原型类 Task 必须把截图验证作为智能体自己的 Step：

```text
备份将修改的文件
修改页面 / 数据 / 样式 / 组件
启动或确认 Web 服务
Playwright 打开目标页面并截图
智能体自己查看截图并判断是否偏离设计
发现问题先修复并重新截图
生成验收截图 / 前后对比图
再交给用户最终验收
```

未完成截图自查的页面类 Task，不允许标记完全 `PASS`。

## 4. 页面表达要求

首页、项目页、团队页、员工页和待决策页应优先表达：

```text
当前 Plan / Stage / WorkItem 是什么？
WorkItem 是否已经细化为 Task？
当前 TaskBatch 走到第几个 Task？
当前 Task 的 Step 在做什么？
哪个员工/智能体负责该 Task 或 Step？
是否有待决策、阻塞、验证失败或需要验收？
```

员工状态必须落到活动：员工不是静态头像，而是某个 Task / Step 的执行、协同、验证、组长把关或等待状态。

---

## 5. 验收规则

后续任务执行、文档评审和页面设计应检查：

- 是否先有 Plan / Stage / WorkItem 的规划入口；
- WorkItem 执行前是否有明确 Task 清单；
- Task 是否作为最小派工单元独立记录；
- Task 执行时是否有动态 Step / nodes[]；
- 员工活动、待决策和生成产物是否能回溯到对应 Task / Step；
- 执行完成后是否回写 WorkItem / Plan 当前焦点和状态。
