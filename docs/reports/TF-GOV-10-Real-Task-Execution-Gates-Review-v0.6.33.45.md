# TF-GOV-10｜真实任务执行偏差修正评审

## 结论

本轮评审确认：`TF-POC-MD-01` 的文档与脚本产物具有 POC 价值，但上一轮 taskflow 执行过程不合格，不能作为通过案例继续推进。已将 taskflow 升级到 v0.9.19，并为真实任务增加节点一致性、真实耗时、Batch 可视化审计、Blocker/Decision、证据落盘五类硬门禁。

## 发现的问题

| 问题 | 结论 | 证据 |
|---|---|---|
| 节点清单不一致 | FAIL | 用户确认节点为“POC 边界复核/解析与更新契约设计/实现最小脚本/示例任务流跑通/文档同步与独立评审”，运行副本节点变成了样例任务流节点。 |
| 实际耗时不可信 | FAIL | 节点记录均为 1s 左右，更像脚本补账本耗时，而不是真实节点执行耗时。 |
| open blocker/decision 未处理 | FAIL | `validate-gates` 检出 1 个 open blocker 与 1 个 open decision。 |
| 证据未落盘或证据过泛 | FAIL | `validate-evidence --strict` 检出 3 条泛化证据。 |
| 产物状态 | PARTIAL | `taskflow-md.mjs` 与运行副本可作为 POC 草稿保留。 |

## 工具验证记录

```text
validate-basic: VALID nodes=5 events=12 progress=5/5
check-plan: PLAN_MISMATCH
validate-gates: GATES_OPEN blockers=1 decisions=1
validate-evidence: EVIDENCE_INVALID count=3
```

本地证据：

```text
_local/taskflow/TF-GOV-10/check-plan.log
_local/taskflow/TF-GOV-10/validate-gates.log
_local/taskflow/TF-GOV-10/validate-evidence.log
_local/taskflow/TF-GOV-10/validate-basic.log
_local/taskflow/TF-POC-MD-01-confirmed-plan.json
```

## 本轮修正

| 文件 | 修正内容 |
|---|---|
| `skills/taskflow/SKILL.md` | 升级 v0.9.19，新增真实任务执行硬门禁。 |
| `skills/taskflow/README.md` | 同步 v0.9.19 说明。 |
| `skills-README.md` | 同步技能包总入口。 |
| `tools/taskflow/taskflow-md.mjs` | 新增 `check-plan`、`validate-gates`、`validate-evidence`；`complete-node` 默认不再把命令间隔当作可信实际耗时。 |
| `docs/guides/TASKFLOW-GOVERNANCE-v0.9.19.md` | 新增治理指南。 |
| `docs/reports/TF-POC-MD-01-Agent-Led-Task-List-POC-Review-v0.6.33.45.md` | 追加执行复盘更正，原 PASS 降级。 |

## 独立评审

| 维度 | 结论 | 说明 |
|---|---|---|
| 产品价值 | PASS | 真实任务门禁能防止“产物做了但流程跑偏”。 |
| 执行治理 | PASS | 节点一致性和证据落盘成为硬约束。 |
| 诚实性 | PASS | 不再把脚本补账本耗时当作真实耗时。 |
| 遗留风险 | MEDIUM | 仍需重跑 TF-POC-MD-01 才能形成合格执行案例。 |

## 建议

下一步不要直接进入 Guarded Flow 设计，先按 v0.9.19 重跑 `TF-POC-MD-01`，确保真实任务执行符合硬门禁。
