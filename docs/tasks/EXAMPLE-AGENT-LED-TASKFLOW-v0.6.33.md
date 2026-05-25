# EXAMPLE-AGENT-LED-TASKFLOW v0.6.33

> 文档类型：结构化 Markdown 任务流示例  
> 用途：作为后续 Agent-led Task List POC 的输入样例  
> 模板来源：`docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md`  
> 当前基线：v0.6.33.45 / taskflow v0.9.16

---
schema: agent-team.taskflow.v1
flowId: TF-POC-MD-01
title: Agent-led Task List POC 样例任务流
baseline: v0.6.33.45 / taskflow v0.9.16
mode: delegated-auto-visible
status: planned
ownerAgentId: emp-planner-001
createdAt: 2026-05-24T00:00:00Z
updatedAt: 2026-05-24T00:00:00Z
estimatedTotal: 中复杂度
progress:
  done: 0
  total: 5
  currentNodeId: TF-POC-MD-01-N01
freezeItems:
  - 不实现完整数据库
  - 不引入前端工程改造
  - 不改变产品版本号
pauseGates:
  - 需要选择正式持久化目录规范
  - 需要选择解析脚本技术栈
  - P0/P1 风险或范围变更
---

## 1. SOW / 工作范围

<!-- TASKFLOW:SOW:START -->

### 目标

验证主智能体能基于结构化 Markdown 维护任务计划、节点状态、事件记录和证据引用，为智能软件工厂后续产品化 Taskflow 打基础。

### 范围内

- 建立一个样例工作区目录结构。
- 用结构化 Markdown 表达计划、任务、审查、待决策和事件。
- 验证 Front Matter 与标记区块可被脚本读取和局部更新。
- 形成 POC 评审结论。

### 范围外

- 不做数据库表结构迁移。
- 不接真实 OpenCode / Codex Runtime。
- 不做前端页面联调。
- 不做多数字员工并行调度。

### 验收模式

`delegated-auto-visible`：节点之间自动推进；节点 start/done 输出到主对话正文；只有遇到暂停门禁才请求用户介入。

<!-- TASKFLOW:SOW:END -->

## 2. 节点清单

<!-- TASKFLOW:NODES:START -->

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 | 依赖 | 暂停门禁 |
|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | 样例工作区搭建 | 建立 project-workspace 样例目录 | 包含 plan、tasks、reviews、decisions、events、artifacts | 中复杂度 | 无 | 无 |
| TF-POC-MD-01-N02 | Front Matter 读取 | 实现最小读取脚本或规则说明 | 能读取 flowId、taskId、status、ownerAgentId、decisionRequired | 中复杂度 | N01 | 需要选择解析技术栈时暂停 |
| TF-POC-MD-01-N03 | 安全局部更新试点 | 验证只更新 Front Matter 和标记区块 | 不重写整篇 Markdown，保留人工正文 | 中复杂度 | N02 | 若局部更新无法安全实现则暂停 |
| TF-POC-MD-01-N04 | 任务事件追加 | 追加 TaskEvent JSONL 样例 | 状态变化、执行反馈、审查结果可追踪 | 中复杂度 | N03 | 无 |
| TF-POC-MD-01-N05 | POC 评审 | 从主智能体维护任务清单角度评审可行性 | 形成 POC 报告与进入 Guarded Task Flow 的条件 | 低复杂度 | N04 | 评审出现 P0/P1 风险时暂停 |

<!-- TASKFLOW:NODES:END -->

## 3. 节点执行状态

<!-- TASKFLOW:STATUS:START -->

| 节点 | 状态 | 开始时间 | 完成时间 | 结果 | 验证 | 证据 | 实际耗时 |
|---|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | todo | - | - | - | - | - | - |
| TF-POC-MD-01-N02 | todo | - | - | - | - | - | - |
| TF-POC-MD-01-N03 | todo | - | - | - | - | - | - |
| TF-POC-MD-01-N04 | todo | - | - | - | - | - | - |
| TF-POC-MD-01-N05 | todo | - | - | - | - | - | - |

<!-- TASKFLOW:STATUS:END -->

## 4. 验收标准

<!-- TASKFLOW:ACCEPTANCE:START -->

- 样例能被人直接阅读，也能被脚本按 Front Matter 和标记区块解析。
- 节点粒度是可验收工作包，不把小编辑拆成过细节点。
- 任务事件、证据、阻塞、待决策都有固定记录位置。
- 用户可见过程遵循 taskflow v0.9.16：自动推进、start/done 简洁输出、最终 7 列总结。

<!-- TASKFLOW:ACCEPTANCE:END -->

## 5. 证据引用

<!-- TASKFLOW:EVIDENCE:START -->

| 证据 ID | 类型 | 路径 / 链接 | 关联节点 | 说明 |
|---|---|---|---|---|
| EVD-POC-001 | DOC | docs/tasks/EXAMPLE-AGENT-LED-TASKFLOW-v0.6.33.md | TF-POC-MD-01-N01 | 本样例任务流 |
| EVD-POC-002 | TEMPLATE | docs/templates/STRUCTURED-TASKFLOW-MD-TEMPLATE.md | TF-POC-MD-01-N02 | 结构化任务流模板 |

<!-- TASKFLOW:EVIDENCE:END -->

## 6. 阻塞与待决策

<!-- TASKFLOW:BLOCKERS:START -->

| ID | 类型 | 关联节点 | 问题 | 建议动作 | 状态 |
|---|---|---|---|---|---|
| BLK-POC-001 | DEPENDENCY_MISSING | TF-POC-MD-01-N02 | 尚未确定正式解析脚本位置 | POC 阶段先放入 tools/taskflow，正式阶段再迁移 | open |

<!-- TASKFLOW:BLOCKERS:END -->

<!-- TASKFLOW:DECISIONS:START -->

| ID | 关联节点 | 问题 | 选项 | 推荐 | 状态 |
|---|---|---|---|---|---|
| DEC-POC-001 | TF-POC-MD-01-N03 | 局部更新策略是否限定为 Front Matter + 标记区块？ | 限定；允许重写全文；全部改为 JSON | 限定为 Front Matter + 标记区块 | open |

<!-- TASKFLOW:DECISIONS:END -->

## 7. 事件记录

<!-- TASKFLOW:EVENTS:START -->

```jsonl
{"eventId":"EVT-POC-001","flowId":"TF-POC-MD-01","nodeId":null,"type":"FLOW_CREATED","summary":"创建 Agent-led Task List POC 样例任务流","createdAt":"2026-05-24T00:00:00Z","evidenceRefs":["EVD-POC-001"]}
{"eventId":"EVT-POC-002","flowId":"TF-POC-MD-01","nodeId":"TF-POC-MD-01-N01","type":"NODE_PLANNED","summary":"计划搭建样例工作区","createdAt":"2026-05-24T00:00:00Z","evidenceRefs":[]}
```

<!-- TASKFLOW:EVENTS:END -->

## 8. 最终总结

<!-- TASKFLOW:SUMMARY:START -->

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | 建立 project-workspace 样例目录 | 待执行 | 未记录 | - | 中复杂度 | - |
| TF-POC-MD-01-N02 | 实现最小读取脚本或规则说明 | 待执行 | 未记录 | - | 中复杂度 | - |
| TF-POC-MD-01-N03 | 验证只更新 Front Matter 和标记区块 | 待执行 | 未记录 | - | 中复杂度 | - |
| TF-POC-MD-01-N04 | 追加 TaskEvent JSONL 样例 | 待执行 | 未记录 | - | 中复杂度 | - |
| TF-POC-MD-01-N05 | 形成 POC 报告与下一步条件 | 待执行 | 未记录 | - | 低复杂度 | - |

<!-- TASKFLOW:SUMMARY:END -->
