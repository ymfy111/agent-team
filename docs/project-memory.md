# 智能软件工厂项目记忆

> 版本：v0.6.33  
> 日期：2026-05-17  
> 状态：当前项目记忆 / 新会话与 OpenCode 接手入口

---

## 1. 项目定位

智能软件工厂是一个智能体协作系统。它把 AI 智能体组织为“数字员工团队”，围绕项目、文档、决策和活动流完成软件研发协作。

系统不是单个聊天框，也不是简单的 prompt 集合，而是：

```text
岗位模板 → 技能资产 → 数字员工实例 → 团队 / 项目 → 文档发布 → 决策闭环 → 活动回写
```

---

## 2. 当前版本与阶段

当前文档版本：**v0.6.33**

v0.6.33 是一次文档收敛和施工图版本：

```text
- 合并 v0.6.32 多轮 PRD、系统设计、Mock、路由状态、运行时设计。
- 删除/合并历史版本和多轮评审过程材料。
- 为 OpenCode 后续开发提供完整施工图。
- 暂不直接进入编码。
```

---

## 3. 冻结的核心决策

### 3.1 岗位、员工、技能

```text
岗位 = AgentTemplate / 数字员工模板
员工 = Worker / AgentInstance / 数字员工实例
技能 = Skill / SkillVersion / SKILL.md 能力资产
岗位技能匹配 = TemplateSkillMapping
```

规则：

```text
- Skill 是能力资产。
- SkillVersion 是技能内容真源。
- TemplateSkillMapping 是岗位技能匹配真源。
- Worker 从 AgentTemplate 创建。
- Worker.skills 是派生视图，不是主数据。
```

### 3.2 数字员工运行时

一个 Worker 对应一个具体 Agent Runtime。当前实现心智是：

```text
Worker = 一个数字员工实例
      = 一个具体 Agent Runtime
      = 某个 RuntimeHost 上的 OpenCode workspaceDir
```

但不能假设所有 Worker 都在一台机器上。必须通过 RuntimeHost / WorkerRuntimeBinding 表达分布式部署可能性。

### 3.3 agent-team 与 Gateway 边界

正式业务系统中：

```text
RuntimeHost / OpenCode supervisor
→ agent-team runtime-service
→ agent-team 数据库保存 Worker / RuntimeHost / AgentRoute / AgentPresence
→ agent-gateway 通过 Provider 查询路由和脱敏状态
```

Gateway 可以承载轻量 heartbeat，但智能软件工厂正式集成时，Worker / RuntimeHost / AgentRoute / AgentPresence 的业务真源在 agent-team。

### 3.4 前端 agentId-only

前端和 widget 只传：

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
OpenCode port
token
```

### 3.5 routeStatus 唯一字段

AgentRoute 使用：

```ts
type RouteStatus = 'active' | 'disabled' | 'unavailable' | 'error'
```

不得再使用 `AgentRoute.status`。

---

## 4. P0a 范围

P0a 是前端可演示 MVP。

P0a 做：

```text
- monorepo 工程骨架
- contracts / domain / mock-seed / data-client / state
- Skill 工作台
- AgentTemplate 管理
- Worker 创建与启用/停用模拟
- RuntimeBinding 展示
- Team / Project 视图
- Doc 草稿 / 发布模拟
- Decision 处理
- Activity 回写
- 小云 MockChatAdapter
```

P0a 不做：

```text
- 真实登录 / 权限 / 多用户
- 真实后端 API
- 真实数据库
- 真实 agent-web-kit Gateway
- 真实 OpenCode runtime 启动
- 生产级审计
- 完整脚本/资源文件管理
```

---

## 5. 给 OpenCode 的默认工作方式

OpenCode 必须先读：

```text
docs/README.md
docs/文档导航.md
docs/project-memory.md
docs/specs/2026-05-17-智能软件工厂P0a工程施工图-v0.6.33.md
docs/tasks/2026-05-17-OpenCode执行清单-v0.6.33.md
docs/guides/OpenCode协作指南-v0.6.33.md
```

执行顺序必须是：

```text
contracts → domain → mock-seed → data-client → state → pages/features → polish
```

禁止直接从页面视觉开工。

---

## 6. 常见坑

```text
1. 不要把 Gateway 设计成业务状态真源。
2. 不要让前端传 workspaceDir / endpointRef / runtimeHost / token。
3. 不要混用 status 和 routeStatus。
4. 不要让 heartbeat 自动恢复 disabled。
5. 不要把会话级 busy 自动等同员工级 busy。
6. 不要让 P0a 膨胀到真实后端、Gateway、OpenCode。
7. 不要把 workspaceDir 中的技能快照当成技能主数据。
8. 不要让普通 Worker 直接对话。
9. 不要把 agent-web-kit 独立架构设计混入 agent-team 正本。
10. 不要再为每轮评审新增大量 revised/final/copy 文档。
```
