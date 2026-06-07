# 智能软件工厂变更说明

> 版本：v0.6.33  
> 文档更新批次：2026-05-21 / 架构演进决策回写  
> 最新原型安全基线：v0.6.33.29

---

## 1. 本次文档变更

本次变更将近期讨论形成的 Agent Team 编排架构决策写入正式文档体系。

新增：

```text
docs/decisions/ADR-0009-Agent-Team-Orchestration-v0.6.33.md
docs/templates/STRUCTURED-TASK-MD-TEMPLATE.md
docs/templates/STRUCTURED-PLAN-MD-TEMPLATE.md
docs/templates/STRUCTURED-DECISION-MD-TEMPLATE.md
docs/templates/STRUCTURED-REVIEW-MD-TEMPLATE.md
docs/guides/STABLE-DELIVERY-v0.3.md
docs/reports/DOC-QA-Report-v0.6.33.md
```

更新：

```text
docs/specs/PRD-v0.6.33.md
docs/specs/SDD-v0.6.33.md
docs/plans/IMPL-PLN-v0.6.33.md
docs/tasks/WBS-v0.6.33.md
docs/changes/CHANGELOG-v0.6.33.md
docs/文档导航.md
```

---

## 2. 核心变化

```text
1. 明确当前阶段采用“主智能体任务清单驱动”的 POC 模式。
2. 避免一开始实现完整复杂状态机，防止过度设计。
3. 定义四阶段演进：Agent-led Task List → Guarded Task Flow → State-machine Orchestration → Factory Runtime Orchestration。
4. 明确主子智能体可以通讯，但必须回写为 TaskEvent / ExecutionResult / ReviewRecord / DecisionItem。
5. 明确任务、计划、审查和决策文档采用结构化 Markdown。
6. 将结构化 Markdown 定义为“YAML Front Matter + Markdown 正文 + 标记区块 + 可选 JSONL Events”。
```

---

## 3. 对原型的影响

不需要推倒现有原型。

```text
首页协作全景：保持封板，解释为任务状态和团队运行态聚合视图。
项目健康总表：保持，解释为项目任务账本 / 进度账本视图。
团队任务单闭环：保持，后续轻量强化“组长维护任务清单”口径。
待决策工作台：保持，作为人类介入点。
员工 Runtime 绑定：保持，作为后续 Runtime 编排预留。
```

---

## 4. 对后续实现的影响

后续 POC 实现优先级调整为：

```text
1. 结构化 Markdown 任务模板。
2. Front Matter 解析与安全局部更新。
3. 主智能体生成计划与任务清单。
4. 子智能体执行反馈回写。
5. 轻量状态约束。
6. 待决策与审查记录回写。
7. 程序状态机编排。
8. Runtime 工厂化调度。
```

---

## 5. 风险与注意事项

```text
不要把主子智能体自由聊天作为事实来源。
不要一开始做完整状态机。
不要让程序重写整篇 Markdown，优先更新结构化字段和标记区块。
不要过早依赖具体某个 Agent Runtime 的实验能力作为核心架构。
```
---

## 6. 高质量文档评审修正

本轮高质量评审后，进一步修正：

```text
1. ADR 编号与仓库既有 ADR-0001～ADR-0008 命名保持连续，新增 ADR-0009。
2. CHANGELOG 归入 docs/changes/，与既有文档导航目录规则一致。
3. 文档导航从“本轮包清单”升级为“仓库文档入口”，保留 v0.6.32 历史文档入口并补充 v0.6.33 新文档入口。
4. 结构化 Markdown 模板从任务单扩展到计划、待决策和审查记录。
5. 补充 stable-delivery / 稳交付 v0.3 指南，记录“任务执行 / 任务执行 高质量”的执行口径。
6. 补充文档高质量评审报告，用于说明本轮评审发现、处理决定和关闭状态。
```

## 7. v0.6.33.30 原型与文档轻量适配

- 原型从“解释底层机制”调整为“呈现用户可见推进路径”。
- 项目健康总表补强岗位产出：计划拆解、执行反馈、审查意见。
- 团队详情页补充岗位产出闭环说明。
- 保持底层机制演进兼容：当前可由主智能体任务清单驱动，后续可演进到状态机与 Runtime 编排，但用户界面不随底层机制大幅变化。
- Mock 数据调整为更接近真实项目推进：每个项目有下一步动作、岗位产出、审查/决策来源和风险说明。

## 8. task / taskflow 技能经验回写

本轮将 `task` / `taskflow` 两个技能的实践经验回写到设计相关文档，作为智能工厂运行机制参考。

新增 / 更新要点：

```text
1. SDD 增加 task/taskflow 与智能工厂设计对象的映射。
2. IMPL-PLN 增加 task/taskflow 从协作实践到产品化能力的分阶段路径。
3. WBS 增加任务流清单、managed task、暂停门禁、流程进度视图、评审追踪等任务。
4. ADR-0009 增加 task/taskflow 技能实践补充，说明其作为架构决策参考，不作为普通用户必须理解的功能。
5. docs/文档导航.md 增加 task/taskflow 经验入口。
```

设计口径：

```text
taskflow 是任务流编排经验，对应协同规划岗维护任务流。
task 是单任务质量闭环，对应一个 TaskTicket 的执行、验证、评审、修复和交付。
managed task 说明长程任务中可以连续执行子任务，但必须保留暂停门禁。
```

## v0.6.33-taskflow-v0.2 文档补充

- 补充 `taskflow` 暂停/恢复机制与智能工厂待决策机制的对应关系。
- 明确 `taskflow` 是单智能体串行长程执行参考，智能工厂是多智能体并行协同系统。
- 更新 SDD、IMPL-PLN、WBS、ADR-0009、TASK-TASKFLOW 指南和文档导航。
- 记录后续产品化时需要新增并行调度、资源占用、冲突检测、跨团队依赖和 Runtime 状态同步能力。


## 9. task v0.5.1 / taskflow v0.4.1 文档同步

- 新增 `docs/guides/TASK-TASKFLOW-v0.4.1.md`。
- 补充 `任务执行` 与 `任务流执行` 的触发边界：单任务不得显示任务流进度图。
- 补充 taskflow SOW 选择、节点颗粒度、逐节点进度、真实计时、暂停/恢复/退出规则。
- 将上述经验同步到 SDD、实施计划、WBS 和 ADR。
- 明确该机制是智能工厂多智能体编排的轻量参考，不等同于完整多智能体并行系统。


## v0.6.33.33

- 原型：修复团队页旧“技术专家 / 系统架构师 / 待介入”口径残留；
- 原型：清理异常重复占位文本；
- 原型：团队页补充计划、执行、审查三类岗位产出摘要；
- 文档：同步 taskflow v0.6 的 SOW 选择、工作包颗粒度、逐节点进度、临时计时和暂停/恢复/退出规则；
- 设计：明确 taskflow 是单智能体串行参考模型，智能工厂是多智能体并行协同系统。


## 2026-05-23 / TF-P0B-04 前端工程同步

- 前端：完成 `TF-P0B-04` 第二个低风险 DOM 模板化试点。
- 前端：新增 `apps/web/src/templates/top-banner-template.js`，将 `networkErrorBanner` 挂载收口到模板模块。
- 前端：`index.html` 中 `top-banners-container` 改为空容器，保持原 `networkErrorBanner` 的 id/class/text 语义不变。
- 验证：`npm run qa:sandbox` 通过，`teamCards=5`、`masters=5`、`workers=17`、`brokenImages=0`、`pageErrors=0`、`httpErrors=0`。
- 流程：taskflow 已升级到 v0.9.9，新增节点内部修复循环规则；验证失败先定位和最小修复，不立即中断找用户。
- 文档：新增 `TF-P0B-04-FRONTEND-SUMMARY-v0.6.33.45.md` 与 `TF-P0B-04-QA-Report-v0.6.33.45.md`。

## 2026-05-23 / TF-P0B-05 Avatar Base64 Fallback 移除与资源路径回归

- 原型：生成 `agent-team-v0.6.33.45-prototype-slim.html`，移除头像 `AVATAR_DATA_V41` / data-uri fallback。
- 原型：头像统一直接引用 `pic/avatars/*.png`，`avatar-default.png` 作为图片兜底。
- 原型体积：HTML 从 4,402,872 bytes 降至 1,124,952 bytes，减少约 3.13 MB。
- 前端：同步迁移后 `apps/web/src/legacy/prototype-runtime.js`，移除头像 base64 fallback。
- 前端体积：`prototype-runtime.js` 从 3,998,127 bytes 降至 720,208 bytes，减少约 3.13 MB。
- 验证：原型 slim 与迁移后 apps/web 均通过头像/关键页面回归；`brokenImages=0`、`pageErrors=0`、`httpErrors=0`。
- 迁移规则：后续 prototype-migration 默认禁止迁移头像/普通图片 data-uri fallback；除非明确要求单文件离线原型，否则统一使用 `pic/` 静态资源。
- 技能：`taskflow / task-runner / prototype-migration` 已升级到 v0.9.10，补充图片资源迁移与 lazy-loading 验证规则。

## TF-GOV-02 / v0.6.33.45 taskflow 治理补充

- 固化 taskflow 启动节点清单表格格式：`节点 / 名称 / 目标 / 验收点 / 预计耗时`。
- 更新 `skills/taskflow/SKILL.md`、`skills/taskflow/README.md`、`skills-README.md`，补充 skill 更新必须同步配套文档的规则。
- 新增 `docs/guides/TASKFLOW-GOVERNANCE-v0.9.11.md`。
- 新增 `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`，说明 taskflow skill 经验到 SOW / TaskTicket / DecisionItem / Blocker / TaskEvent 的产品化映射。
- 新增 `docs/tasks/DEV-TASKFLOW-NEXT-v0.6.33.45.md`，建议下一阶段优先推进结构化 Markdown 模板与 Agent-led Task List POC。
- 未提升产品版本号，仍沿用 v0.6.33.45 基线。

## TF-GOV-03 / v0.6.33.45 taskflow 节点进度可见性修正

- 技能：`taskflow` 升级到 v0.9.12，保持启动节点清单格式不变。
- 技能：节点执行进度表固定为 `节点 / 目标 / 结果 / 验证 / 证据 / 预计耗时 / 实际耗时`。
- 技能：明确进度必须先写入 `.taskflow/taskflows/<taskflowId>.json` 临时缓存。
- 技能：节点完成后必须通过 `render-pending` 同步到主对话窗口；若做不到节点级同步，必须定时推送缓存进度。
- 文档：同步更新 `skills/taskflow/SKILL.md`、`skills/taskflow/README.md`、`skills-README.md`、`docs/guides/TASKFLOW-GOVERNANCE-v0.9.12.md`、`docs/reports/TF-GOV-03-Taskflow-Progress-Visibility-Review-v0.6.33.45.md` 和 `docs/文档导航.md`。
- 工具：`tools/taskflow/taskflow.mjs` 的 progress / summary / visible-summary 输出需匹配 7 列节点进度表。
- 未提升产品版本号，仍沿用 v0.6.33.45 基线。
