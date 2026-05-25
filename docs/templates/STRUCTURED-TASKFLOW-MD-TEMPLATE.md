# STRUCTURED-TASKFLOW-MD-TEMPLATE

> 文档类型：结构化 Markdown 任务流模板  
> 适用对象：taskflow skill、上层 taskflow runner、智能软件工厂 Agent-led Task List POC  
> 当前基线：v0.6.33.45 / taskflow v0.9.16  
> 维护规则：正文可读，Front Matter 可解析；机器更新应优先局部更新 Front Matter、标记区块和事件区，避免重写人工正文。

---
schema: agent-team.taskflow.v1
flowId: TF-EXAMPLE-001
title: 示例任务流名称
baseline: v0.6.33.45 / taskflow v0.9.16
mode: delegated-auto-visible
status: planned
ownerAgentId: emp-planner-001
createdAt: 2026-05-24T00:00:00Z
updatedAt: 2026-05-24T00:00:00Z
estimatedTotal: 低到中复杂度
progress:
  done: 0
  total: 0
  currentNodeId: null
freezeItems:
  - 不改产品版本号
  - 不扩大本轮范围
pauseGates:
  - P0/P1 风险或可能破坏当前基线
  - 范围变更或冻结项需要调整
  - 关键产品/技术决策
  - 依赖缺失且执行者无法自行补齐
  - 验证/评审多轮修复后仍不收敛
  - 需要用户验收、同步、下载、发布或授权
---

## 1. SOW / 工作范围

<!-- TASKFLOW:SOW:START -->

### 目标

一句话说明本轮任务流要交付什么结果。

### 范围内

- 工作项 A
- 工作项 B

### 范围外

- 不做事项 A
- 不做事项 B

### 验收模式

- `delegated-auto-visible`：低打扰自动推进，节点 start/done 输出到主对话正文。
- `checkpoint`：逐节点人工验收或降级测试。
- `manual`：关键节点需要用户确认。

<!-- TASKFLOW:SOW:END -->

## 2. 节点清单

<!-- TASKFLOW:NODES:START -->

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 | 依赖 | 暂停门禁 |
|---|---|---|---|---|---|---|
| TF-EXAMPLE-001-N01 | 节点名称 | 本节点要达成什么结果 | 怎样判断节点完成 | 低复杂度 | 无 | 无 |
| TF-EXAMPLE-001-N02 | 节点名称 | 本节点要达成什么结果 | 怎样判断节点完成 | 中复杂度 | TF-EXAMPLE-001-N01 | 需要关键决策时暂停 |

<!-- TASKFLOW:NODES:END -->

## 3. 节点执行状态

机器可更新区。执行过程中只更新本节表格，不重写上方人工说明。

<!-- TASKFLOW:STATUS:START -->

| 节点 | 状态 | 开始时间 | 完成时间 | 结果 | 验证 | 证据 | 实际耗时 |
|---|---|---|---|---|---|---|---|
| TF-EXAMPLE-001-N01 | todo | - | - | - | - | - | - |
| TF-EXAMPLE-001-N02 | todo | - | - | - | - | - | - |

<!-- TASKFLOW:STATUS:END -->

## 4. 验收标准

<!-- TASKFLOW:ACCEPTANCE:START -->

- 每个节点都有明确目标、验收点、预计耗时和证据要求。
- 普通节点完成后自动推进，不要求用户无意义点击继续。
- 每个节点开始和完成必须进入主对话正文；Activity / 工具日志不算用户可见同步。
- 完成消息必须包含 `进度 x/y`、验证、证据、预计耗时和实际耗时。
- 最终总结必须输出 7 列节点进度表：节点 / 目标 / 结果 / 验证 / 证据 / 预计耗时 / 实际耗时。

<!-- TASKFLOW:ACCEPTANCE:END -->

## 5. 证据引用

<!-- TASKFLOW:EVIDENCE:START -->

| 证据 ID | 类型 | 路径 / 链接 | 关联节点 | 说明 |
|---|---|---|---|---|
| EVD-001 | DOC | docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md | TF-EXAMPLE-001-N01 | 模板文档 |

<!-- TASKFLOW:EVIDENCE:END -->

## 6. 阻塞与待决策

<!-- TASKFLOW:BLOCKERS:START -->

| ID | 类型 | 关联节点 | 问题 | 建议动作 | 状态 |
|---|---|---|---|---|---|
| BLK-001 | DEPENDENCY_MISSING | TF-EXAMPLE-001-N02 | 缺少输入资料 | 补充资料后恢复 | open |

<!-- TASKFLOW:BLOCKERS:END -->

<!-- TASKFLOW:DECISIONS:START -->

| ID | 关联节点 | 问题 | 选项 | 推荐 | 状态 |
|---|---|---|---|---|---|
| DEC-001 | TF-EXAMPLE-001-N02 | 是否调整范围？ | 保持范围；扩大范围；拆到下一轮 | 保持范围 | open |

<!-- TASKFLOW:DECISIONS:END -->

## 7. 事件记录

事件区用于追加 TaskEvent。真实系统中可拆成 `.jsonl`，Markdown 中保留最近关键事件摘要。

<!-- TASKFLOW:EVENTS:START -->

```jsonl
{"eventId":"EVT-001","flowId":"TF-EXAMPLE-001","nodeId":"TF-EXAMPLE-001-N01","type":"FLOW_CREATED","summary":"创建任务流","createdAt":"2026-05-24T00:00:00Z","evidenceRefs":[]}
```

<!-- TASKFLOW:EVENTS:END -->

## 8. 最终总结

任务完成后输出完整 7 列节点进度表。

<!-- TASKFLOW:SUMMARY:START -->

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-EXAMPLE-001-N01 | - | - | - | - | - | - |

<!-- TASKFLOW:SUMMARY:END -->

## 9. 字段映射

| 模板字段 | skill / runner 用途 | 产品化对象 |
|---|---|---|
| `flowId` | 任务流标识 | TaskFlowPlan.flowId |
| `baseline` | 当前基线 | WorkItem.baseline |
| `mode` | 执行模式 | WorkItem.acceptanceMode |
| `freezeItems` | 冻结项 | SOW.freezeItems |
| 节点清单 | 计划与执行单元 | WorkItemNode / TaskTicket |
| 节点执行状态 | 进度恢复与总结 | TaskEvent / TaskTicket.status |
| 证据引用 | 验收证据 | EvidenceRef |
| 阻塞与待决策 | 暂停门禁 | Blocker / DecisionItem |
| 事件记录 | 可追溯事实 | TaskEvent |
