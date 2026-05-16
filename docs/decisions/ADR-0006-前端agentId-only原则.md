# ADR-0006：前端 agentId-only 原则

> 状态：Accepted  
> 日期：2026-05-17  
> 版本：v0.6.33

---

## 背景

agent-team 后续会与 agent-web-kit / agent-gateway / OpenCode runtime 集成。若前端直接持有 runtimeHost、workspaceDir、endpointRef、OpenCode port 或 token，会导致安全边界混乱、路由不可替换、会话不可迁移。

---

## 决策

前端和 widget 只传：

```text
agentId
conversationId
hostContext
```

前端不得传：

```text
endpointRef
workspaceDir
runtimeHost internal URL
OpenCode port
token
```

AgentRoute / ConversationRouteBinding 是后端或 Gateway 内部数据，不暴露给浏览器前端。

---

## 影响

1. 页面打开小云时，只提供 agentId 和 hostContext。
2. Gateway 或 Provider 根据 agentId 查询当前路由。
3. 新会话绑定最新 routeRevision。
4. 已有会话使用创建时的 ConversationRouteBinding。
5. routeStatus = disabled 时拒绝新会话。
6. route 变化不要求前端知道具体 endpoint。

---

## P0a 表达

P0a 可以在内部 mock 数据中展示 route/presence，但 UI 不应引导用户复制 endpoint 或 workspaceDir 到聊天入口。

员工监控页可以展示脱敏后的运行信息，例如：

```text
RuntimeHost：local-dev-01
同步状态：synced
工作区：已初始化
```

但不能把真实路径、端口、token 作为前端调用参数。
