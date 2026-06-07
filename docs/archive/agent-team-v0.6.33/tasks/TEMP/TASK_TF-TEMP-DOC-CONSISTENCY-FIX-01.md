# TASK_TF-TEMP-DOC-CONSISTENCY-FIX-01｜任务正式记录

> 任务类型：临时任务流  
> 基线：v0.6.33.45  
> 生成时间：2026-05-25T16:11:57.542585Z  
> 范围：仅修改 `docs/文档导航.md` 与 `docs/project-memory.md`  
> 冻结项：不删除旧文件、不移动目录、不修改正式工作项内容、不提升版本号。

---

## 1. 执行概览

本轮根据 `TF-TEMP-BASELINE-CHECK-01` 的核验结论，修正文档入口和版本口径不一致问题。

已完成：

- 将当前治理入口统一为 `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`。
- 将当前原型入口统一为 `docs/prototypes/agent-team-v0.6.33.45-prototype.html`。
- 将当前工作项与运行记录入口统一为 `docs/workitems/` 与 `docs/tasks/<WorkItemId>/`。
- 将产品化建议入口统一为 `docs/recs/`。
- 保留 `docs/tasks/`、`docs/recommendations/` 和旧治理版本为历史兼容说明，但不作为当前入口。

---

## 2. 节点摘要

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---:|---:|
| N01 | 核验待修口径 | 确认旧原型基线、旧治理版本、旧目录入口问题 | PASS | `rg` 旧版本引用核验 | 3-8m | 未精确计时 |
| N02 | 修正文档导航 | 已重写当前入口、阶段总览、阅读顺序、目录规则、维护约定和下一步建议 | PASS | `docs/文档导航.md` | 8-15m | 未精确计时 |
| N03 | 修正 project-memory | 已更新治理参考到 v0.9.29，并收口目录口径 | PASS | `docs/project-memory.md` | 8-15m | 未精确计时 |
| N04 | 验证并生成记录 | 旧当前版本引用扫描无结果；主要路径引用均存在 | PASS | 本 run 文档与验证命令输出 | 5-10m | 未精确计时 |

---

## 3. 验证结果

执行的核心验证：

```bash
rg -n "v0\.6\.33\.30|v0\.9\.12|v0\.9\.25|TASKFLOW-GOVERNANCE-v0\.9\.12|TASKFLOW-GOVERNANCE-v0\.9\.25|agent-team-v0\.6\.33\.30" docs/文档导航.md docs/project-memory.md
```

结果：无匹配。

路径存在性检查：`docs/文档导航.md` 与 `docs/project-memory.md` 中主要 `docs/...` 引用均存在；带通配符的示例路径除外。

---

## 4. 问题与遗留

- 本轮未删除旧文件，`docs/tasks/`、`docs/recommendations/` 和旧治理指南仍在源码中保留。
- 部分其他文档可能仍引用旧目录口径，本轮未扩大范围处理。
- 源码包当前不是 Git 仓库快照，沙箱无法直接提交或双端推送。

---

## 5. 产物

- `docs/文档导航.md`
- `docs/project-memory.md`
- `docs/tasks/<WorkItemId>/TF-TEMP-DOC-CONSISTENCY-FIX-01-RUN-v0.6.33.45.md`
- `.taskflow/taskflows/TF-TEMP-DOC-CONSISTENCY-FIX-01.json`

---

## 6. 下一步建议

进入正式任务：`TF-GF-IMPL-04｜恢复记录最小实现`。

执行前建议先读取：

1. `docs/workitems/TF-GF-IMPL.md`
2. `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
3. `docs/guides/TASKFLOW-GUARDED-FLOW-v0.6.33.45.md`
