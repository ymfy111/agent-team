# 决策记录（ADR）

本目录用于存放架构决策记录和重要产品决策记录，不用于存放版本变更说明。

适合放在本目录的内容：

- 为什么采用 `agent-web-kit` 非侵入式“仅对话框”集成方式。
- 为什么当前项目采用 pnpm workspace monorepo。
- 为什么 P0b 使用 SQLite + Prisma，P1 再升级 PostgreSQL + Prisma。
- 为什么岗位菜单保留短名“岗位”，模型名使用 `AgentTemplate`。

命名格式：

```text
ADR-NNNN-简短中文标题.md
```

版本变更说明请放入 `docs/changes/`。
