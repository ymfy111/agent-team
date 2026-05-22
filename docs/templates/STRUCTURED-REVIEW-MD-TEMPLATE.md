# 结构化审查 Markdown 模板

> 用途：记录交付审查岗对任务产物的审查意见，作为通过、返工、待决策的依据。  
> 原则：审查结论必须可回写任务单，不应只存在于聊天记录中。

```md
---
id: REV-001
projectId: PROJ-HR-MIGRATION
taskId: TASK-001
status: OPEN
reviewerRole: reviewer
reviewerAgentId: emp-review-1-1
result: PENDING
createdAt: 2026-05-21T12:00:00+08:00
updatedAt: 2026-05-21T12:00:00+08:00
requiresRework: false
requiresDecision: false
---

# 审查记录

## 审查对象

说明本次审查的任务、产物、代码路径、文档路径或验证结果。

## 审查结论

<!-- review-result:start -->
等待交付审查岗填写。
<!-- review-result:end -->

## 发现问题

<!-- issues:start -->
暂无。
<!-- issues:end -->

## 返工要求

<!-- rework:start -->
暂无返工要求。
<!-- rework:end -->

## 后续流转建议

<!-- next-flow:start -->
等待审查结论。
<!-- next-flow:end -->
```

## 程序更新规则

```text
1. 程序可以更新 status、result、updatedAt、requiresRework、requiresDecision。
2. 程序可以更新 review-result、issues、rework、next-flow 标记区块。
3. 如果 requiresRework=true，关联任务应回到 RUNNING 或 REWORK。
4. 如果 requiresDecision=true，系统应创建或关联 DecisionItem。
```
