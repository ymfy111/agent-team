# SDD-v0.6.33.md 引用链补丁（TF-DOC-MERGE-02）

> 目标文件：`docs/specs/SDD-v0.6.33.md`  
> 补丁性质：人工合并提示。  
> 目的：把 TaskFlow / TaskTicket 子设计纳入主 SDD 引用链。

## 建议插入位置

建议放在“核心数据对象”或 task/taskflow 经验映射段落之后。

## 建议插入文本

```md
> TaskFlow / TaskTicket 层级模型、字段映射和 P0 文档化落地约定详见 `docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`。
```

## 说明

该子设计仅补充 TaskFlow / TaskTicket 的 P0 文档化字段、层级模型、Artifact / Evidence 口径与完成门禁；不替代主 SDD，不提前引入数据库表结构、完整状态机、Runtime 自动调度或任务锁。
