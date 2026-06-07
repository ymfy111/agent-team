# RPT-TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01｜总览页动态工作流文档同步报告

> 报告类型：文档同步 / 设计提炼  
> Status：PASS  
> UpdatedAt：2026-05-31 23:58:00 +0800

---

## 1. 输入

用户提供两张截图：

1. 首页总览：展示顶部指标、协作全景、团队动态、Team 工作项卡片、员工活动状态。
2. 工作项详情抽屉：展示 ERP 系统当前交付工作项、状态、任务列表、执行与验收、停止策略。

用户补充口径：

> 软件工厂是以 AI 动态工作流，计划、阶段、任务项、任务、步骤驱动的。这里要体现的动态和员工也是要落实这些活动。

---

## 2. 提炼结论

- 首页不应只是静态团队 / 员工展示，而应体现动态工作流。
- 任务项 / 工作项是总览页核心业务单元。
- `0/4`、`1/4` 应表示当前 TaskBatch 的任务进度。
- 员工卡片必须表达正在参与的 Task / Step，而不是仅展示头像和状态。
- 右侧团队动态应是 WorkItem / DecisionPacket / TaskEvent 的事件流。
- 详情抽屉应补全 Plan / Stage / WorkItem / Task / Step 上下文。

---

## 3. 更新文件

| 文件 | 动作 |
|---|---|
| `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md` | 新增 |
| `docs/prototypes/pic/references/overview-dynamic-workflow-reference-01.png` | 新增截图证据 |
| `docs/prototypes/pic/references/overview-workitem-drawer-reference-01.png` | 新增截图证据 |
| `docs/tasks/TEMP/TASK_TF-TEMP-OVERVIEW-DYNAMIC-WORKFLOW-DOC-SYNC-01.md` | 新增任务记录 |
| `docs/project-memory.md` | 追加项目记忆 |
| `docs/doc-nav.md` | 更新 ASCII 文档入口 |
| `docs/文档导航.md` | 更新中文文档入口 |
| `docs/workitems/TF-FACTORY-UI-RUNTIME.md` | 增补设计依据和建议任务 |

---

## 4. 验证

- 文档文件存在：PASS
- 截图参考文件存在：PASS
- 关键词覆盖 `计划 / 阶段 / 任务项 / 工作项 / 任务 / 步骤 / 员工活动 / DecisionPacket / TaskBatch`：PASS
- 本轮未修改 `apps/`：PASS

---

## 5. 下一步

建议启动小步实现任务：`TF-FACTORY-UI-RUNTIME-01A｜总览页动态工作流表达增强`。
