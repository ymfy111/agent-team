# TASK_TF-TEMP-ORCH-TIMING-FIX-01｜任务正式记录

> 文档类型：Task / 任务正式记录  
> 任务：TF-TEMP-ORCH-TIMING-FIX-01  
> 工作项：`docs/workitems/TF-RUNTIME-ORCH-POC.md`  
> 当前基线：v0.6.33.45  
> 执行日期：2026-05-26  
> 结果：PASS

---

## 0. 执行计划快照

```text
▶ TaskFlow Plan
ID: TF-TEMP-ORCH-TIMING-FIX-01
BelongsTo: TEMP
Status: PLAN · v0.6.33.45
Time: StartedAt 2026-05-26 03:32 · Estimate S-M / 25-45m

1) Overview
  Goal: 修复 Team Orchestrator 计时语义，把 mock / dry-run 的 adapter 调用耗时与真实任务执行耗时区分开，避免 Run Summary 继续显示误导性的 0s。
  Scope: 只改 orchestrator、adapter、README、相关工作项和运行记录；不改业务设计文档、不接真实 OpenCode、不调整 taskflow skill 核心协议。

2) Nodes
  N01 问题定位      S / 5-10m    目标: 核验当前 team-orchestrator 计时字段和摘要渲染逻辑
  N02 计时修复      M / 10-20m   目标: 增加 timingSource / timingScope / timingConfirmed 语义，mock/dry-run 不再展示为真实任务耗时
  N03 验证回归      S / 5-10m    目标: 跑 mock 与 opencode dry-run，确认摘要显示未精确计时或 <1s 规则
  N04 文档收口      S / 5-10m    目标: 更新 README、工作项和 RUN 记录，输出本轮摘要

3) Gate
  - 如果涉及真实 OpenCode 调用方式，本轮只保留说明，不做联调
  - 如果需要重构 taskflow skill，本轮暂停并另开任务
  - 如果 mock/dry-run 与真实执行耗时无法可靠区分，则保守标记未精确计时

4) Expected Artifacts
  - tools/orchestrator/team-orchestrator.mjs
  - tools/orchestrator/adapters/mock-adapter.mjs
  - tools/orchestrator/adapters/opencode-adapter.mjs
  - tools/orchestrator/README.md
  - docs/workitems/TF-RUNTIME-ORCH-POC.md
  - docs/tasks/<WorkItemId>/RUN_TF-TEMP-ORCH-TIMING-FIX-01.md
```

---

## 1. 执行概览

| 任务 | 结果 | 进度 | 总耗时 |
|---|---:|---:|---:|
| TF-TEMP-ORCH-TIMING-FIX-01｜Orchestrator 计时语义修正 | PASS | 4/4 | 未精确计时 |

| 当前基线 | 验证 | 本轮结论 | 下一步 |
|---|---:|---|---|
| v0.6.33.45 | PASS | 已修正 mock / dry-run 的计时语义，Run Summary 不再把 adapter 调用耗时显示为真实任务耗时。 | 继续本地真实 OpenCode 联调；真实模式下从 task packet 发出到完成口令返回的 wall-clock 才作为节点耗时。 |

---

## 2. 步骤摘要

| 步骤 | 状态 | 目标与产出 | 验证证据 |
|---|---:|---|---|
| N01 问题定位 | PASS | 目标：核验当前计时字段与摘要渲染逻辑。<br>产出：确认根因是 taskflow 真实节点耗时与 orchestrator adapter 调用耗时混用。 | 代码审查：`team-orchestrator.mjs` 原先直接以 adapter 调用差值写入 `actualDurationMs`。 |
| N02 计时修复 | PASS | 目标：增加计时语义字段。<br>产出：新增/规范 `timingSource`、`timingScope`、`timingConfirmed`、`adapterElapsedMs`、`actualDurationLabel`；mock/dry-run 标记为未精确计时。 | `team-orchestrator.mjs`、`mock-adapter.mjs`、`opencode-adapter.mjs` 已更新。 |
| N03 验证回归 | PASS | 目标：验证 mock 与 opencode dry-run 摘要不再显示普通 `0s`。<br>产出：两种模式均显示 `未精确计时（mock/dry-run，仅验证编排链路）`。 | `node --check` 全通过；mock 与 opencode dry-run 均 PASS。 |
| N04 文档收口 | PASS | 目标：更新说明与运行记录。<br>产出：README 和工作项已补充计时语义说明，生成本 RUN。 | `tools/orchestrator/README.md`、`docs/workitems/TF-RUNTIME-ORCH-POC.md`。 |

---

## 3. 问题与遗留

| 类型 | 级别 | 内容 | 处理方式 |
|---|---:|---|---|
| 无阻塞 | - | 未发现 P0/P1 问题 | 可继续本地 OpenCode 联调 |
| 遗留 | P2 | 本轮仍为 mock / dry-run 验证，未接真实 OpenCode | 用户本地将 `opencode.dryRun=false` 后验证真实耗时 |

---

## 4. 产物

| 类型 | 产物 |
|---|---|
| 编排器 | `tools/orchestrator/team-orchestrator.mjs` |
| Mock Adapter | `tools/orchestrator/adapters/mock-adapter.mjs` |
| OpenCode Adapter | `tools/orchestrator/adapters/opencode-adapter.mjs` |
| 说明 | `tools/orchestrator/README.md` |
| 工作项 | `docs/workitems/TF-RUNTIME-ORCH-POC.md` |
| 运行记录 | `docs/tasks/<WorkItemId>/RUN_TF-TEMP-ORCH-TIMING-FIX-01.md` |
| 验证账本 | `.taskflow/taskflows/TF-RUNTIME-ORCH-POC-01.json`、`.taskflow/taskflows/TF-RUNTIME-ORCH-POC-02.json` |

---

## 5. 结论

本轮修复通过。`Team Orchestrator` 已区分 mock / dry-run / real OpenCode 的计时语义：mock 与 dry-run 只验证编排链路，摘要显示为“未精确计时”；真实 OpenCode 完成并返回 `TASK_NODE_DONE / TASK_FLOW_DONE` 后，才把 wall-clock 记录为节点实际耗时。小于 1 秒的真实耗时显示为 `<1s`，不再显示 `0s`。
