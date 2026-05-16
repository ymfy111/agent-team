# 智能软件工厂 docs 目录说明

> 版本：v0.6.33  
> 日期：2026-05-17  
> 状态：当前正本 / 可整体替换 docs 目录  
> 用途：当本地 docs 目录历史版本、评审稿、原型稿过多时，可清空 `docs/` 后用本包覆盖。

---

## 1. 本目录定位

本目录是智能软件工厂当前阶段的**文档正本目录**，面向两类读者：

1. 项目负责人 / 产品设计者：理解系统要做什么、边界在哪里、为什么这样设计。
2. OpenCode / Codex / 其他开发智能体：读取施工图、任务清单和约束后，按步骤创建工程与编码。

v0.6.33 的重点不是继续堆新想法，而是把 v0.6.32 多轮讨论结果合并成一套更少、更清晰、可执行的当前文档集。

---

## 2. 使用方式

推荐替换流程：

```bash
# 在仓库根目录执行，先备份旧 docs
mv docs docs.backup.$(date +%Y%m%d-%H%M%S)

# 解压本包，包内自带 docs/ 目录
unzip -o agent-team-docs-v0.6.33-curated.zip -d .

git add docs
git status
git commit -m "docs: consolidate docs for v0.6.33"
git push origin main
```

如果你还想保留历史 HTML 原型、历史评审报告或早期设计稿，不要再放回当前 `docs/` 正本目录；它们已经由 Git 历史承担归档职责。

---

## 3. 当前目录结构

```text
docs/
├── README.md
├── 文档导航.md
├── project-memory.md
├── specs/
│   ├── 2026-05-17-智能软件工厂产品需求规格-v0.6.33.md
│   ├── 2026-05-17-智能软件工厂系统设计方案-v0.6.33.md
│   ├── 2026-05-17-智能软件工厂Mock数据设计-v0.6.33.md
│   ├── 2026-05-17-智能软件工厂agent-web-kit集成方案-v0.6.33.md
│   └── 2026-05-17-智能软件工厂P0a工程施工图-v0.6.33.md
├── decisions/
│   ├── README.md
│   ├── ADR-0001-agent-web-kit非侵入式集成.md
│   ├── ADR-0002-agent-team采用monorepo分层架构.md
│   └── ADR-0003-agent-team作为业务状态真源.md
├── plans/
│   └── 2026-05-17-智能软件工厂实施路线图-v0.6.33.md
├── tasks/
│   └── 2026-05-17-OpenCode执行清单-v0.6.33.md
├── guides/
│   ├── OpenCode协作指南-v0.6.33.md
│   ├── 智能软件工厂-计划评审模板-v0.6.33.md
│   └── 文档维护规则-v0.6.33.md
├── references/
│   └── 2026-05-17-gstack借鉴分析报告-v0.6.33.md
├── changes/
│   ├── CHANGELOG.md
│   └── 智能软件工厂-v0.6.33-变更说明.md
├── reports/
│   └── 2026-05-17-v0.6.33文档瘦身与合并报告.md
└── prototypes/
    └── README.md
```

---

## 4. 当前正本原则

- 每类文档只保留一个当前正本。
- 历史版本不再复制保留在 `docs/` 当前目录中。
- 评审报告只保留“当前合并结论”，不保留每一轮过程稿。
- HTML 原型只作为历史参考，不再作为 v0.6.33 开发入口；P0a 以施工图和任务清单为入口。
- agent-web-kit 的独立项目设计不放入 agent-team 正本，只保留集成方案和外部参考分析。

---

## 5. 阅读顺序

首次接手时按这个顺序读：

```text
1. docs/README.md
2. docs/文档导航.md
3. docs/project-memory.md
4. docs/specs/2026-05-17-智能软件工厂产品需求规格-v0.6.33.md
5. docs/specs/2026-05-17-智能软件工厂系统设计方案-v0.6.33.md
6. docs/specs/2026-05-17-智能软件工厂P0a工程施工图-v0.6.33.md
7. docs/tasks/2026-05-17-OpenCode执行清单-v0.6.33.md
8. docs/guides/OpenCode协作指南-v0.6.33.md
```
