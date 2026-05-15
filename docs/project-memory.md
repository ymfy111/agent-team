# project-memory

> 本文件记录 `agent-team` / 智能软件工厂项目的长期项目事实、当前文档基线、关键设计决策和协作约定。新会话应先读 `docs/文档导航.md`，再读本文。

## 1. 当前项目事实

- 项目名称：智能软件工厂 / agent-team。
- 当前工作版本：v0.6.32。
- 后续小改不自动升版本，用 Git 提交追踪。
- 只有信息架构、核心模型、MVP 范围、原型或技术路线发生里程碑变化时才升版本。
- 当前文档源：GitHub 仓库 `https://github.com/ymfy111/agent-team`。
- 当前工作模式：我生成保持仓库目录结构的文件包，负责人手动同步到本地并提交。

## 2. 当前文档基线

- PRD：`docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32-revised.md`
- 系统设计：`docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md`
- agent-web-kit 集成方案：`docs/specs/2026-05-14-智能软件工厂-agent-web-kit集成方案-v0.6.32.md`
- 开发计划：`docs/plans/2026-05-14-智能软件工厂开发计划-v0.6.32.md`
- 开发任务拆解：`docs/tasks/2026-05-14-智能软件工厂开发任务拆解-v0.6.32.md`
- 原型：`docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-ui-review-task-breakdown.html`
- 界面走查报告：`docs/reports/2026-05-14-智能软件工厂界面走查报告-v0.6.32.md`
- 技术落地补充评审报告：`docs/reports/2026-05-15-v0.6.32技术落地补充评审报告.md`
- 变更说明：`docs/changes/智能软件工厂-v0.6.32-变更说明.md`
- agent-web-kit 参考架构：`docs/references/agent-web-kit-架构设计-reference.md`

## 3. 产品心智

系统分为运行态和配置态：

```text
运行态：总览 / 团队 / 项目 / 待决策
配置态：岗位 / 员工 / 技能 / 设置
```

核心术语保持稳定：

| UI 名称 | 技术模型 | 含义 |
|---|---|---|
| 岗位 | AgentTemplate | 数字员工模板，定义职责和继承技能。 |
| 员工 | Worker / AgentInstance | 数字员工实例，由模板创建，可分配到团队和项目。 |
| 技能 | Skill | 以 SKILL.md 为核心的能力资产。 |
| 岗位技能匹配 | TemplateSkillMapping | 模板与 Skill 的唯一多对多关系主数据。 |
| 项目匹配 | ProjectAssignment | 员工实例与团队 / 项目的匹配关系。 |

## 4. 技术路线

阶段划分：

```text
P0a：前端可演示 MVP
P0b：本地可运行 MVP
P1：服务化与真实集成增强
```

P0a：

- 使用 mock seed、本地状态、MockChatAdapter。
- 不接真实后端 / 数据库 / Gateway / OpenCode。
- 唯一主线：`Skill → AgentTemplate → Worker → Team/Project → Doc 发布 → Decision 处理 → Activity 回写`。

P0b：

- 引入 Fastify + Prisma + SQLite。
- 持久化核心业务对象、文档版本、技能版本、决策处理结果和 Activity。
- 真实 agent-web-kit 文本对话可选，不阻塞 P0b。

P1：

- PostgreSQL + Prisma。
- 权限、审计、多用户、服务化部署。
- 完整接入 agent-web-kit + agent-gateway + OpenCode。

## 5. agent-web-kit 集成原则

- 当前项目采用非侵入式、松耦合、仅对话框模式。
- 智能软件工厂保留自己的入口、target 选择、HostContext 构造和业务事件回写。
- agent-web-kit 负责对话 UI、消息流、问题卡、决策卡、SSE、Gateway。
- `chat-integration` 只做适配和转译，不做业务决策。
- `agent-web-kit` 只产生对话事件，不成为 `Decision`、`DocVersion`、`Activity` 的业务真源。
- 普通 Worker 不直接对话，必须通过所属团队 Leader。

## 6. 文档目录约定

- `docs/specs/`：正式需求、系统设计、专项集成方案。
- `docs/plans/`：阶段计划 / Roadmap。
- `docs/tasks/`：开发任务拆解 / issue 级任务。
- `docs/decisions/`：ADR / 架构决策 / 产品关键决策。
- `docs/changes/`：版本变更说明。
- `docs/reports/`：评审报告、走查报告、测试报告。
- `docs/prototypes/`：HTML 原型与资源。
- `docs/references/`：外部项目参考资料。
- `docs/guides/`：协作方法和文档规范。

## 7. 当前遗留事项

这些事项不阻塞当前 v0.6.32 技术落地补充合入：

1. P0b 前补 Prisma schema 草案。
2. P0a 开工前补 mock seed 详细数据样例。
3. 后续单独清理 PRD 章节编号和历史修订摘要。
4. ADR 当前保持 `Proposed`，待负责人确认并合入后可改为 `Accepted`。


## 2026-05-15 更新：P0a 原型闭环增强

- 当前 P0a 闭环演示原型：`docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-p0a-flow.html`。
- 原型增强目标不是视觉大改，而是验证 P0a 最小业务闭环：`Skill → AgentTemplate → Worker → Team/Project → Doc 发布 → Decision 处理 → Activity 回写`。
- 原型已覆盖普通员工通过 Leader 联系、Skill 保存草稿 / 发布生效、岗位技能关联 / 移除、基于岗位创建数字员工、文档发布生成 Activity / Decision、决策处理回写 Activity、P0a 演示主线面板。
- 该原型仍为 mock 原型，不接真实后端、数据库、agent-web-kit、Gateway 或 OpenCode。
