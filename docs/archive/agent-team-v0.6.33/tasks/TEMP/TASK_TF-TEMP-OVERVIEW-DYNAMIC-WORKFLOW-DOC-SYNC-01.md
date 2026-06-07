# TASK_TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01｜总览页动态工作流截图需求文档同步

> TaskId：TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01  
> 类型：临时文档同步任务  
> 状态：done  
> StartedAt：2026-05-31 23:54:31 +0800  
> FinishedAt：2026-05-31 23:58:00 +0800  
> 关联工作项：`TF-FACTORY-UI-RUNTIME`  
> 执行入口：`task-runner v1.0.2` 语义记录

---

## 1. 任务目标

根据用户提供的首页与工作项详情抽屉截图，提炼并同步以下设计口径：

- 智能软件工厂以 AI 动态工作流驱动；
- 页面主线应围绕计划、阶段、任务项 / 工作项、任务、步骤；
- 员工活动必须落实到具体任务或步骤；
- 首页总览应能表达 Team / WorkItem / TaskBatch / Task / DecisionPacket 的动态状态。

---

## 2. 本轮范围

### 范围内

- 保存用户提供截图为设计参考图；
- 新增总览页动态工作流子设计文档；
- 更新文档导航、project-memory 和相关 WorkItem；
- 记录本次文档同步任务与 QA 结果。

### 范围外

- 不修改 `apps/` 前端代码；
- 不修改 mock 数据；
- 不启动新的 UI 实现任务；
- 不调整非首页页面。

---

## 3. 产物

- `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`
- `docs/prototypes/pic/references/overview-dynamic-workflow-reference-01.png`
- `docs/prototypes/pic/references/overview-workitem-drawer-reference-01.png`
- `docs/reports/RPT-TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01.md`
- `.runtime/exec/TEMP/TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01.json`

---

## 4. 结论

文档已同步。后续实现建议以 `TF-FACTORY-UI-RUNTIME-01A` 小步任务执行，只改总览页动态工作流表达，避免扩大到全站重构。
