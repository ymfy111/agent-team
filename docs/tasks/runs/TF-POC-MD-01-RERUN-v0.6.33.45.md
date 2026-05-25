# TF-POC-MD-01-RERUN v0.6.33.45

> 文档类型：结构化 Markdown 任务流真实重跑记录  
> 目的：按 taskflow v0.9.19 真实任务硬门禁重跑 Agent-led Task List POC。  
> 原因：上一轮 TF-POC-MD-01 出现节点计划替换、耗时不可信、门禁处理不完整、证据不充分问题。  

---
schema: agent-team.taskflow.v1
flowId: TF-POC-MD-01-RERUN
title: Agent-led Task List POC 真实重跑
baseline: v0.6.33.45 / taskflow v0.9.19
mode: batch-auto-summary
status: done
ownerAgentId: chatgpt-current-session
createdAt: 2026-05-24T00:00:00Z
updatedAt: 2026-05-24T03:54:10.274Z
estimatedTotal: 中复杂度
progress:
  done: 5
  total: 5
  currentNodeId: null
---

## 1. SOW / 工作范围

<!-- TASKFLOW:SOW:START -->

### 目标

重跑 Agent-led Task List POC：用用户确认的 5 个节点作为唯一执行计划，验证结构化 Markdown 任务清单可以被脚本读取、局部更新、追加事件并生成最终审计。

### 范围内

- 复核 POC 边界与输入资料。
- 定义 Markdown 解析与局部更新契约。
- 验证或完善最小脚本 `tools/taskflow/taskflow-md.mjs`。
- 在运行副本上真实跑通节点状态、事件追加和最终总结。
- 同步文档导航、CHANGELOG 和重跑评审报告。

### 范围外

- 不实现数据库版 Taskflow。
- 不接真实 OpenCode / Codex Runtime。
- 不做前端页面联调。
- 不修改模板原件和原始示例文件的业务内容。

### 验收模式

`batch-auto-summary`：无人值守完成，最终输出完整可视化审计；不声明当前 ChatGPT 单轮中间过程实时逐条可见。

<!-- TASKFLOW:SOW:END -->

## 2. 节点清单

<!-- TASKFLOW:NODES:START -->

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 | 依赖 | 暂停门禁 |
|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | POC 边界复核 | 读取现有模板、示例任务流和 taskflow governance，确认本轮只做 Markdown 任务清单最小可运行 POC。 | 输出边界复核记录，明确输入、输出、冻结项和不做范围。 | 低复杂度 | 无 | 发现范围需要扩大时暂停 |
| TF-POC-MD-01-N02 | 解析与更新契约设计 | 定义 Markdown 中哪些区块可被脚本安全更新，哪些内容保持人工可读。 | 形成契约文档，明确可更新区、只读区、事件追加和失败策略。 | 中复杂度 | TF-POC-MD-01-N01 | 需要改变模板结构时暂停 |
| TF-POC-MD-01-N03 | 实现最小脚本 | 新增一个 tools/taskflow/taskflow-md.mjs 或类似脚本，支持读取任务流、更新节点状态、追加事件。 | 脚本通过 node --check，支持 inspect/validate/start-node/complete-node/summary/check-plan/validate-gates/validate-evidence。 | 中复杂度 | TF-POC-MD-01-N02 | 脚本无法安全局部更新时暂停 |
| TF-POC-MD-01-N04 | 示例任务流跑通 | 用现有示例 Markdown 跑一遍真实更新，生成事件记录和最终 summary。 | 运行副本 progress=5/5，事件记录完整，summary 更新，门禁和证据检查通过。 | 中复杂度 | TF-POC-MD-01-N03 | 破坏原始示例或出现 open 关键门禁时暂停 |
| TF-POC-MD-01-N05 | 文档同步与独立评审 | 更新文档导航、CHANGELOG、评审报告，并检查是否适合进入下一阶段。 | 导航和变更记录同步，评审报告明确 PASS/FAIL 和下一步。 | 低复杂度 | TF-POC-MD-01-N04 | 评审发现 P0/P1 时暂停 |

<!-- TASKFLOW:NODES:END -->

## 3. 节点执行状态

<!-- TASKFLOW:STATUS:START -->

| 节点 | 状态 | 开始时间 | 完成时间 | 结果 | 验证 | 证据 | 实际耗时 |
|---|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | done | 2026-05-24T03:52:31.857Z | 2026-05-24T03:52:31.947Z | 已完成 POC 边界复核：输入资料、范围内/范围外、冻结项、运行副本和硬门禁已明确。 | PASS；评审：PASS | EVD-RERUN-N01 | 1s |
| TF-POC-MD-01-N02 | done | 2026-05-24T03:52:45.733Z | 2026-05-24T03:52:45.832Z | 已完成解析与更新契约设计：明确可读区、可更新区、禁止更新区、失败策略和耗时可信规则。 | PASS；评审：PASS | EVD-RERUN-N02 | 1s |
| TF-POC-MD-01-N03 | done | 2026-05-24T03:52:54.616Z | 2026-05-24T03:52:55.281Z | 已验证最小脚本：taskflow-md.mjs 支持 inspect/validate/start-node/complete-node/summary/check-plan/validate-gates/validate-evidence，语法与当前运行副本验证通过。 | PASS；评审：PASS | EVD-RERUN-N03 | 1s |
| TF-POC-MD-01-N04 | done | 2026-05-24T03:53:22.341Z | 2026-05-24T03:53:30.515Z | 已在示例副本上跑通结构化 Markdown 更新：节点状态、事件追加、summary、门禁和证据验证通过；原始示例未被污染。 | PASS；评审：PASS | EVD-RERUN-N04 | 8s |
| TF-POC-MD-01-N05 | done | 2026-05-24T03:54:07.969Z | 2026-05-24T03:54:10.272Z | 已同步文档导航、CHANGELOG 和重跑评审报告，并完成独立评审；本轮重跑结论 PASS。 | PASS；评审：PASS | EVD-RERUN-N05 | 2s |

<!-- TASKFLOW:STATUS:END -->

## 4. 验收标准

<!-- TASKFLOW:ACCEPTANCE:START -->

- 最终节点清单必须与 `_local/taskflow/TF-POC-MD-01-confirmed-plan-v2.json` 完全一致。
- 节点 start 必须发生在节点真实工作开始前；done 必须发生在验证、评审、证据落盘之后。
- 若未建立可信 start/done 账本，实际耗时必须写“未精确计时”，不得事后补秒数。
- open blocker / decision 必须关闭、降级为非阻塞遗留，或触发暂停；不得无条件 PASS。
- 证据必须落盘为文档、日志、命令输出或 EvidenceRef；泛化文字不能单独作为 PASS 证据。

<!-- TASKFLOW:ACCEPTANCE:END -->

## 5. 证据引用

<!-- TASKFLOW:EVIDENCE:START -->

| 证据 ID | 类型 | 路径 / 链接 | 关联节点 | 说明 |
|---|---|---|---|---|
| EVD-RERUN-PLAN | JSON | _local/taskflow/TF-POC-MD-01-confirmed-plan-v2.json | TF-POC-MD-01-N01 | 用户确认节点清单 |
| EVD-RERUN-N01 | DOC | _local/taskflow/TF-POC-MD-01-RERUN/N01-boundary.md | TF-POC-MD-01-N01 | POC 边界复核记录 |
| EVD-RERUN-N02 | DOC | docs/guides/TASKFLOW-MD-CONTRACT-v0.9.19.md | TF-POC-MD-01-N02 | Markdown 解析与更新契约 |
| EVD-RERUN-N03 | LOG | _local/taskflow/TF-POC-MD-01-RERUN/N03-script-validation.log | TF-POC-MD-01-N03 | 脚本能力验证日志 |
| EVD-RERUN-N04 | LOG | _local/taskflow/TF-POC-MD-01-RERUN/N04-run-validation.log | TF-POC-MD-01-N04 | 运行副本验证日志 |
| EVD-RERUN-N05 | DOC | docs/reports/TF-POC-MD-01-Rerun-Review-v0.6.33.45.md | TF-POC-MD-01-N05 | 重跑评审报告 |

<!-- TASKFLOW:EVIDENCE:END -->

## 6. 阻塞与待决策

<!-- TASKFLOW:BLOCKERS:START -->

| ID | 类型 | 关联节点 | 问题 | 建议动作 | 状态 |
|---|---|---|---|---|---|

<!-- TASKFLOW:BLOCKERS:END -->

<!-- TASKFLOW:DECISIONS:START -->

| ID | 关联节点 | 问题 | 选项 | 推荐 | 状态 |
|---|---|---|---|---|---|

<!-- TASKFLOW:DECISIONS:END -->

## 7. 事件记录

<!-- TASKFLOW:EVENTS:START -->

```jsonl
{"eventId":"EVT-RERUN-001","flowId":"TF-POC-MD-01-RERUN","nodeId":null,"type":"FLOW_CREATED","summary":"创建 TF-POC-MD-01 真实重跑记录","createdAt":"2026-05-24T00:00:00Z","evidenceRefs":["EVD-RERUN-PLAN"]}
{"eventId":"EVT-1779594751860-ga9tnm","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N01","type":"NODE_STARTED","summary":"TF-POC-MD-01-N01 started","createdAt":"2026-05-24T03:52:31.860Z","evidenceRefs":[]}
{"eventId":"EVT-1779594751950-ot501y","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N01","type":"NODE_COMPLETED","summary":"已完成 POC 边界复核：输入资料、范围内/范围外、冻结项、运行副本和硬门禁已明确。","createdAt":"2026-05-24T03:52:31.950Z","evidenceRefs":["EVD-RERUN-N01"]}
{"eventId":"EVT-1779594765736-1zedsv","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N02","type":"NODE_STARTED","summary":"TF-POC-MD-01-N02 started","createdAt":"2026-05-24T03:52:45.736Z","evidenceRefs":[]}
{"eventId":"EVT-1779594765834-02077z","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N02","type":"NODE_COMPLETED","summary":"已完成解析与更新契约设计：明确可读区、可更新区、禁止更新区、失败策略和耗时可信规则。","createdAt":"2026-05-24T03:52:45.834Z","evidenceRefs":["EVD-RERUN-N02"]}
{"eventId":"EVT-1779594774619-18ahfs","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N03","type":"NODE_STARTED","summary":"TF-POC-MD-01-N03 started","createdAt":"2026-05-24T03:52:54.619Z","evidenceRefs":[]}
{"eventId":"EVT-1779594775284-ifsoho","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N03","type":"NODE_COMPLETED","summary":"已验证最小脚本：taskflow-md.mjs 支持 inspect/validate/start-node/complete-node/summary/check-plan/validate-gates/validate-evidence，语法与当前运行副本验证通过。","createdAt":"2026-05-24T03:52:55.284Z","evidenceRefs":["EVD-RERUN-N03"]}
{"eventId":"EVT-1779594802344-57g6qn","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N04","type":"NODE_STARTED","summary":"TF-POC-MD-01-N04 started","createdAt":"2026-05-24T03:53:22.344Z","evidenceRefs":[]}
{"eventId":"EVT-1779594810518-2smuwc","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N04","type":"NODE_COMPLETED","summary":"已在示例副本上跑通结构化 Markdown 更新：节点状态、事件追加、summary、门禁和证据验证通过；原始示例未被污染。","createdAt":"2026-05-24T03:53:30.518Z","evidenceRefs":["EVD-RERUN-N04"]}
{"eventId":"EVT-1779594847972-9x1nga","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N05","type":"NODE_STARTED","summary":"TF-POC-MD-01-N05 started","createdAt":"2026-05-24T03:54:07.972Z","evidenceRefs":[]}
{"eventId":"EVT-1779594850274-b3hckn","flowId":"TF-POC-MD-01-RERUN","nodeId":"TF-POC-MD-01-N05","type":"NODE_COMPLETED","summary":"已同步文档导航、CHANGELOG 和重跑评审报告，并完成独立评审；本轮重跑结论 PASS。","createdAt":"2026-05-24T03:54:10.275Z","evidenceRefs":["EVD-RERUN-N05"]}
```

<!-- TASKFLOW:EVENTS:END -->

## 8. 最终总结

<!-- TASKFLOW:SUMMARY:START -->

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | 读取现有模板、示例任务流和 taskflow governance，确认本轮只做 Markdown 任务清单最小可运行 POC。 | 已完成 POC 边界复核：输入资料、范围内/范围外、冻结项、运行副本和硬门禁已明确。 | PASS；评审：PASS | EVD-RERUN-N01 | 低复杂度 | 1s |
| TF-POC-MD-01-N02 | 定义 Markdown 中哪些区块可被脚本安全更新，哪些内容保持人工可读。 | 已完成解析与更新契约设计：明确可读区、可更新区、禁止更新区、失败策略和耗时可信规则。 | PASS；评审：PASS | EVD-RERUN-N02 | 中复杂度 | 1s |
| TF-POC-MD-01-N03 | 新增一个 tools/taskflow/taskflow-md.mjs 或类似脚本，支持读取任务流、更新节点状态、追加事件。 | 已验证最小脚本：taskflow-md.mjs 支持 inspect/validate/start-node/complete-node/summary/check-plan/validate-gates/validate-evidence，语法与当前运行副本验证通过。 | PASS；评审：PASS | EVD-RERUN-N03 | 中复杂度 | 1s |
| TF-POC-MD-01-N04 | 用现有示例 Markdown 跑一遍真实更新，生成事件记录和最终 summary。 | 已在示例副本上跑通结构化 Markdown 更新：节点状态、事件追加、summary、门禁和证据验证通过；原始示例未被污染。 | PASS；评审：PASS | EVD-RERUN-N04 | 中复杂度 | 8s |
| TF-POC-MD-01-N05 | 更新文档导航、CHANGELOG、评审报告，并检查是否适合进入下一阶段。 | 已同步文档导航、CHANGELOG 和重跑评审报告，并完成独立评审；本轮重跑结论 PASS。 | PASS；评审：PASS | EVD-RERUN-N05 | 低复杂度 | 2s |

<!-- TASKFLOW:SUMMARY:END -->
