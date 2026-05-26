# project-memory｜agent-team 当前项目记忆

> 更新时间：2026-05-25  
> 当前基线：v0.6.33.45  
> 当前主线：TaskFlow First / WorkPackage / Guarded Flow 最小实现  
> 当前治理参考：taskflow governance v0.9.29  
> 当前 docs 状态：目录口径已收口到 `docs/workitems/`、`docs/tasks/` 与 `.runtime/orch` / `.runtime/exec`；旧 `runs` 与 `.taskflow` 仅作历史兼容。

---

## 1. 当前核心结论

智能软件工厂的核心不是智能体对话，而是围绕 `TaskFlow / TaskTicket` 组织计划、执行、协作、验证、评审和交付。

对话是用户与智能体的交互入口；WorkItem / Task 是项目推进的事实主线。

当前 ORCH / taskflow 口径：Orchestrator 派发 Task，不派 skill 内部 Step / Node；智能体收到 Task 后使用 taskflow skill 自主拆步骤、执行、验证、总结，完成后输出 `TASK_DONE`、`BLOCKED` 或 `NEED_USER_DECISION`。

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

当前文档导航入口：`docs/文档导航.md`。
当前命名规范入口：`docs/guides/GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md`。

历史兼容说明：旧 `docs/workitems/runs/`、`docs/tasks/runs/` 与 `.taskflow/` 不再作为新任务默认输出位置；旧 `RUN_*` 已按 Task 正式记录口径迁移到 `docs/tasks/`。

---

## 3. 当前必读文档

1. `docs/文档导航.md`
2. `docs/plans/PLAN-SMART-FACTORY.md`
3. `docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
4. `docs/workitems/TF-GF-IMPL.md`
5. `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
6. `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
7. `docs/recs/REC-MAC-PROD-v0.6.33.md`
8. `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
9. `docs/changes/CHANGELOG-v0.6.33.md`
10. `docs/prototypes/agent-team-v0.6.33.45-prototype.html`

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
| `DOC-CLOSEOUT` | done | 清理历史过程文件与过时入口；当前事实入口收口到本文件与 `docs/文档导航.md`。 |

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

## 7. taskflow 执行经验

当前 taskflow skill 已收敛到以下口径：

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
4. 每次 docs 包更新必须同步 `docs/文档导航.md` 与本文件。
5. 旧目录或旧版本可以保留作历史参考，但当前入口不得继续指向旧版本。
6. 本包只包含 `docs/` 时，不包含 `skills/`、`apps/`、`prototypes/` 根目录和图片资源；若需要完整交接，应另附源码或说明来源。
