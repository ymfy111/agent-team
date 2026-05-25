# TF-GOV-12｜可信耗时证据落盘时间校验修复

基线：v0.6.33.45  
技能：taskflow v0.9.20  
范围：最小修复 `taskflow-md.mjs` 耗时可信度判定，不引入复杂 flow 总耗时体系。

## 1. 问题复盘

`TF-TIMING-VERIFY-01` 暴露出新的耗时不准根因：节点 N04 在 `completedAt=2026-05-24T04:05:30.694Z` 时已被标记完成，但其关键证据 `docs/reports/TF-TIMING-VERIFY-01-Timing-Rule-Regression-v0.6.33.45.md` 的文件修改时间为 `2026-05-24T04:07:41.179Z`。

这说明节点完成记录早于证据落盘，N04 的 `2s` 实际耗时不可信。

## 2. 根因

- `complete-node --timing-trusted` 只检查 start/done 时间跨度，没有检查 evidence ref 对应文件是否已经落盘。
- `validate` 只能检查结构和 JSONL 事件，不能发现“证据晚于节点完成时间”。
- 对“文档与评审同步 / 最终总结”类节点，实际执行中容易先标记完成，再补报告和运行记录。

## 3. 最小修复

更新 `tools/taskflow/taskflow-md.mjs`：

1. 新增 evidence 表解析与 evidence ref 拆分。
2. `complete-node --timing-trusted` 在写入完成前检查证据文件 mtime。
3. 若 evidence ref 不存在、文件缺失，或证据文件 mtime 晚于节点 `completedAt`，拒绝可信耗时。
4. 新增 `validate-timing` 命令，复查已完成运行文件中所有具体实际耗时节点的证据 mtime。
5. 修复 EVENTS 空 jsonl 代码块解析，避免空事件块无法追加首条事件。

## 4. 回归验证

验证命令：

```bash
node --check tools/taskflow/taskflow-md.mjs
node tools/taskflow/taskflow-md.mjs validate-timing --file _local/taskflow/TF-GOV-12/timing-fixture-pass.md
node tools/taskflow/taskflow-md.mjs complete-node --file _local/taskflow/TF-GOV-12/timing-fixture-fail.md --node TF-GOV-12-N01 --result '这条不应成功' --validation PASS --evidence EVD-GOV-12-FAIL --timing-trusted
node tools/taskflow/taskflow-md.mjs validate-timing --file docs/tasks/runs/TF-TIMING-VERIFY-01-RUN-v0.6.33.45.md
```

验证结果：

| 场景 | 结果 | 证据 |
|---|---|---|
| 证据先落盘，再 complete --timing-trusted | PASS | `_local/taskflow/TF-GOV-12/pass-validate-timing.log` |
| 证据 mtime 晚于 completedAt | PASS：可信耗时被拒绝 | `_local/taskflow/TF-GOV-12/fail-complete.stderr` |
| 复查旧运行文件 TF-TIMING-VERIFY-01-RUN | PASS：成功识别 N04 耗时不可信 | `_local/taskflow/TF-GOV-12/old-run-validate-timing.stderr` |

## 5. 结论

本次修复没有新增复杂耗时体系，只补上最直接的可信耗时门禁：**具体实际耗时必须以节点证据已在完成前落盘为前提**。

后续真实任务中，若要输出具体实际耗时，应按以下顺序执行：

```text
start-node Nxx
执行真实工作
写完产物、验证日志、评审报告和证据文件
complete-node Nxx --timing-trusted --evidence <EvidenceRef>
validate-timing
```

如果无法满足，应输出“未精确计时”。
