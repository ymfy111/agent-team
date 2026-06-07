# TASK_TF-TEMP-DOCS-REORG-01｜docs 目录重整与命名规范同步

> 文档类型：Task / 正式任务记录  
> 所属工作项：TEMP  
> 当前基线：v0.6.33.45  
> 结果：PASS  

---

## 0. 执行计划快照

```text
Goal: 按新口径重整 docs 目录，统一 workitems / tasks / runtime 语义，并准备同步包。
Scope: 只整理 docs 目录与命名规范；不改 ORCH 代码、不改实验包、不接真实 OpenCode。
```

---

## 1. Overview

Current: 已将旧 `docs/workitems/runs/` 与 `docs/tasks/runs/` 中的运行记录迁移为 `docs/tasks/<WorkItemId>/TASK_<TaskId>.md`，并新增目录命名规范指南。

---

## 2. Steps

| Step | 状态 | 结果 |
|---|---:|---|
| 目录核验 | PASS | 发现旧 `runs` 目录仍存在，且导航/project-memory 仍引用旧口径。 |
| 任务记录迁移 | PASS | 旧 `RUN_*` / `*-RUN-*` 已迁移到 `docs/tasks/`，按 WorkItem 分组。 |
| 命名规范补充 | PASS | 新增 `GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md`。 |
| 导航记忆同步 | PASS | 已同步 `docs/文档导航.md` 与 `docs/project-memory.md`。 |

---

## 3. Issues

- 无 P0/P1 阻塞。
- 历史文件已做迁移映射，详见 `docs/reports/RPT-TF-TEMP-DOCS-REORG-01-Migration-Map-v0.6.33.45.md`。

---

## 4. Actual Artifacts

- `docs/guides/GUIDE-DOC-DIRECTORY-NAMING-v0.6.33.md`
- `docs/文档导航.md`
- `docs/project-memory.md`
- `docs/tasks/`
- `docs/reports/RPT-TF-TEMP-DOCS-REORG-01-Migration-Map-v0.6.33.45.md`

---

## 5. Next

建议后续同步包时采用“删除旧 docs 后整体覆盖”的方式，确保旧 `runs` 目录不会残留。
