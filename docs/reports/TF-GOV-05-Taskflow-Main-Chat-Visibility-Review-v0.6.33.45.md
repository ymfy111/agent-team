# TF-GOV-05｜taskflow 主对话正文可见性补强评审报告

版本：v0.6.33.45 / taskflow v0.9.14  
日期：2026-05-24

## 1. 背景

上一轮模拟测试中，用户指出两个可见性问题：

1. 不能把 Activity / 工具日志里的输出算作用户已看到。
2. 每个节点的“已开始”“已完成，进度 x/y”必须出现在主对话框正文里。

因此本轮将 taskflow 可见性口径升级为：**主对话正文是唯一用户可见验收口径；Activity、工具日志、脚本输出和隐藏缓存只作为辅助证据。**

## 2. 修改内容

- `skills/taskflow/SKILL.md`：升级到 v0.9.14，新增“主对话正文强制同步门禁”。
- `skills/taskflow/README.md`：升级到 v0.9.14，明确最终补表不能替代过程消息。
- `skills-README.md`：升级到 v0.9.14，补充主对话正文可见性规则。
- `tools/taskflow/taskflow.mjs`：`mark-rendered` 增加 `--confirmed-main-chat` 门禁。
- `docs/guides/TASKFLOW-GOVERNANCE-v0.9.14.md`：新增治理说明。
- `docs/文档导航.md` 与 `docs/changes/CHANGELOG-v0.6.33.md`：同步入口和变更记录。

## 3. 模拟测试

任务流：`TF-SIM-REAL-04｜主对话正文完整可见输出模拟测试`

测试目标：验证任务内容为模拟时，真实 taskflow 链路仍能把每个节点的开始、完成、进度、实际耗时输出到主对话正文。

## 4. 验证结果

```text
node --check tools/taskflow/taskflow.mjs：PASS
mark-rendered 无 --confirmed-main-chat：FAIL as expected
validate-visible：PASS
render-pending final：NO_PENDING_VISIBLE_EVENTS
Progress：4/4
Actual Total：51s
Pending Visible Events：0
```

## 5. 最终节点进度日志

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-SIM-REAL-04-N01 | 模拟复核 v0.9.14 主对话正文可见性门禁。 | 模拟确认 v0.9.14 规则：用户可见进度只以主对话正文为准，Activity/工具日志/脚本输出只作为辅助证据。 | PASS；评审：PASS | 主对话正文可见性规则已复核 | 低复杂度 | 8s |
| TF-SIM-REAL-04-N02 | 模拟一个中间节点，验证开始与完成消息都进入主对话正文。 | 模拟确认中间节点也能完整输出 start/done：N02 开始和完成均已在主对话正文出现。 | PASS；评审：PASS | N02 start/done 两类消息均已在对话框正文输出 | 低复杂度 | 9s |
| TF-SIM-REAL-04-N03 | 模拟节点执行中进行阶段性进度推送。 | 模拟确认长节点执行中可以主动推送 7 列缓存进度表到主对话正文，不需要等节点结束。 | PASS；评审：PASS | N03 进行中进度表已输出到对话框正文 | 中复杂度 | 23s |
| TF-SIM-REAL-04-N04 | 模拟最终 validate-visible 和 summary 校验。 | 模拟确认所有节点的 start/done 事件均已输出到主对话正文，准备进行 validate-visible 与最终 summary。 | PASS；评审：PASS | 4 个节点的开始/完成消息均在对话框正文出现 | 低复杂度 | 11s |

## 6. 评审结论

通过。

本轮修正后，taskflow 的用户可见进度口径更加明确：

- 缓存负责记录；
- render-pending 负责生成待展示文本；
- 主对话正文负责真正展示；
- mark-rendered 只有在正文展示后才能执行；
- 最终 summary 负责兜底，不替代过程消息。

## 7. 后续建议

下一轮真实任务流可按 v0.9.14 执行 `TF-DOC-STRUCT-01｜结构化 Markdown 模板收口`。
