# TF-GOV-03 taskflow 节点进度可见性修正评审报告

> 基线：v0.6.33.45 / taskflow v0.9.11  
> 结果：taskflow v0.9.12  
> 范围：taskflow skill、配套 README、治理指南、文档导航、CHANGELOG、taskflow 脚本输出

## 1. 本轮目标

将 taskflow 节点执行进度统一为 7 列表格：

```text
节点 / 目标 / 结果 / 验证 / 证据 / 预计耗时 / 实际耗时
```

同时强化长程任务的可见进度机制：进度必须通过脚本写入临时缓存，并在节点完成时同步到主对话窗口；若环境无法做到节点级同步，则必须定时推送缓存进度。

## 2. 修改结果

| 文件 | 结果 |
|---|---|
| `skills/taskflow/SKILL.md` | 升级到 v0.9.12，补充 7 列节点进度表与缓存推送节奏 |
| `skills/taskflow/README.md` | 升级到 v0.9.12，同步可见输出规则与常用命令 |
| `skills-README.md` | 升级到 v0.9.12，同步技能包级规则 |
| `tools/taskflow/taskflow.mjs` | `progress / summary / visible-summary / done event` 输出统一为 7 列进度口径 |
| `docs/guides/TASKFLOW-GOVERNANCE-v0.9.12.md` | 新增治理指南版本，说明启动清单与执行进度表的区别 |
| `docs/文档导航.md` | 指向 v0.9.12 治理指南，并补充 TF-GOV-03 说明 |
| `docs/changes/CHANGELOG-v0.6.33.md` | 补充 TF-GOV-03 变更记录 |

## 3. 验证结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| 脚本语法 | PASS | `node --check tools/taskflow/taskflow.mjs` |
| progress 输出 | PASS | 输出包含 `节点/目标/结果/验证/证据/预计耗时/实际耗时` |
| summary 输出 | PASS | 输出包含同一 7 列表格 |
| visible-summary 输出 | PASS | 输出 7 列表格，并保留节点事件缓存 |
| visible validation | PASS | 已完成节点的 start/done 事件均 rendered |
| 文档同步 | PASS | SKILL、README、skills-README、治理指南、导航、CHANGELOG 均有 v0.9.12 规则 |

## 4. 独立评审

### 产品/体验

通过。节点进度表从“生命周期视角”调整为“用户关注的交付视角”，更适合长程任务中快速判断每个节点是否达成目标。

### 执行机制

通过。保留 `.taskflow/taskflows/<taskflowId>.json` 作为进度缓存事实源，并明确 `render-pending → 主对话同步 → mark-rendered` 的顺序。

### 文档治理

通过。本轮没有只改 `SKILL.md`，已同步 README、技能包 README、治理指南、导航和 CHANGELOG。

### 风险

低风险。启动清单格式没有改变；只调整执行进度表和脚本输出口径。后续如果已有旧 ledger 的节点缺少 `goal/evidence` 字段，脚本会以节点标题或“无”兜底。

## 5. 未改范围

- 未修改前端源码。
- 未提升产品版本号，仍沿用 v0.6.33.45。
- 未改 task/task-runner/prototype-migration 其他 skill 的执行规则。
- 未实现复杂项目管理能力，仅完善单智能体 taskflow 执行协议。

## 6. 结论

TF-GOV-03 通过。后续 taskflow 输出应区分两类表格：

1. 启动清单：`节点 / 名称 / 目标 / 验收点 / 预计耗时`。
2. 节点进度：`节点 / 目标 / 结果 / 验证 / 证据 / 预计耗时 / 实际耗时`。

长程任务执行时，节点进度必须先进入脚本缓存，并按节点完成或定时节奏同步到主对话窗口。
