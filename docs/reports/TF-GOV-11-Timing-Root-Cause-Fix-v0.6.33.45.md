# TF-GOV-11｜耗时不准根因定位与最小修复

> 基线：v0.6.33.45 / taskflow v0.9.19  
> 类型：执行治理修复  
> 结论：格式输出已达标，但 TF-POC-MD-01-RERUN 的耗时可信度不达标；本轮只做最小对症修复，不扩展 flow 总耗时体系。

## 1. 现象

TF-POC-MD-01-RERUN 最终表格中节点耗时合计为 13s：

- N01：1s
- N02：1s
- N03：1s
- N04：8s
- N05：2s

但用户截图中的 ChatGPT Activity 约为 3m8s，二者明显不一致。

## 2. 根因

### 2.1 脚本行为与治理文档不一致

`docs/guides/TASKFLOW-GOVERNANCE-v0.9.19.md` 已要求：`complete-node` 默认不得把命令间隔当作可信实际耗时，只有显式 `--timing-trusted` 或 `--actual` 时才写具体耗时。

但 `tools/taskflow/taskflow-md.mjs` 旧实现仍然默认执行：

```js
'实际耗时': durationLabel(startedAt, completedAt)
```

这会把 `start-node` 与 `complete-node` 两个命令之间的短间隔误写成节点真实耗时。

### 2.2 部分证据文件在节点完成后才落盘

从文件修改时间看，部分证据或文档晚于节点完成时间：

- `docs/guides/TASKFLOW-MD-CONTRACT-v0.9.19.md` 修改时间约为 03:56:55，但 N02 完成时间为 03:52:45。
- `docs/reports/TF-POC-MD-01-Rerun-Review-v0.6.33.45.md`、`docs/文档导航.md`、`docs/changes/CHANGELOG-v0.6.33.md` 修改时间约为 03:56:55，但 N05 完成时间为 03:54:10。

说明节点完成时间没有覆盖“证据落盘 / 文档同步 / 报告生成”的真实工作。

### 2.3 真正的工作发生在节点计时之外

N01、N02、N03 的 1s 更接近脚本状态更新耗时，而不是节点工作耗时。真实工作包含阅读、分析、写文档、验证、整理回复等，但未被节点账本覆盖。

## 3. 最小修复

本轮只改 `tools/taskflow/taskflow-md.mjs` 的 `complete-node`：

- 默认写 `未精确计时`。
- 只有传入 `--timing-trusted` 且存在有效开始时间时，才按 startedAt/completedAt 计算耗时。
- 允许通过 `--actual "..."` 显式传入可信耗时。

## 4. 回归验证

验证命令：

```bash
node --check tools/taskflow/taskflow-md.mjs
```

结果：PASS。

临时副本验证：

- 不传 `--timing-trusted`：`complete-node` 输出 `未精确计时`。
- 传 `--timing-trusted`：按 start/complete 间隔输出 `1s`。

验证文件位于：

- `_local/taskflow/TF-GOV-11/timing-untrusted-test.md`
- `_local/taskflow/TF-GOV-11/timing-trusted-test.md`

## 5. 对后续执行的约束

后续真实任务只有在严格按以下顺序执行时，才允许使用 `--timing-trusted`：

```text
start-node Nxx
真实执行 Nxx 的产物、验证、评审、证据落盘
complete-node Nxx --timing-trusted
```

若先做工作、后补 start/complete，则必须让实际耗时保持 `未精确计时`，不能输出看似精确的秒数。

## 6. 对 TF-POC-MD-01-RERUN 的改判

- 格式输出：PASS
- 节点清单一致性：PASS
- 门禁检查：PASS
- 证据落盘：部分 PASS
- 耗时可信度：FAIL

TF-POC-MD-01-RERUN 的节点耗时不应作为可信 KPI 使用。
