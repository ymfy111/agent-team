# ADR-0010：采用 Legacy 原型生产化 + Adapter 收口 + 渐进式组件替换

> 文件名：`ADR-0010-Prototype-Migration-v0.6.33.md`  
> 状态：Accepted  
> 日期：2026-05-22  
> 关联设计：`docs/specs/SDD-PROTOTYPE-MIGRATION-v0.6.33.md`  
> 关联主文档：`docs/specs/SDD-v0.6.33.md`、`docs/plans/IMPL-PLN-v0.6.33.md`、`docs/tasks/WBS-v0.6.33.md`

---

## 1. 背景

智能软件工厂当前 HTML 高仿原型经过多轮修正，已经沉淀了大量产品表达、视觉细节、交互行为和问题修复经验。该原型包括总览、协作全景、团队、项目、待决策、岗位、员工、技能、小云入口、头像与状态表达等复杂模块。

如果正式项目完全从零重写，存在较高概率重复经历原型阶段已解决的问题：

```text
布局抖动、刷新闪烁、头像映射错误、状态点重复、抽屉行为退化、待决策位置漂移、旧岗位口径回退等。
```

因此需要一种兼顾复用和正式工程边界的迁移方式。

---

## 2. 决策

采用以下迁移路线：

```text
Legacy 原型生产化
→ Adapter 收口
→ Legacy Module 拆分
→ 正式业务模型接管
→ 高价值组件渐进替换
→ agent-web-kit / OpenCode Runtime 接入
→ Legacy 模块逐步退出
```

核心原则：

```text
1. 不直接推倒重写原型 UI。
2. 不把 Legacy 原型作为长期最终架构。
3. Legacy 层只能通过 dataProvider、apiAdapter、eventBus、stateStore 与正式工程交互。
4. 新增长期业务逻辑进入 contracts / domain / api / ui，不继续堆进 Legacy 大文件。
5. 每个 Legacy 模块必须有替换优先级和退出条件。
```

---

## 3. 备选方案

### 3.1 方案 A：抽规则后完全重写

优点：

```text
架构最干净，长期技术债少。
```

缺点：

```text
初始工作量大；高仿细节容易丢；原型阶段踩过的问题容易重演；正式项目早期交付慢。
```

结论：不作为第一阶段主路线。

### 3.2 方案 B：原型原封不动上线

优点：

```text
复用最高，初始速度最快。
```

缺点：

```text
全局变量、DOM 拼接、内联事件、全局 CSS 和 mock 状态会成为长期技术债；难以接真实 API、权限、测试和运行体。
```

结论：只允许作为短期验证方式，不作为正式工程路线。

### 3.3 方案 C：Legacy 原型生产化 + Adapter 收口 + 渐进替换

优点：

```text
复用现有视觉和交互；快速获得可运行工程；通过 Adapter 控制技术债；支持逐步替换和退出。
```

缺点：

```text
需要严格治理边界；短期会同时存在 Legacy 和正式模块；如果缺少退出机制，可能退化成长期黑盒。
```

结论：采纳。

---

## 4. 影响

### 4.1 对系统设计的影响

系统设计需要新增 Legacy Prototype Runtime 过渡层，并明确其与正式业务模型、agent-web-kit、OpenCode Runtime 的边界。

### 4.2 对实施计划的影响

实施计划从“直接搭正式工程并重写页面”调整为：

```text
P0a：原型工程化运行
P0b：Adapter 收口
P0c：Legacy 模块化
P1：正式业务模型接管
P2：高价值组件替换
P3：真实运行体接入
```

### 4.3 对任务拆解的影响

WBS 需要新增原型生产化迁移任务组，覆盖：

```text
工程壳、资源路径、CSS 命名空间、Data Provider、API Adapter、Event Bus、State Store、Legacy Module、视觉回归、退出计划。
```

### 4.4 对测试和验收的影响

每次迁移都必须使用 Playwright 截图和关键 DOM 检查，防止正式工程在视觉和交互上退化。

---

## 5. 约束

```text
1. P0a / P0b 不接真实 OpenCode Runtime。
2. P0a / P0b 不接真实 agent-web-kit，仅保留小云占位或 mock 对话壳。
3. P0a / P0b 不引入真实数据库，以 fixtures / mock API 为主。
4. Legacy 层不能直接持有最终业务事实来源。
5. 新增业务能力不写入 Legacy 大文件。
6. 每个 Legacy 模块必须可挂载、可更新、可卸载。
7. 所有新增设计子文档必须使用统一前缀命名，设计子文档使用 `SDD-`，决策记录使用 `ADR-`。
```

---

## 6. 退出条件

当以下条件满足时，Legacy 模块应被正式组件替换：

```text
1. 模块接入真实 API 或状态机后，Legacy DOM 操作明显阻碍维护。
2. 模块新增需求频繁，继续修改 Legacy 会扩大技术债。
3. 模块有稳定截图基线和组件契约，可以安全替换。
4. 模块需要复用到多个页面或业务场景。
```

建议优先替换：

```text
DecisionCenter → TeamRuntime → Overview → ProjectDocs → Worker / Role / Skill → Settings
```

---

## 7. 结论

本决策确认：智能软件工厂正式工程第一阶段采用 Legacy 原型生产化路线，但必须通过 Adapter 收口和退出计划控制风险。

该决策的核心不是“少写代码”，而是把高仿原型中已经验证的产品表达和交互细节变成可迁移的工程资产，同时避免让原型技术债成为最终架构。
