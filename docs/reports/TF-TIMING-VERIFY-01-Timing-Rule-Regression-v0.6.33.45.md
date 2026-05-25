# TF-TIMING-VERIFY-01｜可信耗时规则真实回归评审报告

> 基线：v0.6.33.45 / taskflow v0.9.19
> 模式：batch-auto-summary
> 结论：PASS。最小修复生效：不可信计时默认输出“未精确计时”；可信计时需要 --timing-trusted。

## 验证范围

- 不扩大到 flow 总耗时体系。
- 只验证 taskflow-md.mjs complete-node 的耗时口径。
- 只在测试运行副本上执行，不修改前端源码或产品版本。

## 关键验证结果

| 场景 | 命令口径 | 期望 | 结果 | 结论 |
|---|---|---|---|---|
| 不可信计时 | complete-node 不传 --timing-trusted | 实际耗时=未精确计时 | 已验证 | PASS |
| 可信计时 | start 后真实工作落盘，再 complete-node --timing-trusted | 输出具体耗时 | 已验证 | PASS |

## 证据

- `_local/taskflow/TF-TIMING-VERIFY-01/N02-untrusted.log`
- `_local/taskflow/TF-TIMING-VERIFY-01/N03-trusted-work.md`
- `_local/taskflow/TF-TIMING-VERIFY-01/N03-complete.log`
- `docs/tasks/runs/TF-TIMING-VERIFY-01-RUN-v0.6.33.45.md`

## 评审结论

最小修复方向正确。后续真实任务中，若无法证明 start/done 覆盖节点真实工作，就应保留“未精确计时”，不能输出漂亮但不可信的秒数。
