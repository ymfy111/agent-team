# doc-nav｜文档导航统一入口

> 当前同步批次：DOC-REORG / v0.6.33.45 / 生成层架构口径同步。  
> 当前阶段：ORCH / Runtime / Task 目录口径收口；OpenCode 联调包使用 `.runtime/orch` 与 `docs/tasks` 新口径。  
> 当前事实主线：AI 原生应用平台生成层 / AI 动态工作流 / WorkItem / Task Runner 执行闭环。  
> 维护提示：本文件是人类与 AI 沙箱统一文档入口；中文旧入口 `docs/文档导航.md` 仅保留跳转页。

---

## 1. 当前最新入口

| 用途 | 当前入口 | 说明 |
|---|---|---|
| 项目长期事实源 | `docs/project-memory.md` | 当前基线、关键结论、目录口径和下一步。 |
| AI 沙箱双向交接协议 | `AI-SANDBOX-HANDOFF-PROTOCOL.md` | 可执行合入协议：manifest 必需、保护路径、合入模式、停止条件、回滚和双远程推送规则；放在项目根目录，避免 docs 全量更新覆盖。 |
| 文档目录与命名规范 | `docs/guides/GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md` | `docs/workitems`、`docs/tasks`、`.runtime/orch`、`.runtime/exec` 规范。 |
| 总路线图 | `docs/plans/PLAN-SMART-FACTORY.md` | TaskFlow First 总路线图。 |
| 当前 ORCH 子设计 | `docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md` | ORCH / Task Loop Driver / Task 派工颗粒度设计。 |
| RuntimeGateway 子设计 | `docs/specs/SDD-RUNTIME-GATEWAY-v0.6.33.md` | 平台后台只联系 Gateway，由 Gateway 承载本地执行。 |
| 工作项目录 | `docs/workitems/` | 一个 WorkItem 一个主文档。 |
| Task 正式记录 | `docs/tasks/` | 按 WorkItem 分组，每个 Task 一个 `TASK_<TaskId>.md`。 |
| 评审报告 | `docs/reports/` | 独立评审、验证、复盘报告。 |
| 系统设计 | `docs/specs/SDD-v0.6.33.md` | v0.6.33 系统设计正本。 |
| 原型入口 | `docs/prototypes/agent-team-v0.6.33.45-prototype.html` | v0.6.33.45 静态原型。 |
| 总览页 AI 动态工作流设计 | `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md` | 首页以计划、阶段、任务项、任务、步骤驱动，员工活动落实到 Task / Step。 |
| 生成层架构定位 | `docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md` | 软件工厂对应 AI 原生应用平台生成层 / 建层，负责应用建模、代码生成与动态工作流调度。 |
| 任务规划与截图自查规则 | `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md` | 写计划、拆 Task / Step、页面类任务截图自查的必读规则。 |
| 当前 skill 说明 | `skills/README.md` | 当前 active skills 入口。 |
| 单任务执行器 | `skills/task-runner/SKILL.md` | 执行一个明确 Task。 |
| 批次执行器 | `skills/task-batch-runner/SKILL.md` | 执行同一个 WorkItem 下的明确 Task 队列。 |

---

## 2. 当前目录使用规则

| 目录 | 当前用途 | 维护规则 |
|---|---|---|
| `docs/plans/` | Plan / Stage：计划、阶段目标、路线图 | 不放单次执行记录。 |
| `docs/workitems/` | WorkItem：工作项主文档 | 记录目标、范围、任务清单、状态、依赖、下一步。 |
| `docs/tasks/` | Task：任务正式记录 | `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`；临时任务放 `docs/tasks/TEMP/`。 |
| `docs/specs/` | PRD / SDD / 子设计 | 正式需求与系统设计事实源。 |
| `docs/reports/` | 评审、验证、复盘报告 | 需要长期审计或复盘时保留。 |
| `docs/guides/` | 治理规则、目录规范、方法说明 | 当前目录规范入口见 `GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md`。 |
| `docs/recs/` | 产品化建议 | 当前建议类文档入口。 |
| `docs/prototypes/` | 原型 HTML 与图片资源 | 当前原型入口为 v0.6.33.45。 |
| `docs/changes/` | Changelog / 变更记录 | 记录版本级变更。 |

运行态目录不属于正式 docs，但当前口径为：

```text
.runtime/orch/   ORCH 调度运行态：state / dispatches / packets
.runtime/exec/   智能体执行运行态：Task 内部步骤账本
```

---

## 3. 当前工作项

- `docs/workitems/TF-FACTORY-UI-RUNTIME.md`
- `docs/workitems/TF-GF-IMPL.md`
- `docs/workitems/TF-PROD-MODEL.md`
- `docs/workitems/TF-RUNTIME-GATEWAY-DESIGN.md`
- `docs/workitems/TF-RUNTIME-ORCH-POC.md`

---

## 4. 当前 active skills

```text
skills/task-runner/          v1.0.2，执行一个 Task，生成 Step / Node / exec / QA / Summary
skills/task-batch-runner/    v1.0.2，执行一个 TaskBatch，顺序调度 Task[] 并生成 batch Summary
```

历史名称 `taskflow`、`task-batch` 已不再作为 active skill 目录存在。

---

## 5. 当前文档结构摘要

```text
docs/
├── doc-nav.md               # 统一文档入口
├── 文档导航.md              # 旧中文入口，仅跳转到 doc-nav.md
├── project-memory.md
├── plans/
├── workitems/               # WorkItem 主文档
├── tasks/                   # Task 正式记录，按 WorkItem 分组
├── specs/
├── reports/
├── guides/
├── templates/
├── recs/
├── prototypes/
└── changes/
```

---

## 6. 维护约定

1. 每次更新 docs 时，必须同步 `docs/doc-nav.md` 和 `docs/project-memory.md`。
2. `docs/文档导航.md` 只保留跳转页，避免双导航漂移。
3. 新工作项放 `docs/workitems/<WorkItemId>.md`。
4. 新 Task 正式记录放 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`；临时任务放 `docs/tasks/TEMP/`。
5. 旧 `docs/workitems/runs/`、`docs/tasks/runs/`、`.taskflow/` 不再作为新任务默认输出位置。
6. 评审、验证、复盘报告放 `docs/reports/`。
7. 文档文件名优先使用英文缩写，文档标题可以使用中文。

---

## 7. 近期同步记录

### 运行网关页面实现记录

- `docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-TEMP-RUNTIME-GATEWAY-PAGE-IMPLEMENT-01.md`
- `docs/reports/QA-RUNTIME-GATEWAY-PAGE-IMPLEMENT-01.md`

### 前端模块化工作项入口

- 工作项：`docs/workitems/TF-FACTORY-UI-ARCH.md`
- 最新任务：`docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-FACTORY-UI-ARCH-07.md`
- 最新验证：`docs/reports/QA-FRONTEND-UI-ARCH-07.md`

- `docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-FACTORY-UI-ARCH-08.md`：decisions 页面独立拆分任务记录。
- `docs/reports/QA-FRONTEND-UI-ARCH-08.md`：decisions 页面拆分验证报告。

### 前端模块化页面拆分进展（2026-05-28）

- `TF-FACTORY-UI-ARCH-09`：pool 页面独立拆分，见 `docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-FACTORY-UI-ARCH-09.md` 与 `docs/reports/QA-FRONTEND-UI-ARCH-09.md`。
- `TF-FACTORY-UI-ARCH-10`：teams 页面独立拆分，见 `docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-FACTORY-UI-ARCH-10.md` 与 `docs/reports/QA-FRONTEND-UI-ARCH-10.md`。

### 临时修正：roles 页面独立拆分漏项补齐

- `docs/tasks/TEMP/TASK_TF-TEMP-ROLES-PAGE-SPLIT-FIX-01.md`：补齐 roles 独立 feature page 的临时任务记录。
- `docs/reports/QA-TF-TEMP-ROLES-PAGE-SPLIT-FIX-01.md`：roles 真实点击与截图验证报告。

### 前端模块化阶段收口

- `docs/tasks/TF-FACTORY-UI-ARCH/TASK_TF-FACTORY-UI-ARCH-13.md`：前端模块化阶段评审与收口任务记录。
- `docs/reports/QA-FRONTEND-UI-ARCH-13.md`：阶段收口验证报告。
- `docs/reports/RPT-FRONTEND-UI-ARCH-13-CLOSEOUT.md`：阶段评审与后续业务逻辑统一建议。

### docs 已完成任务归档清理工具

- `docs/archive-completed-workitems.mjs`：用于阶段收口后归档已完成任务明细，支持 `--dry-run`、`--archive`、`--clean`。清理前必须先归档，并保留 WorkItem 状态总账、阶段收口报告、project-memory 和文档导航。
- `docs/tasks/TEMP/TASK_TF-TEMP-DOC-ARCHIVE-CLEANUP-SCRIPT-01.md`：归档清理脚本临时任务记录。
- `docs/reports/QA-TF-TEMP-DOC-ARCHIVE-CLEANUP-SCRIPT-01.md`：归档清理脚本验证报告。

### 总览页动态工作流设计同步（2026-05-31）

- 新增设计文档：`docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`。
- 关键口径：软件工厂首页以 `计划 → 阶段 → 任务项/工作项 → 任务 → 步骤` 驱动，员工活动必须落实到具体 Task / Step。
- 截图参考：`docs/prototypes/pic/references/overview-dynamic-workflow-reference-01.png`、`docs/prototypes/pic/references/overview-workitem-drawer-reference-01.png`。

### 生成层架构口径同步（2026-06-01）

- 新增上位架构设计：`docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`。
- 参考图：`docs/prototypes/pic/references/generation-layer-ai-dynamic-workflow-architecture-01.png`、`docs/prototypes/pic/references/ai-native-platform-five-layer-architecture-01.png`。
- 关键口径：智能软件工厂是 AI 原生应用平台的生成层 / 建层产品化工作台，不是普通员工看板或传统项目管理系统；首页、项目、团队、员工、技能、待决策页面应围绕应用生成链路逐步收敛。

### 任务规划与截图自查规则同步（2026-06-01）

- 新增规则文档：`docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`。
- 关键口径：WorkItem 启动前细化 Task；Task 执行时动态拆 Step；页面类 Task 必须由智能体自己截图验证、自查、必要修复后再交付用户验收。

### AI 沙箱双向交接协议（2026-06-01）

- 新增根目录协议文档：`AI-SANDBOX-HANDOFF-PROTOCOL.md`。
- 当前协作口径：ChatGPT 沙箱 docs 为主、可参与部分前端开发；OpenCode 本地 apps 为主、负责本地集成、验证、提交和同时推送 `origin` / `github`。
- 双方通过 `update/` 下的 handoff、manifest 和 zip 包双向同步；除 `review-only` 外 manifest 为合入必需。
- 协议已补充 `protectedPaths`、`allowedPaths`、`deletePaths`、`full-replace/overlay/patch` 语义、基线漂移、停止条件和回滚规则。
