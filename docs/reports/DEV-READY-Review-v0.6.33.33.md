# v0.6.33.33 真实开发落地前评审

## 结论

建议在 v0.6.33.33 原型和文档收口后，进入真实开发任务拆解，但 P0 范围应控制为最小可运行闭环。

## P0 工作包建议

1. 项目 / 团队 / 员工基础模型与 Mock API；
2. 任务单最小闭环：计划、执行、审查、待决策、完成；
3. 待决策工作台：展示问题、推荐方案、用户选择、恢复流转；
4. 原型页面工程化：总览、项目健康、团队详情、待决策、员工页；
5. 文档与结构化 Markdown 模板落地。

## P1 工作包建议

1. RuntimeHost / RuntimeNode / WorkerRuntimeBinding 数据模型；
2. SkillSnapshot / TemplateSkillMapping 管理；
3. 任务事件流和审查记录；
4. 多团队并行和冲突处理；
5. OpenCode / Claude Code / Codex 适配层探索。

## 暂停门禁

- P0 是否接真实 Runtime；
- 是否先做前后端 Mock 闭环；
- 是否引入数据库；
- 是否支持多团队并发执行。
