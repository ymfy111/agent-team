# 文档驱动开发规范

> 文档类型：GUIDE / 文档驱动开发规范  
> 文件名：`GUIDE-DOC-DRIVEN-DEVELOPMENT.md`  
> 适用范围：智能软件工厂 / agent-team 项目的文档生成、维护、回写和归档  
> 当前口径：计划 / 阶段 / 工作项 / 任务 / 步骤  
> 维护状态：当前规范

---

## 1. 规范定位

本文档定义智能软件工厂项目中的文档驱动开发（Document Driven Development，简称 DDD）规则。

本文档不是需求文档、设计文档或任务执行记录，而是这些文档如何生成、引用、更新和归档的规则源。

核心原则：

```text
先有需求与设计边界，再形成计划和阶段；
计划拆成工作项，工作项组织任务；
任务执行产生步骤、证据、评审和运行记录；
有复用价值的结论再回写到长期文档。
```

---

## 2. 层级与命名口径

### 2.1 用户侧与设计侧名称

| 用户侧名称 | 设计侧名称 | 说明 |
|---|---|---|
| 计划 | Plan | 项目或产品级目标、路线图、阶段规划。 |
| 阶段 | Stage | 计划下的一段目标区间。 |
| 工作项 | WorkItem | 阶段下的工作组织单元，承载一组相关 TaskFlow。 |
| 任务 | TaskFlow | 一次可执行、可验证、可审计的任务流。 |
| 步骤 | TaskTicket | TaskFlow 中的最小执行节点，也可理解为 Todo / Node。 |

### 2.2 目录映射

| 层级 / 类型 | 目录 | 说明 |
|---|---|---|
| 主需求 / 主设计 / 子设计 | `docs/specs/` | 长期基线，定义产品、系统和专项设计边界。 |
| 计划 / 阶段 / 路线图 | `docs/plans/` | 管目标、阶段和工作项清单，不写详细执行日志。 |
| 工作项 | `docs/workitems/` | 一个主文档对应一个 WorkItem，管理一组相关 TaskFlow。 |
| 任务流运行记录 | `docs/workitems/runs/` | 记录某次 TaskFlow 执行的节点、事件、证据和审计。 |
| 评审 / 验证 / 复盘 | `docs/reports/` | 保存关键任务后的评审、验证和复盘结论。 |
| 建议类文档 | `docs/recs/` | 产品化建议、演进建议、方案建议。 |
| 规范 / 指南 | `docs/guides/` | 方法、规范、执行规则。 |
| 模板 | `docs/templates/` | 可复用模板资产，不是项目执行结果。 |
| 原型归档 | `docs/prototypes/` | 原型 HTML、图片资源和视觉参考。 |
| 变更记录 | `docs/changes/` | 版本级文档变更摘要。 |

---

## 3. 文档生成顺序

推荐生成与维护顺序：

```text
PRD / SDD / 子设计
  → PLAN 计划 / 阶段路线
  → WorkItem 工作项文档
  → TaskFlow 执行
  → Run / Report
  → 回写 WorkItem / Plan / project-memory / CHANGELOG
```

### 3.1 specs 先定义边界

`docs/specs/` 用于长期基线：

- 主需求：`PRD-vX.md`
- 主设计：`SDD-vX.md`
- 子设计：`SDD-<主题>-vX.md`
- 部署设计：`DEPLOY-vX.md`

### 3.2 plans 管计划和阶段

Plan 文档回答：

```text
为什么做？
分哪些阶段做？
每个阶段有哪些工作项？
当前焦点是什么？
下一步建议推进哪个工作项？
```

Plan 不应展开所有 TaskFlow 节点，也不复制运行日志。

### 3.3 workitems 管工作项状态

WorkItem 文档回答：

```text
这个工作项承接哪个计划和阶段？
包含哪些 TaskFlow？
哪些已完成、当前、待执行、阻塞或暂缓？
运行记录和评审报告在哪里？
下一步是什么？
```

WorkItem 文档是活文档，不建议在文件名里带版本号；状态变化直接更新同一个文件，由 Git 历史和文档内更新记录追踪。

### 3.4 runs / reports 管执行事实

TaskFlow 执行时动态生成步骤 / TaskTicket。步骤默认记录在：

```text
docs/workitems/runs/<TaskFlowId>-RUN-vX.md
```

评审、验证、复盘记录默认放在：

```text
docs/reports/RPT-<TaskFlowId>-<主题>-vX.md
```

不为每个步骤 / TaskTicket 单独建立长期文档。若某个步骤产出可复用结论，应沉淀到 `specs/`、`guides/`、`templates/`、`project-memory.md` 或 `CHANGELOG`。

---

## 4. 命名规范

| 类型 | 命名规则 | 示例 |
|---|---|---|
| 主需求 | `PRD-vX.md` | `PRD-v0.6.33.md` |
| 主设计 | `SDD-vX.md` | `SDD-v0.6.33.md` |
| 子设计 | `SDD-<主题>-vX.md` | `SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` |
| 部署设计 | `DEPLOY-vX.md` | `DEPLOY-v0.6.33.md` |
| 计划 | `PLAN-<主题>.md` | `PLAN-SMART-FACTORY.md` |
| 工作项 | `TF-<领域>-<动作>.md` | `TF-GF-IMPL.md` |
| 运行记录 | `<TaskFlowId>-RUN-vX.md` | `TF-GF-IMPL-04-RUN-v0.6.33.45.md` |
| 评审报告 | `RPT-<TaskFlowId>-<主题>-vX.md` | `RPT-TF-GF-IMPL-04-Review-v0.6.33.45.md` |
| 建议文档 | `REC-<主题>-vX.md` | `REC-MAC-PROD-v0.6.33.md` |
| 指南 | `GUIDE-<主题>.md` 或稳定版本化指南名 | `GUIDE-DOC-DRIVEN-DEVELOPMENT.md` |
| 模板 | `STRUCTURED-<类型>-MD-TEMPLATE.md` | `STRUCTURED-WORKITEM-MD-TEMPLATE.md` |

---

## 5. 模板引用

模板是本文档的 reference，但不是本文档的子目录，也不是项目执行结果。模板统一放在 `docs/templates/`：

| 模板 | 对应文档 |
|---|---|
| `docs/templates/STRUCTURED-PLAN-MD-TEMPLATE.md` | `docs/plans/PLAN-*.md` |
| `docs/templates/STRUCTURED-WORKITEM-MD-TEMPLATE.md` | `docs/workitems/*.md` |
| `docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md` | `docs/workitems/runs/*-RUN-*.md` 或 TaskFlow 执行结构 |
| `docs/templates/STRUCTURED-REVIEW-MD-TEMPLATE.md` | `docs/reports/RPT-*.md` |
| `docs/templates/STRUCTURED-DECISION-MD-TEMPLATE.md` | DecisionItem / 待决策记录 |

模板被使用后生成的具体文档，必须放回对应目录，而不是留在 `docs/templates/`。

---

## 6. 更新与回写规则

### 6.1 TaskFlow 执行完成后

完成一个 TaskFlow 后，默认更新：

1. `docs/workitems/<WorkItem>.md`：更新 TaskFlow 状态、关键产出、Run / Report 链接和下一步。
2. `docs/workitems/runs/<TaskFlowId>-RUN-vX.md`：保存执行节点、事件、证据和审计。
3. `docs/reports/RPT-<TaskFlowId>-<主题>-vX.md`：保存评审、验证或复盘。
4. `docs/changes/CHANGELOG-vX.md`：记录重要文档、命名、目录或设计口径变化。
5. `docs/project-memory.md`：只记录对后续持续有影响的结论。
6. `docs/文档导航.md`：新增或移动正式文档时必须同步。

### 6.2 结论沉淀优先级

```text
一次性过程 → runs / reports
可复用方法 → guides / templates
产品或系统边界 → specs
计划和阶段变化 → plans
工作项状态变化 → workitems
长期项目记忆 → project-memory.md
```

---

## 7. 执行报告输出规则

TaskFlow batch 执行完成后，主对话默认输出四段式报告：

1. 执行概览
2. 节点摘要
3. 问题与遗留
4. 产物与下一步

规则：

- 验证全部通过时，不单独输出“验证摘要”。
- 验证失败、风险和遗留统一进入“问题与遗留”。
- 完整验证命令和日志保留在 `runs/` 或 `reports/` 文件中。
- 主对话表格应为关键内容留宽度，短字段如状态、耗时尽量合并或靠前。
- 执行报告优先由 `taskflow-md.mjs render-report` 根据运行记录自动生成。

---

## 8. 不做事项

1. 不为每个 TaskTicket / 步骤单独建立长期 Markdown 文档。
2. 不把 runs 的详细日志复制进 WorkItem 主文档。
3. 不把历史 reports 长期堆积为主入口。
4. 不让 Plan 直接管理所有 TaskFlow 节点。
5. 不把模板当成项目事实源。
6. 不在没有沉淀结论前清理主规格、模板、原型归档和导航。
7. 不因为一次任务暴露的问题扩展出过多新机制；优先最小修复。

---

## 9. 验收检查清单

新增或调整文档时至少检查：

- [ ] 是否放在正确目录。
- [ ] 是否使用正确命名。
- [ ] 是否更新 `docs/文档导航.md`。
- [ ] 是否需要更新 `docs/project-memory.md`。
- [ ] 是否需要更新 `docs/changes/CHANGELOG-vX.md`。
- [ ] 是否引用了正确模板。
- [ ] 是否避免复制 runs / reports 的过程性内容。
- [ ] 是否保留了主需求、主设计、模板和原型归档等基础资产。
