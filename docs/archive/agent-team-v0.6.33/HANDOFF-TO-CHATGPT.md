# 交接手册：agent-team 项目移交 ChatGPT 继续

> 编写时间：2026-05-25  
> 编写方：OpenCode (Claude Opus)  
> 接手方：ChatGPT  
> 项目仓库：  
> - GitHub: git@github.com:ymfy111/agent-team.git  
> - Gitee: git@gitee.com:ai-craft/agent-team.git  

---

## 1. 项目概况

| 项目 | 说明 |
|---|---|
| 名称 | agent-team（智能软件工厂） |
| 定位 | 以 TaskFlow / TaskTicket 为事实主线的多智能体协作系统，不是群聊工具 |
| 当前版本基线 | v0.6.33.45 |
| 当前阶段 | DOC-CLOSEOUT 完成 → 准备进入 Guarded Flow 最小实现 |
| 核心方法论 | TaskFlow First / WorkPackage / Guarded Flow |

---

## 2. 核心产品对象链

```text
Project
  → Stage / Plan
    → WorkPackage / TaskFlowGroup
      → TaskFlow
        → TaskTicket / Node
          → Artifact / Evidence / Review / Decision / Handoff
```

---

## 3. 分阶段演进路径

```text
A. Agent-led Task List     ← 已完成 POC
B. Guarded Task Flow       ← 当前进入
C. 程序状态机编排           ← 后续
D. Runtime 工厂化调度       ← 远期
```

---

## 4. 文档体系结构

```text
docs/
├── project-memory.md          ← 项目长期事实源（关键！接手必读）
├── 文档导航.md                ← 文档入口与分类索引
├── changes/                   ← CHANGELOG
├── guides/                    ← 治理指南（最新 v0.9.29）
├── plans/                     ← 路线图与阶段计划
├── prototypes/                ← 原型 HTML + 头像资源
├── recommendations/           ← 产品化建议（旧路径）
├── recs/                      ← 产品化建议（新路径）
├── reports/                   ← 评审报告
├── specs/                     ← PRD / SDD / 子设计 / 部署
├── tasks/                     ← 任务流定义与执行记录
├── templates/                 ← 结构化 Markdown 模板
└── workitems/                 ← 工作项与 run 记录（v0.9.29 口径）
```

### 关键文档清单

| 用途 | 文件 |
|---|---|
| 产品需求 | `specs/PRD-v0.6.33.md` |
| 系统设计 | `specs/SDD-v0.6.33.md` |
| TaskFlow/TaskTicket 子设计 | `specs/SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md` |
| 产品-技能映射 | `specs/SDD-TASKFLOW-SKILL-PRODUCT-MAPPING-v0.6.33.md` |
| 总路线图 | `plans/PLAN-SMART-FACTORY.md` |
| Guarded Flow 路线图 | `plans/PLAN-SMART-FACTORY-GUARDED-FLOW.md` |
| 治理规则（最新） | `guides/TASKFLOW-GOVERNANCE-v0.9.29.md` |
| 产品化建议 | `recs/REC-MAC-PROD-v0.6.33.md` |
| 原型 | `prototypes/agent-team-v0.6.33.45-prototype.html` |

---

## 5. 当前状态与已完成工作

### 已完成的主线任务

- TF-DOC-STRUCT：结构化 Markdown 模板体系
- TF-POC-MD-01：Agent-led Task List POC
- TF-GF-IMPL-01：依赖检查最小实现
- TF-GF-IMPL-02：阻塞决策检查最小实现
- TF-GF-IMPL-03：验证失败状态最小实现
- TF-GF-REVIEW-01：产品映射评审
- TF-PROD-MODEL 系列：产品模型收敛（对象最小模型、执行侧对象、UI/Runtime 边界、跨文档一致性）
- DOC-CLOSEOUT：文档清理与同步

### 本次交接前完成的工作

1. 创建并评审修改了 `SDD-TASKFLOW-TASKTICKET-MODEL-v0.6.33.md`（四层模型 + 字段映射 + ID 规范 + P0 落地约定）
2. 多轮文档全量更新（从 ChatGPT 产出的 zip 包同步）
3. 清理过期文档 29 个（patches、重复 run、guides 旧版本、未引用历史报告）
4. 建立双端推送规范（origin=Gitee + github=GitHub）

---

## 6. 下一步工作

### 优先级 1：TF-GF-IMPL-04（恢复记录最小实现）

- 目标：实现任务中断/恢复时的状态记录机制
- 约束：不做完整状态机，只做最小可用记录
- 参考：`docs/workitems/TF-GF-IMPL.md`

### 优先级 2：文档口径一致性修复

当前存在的口径不一致：

| 问题 | 位置 |
|---|---|
| 文档导航仍写 v0.6.33.30 为候选基线 | `文档导航.md` 页首 |
| 文档导航引用 TASKFLOW-GOVERNANCE-v0.9.12 | `文档导航.md` |
| project-memory 引用 v0.9.25 为 skill 参考 | `project-memory.md` |
| 实际最新治理版本是 v0.9.29 | `guides/TASKFLOW-GOVERNANCE-v0.9.29.md` |
| tasks/ 与 workitems/ 双目录并存 | v0.9.29 口径应统一到 workitems/ |
| recommendations/ 与 recs/ 双目录并存 | 应统一到 recs/ |

建议：统一更新 `文档导航.md` 和 `project-memory.md` 中的版本引用。

### 优先级 3：待确认的文件清理

以下文件疑似过期但未删除，需要确认：

- `guides/TASKFLOW-GOVERNANCE-v0.9.12.md`（被导航引用）
- `guides/TASKFLOW-GOVERNANCE-v0.9.25.md`（被 project-memory 引用）
- `tasks/TF-GF-IMPL.md`（与 workitems/TF-GF-IMPL.md 重复）
- `specs/DEPLOY-v0.6.33.md`、`specs/SDD-PROTOTYPE-MIGRATION-v0.6.33.md`（无入口引用）
- `plans/PLAN-v0.6.33.md`（与 PLAN-SMART-FACTORY 疑似重复）

---

## 7. 关键约束与规则

### 架构约束

1. **不做完整状态机**——先主智能体驱动任务清单 + 轻量约束
2. **反馈必须结构化落盘**——TaskEvent / ExecutionResult / ReviewRecord / DecisionItem
3. **TaskFlow First**——协作核心是任务票据与证据链，不是聊天会话
4. **Markdown 结构化**——保留 Markdown 但含元数据/区块，便于程序读取
5. **不提前引入 Runtime 调度**——当前只做文档化 + Guarded Flow

### 文档维护规则

1. 每次更新必须同步 `文档导航.md` 和 `project-memory.md`
2. 新文档按 `guides/TASKFLOW-GOVERNANCE-v0.9.29.md` 定义的目录规范落位
3. 正式任务 run 记录放 `workitems/runs/`
4. 评审报告放 `reports/`

### Git 规则

1. **双端推送**：每次 push 必须同时推送 origin（Gitee）和 github（GitHub）
2. `.gitignore` 排除：`update/`、`backup/`
3. **禁止 git init**（项目已有仓库）

### TaskTicket 完成标准

一个 TaskTicket/Node 完成需要：
- 明确的 verificationEvidence（测试输出/截图/审查结论）
- 不能只说"已修改代码"，必须说明"用什么证据证明修改有效"
- Artifact ≠ Evidence（产出物 ≠ 验证证据）

---

## 8. 协作模式

### 当前协作方

| 角色 | 工具 | 职责 |
|---|---|---|
| 用户 | 人工 | 产品方向、验收、决策 |
| ChatGPT | ChatGPT | 设计侧主力（PRD/SDD/治理/路线图/评审） |
| OpenCode (Claude) | OpenCode | 实施侧辅助（文档同步/代码/git 操作/评审） |

### 文档交接流程

```text
ChatGPT 产出文档 → 导出 zip → 放入 update/ 目录
→ OpenCode 执行：备份 → 全量替换 docs/ → 提交 → 双端推送
```

### 设计-实施同步协议

```text
设计侧更新 → 生成 HandoffPackage / ChangeLog
→ 实施侧 BaselineCheckTask
→ 进入具体 TaskTicket 执行
→ 执行结果回写 TaskEvent / ReviewRecord
→ 设计侧读取最新交接信息
```

---

## 9. 快速上手建议

1. **先读** `docs/project-memory.md`（项目事实源，最重要）
2. **再读** `docs/文档导航.md`（文档分类索引）
3. **看路线图** `docs/plans/PLAN-SMART-FACTORY.md`
4. **看治理规则** `docs/guides/TASKFLOW-GOVERNANCE-v0.9.29.md`
5. **看下一步任务** `docs/workitems/TF-GF-IMPL.md`

---

## 10. 风险提示

1. **口径不一致**是当前最大风险——多个文档对"当前基线版本"和"治理规则版本"说法不同
2. **tasks/ vs workitems/ 双目录**需要收口，v0.9.29 已定义统一到 workitems/
3. **recommendations/ vs recs/ 双目录**需要收口
4. **guides/ 下仍有多个旧版本**（v0.9.11~v0.9.25），虽未删但不应再引用
5. 原型 HTML 是单文件静态原型，修改时注意不要破坏头像资源路径（已从 base64 迁移到 `pic/avatars/*.png`）
