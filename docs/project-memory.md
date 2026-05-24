# project-memory｜agent-team 当前项目记忆

> 更新时间：2026-05-24  
> 当前基线：v0.6.33.45  
> 当前主线：TaskFlow First / WorkPackage / Guarded Flow 最小实现  
> 当前 skill 参考：taskflow v0.9.25  
> 当前 docs 状态：DOC-CLOSEOUT，已清理历史过程文件与过时入口。

---

## 1. 当前核心结论

智能软件工厂的核心不是智能体对话，而是围绕 `TaskFlow / TaskTicket` 组织计划、执行、协作、验证、评审和交付。

对话是用户与智能体的交互入口；TaskFlow / TaskTicket 是项目推进的事实主线。

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
| `docs/plans/` | Stage / Plan：阶段目标、路线图、能力路线。 |
| `docs/tasks/` | WorkPackage / TaskFlowGroup：一组有序 TaskFlow 的工作包清单。 |
| `docs/tasks/runs/` | TaskFlow Run：单次执行记录目录；本次收尾后历史 run 已清理。 |
| `docs/specs/` | 产品 / 系统 / 对象模型 / 子设计。 |
| `docs/reports/` | ReviewRecord、验证报告、复盘报告目录；本次收尾后历史报告已清理。 |
| `docs/recs/` | 产品化建议和多智能体协作建议。 |
| `docs/guides/` | 方法、技能治理、Guarded Flow、Markdown 契约。 |
| `docs/templates/` | 结构化 Markdown 模板。 |

当前文档导航入口：`docs/文档导航.md`。

---

## 3. 当前必读文档

1. `docs/plans/PLAN-SMART-FACTORY.md`
2. `docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
3. `docs/tasks/TF-GF-IMPL.md`
4. `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
5. `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
6. `docs/recs/REC-MAC-PROD-v0.6.33.md`
7. `docs/guides/TASKFLOW-GOVERNANCE-v0.9.25.md`
8. `docs/changes/CHANGELOG-v0.6.33.md`

---

## 4. 已完成主线

| TaskFlow | 状态 | 沉淀结果 |
|---|---|---|
| `TF-DOC-STRUCT-01` | done | 结构化 Markdown TaskFlow 模板：`docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md`。 |
| `TF-POC-MD-01` | done | Markdown TaskFlow 可读写经验已沉淀到 `TASKFLOW-MD-CONTRACT`、TaskTicket 子设计和 taskflow skill 映射设计。 |
| `TF-GUARDED-FLOW-01` | done | Guarded Flow 最小约束设计已沉淀到 `TASKFLOW-GUARDED-FLOW`。 |
| `TF-GF-IMPL-01` | done | 依赖检查最小实现，落地 `validate-dependencies`，摘要见 `TF-GF-IMPL` 工作包。 |
| `TF-GF-IMPL-02` | done | Blocker / Decision 检查最小实现，落地 `validate-gates`，摘要见 `TF-GF-IMPL` 工作包。 |
| `TF-GF-IMPL-03` | done | 验证失败状态最小实现，落地 `validate-statuses`，摘要见 `TF-GF-IMPL` 工作包。 |
| `TF-DOC-MERGE-01 / 02` | done | TaskFlow / TaskTicket 子设计与 recs 口径收口。 |
| `TF-DOC-WP-01` | done | 补充 WorkPackage / TaskFlowGroup 层级，并调整 plans/tasks 文档组织口径。 |

本次 DOC-CLOSEOUT 已清理上述任务的历史 run / report / patch / 测试记录；有复用价值的结论已沉淀到当前文档。

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

P0 文档化阶段，`docs/tasks/*.md` 主文档可作为 WorkPackage 的轻量表现形式。

---

## 7. taskflow 执行经验

当前 taskflow skill 已收敛到以下口径：

- 默认模式：`batch-auto-summary`，无人值守完成任务流，最终给完整审计。
- 对话框审计输出应包含：节点开始、节点完成、完成时间、实际耗时、状态清单和 7 列节点进度表。
- 节点实际耗时由 TaskTicket 状态中的实际开始 / 完成时间计算。
- 若证据未在完成前落盘，不能输出可信实际耗时。
- 普通节点不应强制用户逐节点点击“继续”；只有高风险、人工验收、调试或可见性测试才使用 checkpoint-visible。

---

## 8. 文档清理规则

后续更新 docs 时默认遵循：

1. 当前事实源、路线图、工作包、设计、模板和通用指南应保留。
2. 已完成任务的 run / report / 测试记录不默认长期保留。
3. 若完成任务有复用价值，应先沉淀到通用文档，再清理原始过程文件。
4. 每次 docs 包更新必须同步 `docs/文档导航.md` 与本文件。
5. 本包只包含 `docs/`，不包含 `skills/`、`apps/`、`prototypes/` 和图片资源。
