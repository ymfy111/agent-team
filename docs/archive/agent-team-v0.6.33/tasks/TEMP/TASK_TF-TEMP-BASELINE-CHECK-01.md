# TASK_TF-TEMP-BASELINE-CHECK-01｜任务正式记录

> 文档类型：Task Record / 临时任务流执行记录  
> 任务流 ID：TF-TEMP-BASELINE-CHECK-01  
> 基线：v0.6.33.45 / DOC-CLOSEOUT 后源码快照  
> 执行模式：delegated  
> 生成时间：2026-05-25  
> 说明：本记录只做基线核验与问题识别，不直接修改正式文档内容。

## 1. 执行结论

本轮核验通过，当前源码已可作为后续文档口径修复与 `TF-GF-IMPL-04` 的工作基础；但文档体系仍存在明显口径不一致，需要先做一次小范围文档一致性修复。

## 2. 节点结果

| 节点 | 结果 | 验证 | 证据 |
|---|---|---|---|
| N01 核验工作区与关键文件 | PASS | 关键文件存在；`docs/文档导航.md` 为正确中文文件名；未发现 `#U` 转义乱码残留 | 文件存在性检查、`find *#U*` 无结果 |
| N02 核验核心口径版本引用 | PASS | 发现版本口径不一致：文档导航仍引用治理 v0.9.12 和原型 v0.6.33.30；project-memory 仍写 taskflow v0.9.25 | `rg` 检查 `文档导航.md`、`project-memory.md`、`TF-GF-IMPL.md`、治理指南 |
| N03 核验目录收口与疑似过期文件 | PASS | 确认 `tasks/workitems`、`recommendations/recs` 双目录并存；guides 多版本并存；部分旧计划/专项文档需确认入口 | `find`、文件头部检查、候选文件引用检查、长度比对 |
| N04 生成临时任务流记录 | PASS | 本文件已生成 | `docs/tasks/<WorkItemId>/TF-TEMP-BASELINE-CHECK-01-RUN-v0.6.33.45.md` |

## 3. 已确认正常项

- 当前沙箱工作区：`/mnt/data/agent-team-workspace/agent-team-main`
- 文档导航文件名已是：`docs/文档导航.md`
- 未发现 `#U6587#U6863...` 等转义乱码文件名残留。
- 关键文件存在：
  - `docs/project-memory.md`
  - `docs/workitems/TF-GF-IMPL.md`
  - `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
  - `docs/prototypes/agent-team-v0.6.33.45-prototype.html`
  - `apps/web/index.html`
  - `skills/taskflow/skill.md`

## 4. 发现的问题

### P1：文档入口口径仍落后

`docs/文档导航.md` 中仍存在旧口径：

- taskflow 治理指南入口仍指向 `docs/guides/TASKFLOW-GOVERNANCE-v0.9.12.md`
- 原型安全基线仍写 `v0.6.33.30`
- 原型与视觉口径仍混有 `v0.6.33.29 / v0.6.33.30`

实际交接口径应收敛到：

- 当前基线：`v0.6.33.45`
- 最新治理指南：`docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
- 最新原型：`docs/prototypes/agent-team-v0.6.33.45-prototype.html`

### P1：project-memory 的 skill 参考版本落后

`docs/project-memory.md` 当前仍写：

- `当前 skill 参考：taskflow v0.9.25`
- `docs/guides/TASKFLOW-GOVERNANCE-v0.9.25.md`

实际应更新为：

- taskflow skill：以来源放入沙箱的 `skills/taskflow/skill.md` 为准，当前为 v0.9.9 标准层级包
- 治理指南：`docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`

### P2：目录收口尚未完成

当前仍存在：

- `docs/tasks/` 与 `docs/workitems/` 并存
- `docs/recommendations/` 与 `docs/recs/` 并存
- `docs/guides/` 下保留多个旧治理版本 `v0.9.11` 到 `v0.9.25`

建议后续只做入口与引用收口，不要直接批量删除历史文件；删除动作应单独确认。

### P2：疑似旧文档需确认入口

以下文件疑似旧入口或专项文档，需要后续判断是否保留、迁移或仅归档：

- `docs/plans/PLAN-v0.6.33.md`
- `docs/specs/DEPLOY-v0.6.33.md`
- `docs/specs/SDD-PROTOTYPE-MIGRATION-v0.6.33.md`
- `docs/tasks/TF-GF-IMPL.md`
- `docs/tasks/TF-GF-IMPL-v0.6.33.45.md`

## 5. 建议下一步

建议下一轮执行临时任务流：

`TF-TEMP-DOC-CONSISTENCY-FIX-01｜文档口径一致性修复`

范围建议：

1. 只修 `docs/文档导航.md` 与 `docs/project-memory.md` 的当前基线、治理版本、原型入口、workitems/recs 入口引用。
2. 不删除旧文件，只把入口导向最新文件。
3. 修复后生成一份临时 run 记录和必要的引用检查结果。

