# TASKFLOW-GOVERNANCE v0.9.24｜Blocker/Decision 检查最小实现

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

v0.9.22 已将口径收敛为 TaskTicket 实际时间字段：`start-node` 写实际开始时间，`complete-node` 通过完成门禁后写实际完成时间，并自动计算实际耗时。

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

## v0.9.20 补充：可信耗时证据落盘校验（已被 v0.9.22 收敛）

TF-TIMING-VERIFY-01 复盘发现：即使 `complete-node` 默认不再输出假精确耗时，真实任务仍可能出现“节点先完成，报告/运行记录后落盘”的问题。此时节点 `actualDuration` 仍然不可信。

最小治理规则如下：

1. 如果节点输出具体实际耗时，关联证据必须在节点 `completedAt` 前已经落盘。
2. v0.9.22 后，`complete-node` 默认检查 evidence ref 对应文件的 mtime；若证据缺失或 mtime 晚于 `actualCompletedAt`，拒绝完成。
3. 新增 `validate-timing` 用于复查历史运行文件，发现证据晚于节点完成时间时，应将该节点耗时可信度判为 FAIL。
4. 对“文档与评审同步 / 最终总结”类节点，必须先写完报告、CHANGELOG、运行记录和验证日志，再执行节点完成记录。

回归结论：

- 证据先落盘、再 `complete-node`：PASS。
- 证据 mtime 晚于节点完成时间：拒绝可信耗时。
- 对旧运行文件 `TF-TIMING-VERIFY-01-RUN` 执行 `validate-timing`：能正确发现 N04 证据晚于完成时间的问题。


## v0.9.22 收敛：TaskTicket 实际开始/完成时间

本次不新增复杂总耗时体系，只修正一个口径：节点本身就是事实账本。

- `start-node` 写入 `实际开始时间`。
- `complete-node` 在产物、验证、评审、证据落盘后写入 `实际完成时间`。
- `实际耗时 = 实际完成时间 - 实际开始时间`，由工具自动计算。
- 若缺少实际开始时间，写“未精确计时”。
- `--timing-trusted` 不再作为主流程概念；可信与否由完成门禁和证据 mtime 校验保证。

模板状态表统一为：

```text
节点 / 状态 / 实际开始时间 / 实际完成时间 / 结果 / 验证 / 证据 / 实际耗时
```


## v0.9.22 完成时间与 OpenCode Todo 风格参考

- 节点完成输出必须显示完成时间/结束时间，避免只给实际耗时而无法追溯结束点。
- batch 最终总结可借鉴 OpenCode todo 清单：`[✓]` 已完成、`[!]` 当前/需关注、`[ ]` 未开始，用于快速扫读。
- 简洁状态清单不能替代完整审计表；完整审计仍需包含节点、目标、结果、验证、证据、预计耗时、实际耗时，并在生命周期日志中保留开始/完成时间。


## v0.9.23 补充：依赖检查最小实现

本轮只围绕 Guarded Flow 的第一个已确认问题做最小修复：节点启动前检查依赖。

### 规则

1. `NODES` 表中的 `依赖` 列是启动门禁。
2. `start-node` 在写入 `实际开始时间` 前执行依赖检查。
3. 依赖节点状态必须是 `done` 或 `accepted`。
4. 依赖缺失或未完成时，`start-node` 必须失败，且不得写入开始时间。
5. `validate-dependencies` 用于复查运行文件中已启动或已完成节点是否违反依赖规则。

### 非目标

- 不实现完整状态机。
- 不处理 Blocker / Decision 检查。
- 不接入前端或数据库。
- 不扩展任务节点表格结构。

## v0.9.24 Blocker/Decision 最小实现

本轮只补一件事：open Blocker / open Decision 不得被忽略。

### start-node 门禁

启动节点前，工具必须检查：

```text
- `TASKFLOW:BLOCKERS` 中关联当前节点或全局的 open blocker；
- `TASKFLOW:DECISIONS` 中关联当前节点或全局的 open decision。
```

存在 open gate 时，`start-node` 必须失败，节点不得进入 `in_progress`。

### validate-gates 复查

`validate-gates` 必须复查已经 `in_progress / done / accepted` 的节点。如果这些节点仍关联 open blocker / open decision，则判定 FAIL。

### 关闭状态口径

`closed / resolved / done / accepted / waived / deferred / cancelled / canceled` 视为非阻塞；其他非空状态视为 open。

### 非目标

本版本不实现完整状态机、不设计责任人流转、不做前端 UI。

