# GUIDE-TASK-PLANNING-RULES-v0.6.33｜任务规划与 Step 设计规则

> 文档类型：Guide / 任务规划规则  
> 状态：active  
> UpdatedAt：2026-06-01 01:16:27 +0800  
> 更新任务：`TF-TEMP-PLANNING-RULES-DOC-SYNC-01`  
> 关联执行规则：`docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md`  
> 关联调度门禁：`docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md`  
> 关联触发规则：`docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md`  
> 关联执行器：`skills/task-runner/SKILL.md`、`skills/task-batch-runner/SKILL.md`

---

## 1. 一句话定位

本文件沉淀“怎么写计划、怎么拆任务、怎么设计步骤、怎么验证页面类任务”的执行经验，作为智能体和 ORCH 调用 runner 前的计划编写规则。

核心原则：

```text
Plan / Stage / WorkItem 先规划
WorkItem 启动前细化 Tasks
Task 执行时动态拆 Steps
Task 是最小颗粒度分配单元
Step 是最小颗粒度活动单元
```

---

## 2. 分层规划规则

### 2.1 Plan / Stage / WorkItem 不写成 Step

Plan、Stage、WorkItem 是上层组织对象，用来表达目标、阶段路线、范围边界、工作包和验收门槛。它们不应直接写成“改某个文件、运行某个命令”这类 Step。

Plan / Stage / WorkItem 应回答：

```text
目标是什么？
当前阶段是什么？
要交付哪些工作项？
哪些工作项优先？
范围边界是什么？
验收门槛是什么？
```

### 2.2 WorkItem 启动前必须细化 Task[]

执行某个 WorkItem 前，必须先把该 WorkItem 细化成可独立派工、可独立验收、可独立记录的 Task[]。

每个 Task 至少要有：

```text
TaskId
Title
Goal
Scope
OutOfScope
Inputs / ContextDocs
Dependencies
AcceptanceCriteria
ExpectedArtifacts
Risk / StopGates
RecommendedSkill
EvidenceRequired
```

如果 WorkItem 还没有 Task[]，不得直接调用 `task-runner` 或 `task-batch-runner`，应先进入 WorkItem Task Planning。

### 2.3 Task 执行前动态生成 Step[] / nodes[]

单个 Task 被确认执行后，`task-runner` 才根据当前上下文动态拆 Step[] / nodes[]。

Step 应是活动，不是新的工作项：

```text
读取上下文 / 确认基线
备份文件
最小范围修改
运行验证命令
截图验证与自查
修复问题并重验
生成报告 / 回写状态
```

若某个 Step 变成需要独立验收、独立派工或跨较长时间推进的内容，应暂停并建议提升为新的 Task。

---

## 3. Task Plan 编写模板

Task Runner Plan 里的 Steps 应覆盖理解、修改、验证、评审、交付，而不是只写“实现功能”。

推荐模板：

```text
S01 读取上下文与确认基线
  目标：确认 WorkItem、Task、范围、冻结项、验收标准和相关文件。

S02 备份将修改的文件
  目标：保存可回退基线，页面类任务至少备份 page.js，必要时备份 feature.js、数据、样式和组件。

S03 最小范围实现 / 修改
  目标：只完成本 Task 目标，不吸收新需求，不扩大页面或模块范围。

S04 验证与截图 / 测试
  目标：运行必要命令；页面类任务用 Playwright 打开真实页面并截图。

S05 智能体自查与必要修复
  目标：智能体自己查看截图或验证结果，检查布局、信息层级、交互入口、业务语义和异常；发现问题先修复并重新验证。

S06 记录证据与交付用户验收
  目标：生成 Task 记录、报告、exec 账本、截图或前后对比图，再交给用户最终验收。
```

---

## 4. 页面 / 前端 / 原型类 Task 的强制截图自查规则

页面类 Task 不能盲编码后让用户承担第一轮测试。截图验证必须作为智能体自己的 Step 写入 Plan 并实际执行。

页面类 Task 的 Plan 必须包含：

```text
1. 修改前备份
2. 页面 / 数据 / 样式 / 组件修改
3. 启动或确认 Web 服务可访问
4. Playwright 打开目标页面并截图
5. 智能体自己查看截图
6. 发现问题先修复并重新截图
7. 生成验收截图或前后对比图
8. 再交给用户最终验收
```

验收硬规则：

```text
未完成截图自查，不允许标记 PASS。
截图打不开、不真实、不对应目标页面，不允许交付。
页面类任务必须在 Run Summary 的 Actual Artifacts 中给出截图或对比图链接。
若运行环境无法截图，必须标记 BLOCKED / NEED_DEPENDENCY / PASS_WITH_WARNINGS，并说明原因。
```

---

## 5. 任务拆分质量标准

好的 Task 应满足：

```text
目标清晰：能用一句话说清楚完成什么。
范围可控：能明确本次做什么、不做什么。
可独立验收：完成后可以单独验证和截图/测试。
可回滚：修改文件和产物边界明确。
有证据：能生成报告、截图、日志、exec 账本或测试结果。
```

不好的拆分包括：

```text
把整个 WorkItem 当成一个 Task，导致范围过大。
把每个微小操作都提升为 Task，导致协调成本过高。
把 Step 当成 TaskBatch 项，导致批次进度失真。
页面类 Task 没有截图验证 Step。
只写“修改页面”，没有备份、验证、自查、交付证据。
```

---

## 6. 与 ORCH / Runner 的关系

- ORCH / 智能体在调用 runner 前，必须先按本文件判断输入是否已经达到 Task 或 TaskBatch 颗粒度。
- `task-runner` 负责单个 Task 内部的 Step 设计、执行、验证和总结。
- `task-batch-runner` 负责同一 WorkItem 下多个 Task 的顺序调度，但每个子 Task 仍要遵守本文件的 Task Plan 和截图自查规则。
- 本文件应被写入 `TaskDispatchPacket.contextDocs[]` 或 `TaskBatchDispatchPacket.contextDocs[]`。

推荐 contextDocs：

```text
docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md
docs/guides/GUIDE-ORCH-SCHEDULING-RULES-v0.6.33.md
docs/guides/GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION-v0.6.33.md
docs/guides/GUIDE-SKILL-TRIGGER-MODES-v0.6.33.md
docs/workitems/<WorkItemId>.md
```

---

## 7. 后续累计规则

每次任务执行中形成的可复用经验，应优先沉淀到规则文档，而不是只停留在对话里。

累计位置建议：

```text
计划 / 拆任务 / Step 设计经验 → 本文件
ORCH 调度前置条件 → GUIDE-ORCH-SCHEDULING-RULES
AI 动态工作流层级规则 → GUIDE-AI-DYNAMIC-WORKFLOW-EXECUTION
触发条件与模式 → GUIDE-SKILL-TRIGGER-MODES
单 Task 执行强制格式 → skills/task-runner/SKILL.md
批次执行强制格式 → skills/task-batch-runner/SKILL.md
```
