# Agent Team Docs Update - TF-P0B-05 / v0.6.33.45

本包用于新会话 / 新智能体接手当前 `智能软件工厂` 项目文档状态。

当前同步重点：

- `TF-P0B-05` 已完成头像 base64 data-uri fallback 移除。
- 原型 slim 和迁移后 `apps/web` 均改为直接使用 `pic/avatars/*.png` 静态图片资源。
- `avatar-default.png` 作为头像兜底图。
- 迁移后图片完整性验证通过，`brokenImages=0`、`pageErrors=0`、`httpErrors=0`。
- 最新技能包为 `taskflow-task-runner-prototype-migration-skills-v0.9.10.zip`。

建议阅读顺序：

1. `docs/文档导航.md`
2. `docs/reports/TF-P0B-05-Avatar-Base64-Removal-v0.6.33.45.md`
3. `docs/reports/TF-P0B-05-Image-Check-v0.6.33.45.md`
4. `docs/specs/SDD-v0.6.33.md`
5. `docs/plans/IMPL-PLN-v0.6.33.md`
6. `docs/tasks/DEV-TASKFLOW-v0.6.33.md`
7. `docs/changes/CHANGELOG-v0.6.33.md`

---

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
