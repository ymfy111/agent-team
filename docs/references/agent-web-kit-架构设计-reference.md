# Agent Web Kit 架构设计

## 1. 项目总览

agent-web-kit 是一个 **pnpm workspace monorepo**，将 AI 对话 Widget 拆分为 5 个 npm 包 + 1 个网关应用：

```
agent-web-kit/
├── packages/
│   ├── contracts          # 共享类型定义（零依赖）
│   ├── gateway-client     # HTTP/SSE 通信客户端
│   ├── widget-core        # 纯逻辑层（状态管理、事件归约）
│   ├── widget-lit         # Web Component UI（Shadow DOM）
│   └── embed-sdk          # 宿主集成 SDK（编排层）
├── apps/
│   └── agent-gateway      # Fastify 网关服务（连接 OpenCode runtime）
└── tsconfig.base.json     # 共享 TypeScript 配置
```

### 依赖关系

```
contracts (零依赖)
    ↓
gateway-client ──→ contracts
widget-core    ──→ contracts
    ↓
widget-lit     ──→ contracts + widget-core
    ↓
embed-sdk      ──→ contracts + gateway-client + widget-core + widget-lit
```

**原则：下层不依赖上层，embed-sdk 是唯一的"全量聚合"包。**

### 前后端调用关系

```
┌──────────────────────────────────────────────────────────────────────┐
│                        浏览器（前端）                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  宿主页面（三方网站 / P3 原型）                                 │  │
│  │                                                                │  │
│  │   ┌──────────┐    调用     ┌───────────┐                       │  │
│  │   │ embed-sdk │───────────▶│ widget-lit │ <agent-widget>       │  │
│  │   │  (编排层) │            │  (渲染层)  │ <agent-launcher>     │  │
│  │   └──┬────┬──┘            └─────▲──────┘                       │  │
│  │      │    │                     │                               │  │
│  │ 驱动 │    │ 传 ViewModel        │ 传 ViewModel                  │  │
│  │ 状态 │    │                     │                               │  │
│  │      │    │  ┌─────────────┐    │                               │  │
│  │      │    └─▶│ widget-core │────┘                               │  │
│  │      │       │ (状态管理)  │ reduceState → ViewModel            │  │
│  │      │       └──────▲──────┘                                    │  │
│  │      │              │ 类型定义                                   │  │
│  │      │       ┌──────┴──────┐                                    │  │
│  │      │       │  contracts  │ AgentEvent / AgentCommand / ...    │  │
│  │      │       │(零依赖类型) │                                    │  │
│  │      │       └──────▲──────┘                                    │  │
│  │      │              │ 类型定义                                   │  │
│  │      │       ┌──────┴─────────┐                                 │  │
│  │      └──────▶│ gateway-client │                                 │  │
│  │              │  (通信客户端)  │                                 │  │
│  │              └────────┬───────┘                                  │  │
│  └───────────────────────┼─────────────────────────────────────────┘  │
│                          │                                            │
│               HTTP POST  (sendCommand)                                │
│               HTTP GET   (getMessages, resolve, interactions)         │
│               SSE  GET   (subscribeEvents)                            │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
═══════════════════════════╪═══════════════════  网络边界
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                     服务端（后端）                                      │
│                          │                                            │
│               ┌──────────▼───────────┐                                │
│               │   agent-gateway      │  Fastify :8787                 │
│               │   /agent-gateway/*   │                                │
│               └──────────┬───────────┘                                │
│                          │                                            │
│               HTTP / SSE │ (OpenCode HTTP API)                        │
│                          │                                            │
│               ┌──────────▼───────────┐                                │
│               │  OpenCode Runtime    │  :7000                         │
│               │  (AI 会话引擎)       │                                │
│               └──────────────────────┘                                │
└───────────────────────────────────────────────────────────────────────┘
```

| 包 | 前/后端 | 角色 |
|---|---|---|
| `contracts` | 前端（编译时共享） | 纯类型，前后端都引用但只在编译期存在 |
| `widget-core` | 前端 | 纯函数状态管理，event → state → viewModel |
| `widget-lit` | 前端 | Web Component 渲染层（Shadow DOM） |
| `gateway-client` | 前端 | HTTP/SSE 客户端，**唯一跨网络边界的包** |
| `embed-sdk` | 前端 | 编排层，串联 client → core → lit |
| `agent-gateway` | **后端** | Fastify 服务，桥接前端请求与 OpenCode Runtime |

5 个 npm 包全部运行在浏览器端，只有 `agent-gateway`（apps/ 下的应用）是后端服务。前后端的唯一通信通道是 `gateway-client` → `agent-gateway` 的 HTTP/SSE 调用。

---

## 2. Widget 两种挂载模式（集成方必读）

Widget 提供两种互斥的挂载方式，三方网站根据自身情况二选一：

### 模式 A：全托管（Launcher + Dialog 整体挂载）

Widget 同时提供**工具栏入口**（`<agent-launcher>`）和**对话框**（`<agent-widget>`）。
三方网站不需要提供任何 UI 入口，Widget 自带右下角浮动按钮 → 点击展开对话框。

```
三方网站
  └─ <agent-launcher>        ← Widget 提供的浮动工具栏（小云头像 + 菜单）
      └─ <agent-widget>      ← Widget 提供的完整对话框（header + 消息 + 输入框 + 工具栏）
```

**适用场景**：三方网站没有自己的工具栏/助手入口，完全委托 Widget 处理。

### 模式 B：仅对话框（三方网站自有入口触发）

三方网站已有自己的工具栏/悬浮按钮/菜单项，只需要点击时弹出 Widget 的**对话框**。
不挂载 `<agent-launcher>`，三方网站自行控制对话框的显示/隐藏。

```
三方网站
  ├─ 自有工具栏 / 按钮 / 菜单项     ← 三方网站提供的入口
  └─ <agent-widget>                  ← Widget 提供的完整对话框（独立浮动，自带 header）
```

**适用场景**：三方网站有统一的工具栏 UI，只需在特定按钮点击时弹出 AI 对话。

### 关键约束

1. **对话框（`<agent-widget>`）是完整自包含的**：自带 header、消息区、输入框、工具栏。外部不需要也不应该再包裹额外的面板壳。
2. **不存在"对话框嵌入外部面板内部"的模式**。如果宿主有自己的面板 chrome（标题栏、状态栏等），应当隐藏，由 Widget 的 header 统一提供。
3. 模式 A 和模式 B 的 `<agent-widget>` 是同一个组件、同一套行为，区别仅在于谁控制它的显隐。

---

## 3. 各包职责

| 包 | 职责 | 关键导出 |
|----|------|----------|
| `@agent-web/contracts` | TS 类型定义：消息、命令、交互、挂载选项 | `AgentCommand`, `ConversationRef`, `AgentWidgetMountOptions` |
| `@agent-web/gateway-client` | 与 agent-gateway 的 HTTP 通信 + SSE 订阅 | `createGatewayClient()`, `GatewaySubscription` |
| `@agent-web/widget-core` | 纯函数状态管理：消息归约、ViewModel 构建、历史修剪 | `reduceConversationState()`, `selectConversationViewModel()` |
| `@agent-web/widget-lit` | Web Component 渲染：`<agent-widget>` + `<agent-launcher>` | `renderAgentWidget()`, `AgentWidgetElement` |
| `@agent-web/embed-sdk` | 宿主集成入口：创建 gateway client → 订阅 SSE → 驱动 widget | `mountAgentWidget()` |
| `@agent-web/agent-gateway` | Fastify HTTP 网关，桥接前端请求与 OpenCode runtime | — (应用，不导出) |

## 4. 核心类型契约

核心契约由 `@agent-web/contracts` 提供，UI 状态契约由 `@agent-web/widget-core` 提供。开发时优先遵守这些类型，而不是依赖某个页面的 DOM 结构。

### 4.1 `@agent-web/contracts`

```ts
type AgentWidgetMountOptions = {
  defaultAgentId?: string
  initialConversationId?: string
  gatewayBaseUrl: string
  hostContext?: HostContext
  permissions?: Record<string, boolean>
  modelName?: string
  leaderStatusMain?: string
  leaderStatusSub?: string
}

type ConversationRef = {
  conversationId: string
  runtimeSessionId?: string
  directory?: string
  status: 'new' | 'binding' | 'active' | 'closed' | 'error'
}

type AgentCommand =
  | { type: 'message.send'; text: string; attachmentIds?: string[]; attachments?: AgentAttachment[]; interactionMode?: 'native-question' }
  | { type: 'message.stop'; requestId?: string }
  | { type: 'interaction.answer'; interactionId: string; answers: Record<string, string | string[]>; action?: 'submit' | 'dismiss' }

type AgentEvent =
  | { type: 'assistant.delta'; conversationId: string; text: string }
  | { type: 'assistant.done'; conversationId: string }
  | { type: 'interaction.request'; conversationId: string; payload: AgentInteraction }
  | { type: 'interaction.closed'; conversationId: string; interactionId: string; action: 'submit' | 'dismiss' }
  | { type: 'error'; conversationId?: string; code: string; message: string }
```

`AgentInteraction` 用于标准化 question/表单类交互：

```ts
type AgentInteraction = {
  id: string
  title: string
  interactionType?: 'questions'
  questions?: Array<{
    id: string
    label: string
    inputType?: 'text' | 'textarea' | 'single-choice' | 'multi-choice'
    required?: boolean
    options?: Array<{ label: string; value: string }>
    placeholder?: string
  }>
  actions?: Array<'submit' | 'dismiss'>
}
```

### 4.2 `@agent-web/widget-core`

```ts
type ConversationMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  status?: 'streaming' | 'complete'
}

type ConversationState = {
  messages: ConversationMessage[]
  pendingInteraction?: AgentInteraction
  closedInteractions?: Array<{ interaction: AgentInteraction; action: 'submit' | 'dismiss' }>
  error?: { code: string; message: string }
  stopped?: boolean
}

type ConversationViewModel = Omit<ConversationState, 'stopped'>
```

约定：`ConversationState` 是内部状态，`ConversationViewModel` 是传给渲染层的状态。`stopped` 不进入 ViewModel。

### 4.3 `@agent-web/gateway-client` 与 `@agent-web/embed-sdk`

gateway-client 的主要便捷方法：

```ts
createGatewayClient({ gatewayBaseUrl }).resolveAgent(agentId)
createGatewayClient({ gatewayBaseUrl }).createConversation(agentId, hostContext?)
createGatewayClient({ gatewayBaseUrl }).sendCommand({ agentId, conversationId, command })
createGatewayClient({ gatewayBaseUrl }).getMessages(conversationId, { limit? })
createGatewayClient({ gatewayBaseUrl }).listPendingInteractions(conversationId)
createGatewayClient({ gatewayBaseUrl }).subscribeEvents(conversationId, { onEvent, onError?, onClose? })
```

embed-sdk 的底层挂载接口需要调用方传入已解析的 agent、conversation 与初始 ViewModel：

```ts
type AgentWidgetEmbedOptions = {
  target: Element
  agentId: string
  conversationId: string
  gatewayBaseUrl: string
  viewModel: ConversationViewModel
  autoSync?: boolean
  modelName?: string
  leaderStatusMain?: string
  leaderStatusSub?: string
}

type AgentWidgetEmbedHandle = {
  update(nextOptions: Partial<Omit<AgentWidgetEmbedOptions, 'target'>>): void
  unmount(): void
}
```

P3 原型宿主可使用 `createP3PrototypeAgentWidgetHost()` 先通过 Gateway 创建/绑定会话，再调用底层 `mountAgentWidget()`。

## 5. Gateway API 契约

Gateway 对前端暴露统一 `/agent-gateway` API，前端不得直接调用 OpenCode runtime。

| Method | Path | 用途 | 请求/参数 | 响应概要 |
|---|---|---|---|---|
| `GET` | `/agent-gateway/agents/:agentId/resolve` | 解析 agent 信息 | path: `agentId` | `{ agentId, profile, capabilities, status }` |
| `GET` | `/agent-gateway/teamleaders` | 获取 TeamLeader 目录 | 无 | `{ leaders: TeamLeaderDirectoryEntry[] }` |
| `POST` | `/agent-gateway/conversations` | 创建/复用会话 | `{ agentId, forceNew?, recreate? }` | `{ agentId, conversationId, runtimeSessionId, title, directory, updatedAt, status }` |
| `POST` | `/agent-gateway/commands/send` | 发送命令 | `{ agentId, conversationId, command }` | `{ ok: true }`（异步处理） |
| `GET` | `/agent-gateway/conversations/:conversationId/events` | 订阅事件流 | query: `closeOnDone?`, `closeOnError?` | `text/event-stream`，每条为 `AgentEvent` |
| `GET` | `/agent-gateway/conversations/:conversationId/messages` | 获取消息快照 | query: `limit`（1~100） | `{ conversationId, messages: [{ role, text }] }` |
| `GET` | `/agent-gateway/conversations/:conversationId/interactions` | 获取待处理交互 | 无 | `{ conversationId, interactions: AgentInteraction[] }` |

SSE 事件格式：

```text
data: {"type":"assistant.delta","conversationId":"...","text":"..."}

```

事件类型只允许使用 `AgentEvent` 定义中的 5 类：`assistant.delta` / `assistant.done` / `interaction.request` / `interaction.closed` / `error`。错误事件是一次性通知，历史重放时不会 replay `error`。

## 6. 构建方式

所有包使用 **TypeScript tsc** 直接编译，无 bundler（Vite/Webpack/Rollup）。

```bash
# 全量构建
pnpm -r run build

# 单包构建
pnpm --filter @agent-web/widget-lit run build

# 类型检查（不产出文件）
npx tsc -p packages/widget-lit/tsconfig.json --noEmit
```

每个包的 `tsconfig.json` 继承根目录 `tsconfig.base.json`，编译产物输出到各自的 `dist/` 目录。

**构建顺序**（按依赖拓扑）：
1. contracts
2. gateway-client、widget-core（可并行）
3. widget-lit
4. embed-sdk

## 7. Web Component 注册机制

`widget-lit` 包中的 `<agent-widget>` 和 `<agent-launcher>` 是标准 Web Component，使用 `customElements.define()` 手动注册。虽然包名中保留了 `lit`，但当前实现**不依赖 Lit 框架**，而是 vanilla `HTMLElement` + Shadow DOM。

```typescript
// packages/widget-lit/src/index.ts
export function renderAgentWidget(options): AgentWidgetElement {
  // 注册 custom element（幂等）
  if (!customElements.get('agent-widget')) {
    customElements.define('agent-widget', AgentWidgetElement)
  }
  const el = document.createElement('agent-widget') as AgentWidgetElement
  el.update(options)
  return el
}
```

**Shadow DOM 样式隔离**：所有 CSS 内联在组件的 `attachShadow()` 中，不污染宿主页面。

## 8. 宿主项目集成

### 方式 A：使用 embed-sdk（推荐）

embed-sdk 封装了完整流程：创建通信客户端 → SSE 订阅 → 状态管理 → Widget 渲染。

```typescript
import { mountAgentWidget } from '@agent-web/embed-sdk'

const handle = mountAgentWidget({
  target: document.getElementById('chat-container'),
  agentId: 'my-agent',
  conversationId: 'conversation-id-from-gateway',
  gatewayBaseUrl: 'http://127.0.0.1:8787', // 示例：Gateway 地址，不是 OpenCode runtime 地址
  viewModel: { messages: [] },
  autoSync: true,
})

// 更新配置
handle.update({ agentId: 'another-agent' })

// 卸载
handle.unmount()
```

说明：`headerless` 是 `<agent-widget>` 组件 attribute，不是 `mountAgentWidget()` 的公开参数。embed-sdk 默认挂载完整 Widget；仅在高级手动组装场景中才直接设置组件 attribute。

### 方式 B：手动组装（高级）

如果宿主需要自定义状态管理或通信层：

```typescript
import { createGatewayClient } from '@agent-web/gateway-client'
import { reduceConversationState, selectConversationViewModel } from '@agent-web/widget-core'
import { renderAgentWidget } from '@agent-web/widget-lit'

// 1. 创建通信客户端
const client = createGatewayClient({ gatewayBaseUrl: 'http://127.0.0.1:8787' })

// 2. 渲染 widget，并自行管理状态
let state = { /* initial */ }
const widget = renderAgentWidget({
  viewModel: selectConversationViewModel(state),
  onSendMessage: (text) => client.sendCommand({ agentId, conversationId: convId, command: { type: 'message.send', text } }),
})
document.body.appendChild(widget)

// 3. 订阅 SSE，并把事件喂给 reducer
const subscription = client.subscribeEvents(convId, {
  onEvent(event) {
    state = reduceConversationState(state, event)
    widget.update({ viewModel: selectConversationViewModel(state) })
  },
})
```

## 9. 运行开发环境

```bash
# 1. 安装依赖
pnpm install

# 2. 一键启动 P3 开发环境（OpenCode 7000 + Gateway 8787 + Vite 5173）
# 当前本地验证约定：OpenCode/Gateway 工作目录指向用户产品工作区 p2
OPENCODE_LEADER_DIRECTORY=/home/kk/workspace/p2 pnpm run dev:p3

# 3. 单独启动 Gateway（需要 OpenCode runtime 已在 7000 端口运行）
OPENCODE_ENDPOINT=http://127.0.0.1:7000 pnpm --filter @agent-web/agent-gateway run dev
```

前置条件：`pnpm` 可用、`opencode` 命令可用、端口 `7000/8787/5173` 未被占用。项目未显式声明 Node engines；依赖层面至少要求 Node >= 18。

常用环境变量：

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `AGENT_GATEWAY_HOST` | `127.0.0.1` | Gateway 监听地址 |
| `AGENT_GATEWAY_PORT` | `8787` | Gateway 监听端口 |
| `OPENCODE_ENDPOINT` | `http://127.0.0.1:7000` | OpenCode runtime 地址 |
| `OPENCODE_TOKEN` | 空 | OpenCode Bearer Token |
| `OPENCODE_LEADER_TITLE` | `AGENT-TEAM/全局助手/LEADER` | Leader 会话标题 |
| `OPENCODE_LEADER_DIRECTORY` | 脚本默认值，可覆盖 | Leader 工作目录，当前本地验证应设为 `/home/kk/workspace/p2` |

## 10. 分层架构的开发与调试方法论

> 从实际踩坑经验总结。单文件原型改了就生效，monorepo 分层后每次改动要跨包构建、重启服务、手动验证，效率反而下降。以下方法论解决这个问题。

### 10.0 当前收敛判断

翻版开发比 HTML 单文件原型慢，根因不是“分层架构错误”，而是迁移过程中同时承担了三类成本：

1. 复刻旧版可见行为；
2. 把单文件拆成可复用 monorepo；
3. 接入真实 Gateway/OpenCode 链路。

如果没有同步补上构建反馈和防回归测试，分层只会增加包间构建、dist 缓存、服务重启和跨层定位成本。

当前 `packages/widget-lit/src/agent-widget.ts` 约 1276 行，不是此前误读的“75K 行”。它是偏大的 UI 组件，但不是必须立刻大拆的超巨型 God Component。正确路线是：**先 Q-1 缩短构建反馈 → 再 Q-2 补高频回归测试 → 最后轻量拆分 widget-lit**。

### 10.1 核心原则：测试守住每层契约，改动时不启动全链路

分层架构的优势是**每层可独立测试**。如果每次改动都要启动 OpenCode + Gateway + Vite 三个服务再到浏览器里手动验证，说明测试覆盖不够。

**目标：日常改代码优先跑相关包测试和 `pnpm test`，不启动全链路服务。全链路验证只在最终验收、真实 SSE/浏览器行为或跨服务时序问题时做。**

在 Q-1 完成前，任何跨包前端改动都要显式确认浏览器消费的是最新源码还是旧 `dist/`；在 Q-2 完成前，不启动 Phase 3 新功能。

### 10.2 每层测试的边界

| 层 | 测试输入 | 测试输出 | 不测什么 |
|---|---------|---------|---------|
| **widget-core** | AgentEvent 事件序列 | ConversationState 状态 | DOM、渲染、网络 |
| **widget-lit** | ConversationViewModel | HTML 字符串 / DOM 结构 | 事件来源、状态逻辑 |
| **gateway runtime** | OpenCode SSE 原始文本 | 标准 AgentEvent | 真实网络连接 |
| **gateway-client** | SSE 事件 / HTTP 响应 | 回调触发、数据结构 | 真实 HTTP |
| **embed-sdk** | 事件→状态→渲染的编排 | 状态流转正确性 | 具体 UI 细节 |

### 10.3 开发流程：测试驱动修复

以实际 bug 为例——收到 error 事件后输入框一直卡在"正在回复..."：

**第一步：定位 bug 在哪一层。** 输入框状态由 `widget-core` 的 `ConversationState.messages[].status` 控制，所以问题在 widget-core。

**第二步：写一个失败的测试。**

```ts
// packages/widget-core/src/widget-core.test.ts
it('completes streaming messages when error event arrives', () => {
  const state = reduceConversationState(
    { messages: [{ id: 'a-1', role: 'assistant', text: '', status: 'streaming' }] },
    { type: 'error', conversationId: 'c1', code: 'MODEL_ERROR', message: '模型不可用' }
  )
  expect(state.error?.code).toBe('MODEL_ERROR')
  expect(state.messages[0].status).toBe('complete')  // 这行会失败
})
```

**第三步：改代码让测试通过。**

```ts
// event-reducer.ts 的 error case
case 'error':
  return {
    ...state,
    error: { code: event.code, message: event.message },
    messages: state.messages.map((m) =>
      m.status === 'streaming' ? { ...m, status: 'complete' as const } : m,
    ),
  }
```

**第四步：跑该包全部测试确认无回归。**

```bash
cd packages/widget-core && pnpm test  # 200ms，24 个测试全过
```

**第五步：最后才做一次端到端验证（可选）。**

### 10.4 何时需要全链路验证

全链路验证（启动三个服务 + 浏览器）只在以下场景做：

- 新功能开发完成后的最终验收
- 涉及真实 SSE 连接、重连、超时行为
- 涉及浏览器特定行为（localStorage 缓存、Vite HMR）
- 涉及跨服务时序问题（如 gateway 缓存旧 session ID）
- 验收前的最终一轮冒烟测试

**日常改代码不应依赖全链路验证。**

### 10.5 构建与热更新优化

| 组件 | 改代码后需要什么 | 优化方案 |
|------|----------------|---------|
| widget-core / gateway-client / contracts | 需 `pnpm build` 后 Vite 才能消费 | 让 `package.json` 的 `exports` 指向 `src/`，Vite 直接消费源码，改了即生效 |
| widget-lit | Vite HMR 通常自动生效 | 确认依赖包的 exports 配置 |
| agent-gateway | 必须重启进程 | `"dev": "tsx --watch src/standalone.ts"`，改代码后自动重启 |
| embed-sdk | Vite HMR | 同 widget-lit |

### 10.6 调试链路速查

当 UI 行为不符合预期时，按以下顺序排查：

```
1. widget-lit：渲染是否正确？
   → 检查 ViewModel 的值（浏览器 DevTools）

2. widget-core：状态转换是否正确？
   → 写测试验证：给定事件序列，输出状态是否符合预期

3. embed-sdk：事件是否到达 widget-core？
   → 在 onEvent 回调里打日志

4. gateway-client：SSE 事件是否到达 embed-sdk？
   → 浏览器 Network 面板查看 EventStream

5. agent-gateway：OpenCode 事件是否正确转换为 AgentEvent？
   → 写测试验证 toAgentEvent 的输入输出

6. OpenCode：是否返回了预期的 SSE 事件？
   → curl 直接请求 OpenCode API 确认
```

**从上往下排查（UI→状态→网络→后端），第一个异常的层就是 bug 所在。**

### 10.7 踩坑记录

| 问题 | 根因 | 解法 |
|------|------|------|
| 改了 widget-core 但 UI 没变 | 需要先 build 才能被 Vite 消费 | `pnpm build` 或改 exports 指向源码 |
| 改了默认模型但浏览器还是旧的 | localStorage 缓存了旧模型选择 | 清除 site data |
| Gateway 重启后对话断掉 | 旧 session 被 delete 后 gateway 缓存了旧 runtimeSessionId | 重启 gateway |
| error 事件到了但输入框不恢复 | reducer 的 error case 没 complete streaming 消息 | 测试驱动修复 |
| SSE 断连后输入框不恢复 | `applyTransportError` 没 complete streaming 消息 | 同上 |
| `ProviderModelNotFoundError` 前端无提示 | gateway 只处理 `finish === 'stop'`，忽略了 `interrupted`/`error` | 扩展 `toAgentEvent` 处理非 stop finish |
| 全链路验证一个 bug 要 5-10 分钟 | 缺少单元测试，依赖手动验证 | 每次修 bug 前先补失败测试 |

### 10.8 UI 层拆分原则

`agent-widget.ts` 的拆分目标是降低修改风险，不是追求抽象数量。拆分必须满足：

1. **测试先行**：先补当前行为测试，再拆模块；拆完后测试必须保持全绿。
2. **边界清楚**：优先拆样式、question card、message list、resize/drag 这类输入输出明确的模块。
3. **小步停止**：每次只拆一个模块；当 `agent-widget.ts` 降到约 600~800 行并主要承担生命周期/组合职责时停止。
4. **禁止无保护大改**：在回归测试不足时，不为了“看起来架构更好”做大范围重构。

这条原则尤其适用于 AI agent 辅助开发：文件越大、隐式耦合越多，agent 越容易只看局部就修改，导致远处行为回归。用小模块 + 明确测试来缩小上下文窗口。

## 11. Gateway 运行时规则与可靠性

### 11.1 会话真源原则

- **Gateway 是会话与目录的单一真源**，前端只消费接口，不得本地推断或拼装会话信息。
- `runtimeSessionId` 只能由 Gateway 生成和下发，前端禁止自行拼装。
- `workspaceDir` 必须为绝对路径且来源统一，禁止硬编码 leader 列表/端口/目录。

详见 §5 Gateway API 契约。

### 11.2 Backfill 幂等性

- `GET /conversations/:conversationId/interactions` 中，`eventBus.publish` 必须对 `interactionId` 去重（使用 `Set<interactionId>` 做发布前检查）。
- 接口每次仍返回完整 pending interactions，去重不影响响应体。
- 前端 DOM 去重作为第二道防线：同一 `interactionId` 只能插入一个 `[data-interaction-id]` 节点。

### 11.3 前端消息去重（SSE + Polling 并存）

当前 monorepo 链路的去重策略（原型兼容路径的文本/DOM 去重已不适用）：

| 层 | 机制 | 实现 |
|----|------|------|
| Snapshot 守卫 | streaming 期间不使用 history snapshot 覆盖当前状态 | `embed-sdk` 在 `hasStreaming` 时跳过 snapshot 写回 |
| SSE replay 守卫 | 已完成 assistant 消息不因 SSE replay 重复追加 | `widget-core` 通过 message id/status 防重 |
| Backfill 幂等 | 同一 `interactionId` 不重复 publish 到 eventBus | Gateway `Set<interactionId>` 做发布前检查（见 §11.2） |

### 11.4 Gateway 重启恢复

前端在收到 `404 CONVERSATION_NOT_FOUND` 时自动恢复：

1. 仅 `404` + `CONVERSATION_NOT_FOUND` 触发，其他 404 不恢复
2. `recoverGatewayConversation()` → `createConversation()` → 更新 `conversationId` → 重新绑定 runtime
3. 对 `sendCommand / getMessages / listPendingInteractions` 三个调用点，恢复后用新 `conversationId` 重试

**限制**：旧历史不可恢复；SSE 订阅恢复不在此逻辑内。

## 12. 分层架构收益——为什么不把所有逻辑放进 widget-lit？

如果不分层，`gateway-client`、`widget-core`、`embed-sdk` 的逻辑都会塞进 `widget-lit`，变成一个 7000+ 行的 God Component——这正是改造前原型的状态。下面用一个真实 bug 场景说明分层的价值。

### 12.1 场景：AI 流式回复中途网络断开

用户发了一条消息，AI 正在流式回复，这时网络断了。不分层的话，SSE 连接管理、断线重连、状态恢复、DOM 更新混在一个组件里，改一处容易连带出问题。分层后各层各司其职：

```
网络断开
    │
    ▼
gateway-client ──▶ 触发 onError 回调（不关心 UI 怎么显示）
    │
    ▼
widget-core    ──▶ reduceConversationState(当前状态, error事件)
    │               纯函数：streaming → complete，error 置位
    │               不碰 DOM，200ms 跑完全部测试即可验证
    ▼
widget-lit     ──▶ 拿到新 ViewModel，渲染错误提示条，
    │               输入框从"正在回复…"恢复为可输入
    │               不知道错误从哪来，只管渲染
    ▼
embed-sdk      ──▶ 串联以上三层：创建 client → 订阅事件
                    → 喂给 core 做状态转换 → 推 ViewModel 给 lit
```

具体的状态转换：

```ts
// widget-core 纯函数输入 → 输出，无副作用
输入状态:
  { messages: [{ id: 'a1', role: 'assistant', text: '正在回答...', status: 'streaming' }] }
+ error 事件:
  { type: 'error', code: 'NETWORK', message: '连接中断' }

输出状态:
  { messages: [{ id: 'a1', role: 'assistant', text: '正在回答...', status: 'complete' }],
    error: { code: 'NETWORK', message: '连接中断' } }
```

### 12.2 每层的职责边界

| 层 | 它管什么 | 它不管什么 |
|---|---------|----------|
| **gateway-client** | HTTP/SSE 连接、请求发送、事件解析 | UI 渲染、状态逻辑 |
| **widget-core** | 事件→状态的纯函数转换、ViewModel 构建 | 网络、DOM |
| **widget-lit** | 根据 ViewModel 渲染 DOM、处理用户交互 | 状态计算、网络通信 |
| **embed-sdk** | 串联以上三层的胶水编排 | 具体的状态逻辑和渲染细节 |

**每层具体做了什么（以"用户发消息 → AI 回复"为例）：**

**embed-sdk（传话的）**：
1. 用户点发送 → 收到 `onSendMessage` 回调
2. 调用 `client.sendCommand({ type: 'message.send', text })` 发到 Gateway
3. SSE 事件回来 → `onEvent` 回调触发 → 把事件喂给 widget-core
4. 拿到 core 算出的新 ViewModel → 推给 widget-lit 渲染
5. 全程不算状态、不拼字符串、不碰 DOM

**widget-core（算账的）**：
1. 收到 user message → `reduceConversationState()` 产出含 user 消息的新状态
2. 收到 `assistant.delta` → 把 text 拼接到当前 assistant 消息，status 置为 `streaming`
3. 收到 `assistant.done` → status 从 `streaming` 切为 `complete`
4. 收到 `error` → 置 error 字段，同时把所有 streaming 消息标记为 `complete`
5. 每次状态变化后 `selectConversationViewModel()` 输出供渲染的 ViewModel
6. 全程纯函数，不发请求、不碰 DOM

**widget-lit（画画的）**：
1. 收到 ViewModel 含 user 消息 → 渲染用户气泡，输入框置灰显示"正在回复…"
2. 收到 ViewModel 含 streaming assistant → 渲染 assistant 气泡 + 打字光标动画
3. delta 更新 → 气泡文本追加，光标继续闪烁
4. 收到 ViewModel 中 status 变 complete → 光标消失，输入框恢复可用
5. 收到 ViewModel 含 error → 渲染错误提示条
6. 全程不知道消息从哪来，给什么 ViewModel 就画什么

> 完整时序走读见附录 B。

### 12.3 分层 vs 不分层的实际收益对比

| 场景 | 不分层（God Component） | 分层后 |
|------|----------------------|--------|
| 修 error 后输入框不恢复 | 启动 3 个服务 + 浏览器手动复现，5-10 分钟 | 写一个 widget-core 测试，200ms 验证 |
| 换 UI 框架（当前 vanilla → React/Vue） | 重写整个组件 | 只换 widget-lit，core/client 不动 |
| 换通信协议（SSE → WebSocket） | 改动散落各处 | 只换 gateway-client |
| 宿主想自己管状态（如接入 Redux） | 没法接入 | 不用 embed-sdk，直接用 core + client |
| 多人协作 | 改状态逻辑可能破坏渲染，改渲染可能破坏状态 | 各层独立开发，通过类型契约（contracts）衔接 |

### 12.4 一句话总结

- **widget-core** = 可独立测试的纯逻辑（改了跑测试，200ms 出结果）
- **embed-sdk** = 可替换的胶水（宿主想自己编排就不用它）
- **widget-lit** = 只管渲染（给 ViewModel 就画，不问数据从哪来）

拆出来的核心目的：**不让渲染层变成什么都管的 God Component，每层可以独立改、独立测、独立换。**

## 附录 A. 与改造前（原型单文件）的对比

| 维度 | 改造前（persona2 v0.6.26 单文件） | 改造后（agent-web-kit monorepo） |
|------|-----------------------------------|----------------------------------|
| 代码组织 | 单个 7000+ 行 HTML/JS 文件 | 5 个职责清晰的 npm 包 |
| 样式隔离 | 全局 CSS，与宿主样式冲突 | Shadow DOM 完全隔离 |
| 状态管理 | 分散在 DOM 操作中 | 纯函数 reducer，可测试 |
| 通信层 | 硬编码 fetch/SSE | 独立 gateway-client，可替换 |
| 可测试性 | 几乎无法单元测试 | 每层可独立测试 |
| 复用性 | 无法在其他项目使用 | npm 包，任何项目可集成 |
| 类型安全 | 无 | 全链路 TypeScript |

## 附录 B. 场景走读：用户发消息 → AI 流式回复 → 完成

以最核心的对话场景为例，展示 embed-sdk / widget-core / widget-lit 三层在每个时刻各做了什么。

```
时间线              embed-sdk                   widget-core                  widget-lit
──────────────────────────────────────────────────────────────────────────────────────────

用户输入"你好"
点击发送
                    ┌────────────────────┐
                    │ 收到 onSendMessage │
                    │ 回调，调用          │
                    │ client.sendCommand │
                    │ ({                 │
                    │  type:'message.    │
                    │       send',      │
                    │  text:'你好'       │
                    │ })                 │
                    │                    │
                    │ 同时构造 user 消息 │
                    │ 喂给 core ────────▶│ reduceState(state,   │
                    └────────────────────┘│   userMessage)       │
                                         │                      │
                                         │ 输出新状态:           │
                                         │ messages: [{         │
                                         │   id:'u1',           │
                                         │   role:'user',       │
                                         │   text:'你好',       │
                                         │   status:'complete'  │
                                         │ }]                   │
                                         │                      │
                                         │ selectViewModel() ──▶│ 渲染用户消息气泡
                                         │                      │ 输入框置灰
                                         │                      │ 显示"正在回复…"

SSE: assistant.delta
text: "你"
                    ┌────────────────────┐
                    │ onEvent 回调触发   │
                    │ 喂给 core ────────▶│ reduceState(state,   │
                    └────────────────────┘│   assistant.delta)   │
                                         │                      │
                                         │ 输出:                │
                                         │ messages: [          │
                                         │   {id:'u1',...},     │
                                         │   {id:'a1',          │
                                         │    role:'assistant', │
                                         │    text:'你',        │
                                         │    status:'streaming'│
                                         │   }                  │
                                         │ ]                    │
                                         │                      │
                                         │ selectViewModel() ──▶│ 追加 assistant 气泡
                                         │                      │ 内容："你"
                                         │                      │ 显示打字光标动画

SSE: assistant.delta
text: "好呀"
                    ┌────────────────────┐
                    │ onEvent ──────────▶│ reduceState:         │
                    └────────────────────┘│  text: '你'+'好呀'   │
                                         │  → '你好呀'          │
                                         │  status: 'streaming' │
                                         │                      │
                                         │ selectViewModel() ──▶│ 气泡文本更新为
                                         │                      │ "你好呀"
                                         │                      │ 光标继续闪烁

SSE: assistant.done
                    ┌────────────────────┐
                    │ onEvent ──────────▶│ reduceState:         │
                    └────────────────────┘│  status: 'streaming' │
                                         │    → 'complete'      │
                                         │                      │
                                         │ selectViewModel() ──▶│ 光标消失
                                         │                      │ 输入框恢复可用
                                         │                      │ 可以输入下一条
```

**三层职责小结：**

| 层 | 做的事 | 不做的事 |
|---|--------|---------|
| **embed-sdk** | 把用户操作转成 `sendCommand` 发出去；把 SSE 事件逐条喂给 core；把 core 输出的 ViewModel 推给 lit | 不算状态、不拼字符串、不碰 DOM |
| **widget-core** | 每收一个事件，纯函数算出新状态：拼接 delta 文本、切换 streaming/complete、构建 ViewModel | 不发请求、不渲染、不知道 SSE 长什么样 |
| **widget-lit** | 每收一个 ViewModel，渲染对应的 DOM：气泡、光标、输入框状态 | 不知道消息从哪来、不管网络、不管状态怎么算 |

一句话：**embed-sdk 是传话的，widget-core 是算账的，widget-lit 是画画的。**
