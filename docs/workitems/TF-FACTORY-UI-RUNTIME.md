# TF-FACTORY-UI-RUNTIME｜迁移目标网站 Runtime / Gateway 前端改造工作项

> 文档类型：WorkItem / 工作项  
> 当前基线：v0.6.33.45  
> 所属计划：`docs/plans/PLAN-SMART-FACTORY.md`  
> 关联阶段：G｜Runtime / Gateway / UI / 自动调度  
> 状态：planned  
> 当前焦点：先完成前端信息架构与运行体辅助视图设计；已补充总览页 AI 动态工作流表达设计，不直接进入大范围实现。  

---

## 1. 工作项定位

本工作项用于把 Runtime / Gateway / TeamOrchestrator / OpenCode RuntimeNode 的设计，逐步落到迁移目标网站前端中。

本工作项的边界是：**前端要表达运行体基础设施，但不能把智能软件工厂做成 Web IDE**。用户主线仍然是 Project / Plan / WorkItem / TaskFlow / DigitalEmployee，Gateway、OpenCode、Workspace、日志、终端、诊断只作为任务执行和排障的下钻能力。

---

## 2. 设计依据

- 总路线图：`docs/plans/PLAN-SMART-FACTORY.md`
- 主系统设计：`docs/specs/SDD-v0.6.33.md`
- Runtime / Gateway 参考子设计：`docs/specs/SDD-COSTRICT-CLOUD-REFERENCE-v0.6.33.md`
- 当前原型参考：`docs/prototypes/agent-team-v0.6.33.45-prototype.html`
- 项目长期事实源：`docs/project-memory.md`
- 总览页 AI 动态工作流表达设计：`docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`

---

## 3. 前端改造原则

1. **任务流优先**：页面主入口仍是项目、计划、工作项、任务流、待决策和数字员工。
2. **运行体辅助**：RuntimeGateway、TeamOrchestrator、OpenCode RuntimeNode、Workspace、Lease、Diagnostics 作为执行与排障辅助信息。
3. **不做 Web IDE 首页**：不以文件树、终端、编辑器作为主导航中心。
4. **绑定关系可见**：用户应能看到哪个 Team 服务哪个 Project、由哪个 Gateway 承载、哪些员工已初始化为 OpenCode RuntimeNode。
5. **异常可定位**：运行体离线、Lease 冲突、Workspace 占用、初始化失败等应能从任务流或员工详情下钻查看。
6. **先 Mock / 原型映射，再实现**：目标网站实现前先明确页面信息架构、字段、状态和 Mock 数据契约。

---

## 4. TaskFlow 状态清单

| TaskFlow | 状态 | 目标 | 具体任务清单 | 关键产出 | 下一步 |
|---|---|---|---|---|---|
| TF-FACTORY-UI-RUNTIME-01 | ready | 前端信息架构与导航落点设计 | 1）梳理当前原型页面；2）确定 Runtime/Gateway 入口位置；3）明确哪些信息放首页、项目页、团队页、员工页、网关页；4）输出页面级信息架构 | 页面入口与信息架构说明 | 下一步建议执行 |
| TF-FACTORY-UI-RUNTIME-01A | ready | 总览页动态工作流表达增强 | 1）围绕 Plan/Stage/WorkItem/Task/Step 调整首页信息表达；2）员工活动绑定到 Task/Step；3）右侧团队动态改为 WorkItem/DecisionPacket 事件流；4）详情抽屉展示任务列表、执行与验收、停止策略；5）输出前后截图 | overview 动态工作流增强实现 | 建议作为下一步小步实现 |
| TF-FACTORY-UI-RUNTIME-02 | planned | RuntimeGateway 列表与详情视图 | 1）设计 Gateway 列表字段；2）设计 Gateway 详情分区；3）展示承载的 TeamOrchestrator；4）展示 OpenCode RuntimeNode；5）设计日志/诊断入口 | Gateway 视图设计 | 后续 |
| TF-FACTORY-UI-RUNTIME-03 | planned | TeamProjectAssignment 与 TeamOrchestrator 视图 | 1）展示 Team 与 Project 的阶段性绑定；2）展示 ProjectContextSnapshot；3）展示编排器状态、当前工作项、阻塞与最近调度事件；4）设计启动/暂停/恢复等操作边界 | 团队项目绑定与编排器状态视图 | 后续 |
| TF-FACTORY-UI-RUNTIME-04 | planned | 数字员工运行体绑定视图 | 1）展示员工生命周期：已创建/已入组/可初始化/已运行；2）展示绑定的 Gateway、OpenCode RuntimeNode、workspace；3）展示 skill/MCP/AGENTS.md/memory snapshot 版本；4）展示当前任务与 Lease | 员工详情运行体区块 | 后续 |
| TF-FACTORY-UI-RUNTIME-05 | planned | 项目共享事实源与任务流入口视图 | 1）在项目页展示共享事实源入口；2）串联 plans/workitems/runs/project-memory；3）展示运行账本状态；4）支持从任务流下钻到运行体证据 | 项目协同事实源视图 | 后续 |
| TF-FACTORY-UI-RUNTIME-06 | planned | Lease、异常与 Diagnostics 下钻 | 1）设计 Lease 冲突提示；2）设计 runtime offline / blocked / init failed 状态；3）设计诊断面板字段；4）设计用户决策入口 | 诊断与异常处理视图 | 后续 |
| TF-FACTORY-UI-RUNTIME-07 | planned | 迁移目标网站前端实现与 Mock 数据接入 | 1）在目标网站前端实现相关页面/组件；2）补充 Mock 数据；3）统一状态与字段命名；4）确保不破坏现有任务流主线 | 可运行前端页面 | 后续 |
| TF-FACTORY-UI-RUNTIME-08 | planned | 前端验证、截图评审与交付 | 1）Playwright 截图验证；2）DOM/状态检查；3）视觉与交互评审；4）生成 QA / RUN 记录；5）必要时收尾修正 | 验证截图、QA 结论、交付记录 | 后续 |

状态说明：

- `planned`：计划中，尚未满足执行条件；
- `ready`：可执行，适合作为下一步；
- `running`：执行中；
- `done`：执行完成并有 Run / Report 记录；
- `accepted`：已被用户或阶段门禁验收；
- `blocked`：阻塞；
- `deferred`：暂缓。

---

## 5. 范围边界

### 5.1 范围内

- 目标网站前端的信息架构、导航落点、状态字段和 Mock 数据设计；
- RuntimeGateway、TeamOrchestrator、OpenCode RuntimeNode、Employee Runtime Binding 的辅助视图；
- Project Shared Facts / Source Area 的用户可理解表达；
- Lease、诊断、异常和恢复入口的前端表达；
- Playwright 截图验证和独立评审。

### 5.2 范围外

- 不实现真实 Gateway API；
- 不启动真实 OpenCode；
- 不把产品主入口改成 Web IDE；
- 不实现文件编辑器、终端、代码编辑器为主的远程开发体验；
- 不做后端 Runtime 调度状态机。

---

## 6. 验收标准

本工作项完成时应满足：

- 用户能从项目 / 团队 / 员工 / 网关视角理解运行体关系；
- TeamProjectAssignment、ProjectContextSnapshot、RuntimeGateway、TeamOrchestrator、OpenCode RuntimeNode 的关系表达清楚；
- 运行体视图服务于任务流执行、证据追溯和异常排障；
- 前端不偏移成 Web IDE；
- 每次实现类任务都有截图验证、运行记录和必要的评审结论。

---

## 7. 更新记录

| 时间 | 变更 | 依据 |
|---|---|---|
| 2026-05-26 | 新建迁移目标网站 Runtime / Gateway 前端改造工作项，拆解为 8 个 TaskFlow | 用户要求将迁移目标网站前端更新纳入正式计划并拆解任务清单 |
| 2026-05-31 | 根据用户首页和工作项详情抽屉截图，新增总览页 AI 动态工作流表达设计，并建议后续以 TF-FACTORY-UI-RUNTIME-01A 小步实现 | 用户截图与补充口径：软件工厂以 AI 动态工作流、计划/阶段/任务项/任务/步骤驱动 |
