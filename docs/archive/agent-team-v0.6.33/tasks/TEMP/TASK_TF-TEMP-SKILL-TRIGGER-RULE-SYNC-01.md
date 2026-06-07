# TASK_TF-TEMP-SKILL-TRIGGER-RULE-SYNC-01｜Skill 触发条件与调度模式同步

> 类型：TEMP / 文档与 skill 规则同步  
> 状态：done  
> Skill：task-runner  
> Mode：TEMP_INTERACTIVE  
> StartedAt：2026-06-01 00:25:56 +0800  
> FinishedAt：2026-06-01 00:25:56 +0800

## 1. 目标

评审并固化 `task-runner` / `task-batch-runner` 的触发条件，覆盖临时任务、计划任务用户交互确认调度、未来 ORCH 非交互调度三类场景。

## 2. 范围

范围内：

- 更新 `skills/task-runner/SKILL.md`；
- 更新 `skills/task-batch-runner/SKILL.md`；
- 新增触发模式 Guide；
- 更新 AI 动态工作流执行 Guide、skills README、文档导航、project-memory、工作项记录；
- 生成本任务报告和 `.runtime/exec` 账本。

范围外：

- 不修改 `apps/` 页面代码；
- 不变更 runner 脚本实现；
- 不调整已有业务规则正文。

## 3. nodes[]

| Node | 状态 | 说明 | 产物 |
|---|---|---|---|
| S01 | PASS | 评审触发条件方案 | 通过，方案适合固化 |
| S02 | PASS | 更新 skill 规则 | task-runner / task-batch-runner |
| S03 | PASS | 更新项目 docs | guide / README / nav / memory / workitem |
| S04 | PASS | 校验关键字段与边界 | apps 未修改，版本脚本可运行 |

## 4. 评审结论

通过。触发体系符合当前 AI 动态工作流层级：`Plan / Stage / WorkItem / Task / Step`。它能同时支持当前用户交互确认推进，以及未来 ORCH 结构化派工非交互调用。

## 5. 输出合规

```json
{
  "visibleOutputCompliance": {
    "planShown": true,
    "planCodeBlock": false,
    "userConfirmed": "conditional_user_approval",
    "summaryShown": true,
    "summaryCodeBlock": true,
    "complianceStatus": "PASS_WITH_WARNINGS",
    "note": "用户要求评审通过即执行；本轮在对话中给出执行开始提示，但未单独输出完整代码块 Plan。"
  }
}
```
