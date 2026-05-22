# 结构化计划 Markdown 模板

> 用途：用于 Agent-led Task List 第一阶段，由协同规划岗 / 主智能体生成并持续维护项目计划。  
> 原则：Front Matter 给程序读取计划状态，Markdown 正文给人和智能体理解目标、假设、任务摘要和调整记录。

```md
---
id: PLAN-001
projectId: PROJ-HR-MIGRATION
title: HR 代码迁移计划
status: ACTIVE
ownerRole: planner
ownerAgentId: emp-planner-1
version: 1
createdAt: 2026-05-21T10:00:00+08:00
updatedAt: 2026-05-21T10:30:00+08:00
currentFocus: 先完成用户管理页面迁移与基础验证
taskCount: 4
openDecisionCount: 1
openReviewCount: 2
---

# 项目目标

说明本轮项目希望达成的业务目标、技术目标和交付边界。

## 关键假设

- 假设一：……
- 假设二：……

## 任务清单摘要

<!-- task-summary:start -->
- TASK-001：用户管理页面迁移，状态 TODO。
- TASK-002：接口兼容性验证，状态 TODO。
<!-- task-summary:end -->

## 计划调整记录

<!-- plan-updates:start -->
暂无调整。
<!-- plan-updates:end -->

## 当前下一步

<!-- next-action:start -->
等待协同规划岗分派第一批任务。
<!-- next-action:end -->
```

## 程序更新规则

```text
1. 程序可以更新 Front Matter 中的 status、version、updatedAt、currentFocus、taskCount、openDecisionCount、openReviewCount。
2. 程序可以更新 task-summary、plan-updates、next-action 标记区块。
3. 程序不应整体重写计划正文中的目标和假设，除非由协同规划岗明确重规划。
4. 计划调整建议同步追加到 events/PLAN-001.events.jsonl。
```
