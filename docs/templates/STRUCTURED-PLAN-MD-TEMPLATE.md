# STRUCTURED-PLAN-MD-TEMPLATE

> 文档类型：Plan / Stage / Roadmap 模板  
> 适用目录：`docs/plans/`  
> 命名规则：`PLAN-<主题>.md`  
> 用途：描述计划、阶段、工作项总览和当前焦点，不承载具体执行日志。

---

```yaml
id: PLAN-EXAMPLE
title: 示例计划
status: active
owner: planner
createdAt: 2026-05-25
updatedAt: 2026-05-25
currentStage: STAGE-01
currentFocus: WI-EXAMPLE-IMPL
```

# PLAN-EXAMPLE｜示例计划

## 1. 计划定位

说明本计划为什么存在、要解决什么问题、与 PRD / SDD / 子设计的关系。

## 2. 阶段清单

| 阶段 | 状态 | 目标 | 工作项 | 备注 |
|---|---:|---|---|---|
| STAGE-01｜阶段名称 | running | 阶段目标 | WI-EXAMPLE-IMPL | 当前阶段 |
| STAGE-02｜阶段名称 | planned | 阶段目标 | 待拆分 | 后续 |

状态建议：`planned / ready / running / done / accepted / blocked / deferred / superseded`。

## 3. 工作项总览

| 工作项 | 所属阶段 | 状态 | 目标 | 文档 |
|---|---|---:|---|---|
| WI-EXAMPLE-IMPL | STAGE-01 | running | 承接阶段目标的一组相关 TaskFlow | `docs/workitems/WI-EXAMPLE-IMPL.md` |

## 4. 当前焦点

- 当前阶段：STAGE-01
- 当前工作项：WI-EXAMPLE-IMPL
- 下一步建议：说明下一步优先推进什么。

## 5. 暂缓 / 后续

| 项 | 原因 | 重新评估条件 |
|---|---|---|
| 示例后续项 | 当前不在 P0 范围 | 阶段完成后评估 |

## 6. 关联文档

| 类型 | 文档 | 说明 |
|---|---|---|
| 主需求 | `docs/specs/PRD-vX.md` | 需求边界 |
| 主设计 | `docs/specs/SDD-vX.md` | 系统设计边界 |
| 子设计 | `docs/specs/SDD-<主题>-vX.md` | 专项设计 |
| 工作项 | `docs/workitems/<WorkItem>.md` | 具体工作项入口 |

## 7. 更新记录

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-05-25 | 创建计划 | 初始版本 |
```

## 使用规则

1. Plan 文档说明阶段目标和工作项，不写详细 TaskTicket 节点。
2. 一个计划可以包含多个阶段，一个阶段可以包含多个工作项。
3. 工作项状态变化后，应回写本计划的“工作项总览”或“当前焦点”。
4. 任务流执行细节放入 `docs/workitems/runs/`，不要复制进 Plan。
