# STRUCTURED-REVIEW-MD-TEMPLATE

> 文档类型：Review / Report 模板  
> 适用目录：`docs/reports/`  
> 命名规则：`RPT-<TaskFlowId>-<主题>-vX.md`  
> 用途：记录评审、验证、复盘结论；不复制完整运行日志。

---

```yaml
id: RPT-EXAMPLE-001
relatedTaskFlow: TF-EXAMPLE-001
relatedWorkItem: TF-EXAMPLE-IMPL
type: review
result: PASS
createdAt: 2026-05-25
updatedAt: 2026-05-25
```

# RPT-EXAMPLE-001｜示例评审报告

## 1. 评审对象

| 类型 | 对象 | 说明 |
|---|---|---|
| WorkItem | TF-EXAMPLE-IMPL | 所属工作项 |
| TaskFlow | TF-EXAMPLE-001 | 本次评审任务 |
| Run | `docs/workitems/runs/TF-EXAMPLE-001-RUN-vX.md` | 执行记录 |
| Artifact | `path/to/artifact` | 评审对象 |

## 2. 评审结论

| 维度 | 结论 | 说明 |
|---|---:|---|
| 范围一致性 | PASS | 未发现范围偏移。 |
| 验证充分性 | PASS | 证据满足 doneCriteria。 |
| 文档同步 | PASS | 需要回写的文档已同步。 |
| 风险 | PASS | 未发现 P0/P1 风险。 |

## 3. 问题与遗留

| 类型 | 级别 | 内容 | 处理方式 |
|---|---:|---|---|
| 无阻塞 | - | 未发现 P0/P1 问题 | 可继续 |

## 4. 建议

- 下一步建议。

## 5. 回写项

| 文档 | 回写内容 |
|---|---|
| `docs/workitems/<WorkItem>.md` | 更新 TaskFlow 状态和报告链接。 |
| `docs/changes/CHANGELOG-vX.md` | 重要变化时记录。 |
