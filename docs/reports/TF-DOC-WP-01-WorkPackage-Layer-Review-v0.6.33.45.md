# TF-DOC-WP-01｜WorkPackage / TaskFlowGroup 层级收口评审

> 基线：v0.6.33.45
> 模式：临时真实文档调整任务
> 结论：PASS

## 1. 目标

将当前项目文档体系与智能软件工厂产品层级对齐：

```text
Project
  → Stage / Plan
    → WorkPackage / TaskFlowGroup
      → TaskFlow
        → TaskTicket / Node
          → Artifact / Evidence / Review / Decision / Handoff
```

## 2. 调整结果

- `docs/plans/`：承载阶段计划、路线图和能力路线。
- `docs/tasks/`：承载 WorkPackage / TaskFlowGroup 与可执行任务流清单。
- `docs/tasks/runs/`：承载单次 TaskFlow 运行记录。
- `docs/reports/`：承载评审、验证、复盘。

## 3. 关键变更

| 文件 | 变更 |
|---|---|
| `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` | 补 WorkPackage / TaskFlowGroup 层级和字段建议 |
| `docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md` | 补 skill 到 WorkPackage / TaskFlowGroup 的产品化映射 |
| `docs/recommendations/多智能体协作产品化建议-v0.6.33.md` | 补 WorkPackage / TaskFlowGroup 作为计划到任务流的组织层 |
| `docs/plans/SMART-FACTORY-ROADMAP-v0.6.33.45.md` | 更新当前项目作为软件工厂雏形的层级映射 |
| `docs/plans/TF-GUARDED-FLOW-ROADMAP-v0.6.33.45.md` | 迁移到 plans 并补与工作包文档关系 |
| `docs/tasks/TF-GF-IMPL-v0.6.33.45.md` | 新增 Guarded Flow 最小实现工作包状态清单 |
| `docs/文档导航.md` | 同步入口和目录使用规则 |
| `docs/changes/CHANGELOG-v0.6.33.md` | 记录本轮目录与口径调整 |

## 4. 独立评审

| 维度 | 结论 | 说明 |
|---|---|---|
| 产品层级 | PASS | 补齐 Plan 与 TaskFlow 之间的组织层，符合项目规模。 |
| 范围控制 | PASS | 未引入数据库、完整状态机、Runtime 调度或任务锁。 |
| 文档可读性 | PASS | plans / tasks / runs / reports 分工更清楚。 |
| 兼容性 | WARN | 路线图文件已迁移到 `docs/plans/`，后续同步 GitHub 时需注意旧路径引用。 |
| 后续推进 | PASS | `TF-GF-IMPL-v0.6.33.45.md` 能直接展示已完成、当前和下一步。 |

## 5. 后续建议

下一步可继续 `TF-GF-IMPL-04｜恢复记录最小实现`。执行前应以 `docs/tasks/TF-GF-IMPL-v0.6.33.45.md` 作为当前工作包入口。
