# 智能软件工厂阶段实施计划

> 版本：v0.6.33  
> 文档更新批次：2026-05-21 / 分阶段演进架构回写  
> 最新原型安全基线：v0.6.33.29  
> 状态：将后续实施从“一步到位状态机”调整为“主智能体任务清单驱动，逐步演进到状态机和 Runtime 编排”。

---

## 0. 执行原则

后续实施遵循：

```text
1. 避免过度设计，不在第一阶段直接实现完整复杂状态机。
2. 优先落地主智能体生成计划、拆解任务清单、维护任务变化的 POC。
3. 任务文档采用结构化 Markdown，兼顾人、智能体和程序读取。
4. 程序先做持久化和轻量约束，后续再逐步接管调度。
5. 原型迭代继续使用 stable-delivery / 稳交付 v0.3 流程。
```

---

## 1. 当前原型阶段状态

```text
最新安全基线：v0.6.33.29
已收敛模块：
  首页协作全景
  待决策工作台
  团队任务单闭环
  项目健康总表
  员工 Runtime 绑定
  岗位 / 技能匹配
  整体一致性修复
```

当前原型已经适合进入：

```text
v0.6.33.30：演示路径串联
v0.6.33-docs-final：文档回写
后续 POC：Agent-led Task List 最小闭环实现
```

---

## 2. 阶段 A：Agent-led Task List

### 2.1 目标

落地第一阶段最小闭环：协同规划岗生成计划、拆解任务清单、调用子智能体执行、根据反馈维护任务清单。

### 2.2 范围

```text
ProjectPlan.md
TaskTicket.md
TaskEvent 记录
主智能体生成和更新任务清单
子智能体执行并反馈
待决策事项生成
审查记录回写
```

### 2.3 不做

```text
复杂状态机引擎
多 Runtime 调度
任务依赖图优化
失败自动重试平台
```

### 2.4 验收

```text
主智能体能生成计划和任务清单。
任务清单能持久化为结构化 Markdown。
子智能体执行结果能回写到任务文档或事件日志。
主智能体能读取反馈并更新下一步。
待决策事项能进入待决策工作台。
```

---

## 3. 阶段 B：Guarded Task Flow

### 3.1 目标

在 Agent-led Task List 基础上加入轻量状态约束，防止任务状态乱跳。

### 3.2 状态

```text
TODO
RUNNING
REVIEWING
NEEDS_DECISION
DONE
```

### 3.3 约束

```text
TODO 只能进入 RUNNING。
RUNNING 只能进入 REVIEWING 或 NEEDS_DECISION。
REVIEWING 可以进入 DONE、RUNNING 或 NEEDS_DECISION。
NEEDS_DECISION 必须由用户处理后才能继续。
DONE 不允许被普通执行过程改回其他状态，除非走变更流程。
```

### 3.4 验收

```text
程序能读取 Markdown Front Matter 的 status 字段。
程序能拒绝非法状态跳转。
状态变化有 TaskEvent 记录。
```

---

## 4. 阶段 C：State-machine Orchestration

### 4.1 目标

将常规流转从主智能体全程调度，逐步迁移到程序状态机调度。

### 4.2 调度规则

```text
PLANNING       调用协同规划岗
RUNNING        调用实现验证岗
REVIEWING      调用交付审查岗
NEEDS_DECISION 进入待决策工作台
REWORK         重新分派实现验证岗
REPLAN         调用协同规划岗重规划
```

### 4.3 验收

```text
程序能根据任务状态自动选择调用角色。
主智能体只在规划、重规划、阻塞判断等关键节点参与。
任务流转不依赖聊天记录作为事实来源。
```

---

## 5. 阶段 D：Factory Runtime Orchestration

### 5.1 目标

实现多运行体、多数字员工、多项目并行的真实调度能力。

### 5.2 范围

```text
RuntimeHost
RuntimeNode
WorkerRuntimeBinding
SkillSnapshot
Workspace
AgentRoute
ToolPermissionProfile
Heartbeat
ExecutionLease
RetryPolicy
AuditLog
```

### 5.3 验收

```text
数字员工能绑定真实 OpenCode / Claude Code / Codex Runtime。
任务可以派发到具体运行节点。
任务结果能回写任务单。
运行状态能上报到员工页和协作全景。
```

---

## 6. 文档与原型后续顺序

建议后续顺序：

```text
1. v0.6.33.30 演示路径串联。
2. v0.6.33 文档最终回写：PRD / SDD / IMPL-PLN / WBS / CHANGELOG / ADR。
3. 结构化 Markdown 任务模板落地。
4. Agent-led Task List POC 实现。
5. Guarded Task Flow 实现。
6. Runtime 编排前置设计。
```

---

## 7. 稳交付执行要求

原型和文档迭代继续按 `stable-delivery v0.3` 执行：

```text
任务执行          标准模式
任务执行 高质量   高质量模式
```

每轮必须包含：

```text
计划确认
minimax 小步执行
截图验证
独立评审
评审追踪表
必要修复
前后对比截图
用户验收门
```
---

## 8. 文档与执行流程治理

后续文档、原型和补丁迭代统一使用 `stable-delivery / 稳交付 v0.3` 流程。

```text
任务执行：标准模式，至少 1 轮独立评审；本轮范围内 P0/P1/P2 必须修复。
任务执行 高质量：高质量模式，至少 2 轮评审，最多 4 轮，按问题是否收敛决定是否继续。
```

结构化 Markdown 模板按以下顺序补齐：

```text
1. STRUCTURED-WORKITEM-MD-TEMPLATE.md
2. STRUCTURED-PLAN-MD-TEMPLATE.md
3. STRUCTURED-DECISION-MD-TEMPLATE.md
4. STRUCTURED-REVIEW-MD-TEMPLATE.md
```

每次文档包更新必须同步更新 `docs/文档导航.md`，并在导航中标明最新安全基线、关键 ADR 和阅读顺序。

## 9. 原型与文档口径轻量适配阶段

在文档完成“主智能体任务清单驱动，逐步演进到状态机编排”的调整后，原型不做复杂状态机页面，不大改交互结构，而进行轻量适配：

1. 首页保持总览和协作全景心智，补充用户可见推进路径。
2. 项目健康总表强化岗位产出、项目下一步和风险处理。
3. 团队详情页强化三类岗位产出，不暴露底层状态机细节。
4. 待决策工作台保持人类决策节点定位。
5. 员工页继续作为 Runtime 绑定和后续运行体落地说明。

该阶段目标是让原型兼容后续底层演进，而不是把底层机制直接呈现给用户。

## 10. task / taskflow 机制验证与产品化路径

本项目已通过 `task` / `taskflow` 技能实践验证了“两层任务执行机制”：

```text
taskflow：外层任务流编排
task：单任务质量闭环
```

这套机制可作为后续智能软件工厂 POC 的实现参考，但应分阶段落地，避免一次性产品化全部流程。

### 10.1 短期：作为项目协作方法使用

在近期原型、文档和交接任务中，继续使用：

```text
任务执行 / 任务执行 高质量
任务流执行 / 任务流执行 高质量
```

目标是沉淀真实任务中的流程数据、评审追踪、暂停门禁和产物结构。

### 10.2 中期：映射到 Agent-led Task List

将 taskflow 的任务流清单转化为智能工厂第一阶段能力：

```text
FLOW.md         项目任务流
TASK-*.md       结构化任务单
REVIEW-*.md     审查记录
DEC-*.md        待决策记录
FLOW-REPORT.md  阶段汇总
```

协同规划岗负责生成和维护任务流；系统负责持久化任务、状态、事件和产物。

### 10.3 后续：演进到 Guarded Task Flow

当任务状态需要程序约束时，将 taskflow 的暂停门禁转化为轻量状态控制：

| taskflow 经验 | 产品化能力 |
|---|---|
| 暂停等待用户 | NEEDS_DECISION |
| 质量不收敛 | QUALITY_NOT_CONVERGED / REVIEWING |
| 依赖缺失 | BLOCKED |
| 节点完成 | DONE |
| 节点修复 | REWORK / RUNNING |

### 10.4 最终：作为状态机编排的用户级原型

在 State-machine Orchestration 阶段，taskflow 不再只是技能执行约定，而会演进为系统能力：

```text
任务流引擎读取 TaskTicket
状态机选择下一节点
调度器调用对应数字员工 Runtime
审查与待决策形成质量门禁
项目健康总表展示任务流进度
```

### 10.5 实施原则

```text
1. 先把 task/taskflow 作为协作实践沉淀，不急于产品化。
2. 产品化时优先实现结构化任务清单和状态回写。
3. UI 只展示用户可理解的项目推进和岗位产出，不展示技能内部术语。
4. taskflow 的流程图格式可作为未来任务流进度视图的参考。
5. managed task 模式可作为长程无人值守子任务执行的参考。
```

## 11. taskflow v0.3 经验的产品化边界

`taskflow v0.3` 增加的暂停/恢复机制可用于指导智能工厂后续落地，但应分阶段产品化。

### 11.1 第一阶段：串行任务流参考

在 POC 阶段，可以借鉴 `taskflow` 的串行任务流：

- 一个任务流按节点顺序推进；
- 每个节点调用单任务质量闭环；
- 暂停时记录原因、位置、已完成节点、未完成节点和需要用户补充的信息；
- 用户补充后从暂停点恢复。

### 11.2 第二阶段：待决策与恢复执行

将暂停机制产品化为待决策能力：

- 任务单进入 `NEEDS_DECISION`；
- 待决策工作台展示决策原因、影响范围、推荐方案和可选动作；
- 用户确认后任务单恢复到执行、审查或重规划节点。

### 11.3 第三阶段：多智能体并行编排

当进入多智能体协作阶段，需要在串行任务流之上增加：

- 并行任务调度；
- 多数字员工资源占用；
- 文件/产物冲突检测；
- 审查队列和返工队列；
- RuntimeHost / RuntimeNode 状态同步；
- 跨团队任务依赖与优先级仲裁。

该阶段不应简单复制 `taskflow` 的串行执行假设，而应把它作为流程语义和质量门禁的参考。


## 12. task/taskflow v0.4.1 经验的阶段落地

### 12.1 短期：作为团队工作方法

在当前阶段，`task` / `taskflow` 仍作为项目协作方法和技能包使用，不直接升级为普通用户可见功能。

短期要求：

- 单个任务使用 `任务执行`；
- 多工作项使用 `任务流执行`；
- 用户未明确 SOW 时，先做候选工作项选择；
- 完成后记录预计/实际耗时，无法精确计时必须明确说明。

### 12.2 中期：抽象为任务清单产品机制

将 SOW、工作项、任务单、暂停门禁、评审追踪逐步映射到产品模型：

- SOW → 项目阶段 / 工作项；
- taskflow 节点 → 可验收任务组；
- task → 单个任务单闭环；
- 暂停 → 待决策 / 阻塞；
- 退出 → 回退安全基线或重新规划。

### 12.3 后续：支持多智能体并行

当进入多智能体协作实现阶段，需要额外增加：

- 并行任务调度；
- Runtime / Workspace 资源分配；
- 冲突检测；
- 审查队列；
- 跨任务待决策影响分析；
- 任务恢复与重试策略。


## v0.6.33.33 原型收口实施说明

本阶段先做原型收口，再进入真实开发任务拆解。建议顺序：

1. 复核现有原型是否符合“用户看项目推进与岗位产出”的产品心智；
2. 修复团队页旧岗位口径残留和异常占位文本；
3. 同步 task/taskflow 最新经验到设计参考文档；
4. 打包最新原型、文档、QA、技能和交接说明；
5. 在原型与文档收口后，再梳理真实开发 P0/P1 任务。

taskflow v0.6 的经验用于指导长程任务组织，但不直接等同于智能工厂的多智能体调度实现。


---

## 9. P0b 前端工程收口最新状态（TF-P0B-04）

### 9.1 当前状态

截至 TF-P0B-04，前端工程已经从单 HTML 原型迁移为无构建 ESM 前端工程，并完成以下收口：

```text
1. 数据入口：mock-state / dataProvider。
2. API 门面：factoryApi / mockFactoryApi / httpFactoryApi。
3. 状态入口：prototypeStore。
4. 网站框架：AppShell / Router / MenuConfig / PageRegistry。
5. 动作入口：EventBus / ActionDispatcher。
6. 页面模块：Legacy Page Module 初步拆分。
7. 模板化试点：top banner / networkErrorBanner。
```

### 9.2 继续推进原则

```text
1. 继续保持无构建 ESM，暂不引入 Vite / TypeScript / pnpm。
2. index.html 仍为入口，后续只做低风险、可验证的 DOM 模板化。
3. prototype-runtime.js 不做一次性重写。
4. 每个前端 taskflow 节点必须截图验证；失败先进入节点内部修复循环。
```

### 9.3 下一步建议

优先级建议：

```text
P0b 后续：继续低风险 DOM 模板化试点，或先做 prototype-runtime.js 拆分边界评估。
P0c 后续：Taskflow 执行模型 UI 对齐应在稳定源码基线上继续，不回头修改原始高仿原型。
```
