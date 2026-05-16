# ADR-0003：agent-team 作为业务状态真源

> 状态：Accepted  
> 日期：2026-05-17

## 背景

智能软件工厂需要展示 Worker 在线/离线、忙碌/空闲、RuntimeHost 状态、AgentRoute 状态和运行时绑定。如果让 Gateway 成为业务状态真源，会让业务系统失去对员工生命周期、团队分配、技能同步和运行时状态的统一控制。

## 决策

正式集成时，agent-team 是以下对象的业务状态真源：

```text
Worker
RuntimeHost
WorkerRuntimeBinding
AgentRoute
AgentPresence
ConversationRouteBinding
```

Gateway 只负责：

```text
agentId 解析
会话路由
命令转发
SSE 转发
轻量状态摘要
```

## 关键规则

```text
- Gateway 可以支持 heartbeat，但不自动成为业务状态真源。
- disabled route 不能被 heartbeat 自动恢复。
- RuntimeHost offline 可推导 active route unavailable，但不覆盖 disabled。
- 会话级 busy 不自动等于员工级 busy。
```
