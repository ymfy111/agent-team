# ADR-0001：agent-web-kit 采用非侵入式集成

> 状态：Accepted  
> 日期：2026-05-17

## 背景

智能软件工厂需要对话能力，但项目核心是团队、员工、项目、文档、决策和运行时治理。如果在 agent-team 中复制聊天 UI 和 Gateway 能力，会造成职责重复。

## 决策

agent-team 不实现完整聊天组件，只通过 chat-integration 层接入 agent-web-kit。

前端只传：

```text
agentId
conversationId
hostContext
```

不得传：

```text
endpointRef
workspaceDir
runtimeHost internal URL
token
```

## 后果

优点：

```text
- agent-team 聚焦业务。
- agent-web-kit 聚焦对话。
- 后续可替换 widget/gateway 实现。
```

代价：

```text
- 需要定义清晰 hostContext 和 interaction 映射。
- P0a 必须先有 MockChatAdapter 占位。
```
