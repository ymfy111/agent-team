# 智能软件工厂 agent-web-kit 集成方案

> 版本：v0.6.32  
> 日期：2026-05-17  
> 状态：当前正本 / 集成边界说明

---

## 1. 集成目标

智能软件工厂需要小云对话能力，但不在 agent-team 中重复实现完整聊天 UI、消息渲染、SSE 客户端和 Gateway 转发逻辑。

agent-team 负责：

```text
团队 / 员工 / 项目 / 文档 / 决策 / 技能 / 运行时业务数据
选择对话 target
生成 hostContext
处理 question / decision 类业务事件
```

agent-web-kit 负责：

```text
Widget / Dialog
消息渲染
附件
question / interaction 卡片
SSE 订阅
Gateway 通信
会话命令转发
```

---

## 2. 非侵入式集成模式

P0a 使用 MockChatAdapter，不接真实 agent-web-kit。

P0b/P1 再接真实：

```text
agent-team 页面
→ chat-integration adapter
→ agent-web-kit embed-sdk / widget
→ agent-gateway
→ runtime provider / OpenCode runtime
```

集成原则：

```text
- agent-team 不复制 agent-web-kit UI。
- agent-web-kit 不拥有 agent-team 业务模型。
- 前端只以 agentId 选择对话对象。
- 真实 endpointRef / workspaceDir / runtimeHost internal URL 不给浏览器。
```

---

## 3. agentId-only 契约

前端对话入口只传：

```ts
type XiaoyunOpenInput = {
  agentId: string
  conversationId?: string
  hostContext?: HostContext
}
```

```ts
type HostContext = {
  source: 'overview' | 'team' | 'worker' | 'doc' | 'decision' | 'runtime'
  teamId?: string
  projectId?: string
  workerId?: string
  docId?: string
  decisionId?: string
  intent?: string
}
```

禁止：

```text
endpointRef
workspaceDir
runtimeHost internal URL
OpenCode port
token
```

---

## 4. 对话 target 规则

| 入口 | target |
|---|---|
| 全局小云 | global assistant |
| 团队页 Leader 对话 | team leader agentId |
| 普通 Worker 沟通 | 所属 Team Leader agentId + worker context |
| 文档页咨询 | Team Leader agentId + doc context |
| 决策页咨询 | Team Leader agentId + decision context |
| Runtime 页诊断 | Leader 或 global assistant + runtime summary context |

普通 Worker 不直接对话。

---

## 5. Route Provider 关系

正式集成时，Gateway 不直接硬编码所有 route，而是通过 Provider 查询宿主业务系统。

```text
agent-gateway
→ route provider
→ agent-team API
→ AgentRoute / AgentPresence 脱敏摘要
```

agent-team 提供业务真源：

```text
Worker
RuntimeHost
WorkerRuntimeBinding
AgentRoute
AgentPresence
ConversationRouteBinding
```

Gateway 负责：

```text
agentId 解析
创建 conversation
绑定 route snapshot
命令转发
SSE 转发
错误映射
轻量状态摘要
```

---

## 6. 心跳与 busy 状态

正式业务系统：

```text
RuntimeHost / OpenCode supervisor
→ agent-team runtime-service
→ agent-team 数据库
→ Gateway Provider 查询状态
```

轻量 demo：

```text
Runtime / Mock runtime
→ Gateway heartbeat
→ Gateway 临时维护状态
```

规则：

```text
- Gateway 支持 heartbeat。
- 正式系统的业务状态真源仍是 agent-team。
- 会话级 busy 不自动等于员工级 busy。
- disabled 不能被 heartbeat 自动恢复。
```

---

## 7. MockChatAdapter

P0a 只实现 mock adapter：

```ts
type ChatAdapter = {
  open(input: XiaoyunOpenInput): void
  sendMessage(input: { conversationId: string; text: string }): Promise<void>
  answerInteraction(input: { interactionId: string; answers: Record<string, unknown> }): Promise<void>
}
```

Mock 行为：

```text
- 可展示欢迎语。
- 可根据 hostContext 输出上下文摘要。
- 可模拟 question / decision request。
- 可把 interaction.answer 映射为 Decision resolved 或 Activity。
```

P0a 不做：

```text
- 真实 SSE。
- 真实 Gateway。
- 真实 agent-web-kit package 引用。
- 真实 OpenCode session。
```
