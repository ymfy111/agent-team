# STRUCTURED-DECISION-MD-TEMPLATE

> 文档类型：DecisionItem / 待决策模板  
> 适用场景：TaskFlow 执行中的关键取舍、用户确认、范围变化或阻塞解除。  
> 原则：待决策不是聊天记录，应具备问题、选项、推荐方案、影响和处理结果。

---

```yaml
id: DEC-EXAMPLE-001
relatedPlan: PLAN-EXAMPLE
relatedStage: STAGE-01
relatedWorkItem: TF-EXAMPLE-IMPL
relatedTaskFlow: TF-EXAMPLE-001
relatedTaskTicket: TF-EXAMPLE-001-N02
status: open
priority: P1
createdAt: 2026-05-25
updatedAt: 2026-05-25
recommendedOption: option-a
resolvedBy: null
resolvedAt: null
```

# DEC-EXAMPLE-001｜待决策事项

## 1. 问题

说明需要决策的问题。

## 2. 背景

说明问题来自哪个计划、阶段、工作项、任务或步骤，以及为什么需要用户/评审方介入。

## 3. 可选方案

| 选项 | 说明 | 优点 | 风险 |
|---|---|---|---|
| option-a | 方案 A | 优点 | 风险 |
| option-b | 方案 B | 优点 | 风险 |

## 4. 推荐方案

建议选择的方案及理由。

## 5. 影响范围

| 影响对象 | 影响说明 |
|---|---|
| WorkItem / TaskFlow / TaskTicket | 说明影响。 |

## 6. 处理结果

| 状态 | 处理人 | 时间 | 结论 |
|---|---|---|---|
| open | - | - | 等待处理 |
