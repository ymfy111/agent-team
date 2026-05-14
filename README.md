# agent-team

Agent Team 智能体协作网站项目，当前文档基线为 **v0.6.32**。

本项目从 Agent Team V2 注册中心 HTML 原型起步，后续补齐需求、设计与实现，最终交付完整的智能体协作网站。智能体对话能力不在本项目重复实现，未来通过引用 `agent-web-kit` 组件集成。

## 当前入口

- 文档导航：`docs/文档导航.md`
- 项目记忆：`docs/project-memory.md`
- 当前 PRD：`docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32-revised.md`
- 当前设计：`docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md`
- 当前原型：`docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-ui-review-task-breakdown.html`
- 开发计划：`docs/plans/2026-05-14-智能软件工厂开发计划-v0.6.32.md`
- 开发任务拆解：`docs/plans/2026-05-14-智能软件工厂开发任务拆解-v0.6.32.md`

## 文档目录

- `docs/specs/`：需求规格、系统设计、集成方案、参考架构文档
- `docs/plans/`：开发计划、任务拆解
- `docs/prototypes/`：HTML 原型与原型资源
- `docs/reports/`：界面走查、验收报告、测试报告
- `docs/changes/`：版本变更说明
- `docs/decisions/`：架构决策记录（ADR）
- `docs/project-memory.md`：长期项目记忆与当前基线说明

## 下一轮计划

下一轮版本为 **v0.6.33**，重点是：

1. 新增 `agent-web-kit` 非侵入式、松耦合对话框集成方案。
2. 更新系统设计方案，补充当前项目 monorepo 分层、前后端技术路线、数据库选型与持久化策略。

## 绑定工作空间

- 智能体工作空间：`/home/kk/workspace/p1`
- 绑定模式：外挂项目模式
