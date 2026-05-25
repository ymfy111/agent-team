# TF-PROD-MODEL｜TaskFlow First 产品对象最小模型工作项

> 文档类型：WorkItem / 工作项  
> 当前基线：v0.6.33.45  
> 所属计划：`docs/plans/PLAN-SMART-FACTORY.md`  
> 关联阶段：TaskFlow First 产品对象建模阶段  
> 状态：ready  
> 当前焦点：从已完成的 Guarded Flow P0 能力中抽取正式产品对象最小模型。

---

## 1. 工作项定位

本工作项承接 `TF-GF-IMPL` 的执行成果，将 `taskflow skill + 结构化 Markdown + taskflow-md.mjs` 中已经验证的单智能体任务流能力，收敛为智能软件工厂产品中的最小对象模型。

本工作项不继续堆叠工具命令，重点回答：

```text
计划 / 阶段 / 工作项 / 任务 / 步骤
Plan / Stage / WorkItem / TaskFlow / TaskTicket
```

这些对象在正式产品中各自承担什么职责、最小字段是什么、如何与事件、证据、评审、决策和交接关联。

---

## 2. 所属计划与设计依据

- 总路线图：`docs/plans/PLAN-SMART-FACTORY.md`
- 上一工作项：`docs/workitems/TF-GF-IMPL.md`
- 主设计：`docs/specs/SDD-v0.6.33.md`
- TaskFlow / TaskTicket 子设计：`docs/specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`
- skill 产品化映射：`docs/specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md`
- 多智能体协作产品化建议：`docs/recs/REC-MAC-PROD-v0.6.33.md`
- DDD 规范：`docs/guides/GUIDE-DOC-DRIVEN-DEVELOPMENT.md`

---

## 3. 任务状态清单

| 任务 | 状态 | 目标 | 关键产出 | Run | Report | 下一步 |
|---|---|---|---|---|---|---|
| TF-PROD-MODEL-01 | ready | 定义 Plan / Stage / WorkItem / TaskFlow / TaskTicket 的最小字段和边界 | 产品对象最小字段表 | 待生成 | 待生成 | 下一步建议执行 |
| TF-PROD-MODEL-02 | planned | 定义 TaskEvent / EvidenceRef / ReviewRecord / DecisionItem / HandoffPackage 的最小关系 | 事件、证据、评审、决策、交接关系图 | 待生成 | 待生成 | 后续 |
| TF-PROD-MODEL-03 | planned | 评审产品对象如何映射到 UI 信息架构与 Runtime 边界 | UI / Runtime 边界建议 | 待生成 | 待生成 | 后续 |
| TF-PROD-MODEL-04 | planned | 将模型结论回写到 SDD / REC / PLAN / WorkItem | 文档同步与评审 | 待生成 | 待生成 | 后续 |

状态说明：

- `planned`：计划中，尚未满足执行条件；
- `ready`：可执行，适合作为下一步；
- `running`：执行中；
- `done`：执行完成并有 Run / Report 记录或结论已沉淀；
- `accepted`：已被用户或阶段门禁验收；
- `blocked`：阻塞；
- `deferred`：暂缓；
- `superseded`：已被替代。

---

## 4. 本工作项边界

### 4.1 范围内

- 收敛 Plan / Stage / WorkItem / TaskFlow / TaskTicket 的产品对象定义；
- 定义 TaskEvent、EvidenceRef、ReviewRecord、DecisionItem、HandoffPackage 与任务对象的最小关系；
- 评审这些对象如何支撑后续 UI 和 Runtime；
- 将结论同步到相关 SDD、REC、PLAN 和 WorkItem 文档。

### 4.2 范围外

- 不实现数据库表；
- 不实现完整状态机；
- 不实现 Runtime 自动调度；
- 不修改网站 UI；
- 不扩展 taskflow-md 工具命令，除非后续任务明确要求。

---

## 5. 验收标准

本工作项完成时应满足：

- 产品对象最小模型能覆盖当前 Guarded Flow 已验证能力；
- 用户侧命名与设计侧对象一一对应；
- 不与主 PRD / 主 SDD / 原型迁移设计冲突；
- 后续 UI / Runtime 工作能基于该模型继续展开；
- 结论已沉淀到正式设计或建议文档，而不是只存在运行记录中。

---

## 6. 更新记录

| 时间 | 变更 | 依据 |
|---|---|---|
| 2026-05-25 | 新建 TaskFlow First 产品对象最小模型工作项 | TF-GF-IMPL 已 accepted，下一步进入产品对象建模 |
