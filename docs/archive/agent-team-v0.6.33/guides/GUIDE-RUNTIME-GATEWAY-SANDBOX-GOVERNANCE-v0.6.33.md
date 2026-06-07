# GUIDE-RUNTIME-GATEWAY-SANDBOX-GOVERNANCE｜运行网关 / 沙箱 / 数字员工运行绑定治理指南

> 文档类型：Guide / 运行资源治理  
> 当前基线：v0.6.33.45  
> 适用范围：RuntimeGateway、RuntimeSandbox、OpenCodeRuntimeNode、AgentTeam、DigitalEmployee、ProjectExecutionSession 的产品与前端设计口径。

---

## 1. 核心类比

在智能软件工厂中，运行资源可按“生产线 / 工位 / 员工”理解：

```text
RuntimeGateway / 运行网关
  = 服务器级生产资源入口，可理解为一条生产线。

RuntimeSandbox / 运行沙箱，也可称 OpenCodeWorkspace
  = 生产线上的独立工位 / 隔离工作台。

OpenCodeRuntimeNode / OC 运行节点
  = 工位中运行的独立 OpenCode 进程。

DigitalEmployee / 数字员工
  = 被安排到工位上工作的员工身份。
```

第一版产品应避免让用户手工管理每个 OC 进程。用户主要管理 Team、Project、Gateway 绑定和员工运行状态；沙箱分配、OC 启动、Skill/MCP/Rules/Memory 同步应尽量作为 Team 成员初始化的隐式流程完成。

---

## 2. 对象关系

```text
RuntimeHost 1:1 RuntimeGateway
RuntimeGateway 1:N RuntimeSandbox
RuntimeSandbox 0..1 active OpenCodeRuntimeNode
OpenCodeRuntimeNode 1:1 DigitalEmployee
AgentTeam 1:N DigitalEmployee
AgentTeam N:1 RuntimeGateway（当前推荐一个 Team 绑定一个 Gateway）
Project + AgentTeam = TeamProjectAssignment
TeamProjectAssignment 激活后产生 ProjectExecutionSession
ProjectExecutionSession 1:1 TeamOrchestratorSession
ProjectExecutionSession 1:N OpenCodeRuntimeNode
```

当前版本推荐：

```text
一个 RuntimeGateway 可以服务多个 AgentTeam；
一个 AgentTeam 默认绑定一个 RuntimeGateway；
一个 Team 的成员对应 OC 尽量运行在同一个 Gateway 下，访问同一个 ProjectWorkspace。
```

这样可减少跨服务器 ProjectWorkspace 同步、任务锁、日志汇聚、权限边界和诊断复杂度。

---

## 3. Team 绑定 Gateway 与成员初始化

Team 绑定 Gateway 后，向 Team 添加数字员工时，平台和 Gateway 应隐式完成运行初始化：

```text
1. 检查 Team 已绑定可用 RuntimeGateway。
2. 在该 Gateway 下分配 RuntimeSandbox / OpenCodeWorkspace。
3. 初始化沙箱目录和权限。
4. 启动 OpenCodeRuntimeNode。
5. 建立 DigitalEmployeeRuntimeBinding。
6. 同步员工 skills、rules、MCP、memory。
7. 在项目执行时同步 ProjectContextSnapshot。
8. 将成员状态标记为 initializing / ready / error。
```

日常主流程不应要求用户单独执行“新建 OC、绑定员工、下发 skill、下发 MCP、同步记忆”等底层操作。

---

## 4. RuntimeSandbox 生命周期

RuntimeSandbox 是可复用工位，但解绑后不能直接给新员工使用，必须先重新初始化。

推荐状态：

```text
available
  可分配，未绑定员工。

bound
  已绑定某个 DigitalEmployee，内部运行一个 OC。

unbinding
  正在解绑，停止 OC，保存必要运行记录。

pending-reset
  已解绑，但仍残留旧员工 skills / rules / MCP / memory / workspace 状态。

resetting
  正在重新初始化。

available
  初始化完成，可重新绑定给员工。

retired
  废弃，不再复用。
```

关键规则：

```text
解绑 ≠ 可复用；
解绑后的沙箱必须 reset 后才可 available；
避免旧员工记忆、旧项目上下文、旧 MCP 权限、旧 rules / skill 污染新员工。
```

---

## 5. 网关注册生命周期

RuntimeGateway 一旦注册到平台后台，就成为持久资源台账。心跳只更新状态，不决定是否存在。

```text
registered → online / degraded / offline / disabled → deleting → deleted
```

规则：

```text
心跳异常：网关置灰 / 标记 offline，不自动消失；
网关不可用：不自动解绑 Team / 沙箱 / OC / 数字员工；
删除网关：必须由用户手动触发，并执行绑定关系和运行记录检查。
```

删除前至少检查：

```text
绑定 Team 数
RuntimeSandbox 数
OC RuntimeNode 数
DigitalEmployeeRuntimeBinding 数
运行中的 ProjectExecutionSession
未完成 Task / DecisionPacket
pending-reset / error 沙箱
```

有活跃绑定时默认禁止删除，提示先迁移、解绑或清理。

---

## 6. 前端页面边界

### 6.1 运行网关页

定位：服务器级生产资源监控页。

展示：

```text
已注册网关列表
网关在线 / 离线 / 异常状态
注册时间、运行时长、沙箱数量、CPU / 内存使用率
Team 筛选
该网关下沙箱 / OC 卡片
沙箱绑定员工、所属 Team、OC 状态、当前任务、最近活动
离线置灰和删除风险提示
```

不做：

```text
Team 绑定 / 解绑 Gateway
员工换沙箱
下发 Skill / MCP / Rules / Memory
任务派发
DecisionPacket 处理
```

### 6.2 Team 页

主操作入口：

```text
Team 绑定 Gateway
成员加入 Team 后初始化运行体
查看成员初始化状态
触发成员重新初始化 / 换沙箱
```

### 6.3 数字员工页

主操作入口：

```text
查看当前 RuntimeSandbox / OC 绑定
更换沙箱
重新同步 skills / rules / MCP / memory
查看当前任务和最近执行结果
```

### 6.4 Project / 待决策页

ProjectExecutionSession 不应长期作为孤立主菜单，而应作为 Team、Project、待决策和运行网关之间的运行态上下文：

```text
Project 页：看项目正在由哪个 Team 执行、当前任务进度、项目共享事实源入口。
待决策页：处理 DecisionPacket，并反查来源项目 / Team / Task / 执行会话。
运行网关页：穿透查看该 Gateway 承载的沙箱 / OC / 员工运行状态。
```

---

## 7. 页面当前实现口径

`apps/web` 当前已实现 `runtime-gateway` 独立 feature page，第一版为 mock 监控页：

```text
左侧：已注册运行网关列表。
右侧：所选网关状态、指标卡、Team 筛选、沙箱 / OC 卡片。
```

该页面只用于监控与穿透查看，不接真实 Gateway API，不承担 Team / 员工绑定主流程。
