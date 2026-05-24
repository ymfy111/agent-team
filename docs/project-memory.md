# 智能软件工厂项目记忆

> 当前版本：v0.6.33（原型 v0.6.33.45）  
> 当前前端迁移基线：TF-P0B-05  
> 状态：长期项目记忆 / 下一步工作锚点

---

## 1. 当前项目定位

`agent-team` 是智能软件工厂的项目仓库，也是智能软件工厂自身研发过程的半手工 POC。

当前智能软件工厂系统尚未实现，因此还不能自动完成岗位确认、任务分派、进度跟踪、阻塞协调、决策上报和验收门禁。当前阶段由项目负责人手动调度外部智能体协作：

```text
项目负责人 ↔ 设计智能体（ChatGPT 主导）
  形成需求、设计、施工图、评审意见、任务单、原型迁移。

项目负责人 ↔ 编程智能体（OpenCode / Codex）
  按任务单创建工程、写代码、跑测试、修复问题。

项目负责人 ↔ 评审 / 交付审查智能体
  独立检查设计、计划、代码或交付结果是否满足标准。
```

智能软件工厂的产品目标，就是把这种依赖人工搬运上下文的协作方式系统化。

---

## 2. 当前 AI 原生岗位模型

三个核心 AI 原生岗位：

```text
协同规划岗
  默认担任团队 Leader / 组长。
  负责用户沟通、需求沉淀、系统设计、阶段计划、任务单、进度跟踪、阻塞协调、分歧初判和对人反馈。

实现验证岗
  负责编码、TDD、自测、局部集成、修复、执行回执。
  可以多个实例并行。

交付审查岗
  负责独立验收、质量门禁、整改建议、初验收报工。
  不参与实现验证岗的日常 TDD 循环。
```

`Leader / 组长` 是团队角色，不是第四个岗位。默认规则是：团队 Leader 由协同规划岗数字员工担任。

---

## 3. 当前工作闭环

```text
岗位确认
→ 工作指南
→ 项目上下文
→ 阶段计划
→ TaskTicket / 任务单
→ 执行回执（TaskEvent / ExecutionResult）
→ 进度 / 阻塞 / 分歧
→ ReviewRecord / DecisionItem / ChangeRequest
→ AcceptanceRecord / ReworkOrder
→ Activity 回写
```

---

## 4. 当前文档与工程状态

### 4.1 核心文档入口

```text
README.md
docs/文档导航.md
docs/project-memory.md（本文件）
```

### 4.2 核心设计文档（v0.6.33 基线）

```text
docs/specs/PRD-v0.6.33.md
docs/specs/SDD-v0.6.33.md
docs/plans/IMPL-PLN-v0.6.33.md
docs/tasks/WBS-v0.6.33.md
docs/tasks/DEV-TASKFLOW-v0.6.33.md
docs/decisions/ADR-0009-Agent-Team-Orchestration-v0.6.33.md
docs/changes/CHANGELOG-v0.6.33.md
```

### 4.3 原型参考

```text
docs/prototypes/agent-team-v0.6.33.45-prototype.html（slim 归档，已移除 base64 头像）
docs/prototypes/pic/（头像与视觉素材）
```

### 4.4 前端工程（apps/web）

```text
当前形态：无构建 ESM（不引入 TS/Vite/pnpm/第三方包）
入口：index.html + src/main.js
CSS：src/styles/prototype.css
Legacy 渲染：src/legacy/prototype-runtime.js（约 720KB，已 slim）
结构：bootstrap / adapters / services / app / pages / templates / tools / qa
资源：pic/ 与 index.html 同级，部署时必须携带 pic/avatars/
头像策略：统一 pic/avatars/*.png，avatar-default.png 兜底，无 base64 fallback
```

### 4.5 QA 验证基准

```text
brokenImages=0, pageErrors=0, httpErrors=0
teamCards=5, masters=5, workers=17
验证命令：cd apps/web && python tools/sandbox_verify.py
```

---

## 5. 已完成的任务流（P0B/P0C）

### TF-P0B-01：结构化前端工程收口
- Data Provider 抽离、Factory API 抽象、Prototype Store 收口
- AppShell / Router / MenuConfig 收口
- EventBus / Action Dispatcher 收口
- Legacy Page Module 初步拆分

### TF-P0B-02：前端源码基线校准
- README / QA / manifest / package.json 对齐
- index.html 与 prototype-runtime.js 瘦身边界清单
- entry-map.js、page-meta.js

### TF-P0B-03：第一个 DOM 模板化试点
- loadingPage 作为最低风险试点
- page-template-host.js、loading-page-template.js

### TF-P0B-04：第二个 DOM 模板化试点
- top-banners-container / networkErrorBanner 模板化
- top-banner-template.js

### TF-P0B-05：Avatar Base64 Fallback 移除
- 原型与 apps/web 头像统一走静态路径
- prototype-runtime.js 从 ~4MB 降到 ~720KB
- 图片验证通过

### TF-P0C-01/02（试做）：Taskflow UI 对齐
- 总览页任务流摘要、项目页节点证据面板
- Decision / Blocker / Node Evidence 语义
- 团队/员工页当前节点状态

---

## 6. 架构演进路线

```text
阶段 A: Agent-led Task List（当前，主智能体任务清单驱动）
阶段 B: Guarded Task Flow（轻量状态约束）
阶段 C: State-machine Orchestration（程序状态机）
阶段 D: Factory Runtime Orchestration（多 Runtime 工厂化编排）
```

当前处于阶段 A，不要直接实现完整状态机。

---

## 7. 下一步方向

```text
方案 A：继续前端瘦身（清理残留 data-uri 兼容逻辑）
方案 B：继续 DOM 模板化试点（第三个低风险模块）
方案 C：基线复核（GitHub 拉取 → QA → 确认基线 → 再选任务流）
```

推荐新会话先做基线复核（方案 C），再选 A 或 B。

---

## 8. 长期设计约束

```text
1. P0 阶段保持无构建 ESM，不引入 Vite/TS/pnpm。
2. agent-team 是业务状态真源（Gateway 不是）。
3. 前端只传 agentId / conversationId / hostContext。
4. Worker 绑定 RuntimeHost / workspace / OpenCode 主智能体。
5. OpenCode 内部子智能体 ≠ 软件工厂正式 Worker。
6. 关键验收支持独立 Worker / 独立会话 / 不同模型。
7. 交付审查采用批量门禁，不做碎片化即时往返。
8. 结构化 Markdown = YAML Front Matter + 正文 + 标记区块 + 可选 JSONL 事件。
9. 不把主子智能体自由聊天当事实来源；关键信息必须回写结构化记录。
```

---

## 9. Git 远程

```text
码云（origin）：git@gitee.com:ai-craft/agent-team.git
GitHub：git@github.com:ymfy111/agent-team.git
分支：main
```
