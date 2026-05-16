# agent-team

Agent Team 智能体协作网站项目，当前文档基线为 **v0.6.32**。

本项目从 Agent Team V2 注册中心 HTML 原型起步，沉淀为“智能软件工厂”的需求、设计、原型、开发计划和任务拆解。智能体对话能力不在本项目中重复实现，后续通过 `agent-web-kit` 以非侵入式、松耦合方式集成。

## 当前入口

- 文档导航：`docs/文档导航.md`
- 项目记忆：`docs/project-memory.md`
- 当前 PRD：`docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32.md`
- 当前系统设计：`docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32.md`
- agent-web-kit 集成方案：`docs/specs/2026-05-14-智能软件工厂-agent-web-kit集成方案-v0.6.32.md`
- 当前原型：`docs/prototypes/Agent-Team-V2-注册中心-v0.6.32.html`
- 开发计划：`docs/plans/2026-05-14-智能软件工厂开发计划-v0.6.32.md`
- 开发任务拆解：`docs/tasks/2026-05-14-智能软件工厂开发任务拆解-v0.6.32.md`
- Mock 数据设计：`docs/specs/2026-05-15-智能软件工厂Mock数据设计-v0.6.32.md`
- P0a 执行顺序清单：`docs/tasks/2026-05-15-P0a开发执行顺序清单-v0.6.32.md`

## 文档目录

- `docs/specs/`：正式需求规格、系统设计、专项集成方案。
- `docs/plans/`：阶段计划、Roadmap、开发计划。
- `docs/tasks/`：开发任务拆解、issue 级任务说明。
- `docs/decisions/`：ADR / 架构决策 / 产品关键决策。
- `docs/changes/`：版本变更说明。
- `docs/reports/`：界面走查、技术评审、测试报告。
- `docs/prototypes/`：HTML 原型与原型资源。
- `docs/references/`：外部项目参考资料。
- `docs/guides/`：文档方法、协作规范、操作指南。
- `docs/project-memory.md`：长期项目记忆与当前基线说明。

## 当前推进重点

当前版本不继续扩展产品概念，重点进入 **P0a 前端可演示 MVP** 开工准备：

1. 按 monorepo 结构建立工程骨架。
2. 建立 contracts、domain、mock-seed、state、data-client、ui、chat-integration/mock。
3. 跑通 P0a 最小闭环：`Skill → AgentTemplate → Worker + RuntimeBinding → Team/Project → Doc 发布 → Decision 处理 → Activity 回写`。
4. 以 `docs/prototypes/Agent-Team-V2-注册中心-v0.6.32.html` 原型作为闭环演示参照，验证普通员工通过 Leader 联系、Skill 发布、模板挂载技能、创建数字员工、文档发布、决策处理与 Activity 回写。
5. 小云先使用 `MockChatAdapter`，不阻塞 P0a。
6. 每个数字员工实例在 mock 中绑定一个 RuntimeHost / OpenCode workspaceDir，并展示技能初始化快照和同步状态。

## 更新约定

- 当前工作版本保持 **v0.6.32**。
- 小改不递增版本号，用 Git 提交追踪。
- 只有信息架构、核心模型、MVP 范围、原型或技术路线出现里程碑级变化时才调整版本号。
