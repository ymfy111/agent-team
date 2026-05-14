# 项目记忆 — agent-team

最后同步时间: 2026-05-13

## 项目目标

agent-team 是“智能体协作项目”的产品工程目录：基于现有 Agent Team V2 注册中心原型，补齐需求、设计与实现，最终交付完整的智能体协作网站。

## 项目定位

- `p1` 是智能体工作空间，负责调度、设计、实施与验收。
- `agent-team` 是外挂项目目录，承载项目长期事实、设计文档、计划、报告、原型与后续代码。
- `agent-web-kit` 聚焦智能体 UI（对话框、嵌入 SDK、Agent Gateway）。
- `agent-team` 未来需要引用 `agent-web-kit` 组件，为协作网站提供智能体对话能力。

## 规格源 / Golden Reference

以下原型是 agent-team 的初始规格源：

| 文件 | 用途 |
|------|------|
| `docs/prototypes/Agent-Team-V2-注册中心-v0.6.25-ex.html` | Agent Team V2 注册中心基础扩展原型 |
| `docs/prototypes/Agent-Team-V2-注册中心-v0.6.26-persona2.html` | Persona 版本注册中心原型 |

原则：先读原型与行为，再补需求与设计；原型改动必须版本化，不覆盖历史版本。

## 初始开发方向

1. 从两个 HTML 原型提炼功能清单、信息架构、交互链路与视觉规范。
2. 补充需求文档与系统设计，明确注册中心、智能体卡片、协作流程、对话入口与后端边界。
3. 制定实施计划，逐步把静态原型演进为可运行协作网站。
4. 集成 `agent-web-kit` 作为对话组件，而不是在 agent-team 中重复实现聊天 UI。

## 操作规则

- 项目事实、设计、计划、报告写入本项目 `docs/`。
- 智能体运行状态写入绑定工作空间 `p1/.opencode/mem/`。
- 禁止硬编码密钥和凭据。
- 禁止 `git init`，除非用户明确要求并确认风险。

## 已验证里程碑

| 日期 | 里程碑 | 证据 |
|------|--------|------|
| 2026-05-13 | 项目初始化 | p1 绑定 agent-team；两个原型复制到 `docs/prototypes/` |
| 2026-05-13 | 需求基线稿落地 | `docs/specs/2026-05-13-智能软件工厂产品需求规格.md`；已同步 `docs/文档导航.md` |
| 2026-05-13 | 设计大纲落地 | `docs/specs/2026-05-13-智能软件工厂系统设计方案大纲.md`；PRD 已回补对话边界、决策闭环、文档发布语义 |
| 2026-05-13 | 系统设计基线稿落地 | `docs/specs/2026-05-13-智能软件工厂系统设计方案.md`；覆盖架构、模块、数据、状态、小云集成边界与实施阶段 |

## 产品核心内容

- **核心定位**：智能软件工厂 / 智能体协作网站；V2 心智为"团队承接项目 + 文档驱动开发"。
- **目标用户**：需要组建 AI 研发团队、追踪项目进展、管理智能体成员的负责人或技术 owner。
- **核心价值主张**：把 AI 智能体组织成有结构的团队，以文档（需求/计划/决策/报告）作为驱动开发的"合同"，让每个 agent 角色可识别、可追踪、可对话。

## 信息架构与模块

主要导航页面（顶部 nav）：

| 页面 | 说明 |
|------|------|
| 总览 | 所有团队协作全景、最近动态 |
| 团队 | 团队列表 + 团队详情（双 tab） |
| 项目 | 跨团队项目视图 |
| 员工 | 全员 worker 列表与筛选 |
| 待决策 | 待处理决策项汇总 |
| 设置 | 系统配置（只读展示） |

团队详情稳定为双 tab：
- **团队工作台**：左编队（成员列表可点击高亮）+ 右详情（当前选中成员/任务信息）
- **项目文档库**：支持文档预览/编辑、保存草稿、发布给 Agent

## 角色与组织模型

- 5 个研发组，每组 1 个 Leader + N 个成员。
- 角色包括：`explorer` / `fixer` / `oracle` / `designer`；UI 中存在 `librarian` 筛选残留，后续需清理。
- **普通成员不直接对话**，Leader / 主智能体承担对话入口；成员只能通过 Leader 协调。
- v0.6.26-persona2 强化"数字员工人物感"：去流程符号干扰，强化组长/组员名片、头像、角色可识别性。

## 核心数据模型

```
teams[]
  ├── id, name, leaderId, memberIds[]
  └── currentProject
        ├── id, name, status
        ├── codeRepo, modelRepo
        ├── blockers[]
        └── docs
              ├── specs[]
              ├── plans[]
              ├── decisions[]
              ├── reports[]
              └── notes[]

workers[]
  ├── id, name, role, teamId
  ├── status (idle / busy / offline)
  └── avatar, bio

decisions[]
  ├── id, title, status (pending / resolved / blocked)
  ├── teamId, projectId
  └── description, options[], resolution
```

## 关键交互链路

1. **切页**：顶部 nav 切换总览/团队/项目/员工/待决策/设置。
2. **团队 tab**：团队工作台 ↔ 项目文档库。
3. **成员选择**：左侧点击成员高亮，右侧更新详情。
4. **决策筛选和详情**：按状态/团队筛选决策，点击展开详情。
5. **文档预览/编辑/发布**：文档库 → 选文档 → 预览/编辑 → 保存草稿 / 发布给 Agent。
6. **小云会话**：发送消息、测试连接、处理 question/interaction 事件。

## agent-web-kit 集成策略

- agent-team **不重复实现**聊天 UI；未来引用 agent-web-kit 的 widget / embed-sdk。
- 小云链路默认同源 Bridge：`/api/chat/send`、`/api/chat/stream`、`/api/interactions`。
- OpenCode 直连 fallback；依赖 prompt_async + SSE 实现异步消息流。
- 集成边界：agent-team 负责业务数据（teams/workers/decisions/docs）、页面路由、鉴权；agent-web-kit 负责对话 UI 渲染与事件订阅。
- **术语**：统一使用 `session`，避免与旧 `conversation` 混用。

## 原型版本与风险

| 文件 | 版本 | 用途 | 风险 |
|------|------|------|------|
| `Agent-Team-V2-注册中心-v0.6.25-ex.html` | v0.6.25-ex | agent-web-kit migration fixture；仅作迁移参考 | 文件名含"ex"，页面内部 title/badge 版本可能与文件名不一致；禁止作为人物感基线 |
| `Agent-Team-V2-注册中心-v0.6.26-persona2.html` | v0.6.26-persona2 | **人物感基线**；后续需求提炼、视觉规范、MVP 设计的规格源 | CSS 作用域隔离（`#topologyHtml`）需注意组件复用时样式继承问题 |

- 原则：原型只读，改动必须版本化，不覆盖历史文件。
- 引用时以 v0.6.26-persona2 为基准，明确说明 v0.6.25-ex 仅用于 agent-web-kit 迁移对比。

## 计划线索

v0.4 改动计划（`docs/plans/2026-04-22-Agent-Team-V2原型v0.4-改动计划.md`）稳定方向：

- **结构纠偏**：总览页、Team 详情双栏、设置只读
- **核心状态补齐**：Worker 加入 Team 选择器、决策筛选、异常状态显示
- **命名/视觉收敛**：字段命名统一、按钮命名统一
- **AC 清单**：共 12 条验收标准
- **流程**：`designer → overmind 实景验证 → 文档同步 → 定版`

## 待办

- [ ] 原型解读 → 功能清单 / 需求规格文档（优先）
- [ ] agent-team MVP 范围与架构设计
- [ ] `session` 术语统一（全局替换旧 `conversation` 用法）
- [ ] `librarian` 角色 UI 残留清理（员工页筛选 + worker 数据）
- [ ] agent-web-kit 集成边界明确（widget API / embed-sdk 版本 / 事件协议）
- [ ] 明确与 agent-web-kit 的组件集成边界
- [ ] 制定迭代计划（基于 v0.4 改动计划 AC）并开始实施
