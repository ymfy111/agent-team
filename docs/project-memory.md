# project-memory｜agent-team 当前项目记忆

> 更新时间：2026-06-01 01:16:27 +0800
> 当前基线：v0.6.33.45  
> 当前主线：AI 原生应用平台生成层 / AI 动态工作流 / Task Runner 执行闭环  
> 当前治理参考：历史 taskflow governance v0.9.29 + 当前 task-runner / task-batch-runner 门禁  
> 当前 docs 状态：目录口径已收口到 `docs/workitems/`、`docs/tasks/` 与 `.runtime/orch` / `.runtime/exec`；旧 `runs` 与 `.taskflow` 仅作历史兼容。

---

## 1. 当前核心结论

智能软件工厂的核心不是智能体对话，而是围绕 `TaskFlow / TaskTicket` 组织计划、执行、协作、验证、评审和交付。

对话是用户与智能体的交互入口；WorkItem / Task 是项目推进的事实主线。

当前 ORCH / runner 口径：Orchestrator 派发 Task 或 TaskBatch，不派 skill 内部 Step / Node；智能体收到 Task 后使用 `task-runner` 或 `task-batch-runner` 自主拆步骤、执行、验证、总结，完成后输出 `TASK_DONE`、`BLOCKED` 或 `NEED_USER_DECISION`。

历史说明：本文中 `taskflow`、TaskFlow、TaskTicket 等表述是早期治理经验与对象模型沉淀；当前 active skill 名称已收口为 `task-runner` 与 `task-batch-runner`，不得把旧 `taskflow` / `task-batch` 当作 active skill 调用。

当前项目 `agent-team` 已经是智能软件工厂的一个简化雏形：

```text
Project
  → Stage / Plan
    → WorkPackage / TaskFlowGroup
      → TaskFlow
        → TaskTicket / Node
          → Artifact / Evidence / Review / Decision / Handoff
```

---

## 2. 当前目录口径

| 目录 | 当前含义 |
|---|---|
| `docs/plans/` | Plan / Stage：阶段目标、路线图、能力路线。 |
| `docs/workitems/` | WorkItem：一个主文档对应一个工作项，管理一组相关 Task。 |
| `docs/tasks/` | Task：单个 Task 的正式任务记录；按 WorkItem 分组，临时任务放 `TEMP/`。 |
| `docs/specs/` | 产品 / 系统 / 对象模型 / 子设计。 |
| `docs/reports/` | ReviewRecord、验证报告、复盘报告目录。 |
| `docs/recs/` | 产品化建议和多智能体协作建议。 |
| `docs/guides/` | 方法、目录规范、技能治理、Guarded Flow、Markdown 契约。 |
| `docs/templates/` | 结构化 Markdown 模板。 |
| `docs/prototypes/` | 原型 HTML 与图片资源。 |

运行态目录口径：

| 目录 | 当前含义 |
|---|---|
| `.runtime/orch/` | ORCH 调度运行态：`state.json`、`dispatches.jsonl`、`packets/<TaskId>.md`。 |
| `.runtime/exec/` | 智能体 / taskflow skill 执行运行态：Task 内部步骤账本。 |

当前统一文档导航入口：`docs/doc-nav.md`。`docs/文档导航.md` 仅保留为旧中文入口跳转页。
当前命名规范入口：`docs/guides/GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md`。

历史兼容说明：旧 `docs/workitems/runs/`、`docs/tasks/runs/` 与 `.taskflow/` 不再作为新任务默认输出位置；旧 `RUN_*` 已按 Task 正式记录口径迁移到 `docs/tasks/`。

---

## 3. 当前必读文档

1. `docs/doc-nav.md`
2. `docs/plans/PLAN-SMART-FACTORY.md`
3. `docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
4. `docs/workitems/TF-GF-IMPL.md`
5. `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
6. `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
7. `docs/recs/REC-MAC-PROD-v0.6.33.md`
8. `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
9. `docs/changes/CHANGELOG-v0.6.33.md`
10. `docs/prototypes/agent-team-v0.6.33.45-prototype.html`
11. `AI-SANDBOX-HANDOFF-PROTOCOL.md`

---

## 4. 已完成主线

| TaskFlow | 状态 | 沉淀结果 |
|---|---|---|
| `TF-DOC-STRUCT-01` | done | 结构化 Markdown TaskFlow 模板：`docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md`。 |
| `TF-POC-MD-01` | done | Markdown TaskFlow 可读写经验已沉淀到 `TASKFLOW-MD-CONTRACT`、TaskTicket 子设计和 taskflow skill 映射设计。 |
| `TF-GUARDED-FLOW-01` | done | Guarded Flow 最小约束设计已沉淀到 `TASKFLOW-GUARDED-FLOW`。 |
| `TF-GF-IMPL-01` | done | 依赖检查最小实现，落地 `validate-dependencies`，摘要见 `TF-GF-IMPL` 工作项。 |
| `TF-GF-IMPL-02` | done | Blocker / Decision 检查最小实现，落地 `validate-gates`，摘要见 `TF-GF-IMPL` 工作项。 |
| `TF-GF-IMPL-03` | done | 验证失败状态最小实现，落地 `validate-statuses`，摘要见 `TF-GF-IMPL` 工作项。 |
| `TF-DOC-MERGE-01 / 02` | done | TaskFlow / TaskTicket 子设计与 recs 口径收口。 |
| `TF-DOC-WP-01` | done | 补充 WorkPackage / TaskFlowGroup 层级，并调整 plans / workitems 文档组织口径。 |
| `DOC-CLOSEOUT` | done | 清理历史过程文件与过时入口；当前事实入口收口到本文件与 `docs/doc-nav.md`。 |

有复用价值的结论应沉淀到当前文档；历史 run / report / patch / 测试记录不默认长期保留。

---

## 5. 当前下一步

建议下一步：`TF-GF-IMPL-04｜恢复记录最小实现`。

目标：补充节点从 `needs_review / blocked / paused` 等状态恢复继续时的最小事件记录能力。

边界：

- 不做完整状态机；
- 不做 UI；
- 不做 Runtime 自动调度；
- 不新增数据库任务锁；
- 只补最小命令或事件追加能力，并用结构化 Markdown 运行副本验证。

后续：`TF-GF-REVIEW-01｜Guarded Flow 产品化映射评审`，用于判断当前单智能体工厂经验如何进入多智能体软件工厂产品模型。

---

## 6. 关键设计口径

### 6.1 单智能体工厂与多智能体工厂

简单项目可以使用 `taskflow skill + 结构化 Markdown + taskflow-md.mjs` 形成单智能体工厂：

```text
用户目标 → TaskFlow → TaskTicket / Node → 单智能体执行 → Artifact / Evidence / Review
```

复杂项目应由软件工厂平台组织多智能体协同：

```text
Project / Stage / Plan
  → WorkPackage / TaskFlowGroup
    → TaskFlow
      → 多个 TaskTicket / Node
        → 多个数字员工协同执行
```

两者本质都是任务流驱动，差异在于协作规模和平台能力。

### 6.2 TaskTicket / Node 完成口径

- `doneCriteria` 是节点进入 `done / accepted` 的完成判定标准。
- `actualDuration` 不是独立事实源，只能由 `actualCompletedAt - actualStartedAt` 计算展示。
- Evidence 应说明验证的是哪个 Artifact / Change Reference。
- `done` 表示执行者完成并提交证据；`accepted` 表示评审或验收确认通过。

### 6.3 WorkPackage / TaskFlowGroup

WorkPackage 是 Plan 和 TaskFlow 之间的组织层。一个 WorkPackage 可以包含多个有序 TaskFlow，并维护状态清单、当前焦点、运行记录、评审报告和下一步。

P0 文档化阶段，`docs/workitems/*.md` 主文档可作为 WorkPackage 的轻量表现形式。

---

## 7. 历史 taskflow 执行经验

以下内容为历史治理经验，已迁移为当前 `task-runner` / `task-batch-runner` 的执行口径参考；不表示旧 `taskflow` skill 仍为 active skill。

- 默认模式：`batch-auto-summary`，无人值守完成任务流，最终给完整审计。
- 对话框报告默认四段式：执行概览、步骤摘要、问题与遗留、产物与下一步。
- 验证全部通过时，主对话不单独展开完整验证日志；完整命令和日志保留在 run / report 文件中。
- 节点实际耗时由 TaskTicket 状态中的实际开始 / 完成时间计算。
- 若证据未在完成前落盘，不能输出可信实际耗时。
- 普通节点不应强制用户逐节点点击“继续”；只有高风险、人工验收、调试或可见性测试才使用 checkpoint-visible。

---

## 8. 文档清理规则

后续更新 docs 时默认遵循：

1. 当前事实源、路线图、工作项、设计、模板和通用指南应保留。
2. 已完成任务的 run / report / 测试记录不默认长期保留。
3. 若完成任务有复用价值，应先沉淀到通用文档，再清理原始过程文件。
4. 每次 docs 包更新必须同步 `docs/doc-nav.md` 与本文件；`docs/文档导航.md` 仅保留跳转页，避免双导航漂移。
5. 旧目录或旧版本可以保留作历史参考，但当前入口不得继续指向旧版本。
6. 本包只包含 `docs/` 时，不包含 `skills/`、`apps/`、`prototypes/` 根目录和图片资源；若需要完整交接，应另附源码或说明来源。

## 2026-05-28｜运行网关页面实现

已在 apps/web 新增 `runtime-gateway` 独立 feature 页面：左侧网关列表，右侧网关监控、关键指标卡、Team 筛选和沙箱/OC 卡片。运行网关页只做监控与穿透查看；Team 绑定网关、员工换沙箱、Skill/MCP/规则/记忆同步放到 Team / 数字员工侧。

## 前端模块化最新进展（2026-05-28）

- 运行网关页面已按 v5 监控版实现，定位为网关注册状态监控与沙箱 / OC 穿透查看。
- `skills` 页面已从 legacy DOM 迁出为独立 feature page：`apps/web/src/features/skills/feature.js` + `page.js`。
- 当前页面拆分策略：先结构解耦，再统一业务功能；一次只拆一个页面，拆分前后做截图和真实点击验证。
- 后续建议优先拆 `decisions / pool`，再拆 `teams / projects`，总览页最后收口。


## 2026-05-28 20:13:27 +0800｜TF-FACTORY-UI-ARCH-08

- 已完成 `decisions` 页面独立拆分，新增 `apps/web/src/features/decisions/page.js`，`decisions` 在 page registry 中为 `legacy=false`。
- 本轮保持待决策页面业务语义、文案、视觉样式和交互不变，仅完成结构迁移。
- 真实点击 `decisions` 菜单验证通过；后续建议继续拆 `pool` 页面，为数字员工运行绑定相关能力做结构准备。

## 2026-05-28｜TF-FACTORY-UI-ARCH-09/10 页面拆分

- 通过 task-stack 顺序执行两个独立任务：`TF-FACTORY-UI-ARCH-09`（pool 页面独立拆分）与 `TF-FACTORY-UI-ARCH-10`（teams 页面独立拆分）。
- 两个任务均保留独立 Task 文件、QA 报告、`.runtime/exec` 运行账本和截图证据；主对话仅合并输出 batch 汇总。
- 当前已独立 feature page 包括：`settings`、`runtime-gateway`、`skills`、`decisions`、`pool`、`teams`。
- 后续建议继续拆 `projects`，最后处理依赖最多的 `overview`。



## 2026-05-28｜TF-FACTORY-UI-ARCH-11/12 批量拆分
- 通过 TaskBatch `TB-FACTORY-UI-ARCH-01` 连续执行 `TF-FACTORY-UI-ARCH-11` 与 `TF-FACTORY-UI-ARCH-12`。
- `projects` 与 `overview` 已迁出为独立 `feature.js + page.js` 页面，`feature.js` 中 `legacy=false`。
- 两个任务保持独立 Task 文件、QA 报告、`.runtime/exec` 账本与截图证据；批次日志记录在 `.runtime/batches/TB-FACTORY-UI-ARCH-01.json`。

## 2026-05-28｜TF-TEMP-ROLES-PAGE-SPLIT-FIX-01

- 修正前端模块化拆分漏项：`roles` 页面此前仅有 `feature.js`，仍为 legacy 注册页。
- 已补齐 `apps/web/src/features/roles/page.js`，并将 `roles/feature.js` 改为 `legacy=false`。
- 真实点击“岗位”菜单验证通过，`featureMounted=roles`，岗位卡片保持 3 个，页面文案和视觉保持现有 v0.6.33 收口口径。
- 当前已独立 feature page 包括：`overview`、`teams`、`projects`、`decisions`、`runtime-gateway`、`roles`、`pool`、`skills`、`settings`。


## 2026-05-28 23:20:00 +0800｜TF-FACTORY-UI-ARCH-13 阶段收口

- 已完成前端模块化阶段评审与收口。
- `overview / teams / projects / decisions / runtime-gateway / roles / pool / skills / settings` 均已具备 `feature.js + page.js`，并在 feature registry 中为 `legacy=false`。
- `apps/web/src/legacy/prototype-runtime.js` 仍保留旧原型兼容职责，后续应在业务逻辑统一后单独清理。
- 下一阶段优先做 Team 页面运行资源区、数字员工运行绑定、Project 执行态和 DecisionPacket 待决策能力。

## 2026-05-29｜docs 已完成任务归档清理脚本

- 已新增 `docs/archive-completed-workitems.mjs`，用于阶段收口后归档已完成任务明细。
- 脚本支持 `--dry-run`、`--archive`、`--clean`，默认流程是先 dry-run 预览，再 archive 归档，最后经用户确认后才 clean。
- 已对 `TF-FACTORY-UI-ARCH` 执行 dry-run 与 archive，归档包位于 `/mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/TF-FACTORY-UI-ARCH-completed-archive.zip`。
- 本轮未执行 clean。项目内必须保留 WorkItem 状态总账、阶段收口报告、project-memory、文档导航和未完成任务，避免清理后丢失“当前做到哪、下一步做什么”的判断依据。


- 2026-05-29 00:10:16 +0800: TF-FACTORY-UI-ARCH completed task details archived and cleaned. Archive: `/mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/TF-FACTORY-UI-ARCH-completed-archive.zip`; retained WorkItem ledger and closeout report.

## 2026-05-31｜总览页 AI 动态工作流表达口径

- 用户明确：智能软件工厂应以 AI 动态工作流驱动，页面表达要围绕 `计划 Plan → 阶段 Stage → 任务项/工作项 WorkItem → 任务 Task → 步骤 Step/Node`。
- 总览页不应只是静态团队 / 员工看板；Team 卡片、团队动态和详情抽屉都应表达当前 WorkItem、TaskBatch、Task、Step、DecisionPacket 和员工活动。
- 员工状态必须落实到具体活动：谁在执行哪个 Task/Step，谁在协同/验证/组长把关，谁被阻塞或等待决策。
- `0/4`、`1/4` 等进度表达为当前 TaskBatch 的任务进度，不能误写成泛化的“任务完成”。
- 已新增设计文档：`docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`。后续首页实现建议采用小步任务 `TF-FACTORY-UI-RUNTIME-01A`，只增强 overview 动态工作流表达，不扩大到全站重构。



## 2026-06-01｜生成层定位与五层架构映射

- 用户补充两张架构图后，当前产品定位进一步明确：智能软件工厂是 **AI 原生应用平台中的生成层 / 建层产品化工作台**。
- 软件工厂不是普通项目管理工具或员工看板，而是围绕业务输入和业务本体，通过 AI 动态工作流把 `Plan → Stage → WorkItem → Task → Step` 编排起来，持续生成应用蓝图、页面、服务、配置、测试、发布包和运行反馈。
- 五层映射：输入层提供业务目标、规范、流程、指标、数据和案例；语义层提供概念、关系、规则、指标、流程、场景；生成层由软件工厂承载应用建模与代码生成；执行层由 ORCH、task-runner、task-batch-runner、RuntimeGateway 和数字员工推进；治理层由 DecisionPacket、QA、Review、Evidence、版本和风险闭环保障。
- 已新增上位设计文档：`docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`。
- 已更新总览页设计：`docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`。后续 overview 页面修改必须体现生成活动：业务目标、计划、阶段、工作项、任务批次、任务、步骤、员工活动、生成产物、待决策和验收反馈。


## 2026-06-01｜任务规划与页面截图自查规则

- 已新增 `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`，用于沉淀“怎么写计划 / 怎么拆任务 / 怎么设计 Step / 怎么做截图验证与自查”的执行经验。
- 后续智能体执行前必须遵循：Plan / Stage / WorkItem 先规划；WorkItem 启动前细化 Tasks；Task 执行时再动态拆 Steps。
- 页面 / 前端 / 原型类 Task 必须把 Playwright 截图、智能体自查、必要修复与重新截图、验收截图 / 前后对比图作为自己的 Step；未截图自查不得标记完全 PASS。
- 新智能体接手时应通过 `docs/doc-nav.md`、本文件、`GUIDE-TASK-PLANNING-RULES`、`GUIDE-ORCH-SCHEDULING-RULES` 和 runner `SKILL.md` 读取这些门禁。

## 2026-06-01｜AI 沙箱双向交接协议

- 已新增根目录文档 `AI-SANDBOX-HANDOFF-PROTOCOL.md`，不绑定代码版本号，用于规范 ChatGPT 沙箱与 OpenCode 本地工作区的双向同步；放在项目根目录，避免 `docs/` 全量更新时被覆盖。
- 当前分工：ChatGPT 沙箱 docs 为主、可参与部分前端开发；OpenCode 本地 apps 为主、负责本地集成、验证、提交和同时推送 `origin` / `github`。
- 标准交接通过 `update/` 下的 handoff、manifest 和 zip 包完成；除 `review-only` 外 manifest 为合入必需。OpenCode 接班时必须校验 `baseCommit`、`sha256`、`rootInZip`、`allowedPaths`、`protectedPaths` 和 `deletePaths`，先备份、staging 解压、运行 smoke/QA 或替代检查，再只提交目标范围。
- 协议已补充 `full-replace/overlay/patch` 语义、ChatGPT apps 包门禁、停止条件、双远程推送失败状态和回滚规则。

## 2026-06-01｜文档导航入口收敛

- 已将 `docs/doc-nav.md` 收敛为人类与 AI 沙箱统一文档入口，保留 ASCII 文件名以降低跨沙箱、zip、shell 和 Git 环境的中文路径风险。
- `docs/文档导航.md` 改为极简跳转页，不再承载完整导航，避免 `doc-nav.md` 与中文导航双写漂移。
