# 结构化待决策 Markdown 模板

> 用途：记录需要用户介入的关键取舍，作为待决策工作台和任务单流转的可读载体。  
> 原则：待决策不是聊天记录，应具备问题、选项、推荐方案、风险影响和处理结果。

```md
---
id: DEC-001
projectId: PROJ-HR-MIGRATION
taskId: TASK-001
status: OPEN
priority: P1
ownerRole: planner
createdBy: emp-planner-1
createdAt: 2026-05-21T11:00:00+08:00
updatedAt: 2026-05-21T11:00:00+08:00
recommendedOption: option-a
resolvedBy: null
resolvedAt: null
---

# 待决策事项

## 问题

是否保留旧版导出接口的兼容逻辑？

## 背景

说明为什么需要用户决策，以及该问题来自哪个任务单、哪个团队和哪个执行反馈。

## 可选方案

<!-- options:start -->
### option-a：保留兼容逻辑

优点：风险低；缺点：迁移成本略高。

### option-b：改用新接口

优点：后续维护简单；缺点：需要业务方重新确认。
<!-- options:end -->

## 推荐方案

<!-- recommendation:start -->
建议选择 option-a，先保证迁移风险可控。
<!-- recommendation:end -->

## 风险影响

<!-- impact:start -->
如果不决策，TASK-001 将停留在 NEEDS_DECISION，无法进入审查。
<!-- impact:end -->

## 处理结果

<!-- resolution:start -->
等待用户处理。
<!-- resolution:end -->
```

## 程序更新规则

```text
1. 程序可以更新 status、priority、updatedAt、recommendedOption、resolvedBy、resolvedAt。
2. 程序可以更新 resolution 标记区块。
3. 用户处理后，系统应同步更新关联 TaskTicket 的 status 和 nextStep。
```
