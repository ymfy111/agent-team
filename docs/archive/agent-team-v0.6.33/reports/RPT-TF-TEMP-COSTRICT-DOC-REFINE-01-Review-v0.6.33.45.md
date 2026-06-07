# RPT-TF-TEMP-COSTRICT-DOC-REFINE-01｜CoStrict 参考架构设计评审

> 文档类型：设计评审报告  
> 任务：TF-TEMP-COSTRICT-DOC-REFINE-01  
> 当前基线：v0.6.33.45  
> 评审对象：`docs/specs/SDD-COSTRICT-CLOUD-REFERENCE-v0.6.33.md` 及其对主 SDD、路线图、原型的影响  
> 结果：PASS

---

## 1. 核心结论

CoStrict Cloud 的价值不在于把智能软件工厂改造成 Web IDE，而在于它验证了一种可借鉴的运行体接入模式：Web 控制面通过设备侧 Gateway 发现、连接、诊断和管理分布式工作空间。

本项目应记录并坚持以下原则：

> 不要把智能软件工厂做成 Web IDE，而是把 Web IDE/Gateway 能力变成数字员工运行体的基础设施。

该原则应进入 CoStrict 参考子设计、主 SDD 阶段 D、总路线图阶段 G，并作为后续原型改造的边界。

---

## 2. 可借鉴点

| 维度 | 借鉴内容 | 对智能软件工厂的映射 |
|---|---|---|
| 控制面 / 执行面分离 | Web 端管理设备和 Workspace，执行发生在本地/私有服务器 daemon | Factory Control Plane / RuntimeGateway 分层 |
| 设备注册 | `cs cloud start` 后设备注册并出现在 Web 设备列表 | RuntimeHost 注册、Heartbeat、Diagnostics |
| 工作空间绑定 | Workspace 唯一对应设备上的独立项目目录 | WorkspaceBinding / WorkerRuntimeBinding |
| 连接入口 | 浏览器连接 Workspace，而非裸进程 | AgentRoute / SessionRoute |
| 诊断入口 | 启动日志输出 pid、url、docs、logs | RuntimeDiagnostics 面板 |
| 空闲/连接状态 | Workspace 空闲时可连接 | RuntimeStatus / WorkspaceOccupancy / ExecutionLease |

---

## 3. 不应照搬点

| 风险 | 说明 | 处理建议 |
|---|---|---|
| 产品主线跑偏 | CoStrict 主体验偏远程开发工作区，智能软件工厂主线是 TaskFlow First | Workspace/终端/文件能力只作为任务证据和运行体诊断入口 |
| 过早 Web IDE 化 | 若先做文件编辑器/终端/工作区浏览，容易弱化任务流、评审和交付闭环 | 原型优先表现“任务流驱动运行体”，不是“人进 IDE 操作代码” |
| Runtime 复杂度前置 | 设备注册、隧道、权限、日志、租约都可能放大范围 | 阶段 D 先做模型和模拟，真实调度后置 |
| 多端并发冲突 | 用户、组长智能体、数字员工可能同时控制同一 workspace | 后续必须设计 ExecutionLease / owner / observer mode |

---

## 4. 对设计文档的处理建议

1. `SDD-COSTRICT-CLOUD-REFERENCE-v0.6.33.md`：作为参考子设计，明确“借鉴基础设施，不照搬 Web IDE 产品形态”。
2. `SDD-v0.6.33.md`：在阶段 D 和行业参考章节小步补充 RuntimeGateway / WorkspaceBinding / AgentRoute / Diagnostics / ExecutionLease。
3. `PLAN-SMART-FACTORY.md`：在阶段 G 增加 Runtime Gateway 基础设施设计任务，但不提升到当前 Guarded Flow 之前。
4. `docs/文档导航.md` 与 `docs/project-memory.md`：同步记录该原则，避免后续误解为“要做云 IDE”。

---

## 5. 对原型的改动建议

后续原型需要表达 Runtime/Gateway 能力，但不能把入口做成 Web IDE 首页。建议采用“任务流优先、运行体辅助”的改法：

| 原型区域 | 建议改动 | 边界 |
|---|---|---|
| 协作全景 / 项目详情 | 增加“运行体状态”摘要，如在线主机数、占用工作区、异常运行体 | 不把运行体状态放到任务流之上 |
| 数字员工详情 / 抽屉 | 增加 RuntimeHost、WorkspaceBinding、AgentRoute、最近心跳、当前任务绑定 | 不直接开放全量机器文件系统 |
| 工作空间入口 | 增加“连接工作空间 / 查看日志 / 查看诊断”的辅助入口 | 入口服务于任务证据和排障，不做完整 IDE |
| 待决策 / 异常处理 | 增加 Runtime 异常、Lease 冲突、Workspace 占用等待决策类型 | 不在原型中实现真实调度 |
| 管理视图 | 后续可增加 RuntimeHost 列表和 Diagnostics 面板 | 当前只作为阶段 D 候选，不立即实现 |

---

## 6. 评审结论

本次评审通过。CoStrict 参考应作为阶段 D Runtime 工厂化调度的基础设施参考，不改变当前 TaskFlow First / Guarded Flow 优先级。后续最合适的小步任务是 `TF-RUNTIME-GATEWAY-DESIGN-01`：先设计 RuntimeGateway、RuntimeHost、WorkspaceBinding、AgentRoute、Diagnostics、ExecutionLease 的最小对象模型，再决定是否进入原型改造。
