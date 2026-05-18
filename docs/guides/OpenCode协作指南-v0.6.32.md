# OpenCode 协作指南

> 版本：v0.6.32  
> 日期：2026-05-17  
> 状态：给 OpenCode / Codex / 开发智能体使用

---

## 1. 开工前必须读

```text
docs/README.md
docs/文档导航.md
docs/project-memory.md
docs/specs/2026-05-17-智能软件工厂P0a工程施工图-v0.6.32.md
docs/tasks/2026-05-17-OpenCode执行清单-v0.6.32.md
docs/guides/智能软件工厂-计划评审模板-v0.6.32.md
```

开工前必须复述：

```text
P0a 不接真实后端、数据库、Gateway、OpenCode runtime。
mock-seed 是唯一初始数据源。
AgentRoute 使用 routeStatus，不使用 status。
普通 Worker 不直接对话，只通过 Leader。
Worker.skills 是派生视图。
```

---

## 2. 执行顺序

必须按顺序：

```text
contracts
→ domain
→ mock-seed
→ data-client
→ state
→ apps/web shell
→ features/pages
→ polish
```

禁止跳过 contracts/domain/mock-seed 直接做页面。

---

## 3. 每个任务的交付格式

每个任务完成后输出：

```text
已修改文件
新增文件
执行命令
验证结果
风险和遗留
建议 commit message
```

---

## 4. 代码边界

```text
packages/contracts：只放类型，不放业务逻辑。
packages/domain：只放纯规则和 selectors，不依赖 React/网络。
packages/mock-seed：只放初始化数据，不放页面逻辑。
packages/data-client：统一数据访问接口。
packages/state：统一 commands 和前端状态。
apps/web：只组合页面，不重新定义核心模型。
```

---

## 5. 高风险禁令

```text
- 不要新增 apps/api。
- 不要引入 Prisma / 数据库。
- 不要接真实 Gateway。
- 不要接真实 OpenCode runtime。
- 不要在页面里写散落 mock。
- 不要让 endpointRef/token 进入浏览器组件。
- 不要让 heartbeat 自动恢复 disabled。
- 不要把会话级 busy 当成员工级 busy。
```
