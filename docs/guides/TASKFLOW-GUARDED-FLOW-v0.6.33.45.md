# Guarded Task Flow 最小约束设计

> 文档类型：执行治理指南  
> 基线：v0.6.33.45 / taskflow v0.9.21  
> 适用范围：Agent-led Task List 之后、完整状态机之前的轻量受控任务流阶段。

## 1. 设计目标

Guarded Task Flow 的目标不是一次性实现完整工作流引擎，而是在结构化 Markdown / TaskTicket 任务清单之上增加最小必要门禁，避免数字员工把未满足依赖、未关闭阻塞、未决策事项或验证失败的节点继续推进为 `done`。

## 2. 与现有阶段的关系

| 阶段 | 重点 | Guarded Flow 的补充 |
|---|---|---|
| Agent-led Task List | 主智能体维护任务清单和事件 | 任务可读、可追踪，但门禁主要靠执行纪律 |
| Guarded Task Flow | 增加依赖、阻塞、待决策、验证失败门禁 | 不满足门禁时暂停节点或任务流 |
| State-machine Orchestration | 程序状态机和自动调度 | 更完整但实现成本更高 |

## 3. 最小门禁

### 3.1 依赖门禁

节点进入 `in_progress` 前，应检查依赖节点是否已 `done` 或 `accepted`。依赖未满足时不得启动节点，应记录为 `blocked` 或暂停到待恢复队列。

### 3.2 Blocker 门禁

关联当前节点或全局任务流的 open Blocker 必须处理：

- P0/P1 或依赖缺失类 Blocker：暂停任务流，等待用户或上层调度处理。
- P2/P3 非阻塞项：可继续，但必须在最终审计中标记为遗留项。

### 3.3 Decision 门禁

关联当前节点的 open DecisionItem 不能被忽略。若决策影响范围、验收标准、技术路线或基线安全，应暂停并请求确认；若只是后续优化建议，可记录为非阻塞遗留项。

### 3.4 验证失败门禁

节点验证失败时，不应立即交给用户；应先在节点内部执行有限修复循环：定位原因、最小修复、重新验证、独立评审。超过修复次数或质量不收敛时暂停。

### 3.5 证据门禁

节点完成前必须完成证据落盘。TaskTicket 的 `实际完成时间` 必须晚于或等于该节点关键证据文件的修改时间；否则实际耗时不可信，节点不得作为可信完成。

## 4. 状态建议

Guarded Flow 不需要引入复杂状态机，但建议在 TaskTicket 级别保留以下状态：

| 状态 | 含义 |
|---|---|
| `todo` | 未开始 |
| `in_progress` | 正在执行 |
| `blocked` | 被依赖、阻塞或待决策拦住 |
| `needs_review` | 已完成初步产物，等待评审或验收 |
| `done` | 节点完成，证据和验证通过 |
| `accepted` | 用户或上层验收通过 |
| `cancelled` | 本轮取消或拆出范围 |

## 5. 暂停与恢复

暂停时必须记录：暂停原因、关联节点、阻塞类型、建议动作、当前证据、可恢复条件。恢复时至少检查：依赖是否满足、Blocker/Decision 是否关闭、冻结项是否变化、基线是否仍有效。

## 6. 产品化映射

| Guarded Flow 概念 | 产品对象 |
|---|---|
| 节点依赖 | WorkItemNode.dependencies |
| 节点状态 | TaskTicket.status |
| 暂停原因 | Blocker / DecisionItem |
| 验证记录 | ValidationResult / ReviewRecord |
| 证据 | EvidenceRef |
| 生命周期事件 | TaskEvent |

## 7. 非目标

- 不在本阶段实现跨员工并行调度。
- 不在本阶段实现完整 BPMN / 工作流引擎。
- 不把所有内部状态暴露给普通用户界面。
- 不以工具复杂度替代执行纪律。

## 8. 下一步

后续最小实现应先补 `taskflow-md` 的依赖检查、Blocker/Decision open 检查、验证失败状态更新和恢复记录，再考虑产品化 UI 表达。
