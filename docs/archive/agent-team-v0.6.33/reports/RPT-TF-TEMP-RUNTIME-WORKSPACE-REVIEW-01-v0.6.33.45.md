# RPT-TF-TEMP-RUNTIME-WORKSPACE-REVIEW-01｜Runtime / Workspace 目录结构独立评审

> 文档类型：ReviewRecord / 独立评审报告  
> 任务：TF-TEMP-RUNTIME-WORKSPACE-REVIEW-01  
> 当前基线：v0.6.33.45  
> 评审结论：PASS，建议按“小步纳入阶段 D 预研设计，不提前实现完整 Runtime 调度”的方式进入文档  

---

## 1. 评审对象

本次评审对象为围绕以下关系模型和目录结构形成的设计讨论：

```text
Project ↔ ProjectTeamBinding ↔ AgentTeam
DigitalEmployee → WorkerRuntimeBinding → RuntimeGateway → OpenCode RuntimeNode
Project Control Workspace：共享任务、账本、项目记忆和 RUN 记录
Employee Workspace：员工私有 AGENTS.md、skills、MCP、memory-cache、worktree
```

核心问题是：一组智能体共享项目目录，是否更方便任务认领、运行账本更新和运行日志沉淀。

---

## 2. 评审结论

结论：方向成立，且应写入设计文档。

原因：共享 `Project Control Workspace` 能让团队智能体围绕同一套计划、阶段、工作项、TaskFlow、`.taskflow` 临时账本、RUN 运行记录和项目记忆协同；员工私有 `Employee Workspace` 又能隔离员工记忆缓存、技能/MCP/AGENTS.md、日志和代码 worktree。该模型同时满足“协同便利”和“执行隔离”。

但该模型必须加三条边界：

1. `AgentTeam` 与 `Project` 不能绑死，必须通过 `ProjectTeamBinding / TeamAssignment` 建立阶段性服务关系。
2. 共享项目目录主要共享任务、账本、项目记忆和正式记录，不代表多个员工可以无锁并发写同一物理代码目录。
3. 员工长期记忆的平台侧版本应为权威，本地 `memory-cache` 只是执行期缓存，迁移时要做过滤、摘要和同步。

---

## 3. 主要优点

| 维度 | 结论 | 说明 |
|---|---|---|
| 协同效率 | 通过 | 计划、阶段、工作项、任务流和 RUN 记录集中在项目协同目录，智能体容易发现任务、认领任务和回写状态。 |
| 架构解耦 | 通过 | Project、AgentTeam、ProjectTeamBinding 分层后，团队和项目都可以复用、迁移或临时支援。 |
| 运行隔离 | 通过但需约束 | Employee Workspace 隔离技能、MCP、AGENTS.md、记忆缓存和 worktree，避免所有状态混在项目根目录。 |
| 可迁移性 | 通过但需补策略 | 员工记忆平台侧权威 + 本地缓存的模型支持员工迁移。 |
| 与 CoStrict 借鉴关系 | 通过 | 借鉴 Gateway / Workspace / Diagnostics 机制，但不把智能软件工厂做成 Web IDE。 |

---

## 4. 发现的问题与建议

| 类型 | 级别 | 问题 | 建议 |
|---|---:|---|---|
| 边界 | P1 | Project Control Workspace 如果等同于 Git repo 根目录，容易把执行期账本、租约和员工缓存误提交。 | 产品化阶段建议 repo、binding 账本、employee workspace 分层；单智能体 POC 可保留 repo 根目录简化模式。 |
| 并发 | P1 | 多员工共享目录会带来任务认领和代码写入冲突。 | 引入 `ExecutionLease` 和 `.taskflow/leases/`；代码改动通过 worktree / branch / patch 隔离。 |
| 记忆 | P1 | 员工记忆若只在 OpenCode 本地，迁移会丢；若全量同步，又会带来安全风险。 | 平台侧 EmployeeMemory 为权威，本地 memory-cache 为缓存；迁移只同步摘要和结构化增量，过滤密钥/token/缓存。 |
| 模型 | P2 | AgentTeam 与 Project 若一对一绑定，后续无法支持临时支援、专家团队、多团队协作。 | 增加 `ProjectTeamBinding / TeamAssignment`，承载角色、权限、默认网关、生命周期和协同目录。 |
| UI | P2 | 如果把 Runtime / Gateway 表达成文件树和终端中心，产品会跑偏成 Web IDE。 | 原型只增加运行体健康、工作空间绑定、诊断、Lease 冲突等辅助下钻，不改变 TaskFlow First 主入口。 |
| 路径 | P2 | `.taskflow` 在 repo 根目录还是 binding 目录需要兼容策略。 | 当前 taskflow skill 继续支持 repo 根目录；产品化时增加绑定级账本路径配置。 |

---

## 5. 更新决定

本次评审通过后，已将以下内容写入相关文档：

1. CoStrict 参考子设计增加 `Project Control Workspace 与员工工作区目录结构`。
2. 主 SDD 增加 `ProjectTeamBinding / ProjectControlWorkspace / EmployeeWorkspace / WorkerRuntimeBinding` 阶段 D 预研对象。
3. 总路线图增加 `TF-RUNTIME-WORKSPACE-DIRECTORY-01` 候选任务。
4. 文档导航和 project-memory 同步最新设计口径。

---

## 6. 后续建议

下一步建议拆成两个小任务：

1. `TF-RUNTIME-GATEWAY-DESIGN-01`：定义 RuntimeGateway / RuntimeHost / RuntimeNode / AgentRoute / Diagnostics / ExecutionLease 最小对象。
2. `TF-RUNTIME-WORKSPACE-DIRECTORY-01`：定义 ProjectTeamBinding / Project Control Workspace / Employee Workspace / 记忆同步 / `.taskflow` 账本路径。

原型改造应排在上述设计之后，先表达辅助下钻能力，不直接改成 Web IDE。
