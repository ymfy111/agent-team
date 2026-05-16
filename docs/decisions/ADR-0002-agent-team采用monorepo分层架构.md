# ADR-0002：agent-team 采用 monorepo 分层架构

> 状态：Accepted  
> 日期：2026-05-17

## 背景

智能软件工厂的核心模型较多：Skill、AgentTemplate、Worker、RuntimeHost、Route、Presence、Team、Project、Doc、Decision、Activity。如果直接在单个前端应用里实现，会导致页面和数据规则耦合。

## 决策

P0a 采用 pnpm workspace monorepo：

```text
apps/web
packages/contracts
packages/domain
packages/mock-seed
packages/data-client
packages/state
packages/ui
packages/chat-integration
packages/testing
```

依赖方向：

```text
contracts → domain → mock-seed/data-client/state → apps/web
```

## 后果

优点：

```text
- 类型契约集中。
- 业务规则可测试。
- mock seed 可替换为真实 API。
- 页面不会散落业务规则。
```

代价：

```text
- 开发初期目录较多。
- OpenCode 必须按施工图执行，不能直接从页面开工。
```
