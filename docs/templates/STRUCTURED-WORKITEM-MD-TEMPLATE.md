# STRUCTURED-WORKITEM-MD-TEMPLATE

> 文档类型：WorkItem / 工作项模板  
> 适用目录：`docs/workitems/`  
> 命名规则：`TF-<领域>-<动作>.md` 或 `WI-<领域>-<动作>.md`  
> 用途：一个主文档对应一个 WorkItem，管理一组相关 TaskFlow 的状态、产物和下一步。

---

```yaml
id: TF-EXAMPLE-IMPL
title: 示例工作项
status: running
owner: planner
parentPlan: docs/plans/PLAN-EXAMPLE.md
parentStage: STAGE-01
createdAt: 2026-05-25
updatedAt: 2026-05-25
currentTaskFlow: TF-EXAMPLE-IMPL-01
```

# TF-EXAMPLE-IMPL｜示例工作项

## 1. 工作项定位

说明本工作项承接哪个计划和阶段，要交付什么能力或结果。

## 2. 所属计划 / 阶段

| 层级 | 值 |
|---|---|
| 所属计划 | `docs/plans/PLAN-EXAMPLE.md` |
| 所属阶段 | STAGE-01｜阶段名称 |
| 当前状态 | running |
| 当前焦点 | TF-EXAMPLE-IMPL-01 |

## 3. TaskFlow 状态清单

| TaskFlow | 状态 | 目标 | 关键产出 | Run | Report | 下一步 |
|---|---:|---|---|---|---|---|
| TF-EXAMPLE-IMPL-01 | running | 完成某项能力 | 待产出 | `docs/tasks/TF-EXAMPLE-IMPL/TASK_TF-EXAMPLE-IMPL-01.md` | `docs/reports/RPT-TF-EXAMPLE-IMPL-01-Review-vX.md` | 执行中 |
| TF-EXAMPLE-IMPL-02 | planned | 后续能力 | 待产出 | 待生成 | 待生成 | 待执行 |

状态建议：`planned / ready / running / done / accepted / blocked / deferred / superseded`。

## 4. 当前下一步

说明下一步应执行哪个 TaskFlow，以及执行前需要确认的输入、依赖或冻结项。

## 5. 问题与遗留

| 类型 | 级别 | 内容 | 处理方式 |
|---|---:|---|---|
| 无阻塞 | - | 当前无 P0/P1 阻塞 | 可继续 |

## 6. 运行记录与评审报告

| 类型 | 文件 | 说明 |
|---|---|---|
| Run | `docs/tasks/<WorkItemId>/TASK_<TaskId>.md` | 某次 TaskFlow 执行记录 |
| Report | `docs/reports/...` | 评审、验证或复盘报告 |

## 7. 更新记录

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-05-25 | 创建工作项 | 初始版本 |
```

## 使用规则

1. WorkItem 是阶段下的工作组织单元，不是单个 TaskTicket。
2. WorkItem 文档只维护任务流清单、状态和链接，不复制运行日志。
3. TaskFlow 执行完成后，回写 TaskFlow 状态、关键产出、Run / Report 链接和下一步。
4. 文件名通常不带版本号，作为活文档持续维护。
