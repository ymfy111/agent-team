# TASKFLOW-MD-CONTRACT v0.9.19

> 文档类型：taskflow 结构化 Markdown 解析与更新契约  
> 适用范围：`tools/taskflow/taskflow-md.mjs` POC 与后续 Agent-led Task List runner  
> 基线：v0.6.33.45 / taskflow v0.9.19

## 1. 契约目标

结构化 Markdown 必须同时满足两类要求：

1. 人能直接阅读、评审和手工维护。
2. 脚本能安全读取关键字段，并只更新受控区块，避免破坏人工正文。

## 2. 可读取区域

脚本可以读取：

- Front Matter：`schema`、`flowId`、`title`、`baseline`、`mode`、`status`、`progress`。
- `TASKFLOW:SOW`：只读，用于理解范围。
- `TASKFLOW:NODES`：只读，作为节点计划事实源。
- `TASKFLOW:STATUS`：读写，作为节点执行状态事实源。
- `TASKFLOW:EVIDENCE`：只读，作为 EvidenceRef 注册表。
- `TASKFLOW:BLOCKERS` / `TASKFLOW:DECISIONS`：只读或受控更新，用于门禁检查。
- `TASKFLOW:EVENTS`：追加 JSONL 事件。
- `TASKFLOW:SUMMARY`：重生成最终 7 列审计表。

## 3. 可更新区域

POC 阶段只允许脚本更新：

| 区域 | 操作 | 说明 |
|---|---|---|
| Front Matter | 更新 `status`、`updatedAt`、`progress` | 不改变 SOW、冻结项和门禁定义。 |
| `TASKFLOW:STATUS` | 更新节点状态、开始/完成时间、结果、验证、证据、实际耗时 | 节点行必须来自 `TASKFLOW:NODES`，不新增未知节点。 |
| `TASKFLOW:EVENTS` | 追加 JSONL | 不重写历史事件。 |
| `TASKFLOW:SUMMARY` | 重生成 7 列表 | 从 `NODES + STATUS` 派生。 |

## 4. 禁止更新区域

脚本不得自动重写：

- 人工说明正文。
- `TASKFLOW:SOW`。
- `TASKFLOW:NODES`。
- `TASKFLOW:ACCEPTANCE`。
- 证据、阻塞、待决策区，除非后续引入明确的 guarded update 命令。

## 5. 失败策略

脚本遇到以下情况必须失败停止，而不是猜测修复：

- 缺少任一 `TASKFLOW:*` 必需区块。
- `NODES` 与 `STATUS` 节点不一致。
- `EVENTS` 不是合法 JSONL。
- `check-plan` 与用户确认计划不一致。
- `validate-gates` 发现 open blocker / decision 且未显式允许。
- `validate-evidence` 发现泛化证据或不存在的证据路径。

## 6. 耗时可信规则

- `start-node` 必须在节点真实工作开始前执行。
- `complete-node` 必须在节点工作、验证、评审和证据落盘后执行。
- 只有满足以上条件时，才允许 `--timing-trusted`。
- 如果是事后补账本，必须写 `未精确计时`。

## 7. 与产品化对象映射

| Markdown 区域 | 产品化对象 |
|---|---|
| Front Matter | TaskFlowPlan / WorkPackage |
| `TASKFLOW:NODES` | WorkPackageNode / TaskTicket |
| `TASKFLOW:STATUS` | TaskTicket.status / TaskExecutionState |
| `TASKFLOW:EVENTS` | TaskEvent |
| `TASKFLOW:EVIDENCE` | EvidenceRef |
| `TASKFLOW:BLOCKERS` | Blocker |
| `TASKFLOW:DECISIONS` | DecisionItem |
| `TASKFLOW:SUMMARY` | TaskflowAuditSummary |

## 8. 本轮结论

本契约足以支撑 TF-POC-MD-01 的最小 POC。后续进入 Guarded Task Flow 时，应再补充 Blocker/Decision 的受控更新命令和失败恢复策略。
