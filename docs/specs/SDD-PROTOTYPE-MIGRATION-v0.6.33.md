# 智能软件工厂原型到正式工程迁移设计

> 文档类型：SDD 子文档 / 专项系统设计  
> 文件名：`SDD-PROTOTYPE-MIGRATION-v0.6.33.md`  
> 归属主文档：`docs/specs/SDD-v0.6.33.md`  
> 版本：v0.6.33  
> 状态：原型生产化迁移方案 / Legacy Runtime 过渡架构  

---

## 1. 背景

智能软件工厂当前原型已经不是普通展示页面，而是多轮迭代后形成的高仿交互基线，包含：

```text
运行态：总览、协作全景、团队、项目、待决策。
工厂配置：岗位、员工、技能、设置。
全局能力：小云入口、对话浮层、演示模式、主题皮肤、头像与状态表达。
```

如果直接按正式工程从零重写，容易重复经历原型阶段已经解决过的问题，例如布局抖动、状态点重复、头像映射错误、抽屉交互退化、待决策位置漂移等。

因此，本设计采用：

```text
Legacy 原型生产化 + Adapter 收口 + 渐进式组件替换
```

目标不是把原型永久塞进正式项目，而是先把原型变成可运行、可验证、可逐步替换的工程资产。

---

## 2. 设计目标

```text
1. 最大化复用现有高仿原型的页面结构、样式、布局、交互与视觉细节。
2. 避免一开始就重写全部 UI，降低正式工程落地风险。
3. 通过 Adapter 将数据、事件、状态和 API 边界收口，防止 Legacy 原型污染正式架构。
4. 保持正式业务模型以 AgentTemplate、Worker、Team、Project、TaskTicket、Decision、Activity 等对象为核心。
5. 支持后续逐步接入真实 API、数据库、agent-web-kit 与 OpenCode Runtime。
6. 为 Legacy 模块设置退出机制，避免形成长期不可维护黑盒。
```

---

## 3. 总体迁移路线

```text
高仿 HTML 原型
  ↓
Legacy Prototype Runtime 隔离运行
  ↓
Data / Event / State / API Adapter 收口
  ↓
Mock API 替换原型内联数据
  ↓
按页面拆分 Legacy Module
  ↓
高价值组件渐进替换
  ↓
真实业务 API / 数据库接管
  ↓
agent-web-kit / OpenCode Runtime 接入
  ↓
Legacy 模块逐步退出
```

该路线属于“绞杀式迁移”：先让旧原型在正式工程中可控运行，再逐步由正式模块替换。

---

## 4. 架构分层

```text
apps/web
  ├─ AppShell / 路由 / 权限 / 布局
  ├─ Legacy Prototype Runtime
  │    ├─ overview legacy module
  │    ├─ team legacy module
  │    ├─ project legacy module
  │    ├─ decision legacy module
  │    ├─ worker legacy module
  │    ├─ skill legacy module
  │    └─ xiaoyun legacy module
  ├─ Adapter Layer
  │    ├─ dataProvider
  │    ├─ apiAdapter
  │    ├─ prototypeEventBus
  │    └─ prototypeStore
  └─ New Components
       ├─ Avatar
       ├─ StatusBadge
       ├─ RoleBadge
       ├─ Drawer
       ├─ TeamCard
       ├─ WorkerCard
       └─ DecisionCard

apps/api
  ├─ mock api
  └─ future real api

packages
  ├─ contracts
  ├─ domain
  ├─ fixtures
  ├─ ui
  └─ agent-web-adapter
```

## 4A. P0a 当前结构化无构建 ESM 基线

P0a 已从“进入 Vite / pnpm workspace”调整为更稳的第一步：**结构化无构建 ESM 迁移**。

该调整的目的不是降低最终工程标准，而是把风险拆开：第一步只改目录和资源组织，基本不改原型逻辑；后续再逐步引入 Adapter、Vite、pnpm 和 TypeScript。

当前 P0a 技术栈：

| 类别 | 选择 | 说明 |
|---|---|---|
| 前端语言 | 原生 JavaScript | 暂不改 TypeScript，避免结构迁移和类型改写混在一起。 |
| 模块系统 | Browser Native ES Module | 使用相对路径 import，浏览器和 Nginx 可直接运行。 |
| 样式 | 原生 CSS | 从单 HTML 中拆出 `src/styles/prototype.css`。 |
| 原型逻辑 | `src/legacy/prototype-runtime.js` | 先保留原型行为，降低回归风险。 |
| 静态资源 | `pic/` 与 `index.html` 同级 | 保持原型图片路径稳定。 |
| 沙箱验证 | Python Playwright 虚拟 origin | 不依赖 localhost，也不依赖 npm 包。 |
| 部署方式 | Nginx 静态部署 | 当前阶段可直接托管，无需 build。 |

当前目录：

```text
apps/web/
  index.html
  pic/
  src/
    main.js
    legacy/prototype-runtime.js
    styles/prototype.css
```

P0a 禁止项：

```text
不引入 TypeScript。
不引入 Vite / pnpm / npm 第三方包。
不接真实后端、数据库、agent-web-kit、OpenCode Runtime。
不同时做大规模组件化重写。
```

后续引入 Vite / pnpm / TypeScript 时，只作为工具链增强：目录职责保持不变，JS 可逐步改 TS，相对路径可逐步替换为 alias 或 package import。

---

### 4.1 Legacy Prototype Runtime

Legacy Prototype Runtime 是原型在正式工程中的过渡运行层。它可以复用原型 HTML / CSS / JS 的主要结构，但必须被正式工程包裹和约束。

职责：

```text
1. 承载原型视觉和交互基线。
2. 支持快速工程化运行和截图验证。
3. 通过 Adapter 与正式工程通信。
4. 不直接拥有最终业务事实来源。
```

不允许：

```text
1. 直接访问真实业务数据库。
2. 直接调用 OpenCode Runtime。
3. 新增长期业务逻辑。
4. 绕过正式 API Adapter 修改业务状态。
5. 继续膨胀为新的单文件巨型实现。
```

---

## 5. Adapter 收口设计

### 5.1 Data Provider

原型不得直接读取全局 `teams / workers / decisions / projects` 等变量，而应统一通过 Data Provider 读取。

```ts
type PrototypeDataProvider = {
  getTeams(): Promise<TeamView[]>
  getWorkers(): Promise<WorkerView[]>
  getProjects(): Promise<ProjectView[]>
  getDecisions(): Promise<DecisionView[]>
  getActivities(): Promise<ActivityView[]>
  getSkills(): Promise<SkillView[]>
  getAgentTemplates(): Promise<AgentTemplateView[]>
}
```

阶段演进：

```text
P0a：Data Provider 读取 fixtures。
P0b：Data Provider 调用 mock API。
P1：Data Provider 调用真实 API。
```

### 5.2 API Adapter

Legacy 层不直接 `fetch('/api/...')`，所有写操作进入 API Adapter。

```ts
type PrototypeApiAdapter = {
  resolveDecision(decisionId: string, optionId: string, comment?: string): Promise<void>
  updateWorkerStatus(workerId: string, status: WorkerRuntimeStatus): Promise<void>
  publishDoc(docId: string): Promise<void>
  createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderView>
  submitReview(input: SubmitReviewInput): Promise<AcceptanceRecordView>
}
```

### 5.3 Event Bus

原型里的 `onclick` 和全局函数应逐步收口为事件总线。

```ts
type PrototypeEvent =
  | { type: 'nav.switch'; page: string }
  | { type: 'team.open'; teamId: string }
  | { type: 'worker.open'; workerId: string }
  | { type: 'decision.open'; decisionId: string }
  | { type: 'chat.open'; targetAgentId?: string; hostContext?: HostContext }
  | { type: 'doc.publish'; docId: string }
```

事件总线用于连接：

```text
Legacy DOM 操作
→ 正式路由 / 抽屉 / API / 埋点 / 权限 / 测试
```

### 5.4 State Store

Legacy 层可以保留局部 UI 状态，但需要统一入口。

```ts
type PrototypeState = {
  activePage: string
  selectedTeamId?: string
  selectedWorkerId?: string
  selectedDecisionId?: string
  theme: 'light' | 'cyberpunk'
  drawerOpen: boolean
}
```

后续可以从普通对象演进到 Zustand / Pinia / Redux / Vue reactive 等状态管理方案。

---

## 6. Legacy Module 拆分策略

Legacy 模块不是正式组件，而是从单文件原型拆出的可挂载页面模块。

```ts
type LegacyModule<TOptions = unknown, TData = unknown> = {
  mount(el: HTMLElement, options: TOptions): void
  update(data: TData): void
  unmount(): void
}
```

推荐拆分：

| 模块 | 来源页面 | 替换优先级 | 说明 |
|---|---|---|---|
| `OverviewLegacyModule` | 总览 / 协作全景 | 高 | 视觉复杂，先复用，后重点替换 |
| `TeamLegacyModule` | 团队运行态 | 高 | 任务单闭环和岗位产出主视图 |
| `ProjectLegacyModule` | 项目页 / 文档库 | 高 | 后续需接文档版本与发布流程 |
| `DecisionLegacyModule` | 待决策 | 高 | 人在环门禁，需尽快模型化 |
| `WorkerLegacyModule` | 员工 | 中 | 运行体绑定前可保留较久 |
| `RoleSkillLegacyModule` | 岗位 / 技能 | 中 | 配置型页面，逐步替换即可 |
| `XiaoyunLegacyModule` | 小云入口 | 中高 | 后续由 agent-web-kit 接管 |
| `SettingsLegacyModule` | 设置 | 低 | 可长期低成本保留 |

---

## 7. 与正式业务模型的映射

| 原型概念 | 正式对象 | 说明 |
|---|---|---|
| 岗位 | `AgentTemplate` | AI 原生岗位模板 |
| 员工 | `Worker` | 数字员工实例 |
| 员工运行态 | `WorkerRuntimeBinding` / `runtimeStatus` | 后续绑定真实运行体 |
| 团队 | `Team` / `TeamMember` | Leader + 成员编队 |
| 项目 | `Project` | 团队承接的项目上下文 |
| 文档 | `Doc` / `DocVersion` | 草稿、发布、Agent 可读上下文 |
| 当前任务 | `TaskTicket` / `WorkOrder` | 任务单事实来源 |
| 待决策 | `DecisionItem` | 人在环确认节点 |
| 待审查 | `ReviewRecord` / `AcceptanceRecord` | 质量门禁 |
| 团队动态 | `Activity` / `TaskEvent` | 事件回写 |
| 小云对话 | `agent-web-kit Conversation` | 对话入口，不是业务事实源 |

正式工程中的业务事实来源应逐步从原型内存数据迁移到：

```text
contracts / domain / API / database / structured markdown
```

---

## 8. 与 agent-web-kit 的边界

agent-web-kit 不承担智能软件工厂的业务编排，只负责对话 Widget、消息状态、HTTP/SSE 和 Gateway 通信。

智能软件工厂负责：

```text
1. workerId / agentId / runtimeBinding 解析。
2. Team / Project / WorkOrder / Decision 等业务上下文。
3. 用户是否有权限打开某个 Agent 对话。
4. 对话结果如何转为任务事件、待决策或审查记录。
```

agent-web-kit 负责：

```text
1. 对话框 UI。
2. 消息发送、停止、历史、SSE 订阅。
3. pending interaction / question card 展示。
4. 与 agent-gateway / OpenCode Runtime 的通信。
```

建议新增适配层：

```text
packages/agent-web-adapter
```

职责：

```text
workerId → agentId
teamId / projectId / taskId → hostContext
DecisionItem → AgentInteraction
AgentInteraction result → DecisionItem resolution / TaskEvent
```

---

## 9. 阶段规划

### P0a：结构化无构建 ESM 迁移

```text
目标：把单 HTML 原型拆进稳定工程目录，并保持原效果。
范围：index.html、src/main.js、src/legacy/prototype-runtime.js、src/styles/prototype.css、pic/。
技术：原生 HTML / CSS / Browser ESM / Vanilla JS。
验证：Nginx 静态部署可访问，沙箱 Playwright 虚拟 origin 可截图验证。
不做：TypeScript、Vite、pnpm、npm 包、真实 API、数据库、OpenCode、agent-web-kit。
```

### P0b：Adapter 收口

```text
目标：抽出 dataProvider、apiAdapter、eventBus、prototypeStore。
范围：数据读取、写操作、页面跳转、抽屉、主题切换统一入口。
验收：Legacy 层不直接依赖全局 mock 数据和真实 API。
```

### P0c：Legacy 模块化

```text
目标：从单文件原型拆出页面级 Legacy Module。
范围：Overview、Team、Project、Decision、Worker、RoleSkill、Xiaoyun。
验收：每个模块支持 mount / update / unmount。
```

### P1：正式业务模型接管

```text
目标：contracts / domain / mock API 成为业务事实来源。
范围：AgentTemplate、Skill、Worker、Team、Project、TaskTicket、Decision、Activity。
验收：页面数据由 API / fixtures 生成，而不是原型内联对象。
```

### P2：高价值组件替换

```text
目标：逐步替换高频、高风险 UI。
范围：Avatar、StatusBadge、RoleBadge、TeamCard、WorkerCard、DecisionCard、Drawer、ActivityTimeline、DocEditorShell。
验收：替换后视觉回归通过，不降低原型表达效果。
```

### P3：真实运行体接入

```text
目标：接入 agent-web-kit、agent-gateway、OpenCode Runtime 和 WorkerRuntimeBinding。
范围：RuntimeHost、RuntimeNode、SkillSnapshot、AgentRoute、Heartbeat、运行状态回写。
验收：员工可与真实运行体建立会话，任务事件可回写系统。
```

---

## 10. 运行与验证方案

当前 P0a 推荐运行形态：

```text
apps/web：无构建静态前端，Nginx / 静态 HTTP Server 可直接托管
沙箱验证：Python Playwright 虚拟 origin，不依赖 localhost
后续增强：Vite / pnpm / TypeScript 作为工具链升级，不改变目录职责
```

关键约束：

```text
1. 前端共享包必须通过 alias 直接引用源码。
2. mock fixtures 修改应能触发页面重载或主动 refresh。
3. 后端 mock API 使用 watch restart，不要求 HMR。
4. 每个 Legacy 模块迁移后必须保留基线截图。
```

---

## 11. 回归与验收

每个阶段至少验证：

```text
1. 页面能打开，无阻塞 JS 错误。
2. 总览、团队、项目、待决策、岗位、员工、技能页面可切换。
3. 协作全景节点数量与 mock 数据一致。
4. 头像资源加载成功，状态点不重复。
5. 抽屉 / 弹层 / 小云入口基本交互可用。
6. 待决策可打开详情并执行 mock resolve。
7. Playwright 输出截图。
8. 关键页面与原型基线对比无明显退化。
```

---

## 12. 风险与控制

| 风险 | 影响 | 控制措施 |
|---|---|---|
| Legacy 文件继续膨胀 | 长期维护困难 | 新增业务不得写入 Legacy 大文件 |
| 全局 CSS 污染正式组件 | 样式互相影响 | 加 `.legacy-factory-root` 命名空间，逐步迁出通用样式 |
| Adapter 形同虚设 | 仍然是原型黑盒 | P0b 设置硬验收：所有数据与写操作必须走 Adapter |
| 视觉回归缺失 | 重写后细节退化 | 每个模块保留截图基线和对比图 |
| 过早接运行体 | 调试复杂度爆炸 | P0 阶段不接真实 OpenCode / agent-web-kit |
| Legacy 无退出计划 | 过渡方案变永久架构 | 每个模块维护替换优先级和退出条件 |

---

## 13. Legacy 退出机制

Legacy 模块满足以下条件后应进入替换计划：

```text
1. 该模块变更频率高。
2. 需要接真实权限、API、状态机或运行体。
3. 原型 DOM 操作导致测试困难。
4. 新增需求持续堆积在 Legacy 文件内。
5. 视觉基线已经稳定，可通过正式组件复刻。
```

替换顺序建议：

```text
DecisionCenter → TeamRuntime → Overview → ProjectDocs → Worker / Role / Skill → Settings
```

---

## 14. 结论

本方案采用“先生产化、后组件化；先替换数据源，后替换 UI；先收口边界，后优化代码”的迁移策略。

它的价值不是减少必要工程设计，而是避免正式工程从零重写高仿原型时丢失已经验证过的交互和视觉细节。

最终目标仍然是正式工程接管业务模型、状态、API、运行体和关键组件，Legacy 原型只作为过渡运行体逐步退出。
