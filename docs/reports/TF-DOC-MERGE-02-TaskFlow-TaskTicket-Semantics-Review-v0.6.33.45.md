# TF-DOC-MERGE-02｜TaskFlow / TaskTicket 口径收口评审

> 时间：2026-05-24T07:31:05Z  
> 基线：v0.6.33 / v0.6.33.45  
> 范围：只做 TaskFlow / TaskTicket 子设计语义收口与路线图可读性增强，不改工具脚本，不扩展状态机。

## 1. 处理项

| 项 | 处理结果 |
|---|---|
| `actualDuration` | 已明确为由 `actualStartedAt / actualCompletedAt` 计算展示，不是独立事实源。 |
| `doneCriteria` | 已明确为 `done / accepted` 完成判定标准，并与任务流“验收点”建立轻量映射。 |
| `done / accepted` | 已明确：`done` 是执行完成并提交证据，`accepted` 是评审/验收确认。 |
| Evidence 指向 Artifact | 已补充 Evidence 应说明验证对象，P0 不强制结构化。 |
| DesignImplementationSync | 已补三不原则：不作为独立对象、不形成执行层级、不引入独立队列。 |
| 字段边界 | 已说明字段是 P0 文档化建议，不代表数据库模型。 |
| Guarded Flow 路线图 | 已补“已落地命令 / skill 版本”。 |
| recommendations 本地正式副本 | 已放入 `docs/recommendations/多智能体协作产品化建议-v0.6.33.md` 并补引用链。 |

## 2. 评审结论

PASS。修改范围克制，属于语义口径收口，不属于新功能扩展。核心风险已降低：

- 避免 `actualDuration` 与开始/完成时间不一致；
- 避免 `doneCriteria` 退化成普通备注；
- 避免 DesignImplementationSync 被误建模为新执行层；
- 避免 Guarded Flow 路线图与已落地命令脱节。

## 3. 未做范围

- 未改 `tools/taskflow/taskflow-md.mjs`；
- 未引入数据库模型；
- 未新增 Runtime 调度、任务锁或完整状态机；
- 未直接覆盖 GitHub 主 SDD，仅保留最小补丁说明。
