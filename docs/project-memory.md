# Project Memory：agent-team / 智能软件工厂

> 本文件记录长期项目事实、当前文档基线、关键命名和后续迭代方向。新会话应先读 `docs/文档导航.md`，再读本文件。

## 1. 项目定位

`agent-team` 是“智能软件工厂”的主项目，用于实现智能体协作网站。它将多个 AI 智能体组织成研发团队，以项目和文档为工作载体，让负责人查看团队状态、追踪项目进展、处理决策请求，并通过 Leader / 主智能体进行对话。

智能体对话能力不在本项目重复实现，后续通过 `agent-web-kit` 以非侵入式、松耦合方式集成对话框。

## 2. 当前文档基线

当前工作基线为 **v0.6.32**，不是最初上传的原始基线。

当前基线文件：

- PRD：`docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32-revised.md`
- 系统设计：`docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md`
- HTML 原型：`docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-ui-review-task-breakdown.html`
- 开发计划：`docs/plans/2026-05-14-智能软件工厂开发计划-v0.6.32.md`
- 开发任务拆解：`docs/plans/2026-05-14-智能软件工厂开发任务拆解-v0.6.32.md`
- 界面走查报告：`docs/reports/2026-05-14-智能软件工厂界面走查报告-v0.6.32.md`
- 变更说明：`docs/changes/智能软件工厂-v0.6.32-变更说明.md`
- agent-web-kit 参考：`docs/specs/agent-web-kit-架构设计-reference.md`

## 3. 当前产品心智

左侧导航分为两组：

```text
运行态功能
├── 总览
├── 团队
├── 项目
└── 待决策

软件工厂配置
├── 岗位
├── 员工
├── 技能
└── 设置
```

其中：

- 岗位 = 数字员工模板，代码/设计模型名建议为 `AgentTemplate`。
- 员工 = 数字员工实例，代码/设计模型名为 `Worker` / `AgentInstance`。
- 技能 = SKILL.md 能力资产，代码/设计模型名为 `Skill`。
- 岗位技能匹配 = `TemplateSkillMapping`。
- 设置页只读展示系统运行信息，不承担配置编辑。

## 4. v0.6.32 关键结论

1. **冻结信息架构**：不要再频繁调整一级菜单，避免开发返工。
2. **配置区顺序**：岗位 / 员工 / 技能 / 设置，符合“先有模板，再创建实例，再挂载技能”的心智。
3. **技能配置形态**：技能不是简单字段，而是以 `SKILL.md` 为核心的能力包，可保存草稿、发布生效。
4. **岗位/员工关系**：基于岗位模板创建数字员工实例；实例继承岗位模板的技能，再匹配团队和项目。
5. **小云边界**：当前项目保留入口、上下文和业务事件映射；对话框 UI、SSE、问题卡、决策卡交给 `agent-web-kit`。

## 5. 下一轮 v0.6.33 计划

下一轮重点：

1. 新增 `docs/specs/2026-05-14-智能软件工厂-agent-web-kit集成方案-v0.6.33.md`。
   - 重点描述非侵入式、松耦合集成对话框的步骤和注意事项。
   - 采用 `agent-web-kit` 的“仅对话框”挂载模式，当前项目保留自己的入口。
   - 明确 `target`、`session`、`conversationId`、`HostContext`、`interaction.request → Decision` 映射。
2. 更新系统设计方案到 v0.6.33。
   - 参考 `agent-web-kit` 的 pnpm workspace monorepo 分层思想。
   - 补充当前项目 monorepo 结构、前后端职责、技术路线、数据库路线。
   - 建议 P0a 使用 mock/localStorage，P0b 使用 SQLite + Prisma，P1 升级 PostgreSQL + Prisma。

## 6. GitHub 文档源约定

后续以 GitHub 仓库作为文档源。ChatGPT 不直接 push；每轮生成与仓库目录一致的文件包或 patch，由用户本地提交。

推荐提交命令：

```bash
git add .
git commit -m "docs: sync intelligent software factory docs to v0.6.32"
git push origin main
```
