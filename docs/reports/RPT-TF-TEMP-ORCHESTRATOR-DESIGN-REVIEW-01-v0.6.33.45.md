# RPT-TF-TEMP-ORCHESTRATOR-DESIGN-REVIEW-01｜Team Orchestrator / 调度器方案独立评审

> 文档类型：ReviewRecord / 独立方案评审  
> 当前基线：v0.6.33.45  
> 评审对象：Team Orchestrator / Task Loop Driver / 单智能体闭环 / Decision Flow  
> 评审日期：2026-05-26  
> 结论：PASS，建议分阶段落地  

---

## 1. 评审结论

调度器方案成立，且当前阶段有较高收益。建议新增 `SDD-TEAM-ORCHESTRATOR-v0.6.33.md` 子设计，并在总路线图中新增独立阶段：`阶段 G｜Team Orchestrator / Task Loop Driver POC`。

但落地必须收窄：第一阶段不做多智能体智能分配，不做完整状态机，不做 Web UI。先做单智能体正向流程闭环，验证共享事实源、编排器、账本、RUN 文件和自动继续机制是否可跑通。

---

## 2. 主要评审意见

| 维度 | 发现 | 级别 | 建议 |
|---|---|---:|---|
| 产品价值 | 调度器能把当前文档化 TaskFlow 推进到可运行闭环 | P0 正向 | 优先做 POC，形成沙箱与本地 OpenCode 联调基础 |
| 架构分层 | 调度器同时包含“盯流程”和“派给谁”两类能力 | P1 | 先实现 Execution Monitor，Agent Dispatcher 后置 |
| 主动性来源 | 大模型本身被动，主动性应来自 Loop Driver / WorkerDaemon | P1 | 在设计中明确模型不自由行动，只在 TaskFlow 约束下被唤醒 |
| 决策流 | 任务卡住时不能继续发普通 task，应切换到 Decision Flow | P1 | 引入 DecisionItem / DecisionPacket，决策后 resume / adjust / spawn |
| 实施路径 | 一上来接 OpenCode 和多智能体分配风险高 | P1 | 先 mock adapter，后 opencode-adapter skeleton，再本地联调 |
| 安全边界 | 自动 continue 可能造成无限循环或越权执行 | P1 | 必须有 stop token、maxRounds、timeout、NEED_USER_DECISION 门禁 |
| 项目目录 | 共享事实源适合做协同黑板，但代码写入要隔离 | P2 | 保持共享事实源与源代码区分层，后续结合 worktree / branch / patch |

---

## 3. 通过条件

评审通过的前提是采用以下落地顺序：

```text
1. 单智能体正向闭环
2. OpenCode Adapter 本地联调骨架
3. 异常处理与 DecisionPacket
4. Task Loop Driver 自动继续
5. Gateway 承载启动协议
6. 多智能体派发策略
```

该顺序先验证“盯流程并自动继续”，再处理“派给谁”，避免把 POC 扩展成完整多智能体平台。

---

## 4. 关键决策

1. 新增调度器子设计：`docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`。
2. 新增工作项：`docs/workitems/TF-RUNTIME-ORCH-POC.md`。
3. 在 `PLAN-SMART-FACTORY.md` 中新增阶段 G：Team Orchestrator / Task Loop Driver POC。
4. 原阶段 G 的 Runtime / Gateway / UI 能力顺延为阶段 H，继续作为运行体和界面产品化方向。
5. 后续优先执行 `TF-RUNTIME-ORCH-POC-01｜单智能体正向闭环`。

---

## 5. 风险与边界

- 当前 POC 不应直接变成多智能体调度产品。
- 当前 POC 不应依赖真实 OpenCode，避免本地环境差异阻塞。
- DecisionPacket 不应混同普通 TaskTicket；它的目标是判断与恢复，不是直接产出文件。
- 自动推进必须在 TaskFlow、Lease、停止口令、最大轮次、超时和用户决策门禁下运行。

---

## 6. 下一步

执行 `TF-RUNTIME-ORCH-POC-01`，在沙箱中先做 mock adapter 单智能体正向闭环。完成后再把 adapter 换成用户本地 OpenCode 联调方式。
