# SDD-v0.6.33.md 引用链补丁（TF-DOC-MERGE-01）

> 目标文件：`docs/specs/SDD-v0.6.33.md`  
> 补丁性质：人工合并提示。由于当前沙箱不是完整 Git 工作区，且 GitHub raw 无法从命令行直接下载，本文件提供最小插入片段，避免覆盖主文档全文。

## 建议插入位置 1：第 3 章「核心数据对象」开头后

```md
> TaskFlow / TaskTicket 层级模型、字段映射和 P0 文档化落地约定详见 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`。
```

## 建议插入位置 2：3.2 TaskTicket 示例字段中

在 `nextStep` 或 `artifactRefs` 附近补充：

```yaml
doneCriteria:
  - 完成核心实现
  - 提供验证证据
  - 通过交付审查或列明待决策项
```

## 建议插入位置 3：第 10 章 task / taskflow 技能实践参考后

```md
补充说明：本章中的 taskflow / TaskTicket 映射只作为 P0 文档化和轻量约束参考。TaskFlow Node 可视为 TaskTicket 的文档化视图；后续如进入数据库或服务端持久化阶段，应以 `SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` 的层级模型和字段映射为准。
```
