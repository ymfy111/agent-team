# agent-team TF-P0B-04 文档同步包

本包为 `v0.6.33.45 / TF-P0B-04` 文档同步包，重点记录当前前端工程迁移状态、QA 结果和后续任务流建议。

## 入口

```text
docs/文档导航.md
docs/reports/TF-P0B-04-FRONTEND-SUMMARY-v0.6.33.45.md
docs/reports/TF-P0B-04-QA-Report-v0.6.33.45.md
docs/tasks/DEV-TASKFLOW-v0.6.33.md
docs/plans/IMPL-PLN-v0.6.33.md
docs/tasks/WBS-v0.6.33.md
docs/changes/CHANGELOG-v0.6.33.md
```

## 当前源码包对应状态

```text
apps/web 当前同步基线：TF-P0B-04-N05
前端运行模式：无构建 ESM + legacy runtime 过渡架构
验证命令：cd apps/web && npm run qa:sandbox
```

## 说明

本 docs 包与 apps 包分开交付。同步本地时，建议同时解压：

```text
agent-team-apps-TF-P0B-04-v0.6.33.45.zip
agent-team-docs-TF-P0B-04-v0.6.33.45.zip
```
