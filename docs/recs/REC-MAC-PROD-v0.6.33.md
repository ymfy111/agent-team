# 多智能体协作产品化建议（v0.6.33）

> 来源：GitHub main `docs/recs/REC-MAC-PROD-v0.6.33.md` 的本地正式副本。  
> 目的：把当前“多个智能体 + 用户 + Git 仓库”协作推进 `agent-team` 项目的真实过程，整理为对 v0.6.33 PRD / SDD / ADR-0009 的增量建议与实践反馈。  
> 版本口径：v0.6.33 / 原型 v0.6.33.45 / TF-P0B-05 后。  
> 定位说明：本文不是替代现有 SDD / ADR 的新设计正本；涉及术语、状态和阶段划分时，应以现有 v0.6.33 PRD、SDD 与 ADR-0009 为准。本文只提供后续设计侧参考的补充建议。  
> TaskFlow / TaskTicket 层级模型、字段映射和 P0 文档化落地约定详见 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`。

---

## 0. 导读：本文核心建议概况

1. **任务单是软件工厂的核心锚点**：所有计划、执行、审查、决策、验收都应围绕 TaskTicket 展开；不要先追求多智能体聊天或复杂自动调度。
2. **当前多智能体协作就是软件工厂的真实样本**：把“设计侧、实施侧、用户、Git 仓库”协同推进项目的方式产品化。
3. **Git 仓库是唯一事实源**：聊天记录、沙箱文件都不是最终事实；只有进入仓库的 `docs/`、`apps/`、QA 报告和交接文档才算有效产物。
4. **角色、执行者、工作空间、产物要解耦**：岗位不绑定具体智能体；系统只管理职责、产出和验收。
5. **跨智能体接手前必须做基线复核**：拉取仓库、读取导航/记忆/变更记录、核对版本、运行最小 QA，再开始具体任务。
6. **设计侧和实施侧要双向同步**：设计产物要同步给实施侧；实施结果、QA 问题、工程约束和用户验收结论也要反向同步给设计侧。
7. **交接包要逐步结构化**：交接不只写“做了什么”，还要记录验证证据、风险、下一步和关键决策理由。

---

## 1. 核心判断

当前 `agent-team` 的研发方式，本身就是智能软件工厂的第一批真实业务样本。

```text
当前真实协作：
设计侧智能体产出 PRD / SDD / 任务流 / 原型 / 交接文档
实施侧智能体落盘代码 / 跑 QA / 提交 git / 更新项目记忆
用户负责触发同步、验收和关键决策
Git 仓库承载最终事实

产品化目标：
软件工厂把以上人工协调动作系统化、可追踪、可验证、可恢复。
```

---

## 2. 当前实践到产品能力的映射

| 当前实践 | 产品化能力 |
|---|---|
| 设计侧智能体输出 PRD、SDD、原型、任务流 | 协同规划岗：需求沉淀、方案设计、任务拆解 |
| 实施侧智能体编码、测试、提交 | 实现验证岗：任务执行、验证、回执 |
| 用户验收、决策仲裁 | 待决策机制 + 交付审查岗 |
| 用户口头任务 + 文档清单驱动 | TaskTicket First：计划、执行、审查、决策、验收都围绕任务单沉淀 |
| Git 仓库作为最终事实源 | ProjectRepository / Artifact Store |
| docs/ 与 apps/ 作为交接契约 | TaskTicket / WorkOrder / Artifact / Evidence |
| handoff/update 文档说明当前状态 | HandoffPackage / BaselineSnapshot |
| 实施前先 pull、读文档、跑 QA | BaselineCheckTask |
| 发现设计缺口后反馈，不擅自改设计 | ChangeRequest / DecisionItem |
| 设计推理与取舍散落在聊天记录中 | DecisionContext / DesignRationale 随 Artifact 沉淀 |

---

## 3. 建议补充的核心产品对象

### 3.0 TaskTicket First：任务单优先原则

软件工厂当前阶段不应先做多智能体自由聊天、复杂自动调度或完整状态机。应先把所有协作收敛到 TaskTicket：

```text
计划 → TaskTicket → 执行回执 / TaskEvent / ExecutionResult
→ ReviewRecord → DecisionItem / ChangeRequest
→ AcceptanceRecord / ReworkOrder → Activity 回写
```

TaskTicket 是执行层的核心挂载点；WorkPackage / TaskFlowGroup 是计划到任务流的组织层。TaskTicket 是其他执行对象的挂载点：

```text
Workspace 服务哪个任务
Artifact 归属哪个任务
HandoffPackage 交接哪个任务流或任务集合
BaselineCheckTask 为哪个任务接手前复核
Review / Decision / Acceptance 审查和确认哪个任务
```

P0 阶段的任务单不需要很复杂，但至少应包含：

```text
- taskId
- title / goal
- ownerRole / ownerWorker
- inputArtifacts[]
- outputArtifacts[]
- status
- doneCriteria（建议字段）：节点完成判定标准，可先用 Markdown 列表表达
- verificationEvidence[]
- decisionItems[]
- nextAction
```

关键原则：可以聊天、讨论和临时探索，但关键结论必须回写到 TaskTicket、Artifact、ReviewRecord、DecisionItem 或 AcceptanceRecord 中，不能只停留在聊天上下文。

### 3.0.1 WorkPackage / TaskFlowGroup：任务流组 / 工作包

在 `Project / Stage / Plan` 与具体 `TaskFlow` 之间，应补充轻量的 `WorkPackage / TaskFlowGroup` 层。

它用于承接一个计划目标下的一组有序任务流，例如 `TF-GF-IMPL` 包含 `TF-GF-IMPL-01/02/03/04`。

P0 阶段建议：

- `plans/` 维护阶段目标和能力路线；
- `tasks/` 主文档维护 WorkPackage / TaskFlowGroup 状态清单；
- `tasks/runs/` 记录单次 TaskFlow 执行审计；
- reports 记录评审、验证和复盘。

WorkPackage 不应变成新的复杂执行层，只维护任务流组的状态、当前焦点、运行记录链接和后续动作。

### 3.1 Workspace：外部工作空间

不同智能体可能运行在不同环境中：本地持久工作区、云端沙箱、浏览器会话、远程容器等。产品需要显式建模工作空间，而不是假设所有 Worker 都在同一运行环境。

Workspace 需求应并入 SDD 中已有的 `Workspace / RuntimeHost / RuntimeNode` 方向，不另造平行术语。

### 3.2 ProjectRepository：项目事实源

```text
ProjectRepository = 项目事实源
Conversation = 过程上下文
Sandbox File = 临时产物
Committed Artifact = 有效产物
```

建议区分 Artifact 的可信度层级：

```text
Committed：已进入 ProjectRepository，但尚未完成验证。
Verified：已通过自动化 QA、截图检查、人工复核或交付审查中的一种或多种。
Accepted：已被用户、协同规划岗或交付审查岗确认可作为当前基线。
```

### 3.3 HandoffPackage：交接包

`update/HANDOFF-*.md` 这类文档应被抽象为一等对象，而不是自由文本附件。当前可继续使用 Markdown 交接文档作为人工约定；结构化解析、存储和校验属于 P1 或 Guarded Task Flow 之后的工作。

### 3.4 BaselineCheckTask：基线复核任务

跨智能体、跨会话接手前，第一步不应直接执行开发，而应先复核基线。

标准流程：

```text
拉取项目事实源 → 读取文档导航 / 项目记忆 / 变更记录 / 交接包
→ 核对当前版本、任务流、最近 commit
→ 校验关键版本声明是否一致或差异可解释
→ 运行最小 QA → 输出基线复核结果 → 再进入具体开发任务
```

### 3.5 DesignImplementationSync：设计-实施双向同步协议

DesignImplementationSync 不是独立执行层，而是围绕 TaskFlow / TaskTicket 发生的设计-实施同步流程。

P0 阶段 DesignImplementationSync 不作为独立对象、不形成新的执行层级、不引入独立队列；它仅作为 TaskFlow / TaskTicket 执行过程中的同步活动标签或事件来源。

同步结果应回写为：

- TaskEvent：同步动作、状态变化、执行反馈；
- ReviewRecord：实施偏差、质量审查、返工建议；
- DecisionItem：需要裁决的范围、方案或优先级取舍；
- HandoffPackage：阶段性交接包和接手说明。

---

## 4. Artifact / Evidence 口径

Artifact / Change Reference 指向“产物或变更对象”，典型项包括：

- commit hash
- 文档路径
- 代码路径
- 原型 HTML
- QA 报告路径

Evidence 指向“验证或审查证据”，典型项包括：

- 测试输出
- 截图
- `brokenImages=0 / pageErrors=0 / httpErrors=0`
- 交付审查结论

commit hash 更适合作为 Artifact / Change Reference，不应单独作为 Evidence 示例。

---

## 5. 当前阶段不建议做的事

```text
1. 不实现完整 Artifact Store 数据库。
2. 不实现自动通知系统。
3. 不实现文件级锁或复杂并发控制。
4. 不实现完整 Workspace / Runtime 调度。
5. 不把 HandoffPackage 立即做成强结构化系统对象。
6. 不绕过 TaskTicket 做自由聊天式协作。
```

---

## 6. 推荐优先级

| 优先级 | 建议 | 理由 |
|---|---|---|
| P0 | TaskTicket First | 所有协作围绕任务单沉淀，是后续状态机、Runtime 调度和验收门禁的基础 |
| P0 | BaselineCheckTask | 不依赖复杂系统实现，可立即降低接手误判和版本漂移 |
| P0 原则 | ProjectRepository 事实源原则 | 当前先作为必须遵守的协作原则，不急于做完整 Artifact Store |
| P0 流程 | DesignImplementationSync 双向人工流程 | 解决设计侧/实施侧双向同步痛点，可先用文档和任务流约定 |
| P0 证据标签 | Artifact 可信度分层 | 用 Committed / Verified / Accepted 区分产物可信度，避免误判 |
| P1 | HandoffPackage 结构化 | 当前已有 Markdown 样本，但解析/存储/校验需要后续基础设施 |
| P1 / 阶段 D 预研 | Workspace 建模 | 应并入 SDD 阶段 D 的 Workspace / RuntimeHost / RuntimeNode 体系 |

---

## 7. 对后续设计侧的建议

后续设计可优先围绕以下问题展开：

1. TaskTicket 的 P0 最小字段集是什么？哪些字段必须当前阶段就有，哪些可以 P1 再扩展？
2. BaselineCheckTask 是所有任务流的强制前置节点，还是只在跨会话 / 跨 Worker / 跨工作空间时触发？
3. TaskTicket 与 HandoffPackage 的关系是父子关系、引用关系，还是同级 Artifact？
4. 设计-实施同步协议应由用户手动触发、Git 变更触发，还是由任务流状态触发？
5. Artifact 的 Committed / Verified / Accepted 三层是否足够，是否需要更细的证据类型？
6. `project-memory.md` 被多方写入时，是否需要分区、合并策略或审查门禁？

`project-memory.md` 多方写入问题暂不并入 TaskFlow / TaskTicket 子设计，建议留给后续 Workspace / 事实源 / 记忆分层设计。
