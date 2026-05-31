# doc-nav｜文档导航 ASCII 入口

> UpdatedAt: 2026-06-01 01:16:27 +0800  
> 中文完整入口仍保留：`docs/文档导航.md`。本文件用于避免中文文件名兼容问题，并记录当前 skill 入口。

## 当前关键入口

| 用途 | 文件 |
|---|---|
| 项目长期事实源 | `docs/project-memory.md` |
| 中文文档导航 | `docs/文档导航.md` |
| 当前 skill 说明 | `skills/README.md` |
| 单任务执行器 | `skills/task-runner/SKILL.md` |
| 批次执行器 | `skills/task-batch-runner/SKILL.md` |
| 任务规划与截图自查规则 | `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md` |

## 当前 active skills

```text
skills/task-runner/          v1.0.2，执行一个 Task，生成 Step / Node / exec / QA / Summary
skills/task-batch-runner/    v1.0.2，执行一个 TaskBatch，顺序调度 Task[] 并生成 batch Summary
```

历史名称 `taskflow`、`task-batch` 已不再作为 active skill 目录存在。

## 最近 skill 合并任务

- `TF-TEMP-SKILL-COMPLIANCE-AUDIT-01`：合规规则来源。
- `TF-TEMP-SKILL-VISIBLE-OUTPUT-SLIM-01`：正式命名与可见输出规则来源。
- `TF-TEMP-SKILL-RUNNER-MERGE-01`：本次合并收口任务。


## 2026-06-01｜任务规划与页面截图自查规则

- 新增 `docs/guides/GUIDE-TASK-PLANNING-RULES-v0.6.33.md`。
- 前端 / 页面 / 原型类 Task 必须把 Playwright 截图、智能体自查、必要修复和验收截图作为执行 Step。
- 未完成截图自查的页面类 Task 不得标记完全 PASS。
