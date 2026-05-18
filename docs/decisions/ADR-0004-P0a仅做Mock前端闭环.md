# ADR-0004：P0a 仅做 Mock 前端闭环

> 状态：Accepted  
> 日期：2026-05-17  
> 版本：v0.6.32

---

## 背景

智能软件工厂已经完成 PRD、系统设计、运行时、路由状态、agent-web-kit 集成和 Mock 数据设计的多轮收敛。下一步需要进入 P0a，但如果 P0a 同时接真实后端、数据库、Gateway 和 OpenCode runtime，会导致范围失控。

---

## 决策

P0a 只做 **前端可演示 Mock 闭环**。

P0a 使用：

```text
mock-seed
mockClient
local state
MockChatAdapter
```

P0a 不接：

```text
真实 Fastify API
真实 Prisma / SQLite / PostgreSQL
真实 agent-web-kit Gateway
真实 OpenCode runtime
真实 RuntimeHost supervisor
真实认证 / 权限 / 多用户
```

---

## 影响

1. P0a 的价值是验证业务对象、状态流、页面交互和演示闭环。
2. P0a 的代码必须为 P0b 后端化预留接口，但不能提前实现后端。
3. `packages/data-client` 可以先提供 mockClient，但方法命名应接近未来 API client。
4. `packages/chat-integration` 可以先提供 MockChatAdapter，但不能阻塞未来接入 agent-web-kit。
5. 页面必须从 selectors / store 获取数据，不允许在页面内写散落 mock。

---

## 禁止事项

```text
- 不允许为了“更真实”在 P0a 中启动 OpenCode。
- 不允许把 Gateway 路由逻辑写进前端页面。
- 不允许让前端读取 workspaceDir / endpointRef / token。
- 不允许直接在页面组件里维护业务主数据。
```
