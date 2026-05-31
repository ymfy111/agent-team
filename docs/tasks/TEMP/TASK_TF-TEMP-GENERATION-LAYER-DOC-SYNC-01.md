# TASK_TF-TEMP-GENERATION-LAYER-DOC-SYNC-01｜生成层架构资料同步到 docs

> TaskId：`TF-TEMP-GENERATION-LAYER-DOC-SYNC-01`  
> 类型：TEMP / docs sync  
> Status：DONE  
> StartedAt：2026-06-01 00:03:23 +0800  
> FinishedAt：2026-06-01 00:03:23 +0800  
> Scope：仅更新 docs 与参考图片，不修改 apps 代码。

## 1. 背景

用户补充两张架构图：

- 生成层：AI 驱动的应用建模与生成；
- AI 原生应用平台：五层能力体系与持续演进闭环。

需要把这些上位资料同步到项目文档中，明确当前智能软件工厂对应 AI 原生应用平台中的生成层 / 建层。

## 2. 执行内容

1. 复制架构图参考图片到 `docs/prototypes/pic/references/`。
2. 新增 `docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md`。
3. 更新 `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md`，加入生成层上位依据。
4. 更新 `docs/specs/PRD-v0.6.33.md` 与 `docs/specs/SDD-v0.6.33.md` 的产品 / 系统定位。
5. 更新 `docs/workitems/TF-FACTORY-UI-RUNTIME.md`、`docs/project-memory.md`、`docs/doc-nav.md`、`docs/文档导航.md`。

## 3. 验收标准

- 文档能清楚说明软件工厂是 AI 原生应用平台的生成层 / 建层产品化工作台；
- `Plan → Stage → WorkItem → Task → Step` 与生成层动态工作流关系明确；
- 员工、Skill、Runtime、Decision、QA 与生成活动的关系明确；
- 参考图片已保存且文档可引用；
- 不修改 `apps/`。

## 4. 结果

DONE。详见报告：`docs/reports/RPT-TF-TEMP-GENERATION-LAYER-DOC-SYNC-01.md`。
