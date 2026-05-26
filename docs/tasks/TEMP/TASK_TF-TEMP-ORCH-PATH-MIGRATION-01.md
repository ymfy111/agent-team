# TASK_TF-TEMP-ORCH-PATH-MIGRATION-01｜ORCH POC 输出路径迁移

> 文档类型：Task / 任务正式记录  
> 任务：TF-TEMP-ORCH-PATH-MIGRATION-01  
> 工作项：TEMP  
> 当前基线：v0.6.33.45  
> 结果：PASS

---

## 0. 派工计划快照

```text
Goal: 将 orchestrator POC 从历史 .taskflow / docs/workitems/runs 路径迁移到 .runtime/orch、.runtime/exec、docs/tasks 这套精简结构，并重新打包实验环境。
Scope: 只改 orchestrator POC 代码、README、配置样例和实验包；不接真实 OpenCode、不做多智能体分配、不扩展 lease/decision/logs 完整目录。
```

## 1. Overview

Current: 已完成 ORCH POC 输出路径迁移。新版 orchestrator 支持从平台侧通过 `--projectRoot` 指向被调度项目，并将运行态写入 `.runtime/orch`、执行态写入 `.runtime/exec`、正式 Task 记录写入 `docs/tasks`。

## 2. Steps

- [PASS] S01 现状复核：确认旧实现仍使用 `.taskflow/` 和 `docs/workitems/runs/`。
- [PASS] S02 代码迁移：改造 `team-orchestrator.mjs`、`mock-adapter.mjs`、`opencode-adapter.mjs`。
- [PASS] S03 文档同步：更新 `tools/orchestrator/README.md` 和配置样例。
- [PASS] S04 验证打包：mock 与 opencode dry-run 均通过，并生成 `ai-factory-lab-orchestrator-poc-v0.1.5.zip`。

## 3. Issues

- 无 P0/P1 阻塞。
- P2：本轮仍未接真实 OpenCode；真实 CLI/API 调用待本地联调确认。

## 4. Actual Artifacts

- `tools/orchestrator/team-orchestrator.mjs`
- `tools/orchestrator/adapters/mock-adapter.mjs`
- `tools/orchestrator/adapters/opencode-adapter.mjs`
- `tools/orchestrator/config.example.json`
- `tools/orchestrator/config.local.example.json`
- `tools/orchestrator/README.md`
- `docs/tasks/TF-TEMP-ORCH-PATH-MIGRATION-01/TASK_TF-TEMP-ORCH-PATH-MIGRATION-01.md`
- `ai-factory-lab-orchestrator-poc-v0.1.5.zip`

## 5. Next

建议使用 `v0.1.5` 包进行本地联调，优先验证 `mock` 和 `opencode dry-run`，再把 `dryRun=false` 接真实 OpenCode。
