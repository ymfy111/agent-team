# 智能软件工厂 agent-web-kit 集成方案

> 状态：v0.6.32 技术落地补充  
> 日期：2026-05-15  
> 所属目录：`docs/specs/`  
> 相关文档：  
> - `docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md`  
> - `docs/references/agent-web-kit-架构设计-reference.md`  
> - `docs/decisions/ADR-0001-agent-web-kit采用非侵入式仅对话框集成.md`

---

## 1. 背景

智能软件工厂需要提供“小云”对话能力，让负责人可以从总览、团队、员工、文档、待决策等入口与团队 Leader / 全局助手沟通。

但智能软件工厂的核心职责是团队、项目、文档、决策、岗位、员工、技能等业务编排；对话框本身的消息渲染、附件、问题卡、决策卡、SSE、Gateway、OpenCode 连接不应在本项目中重复实现。

`agent-web-kit` 已经将 AI 对话 Widget 拆分为 `contracts`、`gateway-client`、`widget-core`、`widget-lit`、`embed-sdk` 和 `agent-gateway`，并提供标准 `<agent-widget>` 对话组件。因此，智能软件工厂应以非侵入、松耦合方式接入 `agent-web-kit`。

---

## 2. 集成目标

本集成方案要解决：

```text
智能软件工厂如何在不重写聊天 UI、不反向绑定业务模型、不破坏现有页面心智的前提下，接入 agent-web-kit 对话框。
```

目标包括：

1. 保留智能软件工厂自己的入口和上下文选择能力。
2. 使用 `agent-web-kit` 的 `<agent-widget>` 承载完整对话框。
3. 通过 `HostContext` 向对话框传入团队、项目、文档、员工、决策等业务上下文。
4. 通过适配层把 `interaction.request` 映射为智能软件工厂的 `Decision`。
5. 通过 mock / fallback 机制保证 P0a 阶段不依赖真实 Gateway。
6. 为 P0b / P1 的真实 Gateway、OpenCode、文档上下文更新预留接口。

## 2.1 当前阶段适配策略摘要

| 阶段 | 对话能力策略 | 说明 |
|---|---|---|
| P0a | `MockChatAdapter` | 只验证入口、target、HostContext、CHAT-009，不接真实 agent-web-kit / Gateway / OpenCode。 |
| P0b | 业务 API 与 SQLite 可运行；真实文本对话可选 | P0b 的主目标是业务对象持久化，agent-web-kit 文本对话不作为阻塞项。 |
| P1 | 完整接入 agent-web-kit + agent-gateway + OpenCode | 支持真实消息流、interaction → Decision、文档上下文更新和回写。 |

注意：`context.update` 和 `AgentInteraction.metadata` 属于 P1 建议增强或兼容协议，不作为 P0a / P0b 前置条件。

---

## 3. 非目标

本方案不做以下事情：

```text
- 不在 agent-team 中重复实现完整聊天 UI。
- 不让 agent-web-kit 维护 Team / Project / Doc / Decision / Skill 等业务主数据。
- 不让普通 Worker 直接成为对话 target。
- 不在前端直接调用 OpenCode Runtime。
- 不在 P0a 阶段强依赖真实 agent-gateway。
- 不把 agent-web-kit 的内部包结构复制成当前项目的业务结构。
```

---

## 4. 集成原则

### 4.1 非侵入式

智能软件工厂只通过 `embed-sdk` / `<agent-widget>` 与 `agent-web-kit` 交互，不修改 `agent-web-kit` 内部 UI 实现，不依赖其内部 DOM 结构。

### 4.2 松耦合

`agent-web-kit` 只认识通用的 `agentId`、`conversationId`、`AgentCommand`、`AgentEvent`、`AgentInteraction`、`HostContext` 等协议对象；它不理解智能软件工厂的完整领域模型。

### 4.3 当前项目保留入口

智能软件工厂已有右下角入口、团队 Leader 入口、员工“通过 Leader 联系”入口、文档上下文入口、待决策入口，因此不采用 `agent-web-kit` 的全托管 `<agent-launcher>`。

### 4.4 对话框完整自包含

`<agent-widget>` 自带 header、消息区、输入框、工具栏。智能软件工厂不再外包一层自己的 `chat-panel` 壳，避免双标题栏、双关闭按钮、双缩放逻辑。

### 4.5 业务事件回到 agent-team

小云中产生的正式业务事件，例如需要负责人确认的决策，必须回到智能软件工厂的 `Decision`、`Activity`、`DocHistory` 等业务对象中，而不是只停留在聊天消息里。

### 4.6 协议成熟度分层

本方案区分“当前可用能力、当前项目侧适配、建议后续增强”，避免把未来能力写成当前开发前提。

| 层级 | 能力 | 使用方式 |
|---|---|---|
| 当前可用 | `createConversation(agentId, hostContext?)`、`message.send`、`interaction.answer`、`subscribeEvents`、`interaction.request` | P0b/P1 可直接参考 agent-web-kit 现有契约 |
| 项目侧适配 | `ConversationContextSnapshot`、`mapInteractionToDecision()`、MockChatAdapter | P0a/P0b 由 agent-team 自己维护，不要求 agent-web-kit 改造 |
| 建议后续增强 | `context.update`、`AgentInteraction.metadata` 标准字段 | P1 协议增强项，不能作为 P0a/P0b 阻塞条件 |

---

## 5. 挂载模式选择

采用：

```text
模式 B：仅对话框，由智能软件工厂自己的入口触发。
```

不采用：

```text
模式 A：Launcher + Dialog 全托管。
```

原因：

| 对比项 | 模式 A：全托管 | 模式 B：仅对话框 | 当前项目选择 |
|---|---|---|---|
| 入口 | agent-web-kit 提供 | 当前项目提供 | 当前项目已有入口 |
| 上下文 | 泛化上下文 | 业务页面注入 | 需要 team/doc/decision 等上下文 |
| UI 心智 | 对话组件主导 | 宿主页面主导 | 智能软件工厂主导 |
| 改造成本 | 可能重复入口 | 只替换对话框 | 更低 |
| 适配性 | 适合无自有入口网站 | 适合已有工具栏/按钮网站 | 更匹配 |

---

## 6. 职责边界

| 模块 | 职责 | 不承担 |
|---|---|---|
| agent-team 页面层 | 展示总览、团队、项目、待决策、岗位、员工、技能、设置 | 不实现聊天消息渲染 |
| agent-team chat-integration | 构造 target、session、HostContext；处理业务事件适配与转译 | 不拥有 widget 内部状态；不做是否创建 Decision、是否允许发布、是否回写 Activity 等业务决策 |
| agent-web-kit embed-sdk | 挂载 `<agent-widget>`，编排 client、core、lit | 不读取业务数据库 |
| agent-web-kit widget | 消息渲染、输入、附件、问题卡、决策卡、错误状态 | 不维护 Team / Project / Doc 主数据 |
| agent-gateway | 会话创建、SSE、OpenCode Runtime 桥接 | 不处理智能软件工厂业务流程 |
| agent-team API | 业务对象持久化、决策回写、文档版本、活动记录 | 不直接代理 OpenCode 消息流 |

---

## 7. 推荐运行架构

```text
智能软件工厂页面
  ├── 总览 / 团队 / 项目 / 待决策 / 岗位 / 员工 / 技能
  ├── 小云入口按钮
  └── chat-integration 适配层
       ├── buildHostContext()
       ├── resolveChatTarget()
       ├── openAgentWidget()
       ├── handleAgentEvent()
       └── mapInteractionToDecision()
            │
            ▼
      agent-web-kit embed-sdk
            │
            ▼
      <agent-widget>
            │
            ▼
      gateway-client → agent-gateway → OpenCode Runtime
```

P0a 阶段可以将 `agent-web-kit embed-sdk` 替换为 `MockChatAdapter`，保持相同的适配层接口。

---

## 8. chat-integration 适配层设计

建议在当前项目中增加独立适配层：

```text
packages/chat-integration/
├── index.ts
├── buildHostContext.ts
├── resolveChatTarget.ts
├── openChat.ts
├── mapInteractionToDecision.ts
├── handleAgentEvent.ts
└── mockChatAdapter.ts
```

边界要求：`chat-integration` 只做适配，不做业务决策。它可以提供 `mapInteractionToDecisionDraft()` 这类“候选映射”能力，但最终是否创建正式 `Decision`、如何处理幂等、是否回写团队动态，应由 `packages/domain` 或 `apps/api` 完成。P0a 可以在前端 domain 中模拟该规则，P0b 后由 API 承接。

### 8.1 对外接口

```ts
type OpenChatOptions = {
  entry: ChatEntry
  targetType: ChatTargetType
  teamId?: string
  leaderId?: string
  workerId?: string
  projectId?: string
  docId?: string
  docVersion?: string
  decisionId?: string
  initialPrompt?: string
}

type ChatIntegration = {
  openGlobalAssistant(): Promise<void>
  openTeamLeader(teamId: string): Promise<void>
  openWithWorkerContext(workerId: string): Promise<void>
  openWithDocContext(docId: string): Promise<void>
  openWithDecisionContext(decisionId: string): Promise<void>
  updateContextAfterDocPublish(docId: string, version: string): Promise<void>
  close(): void
}
```

### 8.2 入口枚举

```ts
type ChatEntry =
  | 'global-fab'
  | 'overview-topology'
  | 'team-leader-card'
  | 'team-workbench'
  | 'worker-card'
  | 'project-doc-library'
  | 'decision-detail'
  | 'settings-test'
```

### 8.3 target 类型

```ts
type ChatTargetType =
  | 'global-assistant'
  | 'team-leader'
```

普通员工不作为 target。用户从员工卡发起沟通时，系统应解析该员工所属团队 Leader 作为 target，并把 `workerId` 作为上下文传入。

---

## 9. HostContext 设计

`HostContext` 是智能软件工厂传给 agent-web-kit 的业务上下文快照。它应足够表达“用户从哪里来、正在看什么、希望对谁发起沟通”。

```ts
type AgentTeamHostContext = {
  source: 'agent-team'
  entry: ChatEntry

  target: {
    targetType: 'global-assistant' | 'team-leader'
    agentId: string
    leaderId?: string
    leaderName?: string
  }

  team?: {
    teamId: string
    teamName: string
    health?: string
    currentProjectId?: string
  }

  worker?: {
    workerId: string
    workerName: string
    templateId?: string
    roleName?: string
    teamId?: string
  }

  project?: {
    projectId: string
    projectName: string
    stage?: string
  }

  doc?: {
    docId: string
    docTitle: string
    docCategory?: string
    docVersion?: string
    publishedVersion?: string
  }

  decision?: {
    decisionId: string
    title: string
    status: 'pending' | 'resolved' | 'blocked' | 'expired'
    urgency?: 'normal' | 'urgent'
  }

  permissions?: {
    canCreateDecision?: boolean
    canPublishDoc?: boolean
    canAssignWorker?: boolean
  }

  snapshotAt: string
}
```

### 9.1 HostContext 规则

**HostContext 最小必要上下文原则**：HostContext 只传当前对话所需的最小业务快照，不传完整业务库。

1. `HostContext` 是上下文快照，不是业务主数据。
2. `HostContext` 可以冗余名称、标题、状态等展示字段，便于 Agent 理解。
3. 业务真实状态仍以 agent-team 的数据层为准。
4. 每次从新入口打开小云，应重新构造上下文。
5. 文档发布、决策处理等关键动作后，应触发上下文更新；P0a 更新 MockChatAdapter，P0b 保存 agent-team 侧上下文快照，P1 再对接真实协议。
6. `HostContext` 不作为权限判断依据，权限仍由 agent-team 业务层或 API 判断。
7. `HostContext` 不包含 token、密钥、完整文档库、完整员工列表或敏感运行配置。
8. 从普通员工入口打开时，HostContext 可以包含 `workerId`，但 target 仍必须是所属团队 Leader.

---

## 10. target / session / conversationId 关系

| 概念 | 所属方 | 含义 | 示例 |
|---|---|---|---|
| target | agent-team | 业务对话对象 | 全局助手、研发一组 Leader |
| agentId | agent-web-kit / gateway | 对话 Agent 标识 | `leader-team-1` |
| session | 业务语义 | 某 target 下的一段持续会话 | 研发一组 Leader 当前会话 |
| conversationId | agent-gateway | Gateway 会话 ID | `conv_xxx` |
| runtimeSessionId | OpenCode Runtime | 运行时会话 ID | `runtime_xxx` |

设计要求：

```text
agent-team 可以记住 target 与业务上下文；
agent-gateway 是 conversationId / runtimeSessionId 的真源；
前端不得本地拼 runtimeSessionId；
普通 worker 不能直接成为 target。
```

---

## 11. 入口到上下文映射

| 入口 | target | HostContext 必填 | 说明 |
|---|---|---|---|
| 右下角全局按钮 | global-assistant | entry | 全局助手，不绑定具体团队 |
| 总览 Leader 节点 | team-leader | team、target | 自动切到对应团队 Leader |
| 团队工作台 Leader | team-leader | team、project、target | 默认沟通团队当前项目 |
| 员工卡“通过 Leader 联系” | team-leader | team、worker、target | worker 作为上下文，不作为 target |
| 项目文档库 | team-leader | team、project、doc、target | 注入当前文档和发布版本 |
| 待决策详情 | team-leader | team、project、decision、target | 注入决策上下文 |

---

## 12. interaction.request 到 Decision 的映射

`agent-web-kit` 的 `interaction.request` 可用于渲染问题卡。智能软件工厂需要进一步区分：

```text
普通问题：只在小云内回答。
正式决策：同步创建或关联 agent-team Decision。
```

P1 建议通过 `AgentInteraction.metadata` 标准字段增加业务语义。P0a/P0b 不应假设该字段已经存在；如果当前 agent-web-kit 未支持，则由 agent-team 的 `mapInteractionToDecision()` 根据 payload、入口上下文和幂等键做兼容映射：

```ts
type AgentTeamInteractionMetadata = {
  businessType?: 'question' | 'decision'
  decisionType?: 'requirement' | 'risk' | 'doc-conflict' | 'operation-confirm' | 'preference'
  teamId?: string
  projectId?: string
  docId?: string
  workerId?: string
  urgency?: 'normal' | 'urgent'
  expiresAt?: string
}
```

### 12.1 映射规则

```text
收到 interaction.request
→ 判断 metadata.businessType
→ question：交给 agent-widget 内部问题卡处理
→ decision：创建或更新 Decision
→ 待决策页显示
→ 用户处理 Decision
→ 发送 interaction.answer
→ 写入 Activity / DocHistory / ConversationEvent
```

### 12.2 幂等规则

为避免重复创建决策，应使用以下字段做幂等键：

```text
conversationId + interactionId
```

如果同一个 interaction 重放，只更新已有 Decision 的最新上下文，不新建重复决策。

---

## 13. 文档发布后的上下文更新

文档发布后，是否让已有小云会话立即感知新上下文，按阶段处理。

### 13.1 P0a：MockChatAdapter 更新

P0a 只更新前端状态和 MockChatAdapter 上下文：

```text
Doc 发布
→ 更新前端 published version
→ 生成 Activity
→ MockChatAdapter 读取最新上下文快照
```

不要求真实 Gateway、真实 OpenCode Runtime 或真实 agent-web-kit 会话感知。

### 13.2 P0b：agent-team 侧上下文快照

P0b 发布生成 `DocVersion`，并可在 agent-team 侧保存 `ConversationContextSnapshot`：

```text
ConversationContextSnapshot
├── conversationId?       # 真实对话存在时记录
├── targetType
├── targetId
├── teamId
├── projectId
├── docVersionId
├── createdAt
└── source: doc_publish | decision_resolved | manual_refresh
```

如果 P0b 尚未接入真实 agent-web-kit，该快照只作为业务记录，不阻塞本地可运行 MVP。

### 13.3 P1：建议协议增强

P1 再对接真实 `context.update` 或等价 Gateway API，让真实会话感知新发布版本。

建议增强形式之一：

```ts
type AgentCommand =
  | { type: 'context.update'; hostContext: AgentTeamHostContext }
```

注意：`context.update` 是建议增强，不假设当前 agent-web-kit 已支持。当前阶段若不支持，由 agent-team 侧上下文快照承担过渡能力。

## 14. 错误、降级与 fallback

| 场景 | 处理方式 | 用户反馈 |
|---|---|---|
| agent-web-kit 未加载 | 回退 MockChatAdapter | 显示“当前为模拟对话” |
| agent-gateway 不可用 | 保留输入，不发送真实请求 | 显示连接失败与重试 |
| SSE 中断 | 标记会话异常，允许重新连接 | 显示“连接中断，可重试” |
| interaction 重复 | 按幂等键合并 | 不重复生成待决策 |
| 文档上下文过期 | 重新构造 HostContext | 提示已刷新上下文 |
| target 缺失 | fallback 到 global-assistant | 提示未找到团队 Leader |
| 权限不足 | 不发送敏感命令 | 显示不可执行原因 |

---

## 15. 分阶段计划

集成分阶段与项目整体 P0a / P0b / P1 保持一致。

### 15.1 P0a：Mock 集成

目标：验证入口、target、HostContext 和业务事件映射心智。

- 使用 MockChatAdapter。
- 保留当前项目自己的入口。
- 从总览、团队、员工、文档、待决策打开小云时构造 HostContext。
- 模拟 `interaction.request`，在 agent-team 侧创建 mock Decision。
- 模拟文档发布后的上下文更新，不接真实 Gateway。

### 15.2 P0b：本地可运行与可选文本对话

目标：业务对象持久化后，为真实对话接入准备绑定关系，但不要求完整业务闭环。

- 可选接入 agent-web-kit `<agent-widget>` 文本对话。
- 可选保存 ConversationBinding。
- P0b 若未接入真实 agent-web-kit，不影响本地可运行 MVP 验收。
- 文档发布后保存 agent-team 侧 ConversationContextSnapshot。
- 不要求真实 `context.update`、真实 OpenCode Runtime 或 interaction → Decision 完整回写。

### 15.3 P1：真实业务闭环

目标：打通 agent-web-kit / agent-gateway / OpenCode 真实链路。

- `interaction.request` 标准化映射为 Decision。
- Decision 处理后回写 `interaction.answer` 或等价命令。
- 文档发布通过 `context.update` 或等价协议刷新会话上下文。
- 会话结果写入 Activity / 文档历史 / 决策历史。
- 增加权限、审计、错误恢复和重试策略。

## 16. 验收用例

| 用例 | 操作 | 期望 |
|---|---|---|
| CHAT-001 | 从全局按钮打开小云 | target 为 global-assistant |
| CHAT-002 | 从团队 Leader 打开小云 | target 为该团队 Leader，HostContext 含 teamId |
| CHAT-003 | 从员工卡发起沟通 | target 为所属团队 Leader，HostContext 含 workerId |
| CHAT-004 | 从文档库打开小云 | HostContext 含 docId、docVersion、projectId |
| CHAT-005 | 小云产生正式决策 | 待决策页新增 Decision |
| CHAT-006 | 用户处理 Decision | P0a/P0b 至少回写 Decision 与 Activity；P1 再回写 interaction.answer |
| CHAT-007 | 文档发布后继续对话 | P0a 更新 mock 上下文；P0b 记录上下文快照；P1 通过 context.update 或等价协议刷新 |
| CHAT-008 | Gateway 不可用 | 不影响主页面，显示降级提示 |
| CHAT-009 | 从普通员工卡点击沟通 | 打开所属团队 Leader 对话；HostContext 包含 `workerId`；UI 文案显示“通过 Leader 联系”；不会创建 worker 直接 conversation |

## 17. 多角色评审结论

### 产品评审

集成方式符合当前产品心智：小云是连接能力，不应覆盖智能软件工厂的业务主线。用户仍从团队、员工、文档、决策等业务入口发起对话。

### 架构评审

采用 chat-integration 适配层可以隔离 agent-team 与 agent-web-kit。需严格避免 agent-web-kit 反向理解业务模型。

### 前端评审

P0a 使用 MockChatAdapter 是必要的，可以避免小云真实接入阻塞配置态和运行态页面开发。

### 后端评审

P0b 之前不要求真实会话持久化。P1 需要增加 ConversationContextSnapshot、DecisionInteractionMapping 等持久化对象。

### 数据模型评审

`target`、`session`、`conversationId`、`runtimeSessionId` 必须分层，不可混用。

### QA 评审

验收应按入口和业务闭环测试，而不是只测试对话框能否打开。

---

## 18. 遗留问题

1. `agent-web-kit` 是否正式支持 `context.update` 命令；如不支持，P0b 先由 agent-team 维护上下文快照。
2. `AgentInteraction.metadata` 是否进入 `@agent-web/contracts` 正式类型；如暂未进入，先使用 `payload.extra` 或约定字段。
3. 多团队 Leader 会话是否一 target 一 conversation，还是同 target 可多 conversation，需要在 P0b 接入时根据 Gateway 能力确认。
4. 小云对话历史是否进入智能软件工厂数据库，还是只由 Gateway / OpenCode 管理，需要在 P1 决策。
