# GUIDE-DOC-DIRECTORY-NAMING-v0.6.33｜文档目录与命名规范

> 文档类型：Guide / 文档治理规范  
> 当前基线：v0.6.33.45  
> 适用范围：`docs/` 正式文档目录、`.runtime/` 运行态目录口径  

---

## 1. 核心分层

```text
docs/            人类可读的正式事实源，适合提交 Git
.runtime/        机器可读的运行态目录，默认不提交 Git
```

`docs/` 记录计划、工作项、任务正式记录、设计、评审和项目记忆；`.runtime/` 记录 ORCH 调度运行态和智能体执行运行态。

---

## 2. docs 目录规范

```text
docs/
├── project-memory.md
├── 文档导航.md
├── plans/                  # Plan / Stage：路线图、阶段计划
├── workitems/              # WorkItem：工作项主文档
├── tasks/                  # Task：任务正式记录，按 WorkItem 分组
├── specs/                  # PRD / SDD / 子设计
├── reports/                # 评审、验证、复盘报告
├── decisions/              # ADR / 决策记录，可选
├── guides/                 # 治理规则、执行指南、方法说明
├── templates/              # 结构化 Markdown 模板
├── recs/                   # 产品化建议
├── prototypes/             # 原型与图片资源
└── changes/                # Changelog / 变更记录
```

---

## 3. workitems 与 tasks

```text
docs/workitems/<WorkItemId>.md
```

工作项主文档，记录该工作项的目标、范围、任务清单、状态、依赖、下一步。

```text
docs/tasks/<WorkItemId>/TASK_<TaskId>.md
```

单个 Task 的正式任务记录，记录 Task 的目标、执行计划、执行步骤摘要、证据、产物、问题和下一步。

临时任务统一归入：

```text
docs/tasks/TEMP/TASK_<TaskId>.md
```

测试任务可归入：

```text
docs/tasks/TEST/TASK_<TaskId>.md
```

---

## 4. runtime 目录规范

```text
.runtime/
├── orch/                   # ORCH 调度运行态
└── exec/                   # 智能体 / skill 执行运行态
```

### 4.1 ORCH 最小运行态

POC 初期只保留三件套：

```text
.runtime/orch/
├── state.json              # orch 当前状态、当前 Task、下一 Task
├── dispatches.jsonl        # 派工流水与返回口令
└── packets/
    └── <TaskId>.md         # 当次派给智能体的 Task Dispatch Packet
```

后续仅在需要时再增加 `leases/`、`decisions/`、`logs/`、`events/`。

### 4.2 执行运行态

```text
.runtime/exec/<WorkItemId>/<TaskId>.json
```

记录智能体执行当前 Task 时的内部步骤、验证、产物引用、问题和执行摘要。

---

## 5. 命名规范

| 类型 | 位置 | 命名 |
|---|---|---|
| 工作项 | `docs/workitems/` | `<WorkItemId>.md`，如 `TF-RUNTIME-ORCH-POC.md` |
| 任务正式记录 | `docs/tasks/<WorkItemId>/` | `TASK_<TaskId>.md` |
| 临时任务记录 | `docs/tasks/TEMP/` | `TASK_TF-TEMP-*.md` |
| 评审报告 | `docs/reports/` | `RPT-<TaskId>-<Topic>-v<baseline>.md` |
| 系统设计 | `docs/specs/` | `SDD-<Topic>-v<version>.md` |
| 产品需求 | `docs/specs/` | `PRD-v<version>.md` |
| 计划 | `docs/plans/` | `PLAN-<Topic>.md` |
| 变更记录 | `docs/changes/` | `CHANGELOG-v<version>.md` |

---

## 6. 历史兼容口径

以下旧路径不再作为新任务默认输出位置：

```text
docs/tasks/<WorkItemId>/
docs/tasks/<WorkItemId>/
.runtime/exec/
```

旧 `RUN_*` 文件已迁移为 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`。新任务优先使用 `TASK_*` 命名和 `.runtime/` 运行态目录。
