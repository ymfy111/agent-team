# TF-TEMP-TASK-STACK-SKILL-02｜task-stack 批量执行输出与汇总规范修正

- BelongsTo: TF-TEMP
- Status: PASS
- StartedAt: 2026-05-28 20:40:00 +0800
- FinishedAt: 2026-05-28 21:08:40 +0800

## 目标

修正 task-stack 批量任务执行 skill：开始时必须输出批次任务列表；完成时必须基于每个子任务独立运行报告/exec 账本生成批次汇总，列出任务、状态、开始/结束时间、实际耗时、节点数、合规性和产物。

## 改动

- task-stack 升级到 v0.1.1。
- 新增 `finish --strict-nodes`。
- 新增 `simulate-run --omit-nodes` 测试缺失节点日志场景。
- Batch Summary 从子任务 `.runtime/exec` 读取数据生成。
- 子任务缺失 `nodes[]` 时默认 WARN，严格模式为 NON_COMPLIANT。

## 产物

- task-stack-skill-v0.1.1.zip
