# taskflow 治理指南 v0.9.29

## 1. 命名规则

用户侧统一使用：计划 / 阶段 / 工作项 / 任务 / 步骤。  
设计侧统一使用：Plan / Stage / WorkItem / TaskFlow / TaskTicket。

用户说“执行任务”时，对应设计侧 `TaskFlow`；任务中的 Node / TaskTicket 在用户侧称为“步骤”。

## 2. 正式任务与临时任务

| 类型 | 命名 | 说明 | 是否回写 WorkItem |
|---|---|---|---:|
| 正式任务 | `TF-<WorkItem>-<序号>` | 来源于具体工作项，用于推进计划 / 阶段目标。 | 是 |
| 临时任务 | `TF-TEMP-<主题>-<序号>` | `TEMP` 是系统内置固定工作项，用于临时修补、同步、检查、评审和收口。 | 否，默认不进入普通 WorkItem 主清单 |

临时任务仍然必须生成运行记录、必要的评审 / 验证记录，并在主对话输出执行报告。临时任务不是“不记录”，只是“不挂到普通工作项主清单”。

未来软件工厂研发日报 / 周报 / 月报应把 `TF-TEMP-*` 作为单独类别统计；当前 taskflow skill 不实现报表功能，只保证命名与记录口径支持未来统计。

## 3. 文档与记录位置

```text
docs/plans/             计划 / 阶段 / 路线图
docs/workitems/         工作项文档，一个主文档对应一个 WorkItem
docs/tasks/<WorkItemId>/    任务运行记录，即 TaskFlow Run
docs/reports/           评审、验证、复盘报告
```

正式任务示例：

```text
docs/tasks/<WorkItemId>/TF-PROD-MODEL-02-RUN-v0.6.33.45.md
docs/reports/RPT-TF-PROD-MODEL-02-Review-v0.6.33.45.md
```

临时任务示例：

```text
docs/tasks/<WorkItemId>/TF-TEMP-DOC-SYNC-01-RUN-v0.6.33.45.md
docs/reports/RPT-TF-TEMP-DOC-SYNC-01-Review-v0.6.33.45.md
```

## 4. 默认执行报告

主对话默认输出四段式报告：

1. 执行概览
2. 步骤摘要
3. 问题与遗留
4. 产物与下一步

验证全部通过时，不单独输出“验证摘要”；验证失败、风险和遗留统一放入“问题与遗留”。完整验证命令和日志保留在 run / report 文件中。

## 5. 自动报告生成

优先用脚本根据 run 记录生成报告：

```bash
node tools/taskflow/taskflow-md.mjs render-report --file docs/tasks/<WorkItemId>/<TaskFlowId>-RUN-vX.md
```

报告应使用用户侧命名：任务、步骤、工作项。表格设计上，短字段列保持窄，关键产出 / 问题内容列保留更大宽度。

## 6. 不做事项

- 不在主对话中堆叠完整命令日志。
- 不为每个步骤单独建长期文档。
- 不用 `docs/tasks/` 作为当前记录目录。
- 不把 WorkItem 叫“需求”。
- 不把临时任务塞进普通 WorkItem 主清单。
- 不在当前 skill 中实现日报 / 周报 / 月报功能。
- 不承诺当前 ChatGPT 普通对话能无人值守实时输出每个步骤。
