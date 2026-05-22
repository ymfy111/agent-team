# 结构化任务 Markdown 模板

> 用途：用于智能软件工厂第一阶段 Agent-led Task List。  
> 原则：Front Matter 给程序读，Markdown 正文给人和智能体读，标记区块用于安全局部更新。

```md
---
id: TASK-001
projectId: PROJ-HR-MIGRATION
title: 用户管理页面迁移
type: implementation
status: TODO
ownerRole: implementer
ownerAgentId: emp-impl-1-1
reviewerAgentId: emp-review-1-1
priority: P1
createdBy: emp-planner-1
createdAt: 2026-05-21T10:00:00+08:00
updatedAt: 2026-05-21T10:30:00+08:00
nextStep: 执行页面组件迁移并补齐基础验证
decisionRequired: false
artifacts:
  - path: src/pages/user/UserList.vue
  - path: qa/user-migration-result.md
---

# 任务说明

将用户管理页面从 Vue2 + ElementUI 迁移到 Vue3 + Ant Design Vue。

## 输入上下文

- 参考 PRD 第 3.2 节。
- 保持原有查询、分页、导出行为。
- 不改变后端接口。

## 执行要求

1. 完成组件迁移。
2. 保持字段展示一致。
3. 补充基础验证说明。

## 执行反馈

<!-- agent-feedback:start -->
等待实现验证岗回写。
<!-- agent-feedback:end -->

## 审查记录

<!-- review:start -->
等待交付审查岗审查。
<!-- review:end -->

## 待决策

<!-- decision:start -->
暂无待决策事项。
<!-- decision:end -->
```

## 程序更新规则

```text
1. 程序可以更新 Front Matter 中的 status、ownerAgentId、priority、nextStep、decisionRequired、updatedAt。
2. 程序可以更新 agent-feedback、review、decision 标记区块。
3. 程序不应整体重写 Markdown 正文。
4. 任务历史事件建议追加到 events/TASK-001.events.jsonl。
5. 后期如接入数据库，Markdown 仍可作为可读视图导出。
```
