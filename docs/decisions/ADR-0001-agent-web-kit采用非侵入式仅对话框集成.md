# ADR-0001：agent-web-kit 采用非侵入式仅对话框集成

> 状态：Proposed  
> 日期：2026-05-15  
> 决策者：待确认  
> 适用范围：v0.6.32 技术落地补充草稿  
> 关联文档：`docs/specs/2026-05-14-智能软件工厂-agent-web-kit集成方案-v0.6.32.md`

## 背景

智能软件工厂需要“小云”对话能力，但当前项目核心是团队、项目、文档、决策、岗位、员工、技能等业务编排。对话 UI、消息流、附件、问题卡、决策卡、SSE、OpenCode Gateway 已由 `agent-web-kit` 独立项目承担。

如果在 agent-team 中继续维护完整聊天 UI，会造成重复实现、边界混乱和后续维护成本上升。

## 决策

采用 `agent-web-kit` 的“仅对话框”模式：

```text
智能软件工厂提供入口与业务上下文；
agent-web-kit 提供完整 <agent-widget> 对话框；
双方通过 HostContext、AgentCommand、AgentEvent、AgentInteraction 协议交互。
```

不采用全托管 `<agent-launcher>`。

## 理由

1. 智能软件工厂已有自己的右下角入口、Leader 入口、员工上下文入口、文档入口和决策入口。
2. `<agent-widget>` 是完整自包含对话框，不需要当前项目再包一层聊天面板。
3. 非侵入式集成可以保持 agent-web-kit 可独立演进。
4. 当前项目只维护业务上下文和业务事件映射，更符合职责边界。

## 影响

### 正向影响

- 避免重复实现聊天 UI。
- 降低 agent-team 页面复杂度。
- 便于 agent-web-kit 独立测试和复用。
- 便于 P0a 先用 mock adapter，P0b 再接真实 Gateway。

### 代价

- 需要新增 `chat-integration` 适配层。
- 需要约定 HostContext 与 Decision 映射；`context.update` 作为 P1 建议增强，不作为 P0a/P0b 阻塞条件。
- 对话框内部视觉定制需通过 agent-web-kit 的公开主题能力实现，不能直接改内部 DOM。

## 约束

1. 普通 Worker 不能直接作为对话 target。
2. agent-web-kit 不维护 Team / Project / Doc / Decision / Skill 主数据。
3. agent-team 不直接调用 OpenCode Runtime。
4. 不允许出现双 header、双关闭按钮、双缩放逻辑。

## 后续行动

- 在 `docs/specs/` 中维护集成方案。
- 在系统设计中补充 `packages/chat-integration` 层。
- P0a 使用 MockChatAdapter。
- P0b 接入 `agent-web-kit embed-sdk` 和 `agent-gateway`。
