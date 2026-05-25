# TF-GOV-04｜taskflow 生命周期可见性与实际耗时修正评审

基线：v0.6.33.45 / TF-P0B-05  
技能版本：taskflow v0.9.13  
性质：模拟任务内容，真实脚本缓存与可见输出链路。

## 发现的问题

1. v0.9.12 测试中，模拟任务虽然有开始/结束时间，但实际耗时仍显示“未精确计时（模拟）”或“未精确计时”。
2. 可见输出需要确保 N01、N02、N03... 每个节点都有“已开始”和“已完成”过程消息。
3. 完成进度应使用已完成节点数 / 总节点数，例如 1/3、2/3、3/3，而不是只依赖节点序号。

## 修正内容

- `tools/taskflow/taskflow.mjs`：done 默认基于 startedAt/completedAt 计算 actualDurationMs。
- `tools/taskflow/taskflow.mjs`：完成消息的进度使用 countDone(ledger) / total(ledger)。
- `skills/taskflow/SKILL.md`：升级到 v0.9.13，补充生命周期事件与实际耗时硬规则。
- `skills/taskflow/README.md`、`skills-README.md`、`docs/guides/TASKFLOW-GOVERNANCE-v0.9.13.md`：同步配套文档。

## 回归测试

任务流：TF-SIM-REAL-02｜taskflow v0.9.13 可见生命周期与耗时模拟测试

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-SIM-REAL-02-N01 | 验证节点开始和完成事件都进入缓存并同步到主对话。 | N01 start/done 事件均已进入缓存并完成同步验证。 | PASS；评审：PASS | render-pending 输出 N01 start 与 done | 低复杂度 | 5s |
| TF-SIM-REAL-02-N02 | 验证模拟节点也能基于 startedAt/completedAt 输出实际耗时。 | N02 已验证模拟任务也按 startedAt/completedAt 自动计算实际耗时。 | PASS；评审：PASS | actualOf 输出脚本计算耗时，未出现“未精确计时（模拟）” | 低复杂度 | 5s |
| TF-SIM-REAL-02-N03 | 验证所有 done 节点的 start/done 事件都已 rendered，最终无 pending。 | 所有 done 节点均具备 start/done 事件，准备执行最终可见性校验。 | PASS；评审：PASS | validate-visible 与 render-pending final | 低复杂度 | 6s |

验证结果：

```text
node --check tools/taskflow/taskflow.mjs：PASS
validate-visible：PASS
render-pending final：NO_PENDING_VISIBLE_EVENTS
summary：Progress 3/3，Actual Total 16s
```

## 结论

通过。v0.9.13 已修正 v0.9.12 的可见生命周期与耗时问题，可继续用于真实任务流。
