# Changelog

## v0.6.32 — 2026-05-17

### Added

- 新增当前正本版 PRD、系统设计、Mock 数据设计、agent-web-kit 集成方案。
- 新增 P0a 工程施工图。
- 新增 OpenCode 执行清单。
- 新增文档维护规则和 OpenCode 协作指南。
- 新增 ADR-0003：agent-team 作为业务状态真源。
- 新增 gstack 借鉴分析报告。
- 新增文档瘦身与合并报告。

### Changed

- 将 v0.6.32 多轮修订、评审、补充设计合并为 v0.6.32 当前正本。
- 将历史原型和过程评审从当前正本目录中移出，改由 Git 历史承担归档。
- 将 P0a 入口从“读多个 v0.6.32 文档”收敛为“读 v0.6.32 施工图 + 执行清单”。

### Removed from current docs set

- 多个旧版 PRD / 系统设计副本。
- 多轮评审过程报告。
- 多代 HTML 原型正本。
- 分散的参考稿和重复目录 README。

### Unchanged

- P0a 不接真实后端、数据库、Gateway、OpenCode runtime。
- Worker.skills 仍为派生视图。
- AgentRoute 仍使用 routeStatus。
- agent-team 仍是正式业务状态真源。
