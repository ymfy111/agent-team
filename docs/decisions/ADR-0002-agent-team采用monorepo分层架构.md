# ADR-0002：agent-team 采用 monorepo 分层架构

> 状态：Proposed  
> 日期：2026-05-15  
> 决策者：待确认  
> 适用范围：v0.6.32 技术落地补充草稿  
> 关联文档：`docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md`

## 背景

智能软件工厂包含运行态页面、配置态页面、文档库、决策系统、小云集成、mock 数据、未来 API、持久化等多个部分。如果直接从单文件原型迁移到一个大前端项目，容易出现以下问题：

```text
- 页面、状态、数据访问、业务规则混在一起
- mock 阶段和 API 阶段切换困难
- 技能、岗位、员工、文档、决策等模型重复定义
- 小云集成层侵入业务页面
- 多智能体协作时难以分工
```

`agent-web-kit` 已采用 pnpm workspace monorepo 分层，证明该类项目适合按包边界拆分职责。

## 决策

agent-team 采用 pnpm workspace monorepo，并按业务和技术边界拆分为 apps 与 packages：

```text
agent-team/
├── apps/
│   ├── web
│   └── api
├── packages/
│   ├── contracts
│   ├── domain
│   ├── mock-seed
│   ├── data-client
│   ├── state
│   ├── ui
│   └── chat-integration
└── db/
```

## 技术路线

| 阶段 | 前端 | 后端 | 数据库 | 说明 |
|---|---|---|---|---|
| P0a | React + Vite + TypeScript | 无真实后端 | mock seed + localStorage / IndexedDB | 前端可演示 MVP |
| P0b | React + Vite + TypeScript | Fastify + Prisma | SQLite | 本地可运行 MVP |
| P1 | React + Vite + TypeScript | Fastify 或 NestJS + Prisma | PostgreSQL | 多用户 / 服务化增强 |

## 理由

1. monorepo 有利于共享类型、领域规则和 mock 数据。
2. P0a 可以先验证业务闭环，不被后端阻塞。
3. P0b 使用 SQLite 可以降低本地部署和调试成本。
4. P1 再升级 PostgreSQL，适合多人协作和并发写入。
5. `chat-integration` 独立成包，可以隔离 agent-web-kit 集成细节。

## 影响

### 正向影响

- 支持多个智能体按包协作。
- 业务模型和 DTO 只定义一次。
- mock 数据可复用于前端、测试和种子数据。
- 后续从 mock 切 API 更平滑。

### 代价

- 初期需要维护 workspace、tsconfig、包依赖和构建顺序。
- 需要明确包边界，避免过度拆分。
- 需要补单元测试和契约测试，避免分层后调试成本上升。

## 约束

1. 下层包不依赖上层应用。
2. `domain` 不依赖 UI、API 框架和数据库实现。
3. `contracts` 保持轻量，优先放类型、枚举、DTO。
4. `ui` 不直接访问后端，必须通过 `data-client` 或页面传入数据。
5. `chat-integration` 只做适配，不拥有业务主数据。

## 后续行动

- 在系统设计中补充 monorepo 目录和依赖方向。
- P0a 先创建 `apps/web`、`packages/contracts`、`packages/domain`、`packages/mock-seed`。
- P0b 再创建 `apps/api`、`db/schema.prisma`、业务 API。
