# TF-GUARDED-FLOW-NEXT｜Guarded Task Flow 后续最小实现建议

> 基线：v0.6.33.45  
> 来源：`TF-GUARDED-FLOW-01` 设计任务  
> 原则：只围绕已暴露问题做最小实现，不直接升级完整状态机。

## 推荐顺序

| 任务 | 目标 | 产物 | 暂停门禁 |
|---|---|---|---|
| TF-GF-IMPL-01 依赖检查 | 在 `start-node` 前检查依赖节点状态。 | `taskflow-md.mjs` 增加 `validate-dependencies` 或内置启动检查。 | 依赖表结构不稳定时暂停。 |
| TF-GF-IMPL-02 Blocker/Decision 检查 | 节点完成前检查 open blocker / decision。 | `validate-gates` 恢复或重做为最小命令。 | 发现 P0/P1 open 项时暂停。 |
| TF-GF-IMPL-03 验证失败状态 | 允许节点进入 `needs_review` / `blocked`，而不是强行 done。 | `complete-node --status needs_review|blocked` 最小支持。 | 状态语义影响模板兼容时暂停。 |
| TF-GF-IMPL-04 恢复记录 | 为暂停节点追加恢复条件和恢复事件。 | `resume-node` 或 `append-event` 最小支持。 | 恢复条件缺失时暂停。 |
| TF-GF-REVIEW-01 产品化映射评审 | 评审 Guarded Flow 到 TaskTicket / Blocker / DecisionItem 的映射。 | 设计评审报告。 | 发现过度设计倾向时暂停。 |

## 本轮不建议做的事

- 不做完整图形化流程设计器。
- 不做 BPMN / 状态机引擎。
- 不把工具内部状态直接暴露到用户原型。
- 不把所有状态一次性接入前端。

## 最小验收口径

后续每个实现任务都应能在结构化 Markdown 运行副本上复现：

```text
输入：有依赖 / blocker / decision / validation fail 的任务流副本
执行：对应命令
输出：正确暂停、拒绝完成或记录状态
证据：运行副本 + 命令输出 + 评审结论
```
