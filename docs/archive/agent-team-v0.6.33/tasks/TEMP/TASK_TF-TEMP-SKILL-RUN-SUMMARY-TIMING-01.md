# TASK_TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01｜任务正式记录

> 文档类型：Task / 任务正式记录  
> 任务：TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01  
> 所属：TEMP  
> 当前基线：TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01-N04  
> 执行日期：2026-05-25  
> 结果：PASS

---

## 0. 执行计划快照

```text
▶ TaskFlow Plan
ID: TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01
BelongsTo: TEMP
Status: PLAN · TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01-N04
Time: StartedAt 2026-05-25 18:06 · Estimate S-M / 20-40m

1) Overview
  Goal: 修正 taskflow 运行摘要重复与节点耗时展示问题。
  Scope: 只改 taskflow skill、脚本摘要模板和 README/QA 说明；不改业务设计文档、不清理历史 Task 正式记录。

2) Nodes
  N01 问题定位  未估算  目标: 问题定位
  N02 模板修正  未估算  目标: 模板修正
  N03 计时规则修正  未估算  目标: 计时规则修正
  N04 验证收口  未估算  目标: 验证收口

3) Gate
  - 无特殊暂停门禁

4) Expected Artifacts
  - skills/taskflow/skill.md
  - skills/taskflow/scripts/taskflow.mjs
  - skills/taskflow/README.md
  - skills/taskflow/references/README.md
  - skills/taskflow/references/QA-REPORT.md
  - docs/tasks/<WorkItemId>/RUN_TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01.md
  Note: 初始预计，实际以 Run Summary / Task 正式记录为准。
```

---

## 1. 执行概览

| 任务 | 结果 | 进度 | 总耗时 |
|---|---:|---:|---:|
| TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01｜taskflow 运行摘要去重与耗时展示修正 | PASS | 4/4 | 未精确计时 |

| 当前基线 | 验证 | 本轮结论 | 下一步 |
|---|---:|---|---|
| TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01-N04 | PASS | 已完成 taskflow 运行摘要去重和耗时展示修正：Overview 只描述当前完成情况，最后一段改为 Next；节点摘要只显示实际耗时或未精确计时，不再显示无意义的开始-结束分钟段。 | 后续任务流继续使用 v0.9.15；若需要准确耗时，必须用 start-node/done-node 包住真实执行过程，或在 done-node 中传入可信 --actual。 |

---

## 2. 步骤摘要

| 步骤 | 状态 | 目标与产出 | 验证证据 |
|---|---:|---|---|
| N01 问题定位 | PASS | 目标：问题定位；产出：确认重复来自 Run Summary 前置区、Overview 的 Next、Decision 三处语义重叠；确认耗时不准来自账本未覆盖真实执行过程且 timingConfirmed=false。；耗时：未精确计时 | PASS |
| N02 模板修正 | PASS | 目标：模板修正；产出：已将 Run Summary 改为：Overview 只输出 Current；最后一段改为 5) Next；去掉 Decision。；耗时：未精确计时 | PASS |
| N03 计时规则修正 | PASS | 目标：计时规则修正；产出：已将节点摘要改为只显示 耗时: <actual>，不再输出 17:55-17:55 这类无意义起止时间；并补充可靠计时规则。；耗时：未精确计时 | PASS |
| N04 验证收口 | PASS | 目标：验证收口；产出：通过 node --check 与 render-run-summary 样例验证；已生成本次 Task 正式记录。；耗时：未精确计时 | PASS |

---

## 3. 问题与遗留

| 类型 | 级别 | 内容 | 处理方式 |
|---|---:|---|---|
| 无阻塞 | - | 未发现 P0/P1 问题 | 可继续下一步 |

---

## 4. 产物

| 类型 | 产物 |
|---|---|
| 产物 | `skills/taskflow/skill.md` |
| 产物 | `skills/taskflow/scripts/taskflow.mjs` |
| 产物 | `skills/taskflow/README.md` |
| 产物 | `skills/taskflow/references/README.md` |
| 产物 | `skills/taskflow/references/QA-REPORT.md` |
| 产物 | `docs/tasks/<WorkItemId>/RUN_TF-TEMP-SKILL-RUN-SUMMARY-TIMING-01.md` |

---

## 5. 结论

已完成 taskflow 运行摘要去重和耗时展示修正：Overview 只描述当前完成情况，最后一段改为 Next；节点摘要只显示实际耗时或未精确计时，不再显示无意义的开始-结束分钟段。
