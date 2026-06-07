# TASK_TF-TIMING-VERIFY-01｜任务正式记录

---
schema: agent-team.taskflow.v1
flowId: TF-TIMING-VERIFY-01
scenarioId: TF-TIMING-VERIFY-01
runtimeMode: batch-auto-summary
executionMode: real-task-regression
acceptanceMode: delegated
status: done
createdAt: 2026-05-24T00:00:00Z
updatedAt: 2026-05-24T04:05:30.697Z
progress:
  done: 4
  total: 4
  currentNodeId: null
---

## 1. SOW / 工作范围

<!-- TASKFLOW:SOW:START -->

### 目标

验证 `taskflow-md.mjs` 的可信耗时修正是否有效：默认不输出假精确耗时；只有在 start → 真实工作 → complete 严格覆盖节点工作时，才允许输出具体耗时。

### 范围内

- 复核当前工具脚本和 TF-GOV-11 结论。
- 在测试副本上验证不可信计时默认输出“未精确计时”。
- 在测试副本上验证可信计时可输出具体耗时，并保存真实工作证据。
- 同步评审报告和必要变更记录。

### 范围外

- 不引入 flow 总耗时体系。
- 不修改前端源码。
- 不提升产品版本号。

<!-- TASKFLOW:SOW:END -->

## 2. 节点清单

<!-- TASKFLOW:NODES:START -->

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 | 依赖 | 暂停门禁 |
|---|---|---|---|---|---|---|
| TF-TIMING-VERIFY-01-N01 | 现状复核 | 复核 taskflow-md.mjs、TF-GOV-11 报告和 CHANGELOG，确认本轮验证边界。 | 明确只验证耗时规则，不扩大到 flow 总耗时体系。 | 低复杂度 | 无 | 无 |
| TF-TIMING-VERIFY-01-N02 | 不可信计时回归 | 用真实测试副本执行 start-node / complete-node，不传 --timing-trusted。 | 节点实际耗时必须输出“未精确计时”，不能再出现 1s 假精确值。 | 低复杂度 | TF-TIMING-VERIFY-01-N01 | 无 |
| TF-TIMING-VERIFY-01-N03 | 可信计时回归 | 严格按 start → 做真实小工作 → complete --timing-trusted 执行一个节点。 | 节点实际耗时可以输出具体值，且证据能证明 start/done 覆盖了真实工作。 | 中复杂度 | TF-TIMING-VERIFY-01-N02 | 无 |
| TF-TIMING-VERIFY-01-N04 | 文档与评审同步 | 把验证结果写入评审报告，必要时补 CHANGELOG。 | 产物、验证日志、结论清楚；若仍有偏差，不写 PASS。 | 低复杂度 | TF-TIMING-VERIFY-01-N03 | 无 |

<!-- TASKFLOW:NODES:END -->

## 3. 节点执行状态

<!-- TASKFLOW:STATUS:START -->

| 节点 | 状态 | 开始时间 | 完成时间 | 结果 | 验证 | 证据 | 实际耗时 |
|---|---|---|---|---|---|---|---|
| TF-TIMING-VERIFY-01-N01 | done | 2026-05-24T04:04:51.855Z | 2026-05-24T04:04:52.965Z | 已完成现状复核：确认本轮只验证耗时规则，不扩展 flow 总耗时体系。 | PASS；评审：PASS | EVD-TIMING-N01 | 1s |
| TF-TIMING-VERIFY-01-N02 | done | 2026-05-24T04:04:57.791Z | 2026-05-24T04:04:59.891Z | 不可信计时回归通过：未传 --timing-trusted，脚本没有输出假精确秒数。 | PASS；评审：PASS | EVD-TIMING-N02 | 未精确计时 |
| TF-TIMING-VERIFY-01-N03 | done | 2026-05-24T04:05:07.165Z | 2026-05-24T04:05:10.296Z | 可信计时回归通过：节点 start 后完成真实小工作并落盘证据，再用 --timing-trusted 记录具体耗时。 | PASS；评审：PASS | EVD-TIMING-N03 | 3s |
| TF-TIMING-VERIFY-01-N04 | done | 2026-05-24T04:05:28.487Z | 2026-05-24T04:05:30.694Z | 已完成文档与评审同步：评审报告和 CHANGELOG 已更新，验证结论清楚。 | PASS；评审：PASS | EVD-TIMING-N04 | 2s |

<!-- TASKFLOW:STATUS:END -->

## 4. 验收标准

<!-- TASKFLOW:ACCEPTANCE:START -->

- 不可信计时场景必须输出“未精确计时”。
- 可信计时场景必须在节点开始后做真实工作，并在证据落盘后 complete --timing-trusted。
- 最终总结不能把未可信覆盖的命令间隔写成精确耗时。

<!-- TASKFLOW:ACCEPTANCE:END -->

## 5. 证据引用

<!-- TASKFLOW:EVIDENCE:START -->

| 证据 ID | 类型 | 路径 / 链接 | 关联节点 | 说明 |
|---|---|---|---|---|
| EVD-TIMING-N01 | LOG | _local/taskflow/TF-TIMING-VERIFY-01/N01-assessment.md | TF-TIMING-VERIFY-01-N01 | 现状复核记录 |
| EVD-TIMING-N02 | LOG | _local/taskflow/TF-TIMING-VERIFY-01/N02-untrusted.log | TF-TIMING-VERIFY-01-N02 | 不可信计时回归命令输出 |
| EVD-TIMING-N03 | LOG | _local/taskflow/TF-TIMING-VERIFY-01/N03-trusted-work.md | TF-TIMING-VERIFY-01-N03 | 可信计时节点内真实工作证据 |
| EVD-TIMING-N04 | DOC | docs/reports/TF-TIMING-VERIFY-01-Timing-Rule-Regression-v0.6.33.45.md | TF-TIMING-VERIFY-01-N04 | 本轮评审报告 |

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
{"eventId":"EVT-1779595491857-2d2sm8","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N01","type":"NODE_STARTED","summary":"TF-TIMING-VERIFY-01-N01 started","createdAt":"2026-05-24T04:04:51.857Z","evidenceRefs":[]}
{"eventId":"EVT-1779595492967-zudlwv","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N01","type":"NODE_COMPLETED","summary":"已完成现状复核：确认本轮只验证耗时规则，不扩展 flow 总耗时体系。","createdAt":"2026-05-24T04:04:52.968Z","evidenceRefs":["EVD-TIMING-N01"]}
{"eventId":"EVT-1779595497794-tllsug","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N02","type":"NODE_STARTED","summary":"TF-TIMING-VERIFY-01-N02 started","createdAt":"2026-05-24T04:04:57.794Z","evidenceRefs":[]}
{"eventId":"EVT-1779595499893-1t6pfx","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N02","type":"NODE_COMPLETED","summary":"不可信计时回归通过：未传 --timing-trusted，脚本没有输出假精确秒数。","createdAt":"2026-05-24T04:04:59.893Z","evidenceRefs":["EVD-TIMING-N02"]}
{"eventId":"EVT-1779595507168-axm2m3","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N03","type":"NODE_STARTED","summary":"TF-TIMING-VERIFY-01-N03 started","createdAt":"2026-05-24T04:05:07.168Z","evidenceRefs":[]}
{"eventId":"EVT-1779595510298-f1jbqk","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N03","type":"NODE_COMPLETED","summary":"可信计时回归通过：节点 start 后完成真实小工作并落盘证据，再用 --timing-trusted 记录具体耗时。","createdAt":"2026-05-24T04:05:10.298Z","evidenceRefs":["EVD-TIMING-N03"]}
{"eventId":"EVT-1779595528490-kdttxr","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N04","type":"NODE_STARTED","summary":"TF-TIMING-VERIFY-01-N04 started","createdAt":"2026-05-24T04:05:28.490Z","evidenceRefs":[]}
{"eventId":"EVT-1779595530698-u2vx35","flowId":"TF-TIMING-VERIFY-01","nodeId":"TF-TIMING-VERIFY-01-N04","type":"NODE_COMPLETED","summary":"已完成文档与评审同步：评审报告和 CHANGELOG 已更新，验证结论清楚。","createdAt":"2026-05-24T04:05:30.698Z","evidenceRefs":["EVD-TIMING-N04"]}
```

<!-- TASKFLOW:EVENTS:END -->

## 8. 最终总结

<!-- TASKFLOW:SUMMARY:START -->

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-TIMING-VERIFY-01-N01 | 复核 taskflow-md.mjs、TF-GOV-11 报告和 CHANGELOG，确认本轮验证边界。 | 已完成现状复核：确认本轮只验证耗时规则，不扩展 flow 总耗时体系。 | PASS；评审：PASS | EVD-TIMING-N01 | 低复杂度 | 1s |
| TF-TIMING-VERIFY-01-N02 | 用真实测试副本执行 start-node / complete-node，不传 --timing-trusted。 | 不可信计时回归通过：未传 --timing-trusted，脚本没有输出假精确秒数。 | PASS；评审：PASS | EVD-TIMING-N02 | 低复杂度 | 未精确计时 |
| TF-TIMING-VERIFY-01-N03 | 严格按 start → 做真实小工作 → complete --timing-trusted 执行一个节点。 | 可信计时回归通过：节点 start 后完成真实小工作并落盘证据，再用 --timing-trusted 记录具体耗时。 | PASS；评审：PASS | EVD-TIMING-N03 | 中复杂度 | 3s |
| TF-TIMING-VERIFY-01-N04 | 把验证结果写入评审报告，必要时补 CHANGELOG。 | 已完成文档与评审同步：评审报告和 CHANGELOG 已更新，验证结论清楚。 | PASS；评审：PASS | EVD-TIMING-N04 | 低复杂度 | 2s |

<!-- TASKFLOW:SUMMARY:END -->
