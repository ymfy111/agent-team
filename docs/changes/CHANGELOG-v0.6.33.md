# CHANGELOG v0.6.33

> 当前同步批次：DOC-CLOSEOUT / v0.6.33.45  
> 当前主线：TaskFlow First + WorkPackage / TaskFlowGroup + Guarded Flow 最小实现  
> 说明：本文件仅保留当前阶段对后续推进有价值的变更摘要；历史过程性 run / report / patch / 测试记录已在本次 docs 收尾中清理。

---

## 2026-05-24 / DOC-CLOSEOUT docs 全量收尾

- 导航：重写 `docs/文档导航.md`，将当前入口收敛到 TaskFlow First / WorkPackage / Guarded Flow 主线。
- 项目记忆：更新 `docs/project-memory.md`，记录当前基线、目录口径、已完成主线、下一步建议和关键设计口径。
- 文档瘦身：清理历史 taskflow 治理旧版本、补丁文件、已完成任务的 run / report / 测试记录。
- 沉淀规则：已完成任务如有复用价值，应先沉淀到指南、模板、路线图、工作包或子设计，再清理原始过程文件。
- 当前下一步：`TF-GF-IMPL-04｜恢复记录最小实现`。

---

## 2026-05-24 / WorkPackage / TaskFlowGroup 层级收口

- 文档结构：新增并启用 `docs/plans/`，承载阶段目标、路线图和能力路线。
- 任务组织：`docs/tasks/` 统一为 WorkPackage / TaskFlowGroup，主文档可管理一组有序 TaskFlow。
- 当前工作包：新增 `docs/tasks/TF-GF-IMPL-v0.6.33.45.md`，统一维护 `TF-GF-IMPL-01/02/03/04` 的状态、已落地能力和下一步。
- 设计口径：在 `SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` 中补充 `WorkPackage / TaskFlowGroup` 层级，形成 `Project → Stage/Plan → WorkPackage → TaskFlow → TaskTicket/Node`。
- 产品映射：同步 `SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md` 与 `多智能体协作产品化建议-v0.6.33.md`，明确简单项目可由 skill + 文档驱动，复杂项目由软件工厂平台驱动，本质均为任务流驱动。

---

## 2026-05-24 / TaskFlow First 产品原则

- 核心结论：智能软件工厂的核心不是智能体对话，而是围绕 `TaskFlow / TaskTicket` 组织计划、执行、协作、验证、评审和交付。
- 单智能体工厂：`taskflow skill + 结构化 Markdown + taskflow-md.mjs` 是小项目 / POC 的简化版软件工厂引擎。
- 多智能体工厂：复杂项目由软件工厂平台围绕 TaskFlow / TaskTicket 分配多个数字员工协同执行。
- 对话定位：对话是用户与智能体的交互入口，不是事实源；事实源应沉淀为 TaskFlow、TaskTicket、TaskEvent、Artifact、Evidence、ReviewRecord、DecisionItem 和 HandoffPackage。

---

## 2026-05-24 / TaskFlow / TaskTicket 子设计收口

- 新增/更新 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`。
- 统一层级：`Project → Stage / Plan → WorkPackage / TaskFlowGroup → TaskFlow → TaskTicket / Node → Artifact / Evidence`。
- 明确 `doneCriteria` 是节点完成判定标准；P0 阶段可用 Markdown bullet 表达。
- 明确 `actualDuration` 不是独立事实源，只能由 `actualCompletedAt - actualStartedAt` 计算展示。
- 明确 Artifact / Change Reference 与 Evidence 的边界：commit hash、文档路径、代码路径属于产物/变更引用；测试输出、截图、QA 结果和审查结论属于证据。
- 收紧 DesignImplementationSync：P0 阶段不作为独立对象、不形成新的执行层级、不引入独立队列；同步结果回写为 TaskEvent、ReviewRecord、DecisionItem 或 HandoffPackage。

---

## 2026-05-24 / Guarded Flow 最小实现主线

- `TF-GUARDED-FLOW-01`：完成 Guarded Flow 最小约束设计，沉淀到 `docs/guides/TASKFLOW-GUARDED-FLOW-v0.6.33.45.md`。
- `TF-GF-IMPL-01`：完成依赖检查最小实现，落地 `validate-dependencies`。
- `TF-GF-IMPL-02`：完成 Blocker / Decision 检查最小实现，落地 `validate-gates`。
- `TF-GF-IMPL-03`：完成验证失败状态最小实现，落地 `validate-statuses`。
- `TF-GF-IMPL-04`：下一步候选，恢复记录最小实现，候选能力 `resume-node` / `append-event`。
- `TF-GF-REVIEW-01`：后续候选，Guarded Flow 产品化映射评审。

---

## 2026-05-24 / 结构化 Markdown 与 taskflow 执行经验

- 建立 `docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md`，作为 P0 结构化 TaskFlow 文档模板。
- 建立 `docs/guides/TASKFLOW-MD-CONTRACT-v0.9.19.md`，记录 Markdown 局部更新、标记区块、事件追加等契约。
- taskflow skill 当前收敛到 v0.9.25：默认 `batch-auto-summary`，无人值守完成任务流，最终输出完整审计；高风险、人工验收、调试或可见性测试才使用 checkpoint-visible。
- 节点实际耗时由 TaskTicket 状态中的实际开始 / 完成时间计算；证据未在完成前落盘时，不能输出可信实际耗时。

---

## 2026-05-23 / TF-P0B-05 Avatar Base64 Fallback 移除与资源路径回归

- 原型：生成 `agent-team-v0.6.33.45-prototype-slim.html`，移除头像 `AVATAR_DATA_V41` / data-uri fallback。
- 原型：头像统一直接引用 `pic/avatars/*.png`，`avatar-default.png` 作为图片兜底。
- 前端：同步迁移后 `apps/web/src/legacy/prototype-runtime.js`，移除头像 base64 fallback。
- 验证：原型 slim 与迁移后 apps/web 均通过头像/关键页面回归，`brokenImages=0`、`pageErrors=0`、`httpErrors=0`。
- 迁移规则：后续 prototype-migration 默认禁止迁移头像/普通图片 data-uri fallback；除非明确要求单文件离线原型，否则统一使用 `pic/` 静态资源。

---

## 维护约定

1. 每次 docs 包更新必须同步 `docs/文档导航.md` 与 `docs/project-memory.md`。
2. 当前事实源、路线图、工作包、设计、模板和通用指南应保留。
3. 已完成任务的 run / report / 测试记录不默认长期保留；有复用价值的信息应先沉淀到通用文档。
4. 不为保留历史而堆积文档；历史需要追溯时以 Git 记录为准。
