# TASKFLOW-GOVERNANCE v0.9.19｜真实任务执行硬门禁

## 背景

v0.9.18 将普通 ChatGPT 会话默认模式调整为 `batch-auto-summary`，解决了长程任务中用户不应无意义逐节点点击“继续”的问题。但随后真实任务 `TF-POC-MD-01` 暴露出新的问题：模拟测试正常，真实执行时仍可能出现节点清单被输入样例替换、耗时不可信、Blocker/Decision 未处理却 PASS、证据未落盘等问题。

v0.9.19 的目标不是改变 batch 默认模式，而是增加真实任务执行硬门禁。

## 默认模式

| 模式 | 默认性 | 说明 |
|---|---:|---|
| batch-auto-summary | 默认 | 无人值守完成整个任务流，最终输出完整可视化审计。 |
| checkpoint-visible | 非默认 | 调试、人工验收、高风险或逐节点可见优先。 |
| auto-visible | 产品/runner 模式 | 需要上层 runner、产品 UI、SSE/WebSocket 或事件总线持续推送。 |

## v0.9.19 五个硬门禁

### 1. 节点清单一致性

用户确认的节点清单是本轮 taskflow 唯一执行计划。输入样例、运行副本或脚本解析出的节点只能作为被处理的数据，不能替换本轮计划。最终审计表必须与用户确认的节点逐项一致，否则执行过程判定 FAIL。

### 2. 真实耗时可信度

节点 start 必须发生在真实节点工作开始前，done 必须发生在验证、评审和证据落盘之后。若只是完成后补账本，实际耗时写“未精确计时”。工具命令耗时不能替代节点执行耗时。

### 3. Batch 可视化全过程审计

batch 模式不要求中间实时逐条可见，但最终回复必须展开完整生命周期审计，包括每个节点的开始、完成、进度、目标、结果、验证、证据、预计耗时和实际耗时。只给产物列表和一张 7 列表不够。

### 4. Blocker / Decision 门禁

任务完成前必须检查 open blocker 和 open decision。关键 open 项不得 PASS；非阻塞 open 项可以遗留，但必须标明为 P2/P3 遗留并给出后续处理建议。

### 5. 证据落盘

证据必须是真实路径、截图、日志、命令输出、测试记录或 EvidenceRef。文字声明不能单独作为 PASS 证据。证据未落盘时，节点验证应为 PARTIAL 或 FAIL。

## 工具配套

`tools/taskflow/taskflow-md.mjs` 增加以下检查命令：

```bash
node tools/taskflow/taskflow-md.mjs check-plan --file <taskflow.md> --expected-plan-file <plan.json>
node tools/taskflow/taskflow-md.mjs validate-gates --file <taskflow.md>
node tools/taskflow/taskflow-md.mjs validate-evidence --strict --file <taskflow.md>
```

同时 `complete-node` 默认不再自动把命令间隔作为可信实际耗时。只有显式传入 `--timing-trusted` 或 `--actual`，才会写具体耗时；否则写“未精确计时”。

## 对 TF-POC-MD-01 的修正结论

`TF-POC-MD-01` 的产物可以保留为 POC 草稿，但该轮 taskflow 执行验收应改判：

```text
产物状态：PARTIAL，可保留
执行过程：FAIL
节点一致性：FAIL
耗时可信度：FAIL
门禁处理：FAIL
证据落盘：PARTIAL/FAIL
```

后续如要继续，应先重跑 `TF-POC-MD-01`，严格使用用户确认的节点清单和 v0.9.19 硬门禁。
