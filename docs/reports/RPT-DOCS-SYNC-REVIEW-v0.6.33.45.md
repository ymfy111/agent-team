# RPT-DOCS-SYNC-REVIEW｜docs 完整性修补与评审

> 日期：2026-05-24  
> 基线：v0.6.33.45  
> 范围：`docs/` 全量内容  
> 事实源：用户上传的 `agent-team-main.zip` 解压后的 `docs/`，再进行导航、project-memory 与 CHANGELOG 口径修补。

---

## 1. 评审目标

本轮评审目标是确认当前 `docs/` 是否能作为本地和 GitHub 同步基线：

1. 主 PRD / SDD 等主规格文档未被错误清理；
2. 结构化模板和原型归档保留完整；
3. `plans / tasks / recs / specs / guides / templates / prototypes` 目录口径清楚；
4. `文档导航.md` 与 `project-memory.md` 反映当前真实结构；
5. 旧路径、旧命名、错误口径不再影响新会话接手。

---

## 2. 检查结果

| 检查项 | 结果 | 说明 |
|---|---|---|
| 主规格文档 | PASS | `PRD-v0.6.33.md`、`SDD-v0.6.33.md`、`DEPLOY-v0.6.33.md` 已保留。 |
| TaskFlow 子设计 | PASS | `SDD-TASKFLOW-TASKTICKET-MODEL` 与 `SDD-TASKFLOW-SKILL-PRODUCT-MAPPING` 已保留。 |
| plans 命名 | PASS | 当前使用 `PLAN-SMART-FACTORY.md` 与 `PLAN-SMART-FACTORY-GUARDED-FLOW.md`。 |
| tasks 工作包 | PASS | `TF-GF-IMPL.md` 作为 WorkPackage / TaskFlowGroup 当前入口。 |
| recs 目录 | PASS | `docs/recs/REC-MAC-PROD-v0.6.33.md` 已作为产品化建议入口。 |
| templates | PASS | Plan / Task / TaskFlow / Decision / Review 五类模板均已保留。 |
| prototypes | PASS | `agent-team-v0.6.33.45-prototype.html` 与 `pic/` 资源已保留。 |
| 文档导航 | PASS | 已补齐主规格、模板、原型归档和当前工作包入口。 |
| project-memory | PASS | 已修正 docs 包包含 prototypes 的口径，并记录交接同步经验。 |
| 旧路径引用 | PASS | 未发现正文断链；旧文件名只在 CHANGELOG 中作为改名记录保留。 |

---

## 3. 注意项

当前同步源未包含 docs/specs/SDD-PROTOTYPE-MIGRATION-v0.6.33.md。本轮不重新创建该文件，也不在导航中引用。若后续确认该文件仍属于正式专项设计，应从本地 / Git 恢复并同步导航。

---

## 4. 结论

评审结论：PASS。

当前 `docs/` 可以作为本地与 GitHub 同步基线。后续继续执行 `TF-GF-IMPL-04｜恢复记录最小实现` 前，建议以本包中的：

- `docs/文档导航.md`
- `docs/project-memory.md`
- `docs/plans/PLAN-SMART-FACTORY.md`
- `docs/tasks/TF-GF-IMPL.md`

作为新会话 / 新智能体接手入口。
