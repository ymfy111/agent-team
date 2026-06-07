# TF-POC-MD-01-Rerun Review v0.6.33.45

> 文档类型：真实任务重跑评审报告  
> 任务流：TF-POC-MD-01-RERUN  
> 基线：v0.6.33.45 / taskflow v0.9.19  
> 结论：PASS（以最终验证日志为准）

## 1. 重跑原因

上一轮 `TF-POC-MD-01` 产物有价值，但执行过程存在问题：节点计划被示例文件替换、耗时不可信、open blocker / decision 未处理、证据不充分。因此本轮按 v0.9.19 真实任务硬门禁重跑。

## 2. 本轮执行计划

本轮唯一有效节点清单来自 `_local/taskflow/TF-POC-MD-01-confirmed-plan-v2.json`：

1. `TF-POC-MD-01-N01`：POC 边界复核。
2. `TF-POC-MD-01-N02`：解析与更新契约设计。
3. `TF-POC-MD-01-N03`：实现最小脚本。
4. `TF-POC-MD-01-N04`：示例任务流跑通。
5. `TF-POC-MD-01-N05`：文档同步与独立评审。

## 3. 产物

| 类型 | 路径 | 说明 |
|---|---|---|
| 运行记录 | `docs/tasks/runs/TF-POC-MD-01-RERUN-v0.6.33.45.md` | 本轮真实重跑的结构化任务流记录。 |
| 示例夹具 | `docs/tasks/runs/TF-POC-MD-01-EXAMPLE-FIXTURE-v0.6.33.45.md` | 基于原示例复制的脚本跑通副本，原始示例不被污染。 |
| 契约文档 | `docs/guides/TASKFLOW-MD-CONTRACT-v0.9.19.md` | Markdown 解析与局部更新契约。 |
| 脚本 | `tools/taskflow/taskflow-md.mjs` | 支持 inspect/validate/start-node/complete-node/summary/check-plan/validate-gates/validate-evidence。 |
| 证据日志 | `_local/taskflow/TF-POC-MD-01-RERUN/` | 每个节点的开始、完成与验证日志。 |

## 4. 硬门禁检查

| 门禁 | 结果 | 证据 |
|---|---|---|
| 节点一致性 | PASS | `check-plan` 输出 `PLAN_OK nodes=5 strict=true`。 |
| 真实耗时口径 | PASS | 每个节点均先 `start-node` 再执行工作，再 `complete-node --timing-trusted`。 |
| Batch 审计 | PASS | 运行记录含 STATUS、EVENTS、SUMMARY 三类审计区。 |
| Blocker / Decision | PASS | `validate-gates` 输出 `GATES_OK blockersOpen=0 decisionsOpen=0`。 |
| 证据落盘 | PASS | `validate-evidence --strict` 输出 `EVIDENCE_OK`。 |

## 5. 独立评审

### 产品视角

POC 证明结构化 Markdown 可以作为轻量 Agent-led Task List 载体，适合继续向产品化 Taskflow 过渡。

### 执行视角

本轮修正了上一轮最大问题：执行节点与用户确认计划保持一致，最终审计不再使用示例文件节点冒充本轮节点。

### 工程视角

`taskflow-md.mjs` 仍是 POC 工具，不是完整 Markdown/YAML 解析器。其可靠性依赖 `TASKFLOW:*` 标记区块、稳定表头和严格失败策略。

### 风险

- 如果人工大幅修改表格表头，脚本应失败停止。
- Guarded Task Flow 阶段仍需补充 Blocker/Decision 的受控更新命令和错误恢复策略。

## 6. 结论

本轮重跑通过。`TF-POC-MD-01` 的有效验收应以 `TF-POC-MD-01-RERUN-v0.6.33.45.md` 和本报告为准；上一轮原运行报告保留为反例与复盘依据。

## 7. 下一步建议

进入 `TF-GUARDED-FLOW-01｜Guarded Task Flow 约束设计`，补依赖检查、Blocker/Decision 受控更新、暂停/恢复和错误恢复策略。
