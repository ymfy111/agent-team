# TF-TEMP-TASK-BATCH-SKILL-01｜task-batch 批量任务执行 skill 改造

- WorkItem: TF-TEMP
- Status: PASS
- StartedAt: 2026-05-28 21:24:00 +0800
- FinishedAt: 2026-05-28 21:46:50 +0800

## 目标

将 task-stack 试验版收敛为 task-batch / 任务批次 skill，支持同一 WorkItem 下已计划 Task 的连续执行。

## 结果

- 新增 `skills/task-batch/` 通用 skill 包。
- BatchId 规则调整为 `TB-<WorkItem简称>-<两位序号>`。
- 批次日志路径调整为 `.runtime/batches/<BatchId>.json`。
- 开始输出候选任务清单或 TaskBatch Plan。
- 完成输出由脚本读取 batch + child exec 文件生成。
- 子任务缺失 nodes[] 时标记 WARN / NON_COMPLIANT。

## 产物

- `/mnt/data/task-batch-skill-v0.2.0.zip`
