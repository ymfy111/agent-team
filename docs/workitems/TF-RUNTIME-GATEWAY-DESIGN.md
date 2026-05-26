# TF-RUNTIME-GATEWAY-DESIGN｜RuntimeGateway 最小设计工作项

> 文档类型：WorkItem / 工作项  
> 所属计划：`docs/plans/PLAN-SMART-FACTORY.md`  
> 所属阶段：阶段 G｜Runtime / Gateway / UI / 自动调度  
> 当前基线：v0.6.33.45  
> 状态：进行中  

---

## 1. 工作项目标

围绕“平台后台只联系 RuntimeGateway，由 Gateway 在服务器本地拉取项目、准备 Project Workspace、启动 TeamOrchestrator 和 OpenCode RuntimeNode”的口径，形成最小可用的对象模型、接口草案和后续 POC 路线。

本工作项不直接实现网关服务，不改前端原型，不影响当前本地 `orchestrator v0.1.3` 联调。

---

## 2. TaskFlow 清单

| TaskFlow | 名称 | 目标 | 状态 |
|---|---|---|---:|
| `TF-RUNTIME-GATEWAY-DESIGN-01` | RuntimeGateway 最小对象模型与接口设计 | 新增 `SDD-RUNTIME-GATEWAY`，同步主设计、路线图、导航和项目记忆 | done |
| `TF-RUNTIME-GATEWAY-POC-01` | Gateway 服务最小骨架 | 实现一个本地 Gateway API mock，能接收 activate-assignment 并启动 orchestrator mock | planned |
| `TF-RUNTIME-GATEWAY-POC-02` | ProjectWorkspace Prepare 骨架 | 支持 clone/pull/local 模式准备项目目录，生成 ProjectContextSnapshot | planned |
| `TF-RUNTIME-GATEWAY-POC-03` | RuntimeNode Init 骨架 | 定义并验证 OpenCodeRuntimeNode 初始化参数、skills/MCP/AGENTS.md 下发流程 | planned |
| `TF-RUNTIME-GATEWAY-POC-04` | Diagnostics 与状态上报 | 输出 Gateway / Orchestrator / RuntimeNode 的状态、日志路径与健康检查 | planned |
| `TF-RUNTIME-GATEWAY-REVIEW-01` | Gateway 设计与 POC 评审 | 评审是否进入前端页面实现与真实 OpenCode 联调 | planned |

---

## 3. TF-RUNTIME-GATEWAY-DESIGN-01｜RuntimeGateway 最小对象模型与接口设计

目标：新增 RuntimeGateway 子设计文档，明确平台与 Gateway 的职责边界。

任务清单：

1. 复核 `SDD-v0.6.33`、CoStrict 参考子设计、Team Orchestrator 子设计。
2. 定义 `RuntimeGateway`、`TeamProjectAssignment`、`ProjectWorkspace`、`ProjectContextSnapshot`、`TeamOrchestratorSession`、`OpenCodeRuntimeNode`、`WorkerRuntimeBinding`、`RuntimeDiagnostics`。
3. 定义 Gateway API 草案：注册、心跳、Assignment 生命周期、Workspace 准备、Orchestrator 生命周期、RuntimeNode 生命周期、Diagnostics。
4. 定义本地文件系统建议和安全边界。
5. 同步主 SDD、PLAN、文档导航和 project-memory。
6. 生成 `RUN_TF-RUNTIME-GATEWAY-DESIGN-01.md`。

验收标准：

- `docs/specs/SDD-RUNTIME-GATEWAY-v0.6.33.md` 存在且结构完整。
- 主 SDD / PLAN / 导航 / project-memory 能指向该设计。
- 明确“平台保存期望状态，Gateway 落地运行状态”的边界。
- 不修改当前 orchestrator 代码和本地联调包。

---

## 4. 后续边界

短期优先：

- 本地 Gateway API mock；
- ProjectWorkspace 准备；
- OpenCode RuntimeNode 初始化骨架；
- Diagnostics / Logs / Heartbeat 最小状态上报。

暂不进入：

- 复杂多网关调度；
- 真正反向隧道 / WebSocket 连接代理；
- 细粒度文件权限；
- Web IDE 文件编辑 / 终端主入口；
- 多智能体复杂分配算法。
