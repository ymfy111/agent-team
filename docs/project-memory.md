# project-memory｜agent-team 当前项目记忆

> 更新时间：2026-05-25  
> 当前基线：v0.6.33.45  
> 当前主线：TaskFlow First / WorkItem / Guarded Flow P0 能力完成  
> 当前 skill 参考：taskflow v0.9.28  
> 当前 docs 状态：已按 Plan / Stage / WorkItem / TaskFlow / TaskTicket 口径收口。

---

## 1. 核心结论

智能软件工厂的核心不是智能体对话，而是围绕任务组织计划、执行、协作、验证、评审和交付。

统一层级：

```text
用户侧：计划 / 阶段 / 工作项 / 任务 / 步骤
设计侧：Plan / Stage / WorkItem / TaskFlow / TaskTicket
```

对话是用户与智能体的交互入口；TaskFlow / TaskTicket 是项目推进的事实主线。

---

## 2. 当前目录口径

| 目录 | 当前含义 |
|---|---|
| `docs/plans/` | Plan / Stage：计划、阶段、路线图。 |
| `docs/workitems/` | WorkItem：工作项文档；每个主文档对应一个工作项。 |
| `docs/workitems/runs/` | TaskFlow Run：任务执行记录。 |
| `docs/specs/` | PRD、SDD、部署、专项设计和子设计。 |
| `docs/reports/` | ReviewRecord、验证、复盘报告。 |
| `docs/recs/` | 产品化建议和演进建议。 |
| `docs/guides/` | 文档规范、技能治理、Markdown 契约。 |
| `docs/templates/` | 结构化 Markdown 模板。 |
| `docs/prototypes/` | 原型归档与图片资源。 |

当前文档入口：`docs/文档导航.md`。

---

## 3. 当前必读文档

1. `docs/文档导航.md`
2. `docs/specs/PRD-v0.6.33.md`
3. `docs/specs/SDD-v0.6.33.md`
4. `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
5. `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
6. `docs/plans/PLAN-SMART-FACTORY.md`
7. `docs/plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md`
8. `docs/workitems/TF-GF-IMPL.md`
9. `docs/guides/GUIDE-DOC-DRIVEN-DEVELOPMENT.md`
10. `docs/guides/TASKFLOW-GOVERNANCE-v0.9.28.md`

---

## 4. 已完成主线

| 任务 | 状态 | 沉淀结果 |
|---|---|---|
| TF-DOC-STRUCT-01 | done | 结构化 Markdown TaskFlow 模板。 |
| TF-POC-MD-01 | done | Markdown TaskFlow 可读写经验沉淀到 Markdown 契约、子设计和 skill 映射设计。 |
| TF-GUARDED-FLOW-01 | done | Guarded Flow 最小约束设计。 |
| TF-GF-IMPL-01 | done | 依赖检查最小实现：`validate-dependencies`。 |
| TF-GF-IMPL-02 | done | Blocker / Decision 检查最小实现：`validate-gates`。 |
| TF-GF-IMPL-03 | done | 验证失败状态最小实现：`validate-statuses`。 |
| TF-GF-IMPL-04 | done | 恢复记录最小实现：`resume-node` / `append-event`。 |
| TF-GF-REVIEW-01 | accepted | Guarded Flow 产品化映射评审完成。 |
| TF-DOC-DDD-01 | done | 文档驱动开发规范与模板收口。 |

已完成任务的长期结论应沉淀到 specs、guides、templates、plans、workitems 和 project-memory；过程性 run/report 可按需清理。

---

## 5. 当前下一步候选

建议下一步进入以下方向之一：

1. `TF-PROD-MODEL-01｜TaskFlow First 产品对象最小模型`；
2. 任务流优先 UI 信息架构评审；
3. Runtime / 多智能体执行绑定边界评审。

---

## 6. 执行报告口径

任务执行后，主对话默认输出 4 段式报告：

1. 执行概览；
2. 步骤摘要；
3. 问题与遗留；
4. 产物与下一步。

验证全部通过时不单独输出验证摘要；验证失败、风险和遗留统一放入“问题与遗留”。完整验证命令和日志保留在 run / report 文件中。
