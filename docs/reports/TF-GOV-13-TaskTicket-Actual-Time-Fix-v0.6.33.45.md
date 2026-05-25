# TF-GOV-13｜TaskTicket 实际开始/完成时间收敛

## 背景

用户指出：任务节点 / TaskTicket 开始和结束时应直接记录实际时间，耗时由时间相减得到。此前 `--timing-trusted` 让耗时口径变复杂，容易偏离问题本身。

## 修复目标

仅围绕耗时不准问题做最小修复：

- 节点状态表直接记录 `实际开始时间`、`实际完成时间`、`实际耗时`。
- `start-node` 写实际开始时间。
- `complete-node` 在证据落盘门禁通过后写实际完成时间。
- `实际耗时 = 实际完成时间 - 实际开始时间`。
- 不再把 `--timing-trusted` 作为主流程概念。

## 修改范围

- `tools/taskflow/taskflow-md.mjs`
- `docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md`
- `skills/taskflow/SKILL.md`
- `skills/taskflow/README.md`
- `skills-README.md`
- `docs/guides/TASKFLOW-GOVERNANCE-v0.9.21.md`
- `docs/changes/CHANGELOG-v0.6.33.md`
- `docs/文档导航.md`

## 验证结果

```text
node --check tools/taskflow/taskflow-md.mjs：PASS
validate template：PASS
start-node：写入实际开始时间
complete-node：写入实际完成时间，并自动计算实际耗时
validate-timing pass case：TIMING_EVIDENCE_OK
validate-timing fail case：TIMING_EVIDENCE_FAIL，能发现证据晚于实际完成时间
```

## 回归样例

通过样例：

```text
COMPLETED TF-EXAMPLE-001-N01 1/2 1s
TIMING_EVIDENCE_OK concreteNodes=1 warnings=0
```

失败样例：

```text
TIMING_EVIDENCE_FAIL
- TF-EXAMPLE-001-N01: evidence EVD-001 mtime is later than completedAt
```

## 结论

PASS。耗时口径已收敛为 TaskTicket/节点事实账本：开始记录实际开始时间，完成记录实际完成时间，耗时直接相减。证据晚于完成时间时，耗时校验失败。
