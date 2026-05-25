# taskflow 治理指南 v0.9.28

## 1. 命名规则

用户侧统一使用：计划 / 阶段 / 工作项 / 任务 / 步骤。  
设计侧统一使用：Plan / Stage / WorkItem / TaskFlow / TaskTicket。

用户说“执行任务”时，对应设计侧 TaskFlow；任务中的 Node / TaskTicket 在用户侧称为“步骤”。

## 2. 文档与记录位置

```text
docs/plans/           计划 / 阶段 / 路线图
docs/workitems/       工作项文档，一个主文档对应一个 WorkItem
docs/workitems/runs/  任务运行记录，即 TaskFlow Run
docs/reports/         评审、验证、复盘报告
```

WorkItem 主文档不保存完整步骤日志，只维护任务清单、状态、Run / Report 链接和下一步。完整步骤、事件、证据和审计写入 `docs/workitems/runs/`。

## 3. 默认执行报告

主对话默认输出四段式报告：

1. 执行概览
2. 步骤摘要
3. 问题与遗留
4. 产物与下一步

验证全部通过时，不单独输出“验证摘要”；验证失败、风险和遗留统一放入“问题与遗留”。完整验证命令和日志保留在 run / report 文件中。

## 4. 自动报告生成

优先用脚本生成报告：

```bash
node tools/taskflow/taskflow-md.mjs render-report --file docs/workitems/runs/<TaskFlowId>-RUN-vX.md
```

报告应使用用户侧命名：任务、步骤、工作项。表格设计上，短字段列保持窄，关键产出/问题内容列保留更大宽度。

## 5. 不做事项

- 不在主对话中堆叠完整命令日志；
- 不为每个步骤单独建长期文档；
- 不用 `docs/workitems/` 作为当前记录目录；
- 不把 WorkItem 叫“需求”；
- 不承诺当前 ChatGPT 普通对话能无人值守实时输出每个步骤。
