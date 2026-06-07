# TF-RUNTIME-ORCH-POC｜Team Orchestrator 单智能体闭环工作项

> 文档类型：WorkItem / 工作项  
> 当前基线：v0.6.33.45  
> 所属计划：PLAN-SMART-FACTORY  
> 所属阶段：阶段 G｜Team Orchestrator / Task Loop Driver POC  
> 设计依据：`docs/specs/SDD-TEAM-ORCHESTRATOR-v0.6.33.md`  
> 状态：planned  

---

## 1. 工作项目标

验证 Team Orchestrator 的最小运行闭环：

```text
共享事实源 → 编排器 → 单智能体执行 → 状态回写 → RUN 记录 → 自动继续
```

第一阶段不做多智能体派发，不做 Web UI，不做真实 Gateway 注册。先用沙箱 mock adapter 跑通正向流程，再逐步加入 OpenCode Adapter、异常处理、DecisionPacket 和 Task Loop Driver。

---

## 2. 任务流清单

| TaskFlow | 名称 | 目标 | 状态 |
|---|---|---|---:|
| TF-RUNTIME-ORCH-POC-01 | 单智能体正向闭环 | 读取一个工作项，按顺序执行节点，更新 `.taskflow` 账本并生成 Task 正式记录 | planned |
| TF-RUNTIME-ORCH-POC-02 | OpenCode Adapter 本地联调骨架 | 将执行层抽象为 adapter，保留 mock，同时提供 opencode-adapter skeleton | planned |
| TF-RUNTIME-ORCH-POC-03 | 异常处理与 DecisionPacket | 遇到 blocked / decision_needed 时生成 DecisionItem 与 DecisionPacket | planned |
| TF-RUNTIME-ORCH-POC-04 | Task Loop Driver 自动继续 | 监听结构化状态并自动发送 continue，直到完成、阻塞、失败或需要用户决策 | planned |
| TF-RUNTIME-ORCH-POC-05 | Gateway 承载启动协议 | 定义 RuntimeGateway 如何启动 TeamOrchestratorSession 和 OpenCode RuntimeNode | planned |
| TF-RUNTIME-ORCH-POC-06 | 多智能体派发策略预研 | 从固定目标智能体扩展到按岗位、能力、负载、Lease 的派发策略 | planned |

---

## 3. 具体任务清单

### TF-RUNTIME-ORCH-POC-01｜单智能体正向闭环

目标：在沙箱中跑通最小闭环，不接 OpenCode。

任务：

1. 新增 `tools/orchestrator/team-orchestrator.mjs`。
2. 新增 `tools/orchestrator/adapters/mock-adapter.mjs`。
3. 新增 `tools/orchestrator/config.example.json`。
4. 支持读取 `docs/workitems/*.md` 中的 TaskFlow 清单或指定示例任务。
5. 支持生成/更新 `.runtime/exec/<WorkItemId>/<TaskId>.json`。
6. 支持按 Task 顺序派发，智能体在 Task 内部自行拆 Step / Node。
7. 支持生成 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`。
8. 输出 Task Summary。

验收：

- `node tools/orchestrator/team-orchestrator.mjs run --mode mock --task <TaskId>` 可完成一次正向流程。
- 生成 `.runtime/orch` 调度运行态、`.runtime/exec` 执行运行态和 Task 正式记录。
- 不需要人工逐步骤输入；Task 完成后由 ORCH 决定是否继续派下一个 Task。

### TF-RUNTIME-ORCH-POC-02｜OpenCode Adapter 本地联调骨架

目标：让用户本地可替换 mock adapter 接入 OpenCode。

任务：

1. 抽象 `WorkerAdapter` 接口：`sendTask / waitForResult / detectStatus / writeEvidence`。
2. 保留 `mock-adapter`。
3. 新增 `opencode-adapter.mjs` skeleton。
4. 新增 `config.local.example.json`，说明本地 OpenCode command / workspaceDir / env 配置。
5. 约定 OpenCode 输出状态口令：`TASK_DONE / TASK_FLOW_DONE / NEED_USER_DECISION / BLOCKED / FAILED`。
6. 编写本地联调说明。

验收：

- 沙箱 mock 模式不受影响。
- 本地 adapter 骨架可被配置加载。
- 用户可在本地补齐 OpenCode 调用并联调。

### TF-RUNTIME-ORCH-POC-03｜异常处理与 DecisionPacket

目标：当任务卡住时，从 Task Flow 切换到 Decision Flow。

任务：

1. 定义 `DecisionItem` 最小结构。
2. 定义 `DecisionPacket` 模板。
3. 支持 mock worker 返回 `NEED_USER_DECISION / BLOCKED`。
4. 编排器将异常状态写入 `.taskflow`。
5. 支持生成 DecisionPacket，并暂停普通任务推进。
6. 支持用户/组长决策后 resume / adjust / spawn。

验收：

- 异常路径不会继续发普通 task。
- DecisionPacket 包含 reason / context / options / recommend / expectedOutput。
- 决策完成后可恢复原任务或生成后续任务。

### TF-RUNTIME-ORCH-POC-04｜Task Loop Driver 自动继续

目标：把“人手动发继续”转为受控 loop。

任务：

1. 实现 loop driver 状态机：waiting / running / paused / completed / failed。
2. 监听 worker 结构化状态。
3. 根据 TaskFlow 状态自动发送 next / continue 指令。
4. 支持 stop tokens。
5. 支持 maxRounds / maxDuration / maxFailures。
6. 生成 loop diagnostics。

验收：

- 正向流程能自动推进多个节点。
- 遇到 `TASK_FLOW_DONE` 正常停止。
- 遇到 `NEED_USER_DECISION / BLOCKED / FAILED / timeout` 停止并写明原因。

### TF-RUNTIME-ORCH-POC-05｜Gateway 承载启动协议

目标：明确未来 RuntimeGateway 如何承载 Orchestrator 与 OpenCode。

任务：

1. 定义 `TeamOrchestratorSession` 启动参数。
2. 定义 Gateway 本地 runtime manifest。
3. 定义 assignment activation 指令输入。
4. 定义 Gateway 启动 TeamOrchestrator 的结果上报。
5. 定义 OpenCode RuntimeNode 初始化接口需求。
6. 将协议沉淀到 SDD 或子设计。

验收：

- 明确平台只联系 Gateway。
- Gateway 负责拉取项目、准备 Project Workspace、启动 Orchestrator 和 OpenCode。
- 项目目录不保存团队绑定关系本身。

### TF-RUNTIME-ORCH-POC-06｜多智能体派发策略预研

目标：在单智能体闭环稳定后，再评估多智能体派发。

任务：

1. 定义员工能力标签与岗位类型。
2. 定义任务类型与岗位映射。
3. 定义 idle / busy / blocked / offline 过滤规则。
4. 定义 Lease 冲突规则。
5. 定义 review_requested 等特殊状态派发策略。
6. 输出派发策略评审报告。

验收：

- 不要求实现真实多智能体并发。
- 明确何时从 fixed default agent 升级到能力派发。

---

## 4. 边界

- 不把 POC 做成完整产品调度器。
- 不提前实现多智能体复杂分配。
- 不做 Web UI。
- 不直接操作真实生产项目。
- 所有自动推进必须受 TaskFlow、停止口令、最大轮次、最大耗时和用户决策门禁约束。

---

## 5. 下一步

建议优先执行：`TF-RUNTIME-ORCH-POC-01｜单智能体正向闭环`。
