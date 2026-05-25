# TF-GOV-08｜taskflow 实战可见性与耗时可信度复盘

版本：v0.6.33.45 / taskflow v0.9.17

## 背景

用户截图显示，真实任务 `TF-DOC-STRUCT-01` 执行时，主对话正文只显示了 N01 start/done 和 N02 start，后续 N02 done、N03、N04 的过程输出未完整出现在对话框正文，只在最终总结或隐藏过程里出现。

同时，N01 的开始时间与完成时间相差数分钟，但实际耗时被写为 `0s`，说明耗时记录不是可信脚本计时结果。

## 结论

本轮实战验证应判定为 **FAIL**，不是 PASS。

失败原因：

1. 过程可见性不合格：主对话正文没有完整显示每个节点的 start/done。
2. 耗时可信度不合格：实际耗时与 start/done 时间戳矛盾。
3. v0.9.16 将 auto-visible 能力默认化，未充分区分当前 ChatGPT 单轮环境与具备消息推送能力的上层 runner。

## 修正规则

- `auto-visible` 只有在运行环境/上层 runner 明确支持连续普通助手消息推送时可用。
- 当前 ChatGPT 单轮环境不得宣称“无人值守且实时过程完整可见”。
- 若用户要求实时过程可见，使用 `checkpoint-visible` 或上层 runner。
- 若用户要求无人值守，使用 `batch-auto-summary`，完成后输出完整生命周期审计，不声称实时可见。
- 实际耗时必须由可信 start/done 账本计算；若不可信，写“未精确计时”。

## 处理结果

已升级 taskflow 到 v0.9.17，并同步更新：

- `skills/taskflow/SKILL.md`
- `skills/taskflow/README.md`
- `skills-README.md`
- `docs/guides/TASKFLOW-GOVERNANCE-v0.9.17.md`
- `docs/reports/TF-GOV-08-Taskflow-Reality-Check-v0.6.33.45.md`

## 下一步建议

真实项目继续执行时，先选择模式：

1. 需要无人值守：采用 batch-auto-summary，最终审计完整但不承诺实时过程；
2. 需要实时可见：采用 checkpoint-visible，或开发/接入上层 taskflow runner 负责消息推送。
