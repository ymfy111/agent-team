# TF-FACTORY-UI-ARCH｜前端业务模块化架构调整

## 当前状态

本工作项用于把从静态原型迁移来的前端页面，渐进拆分为独立 `feature.js + page.js` 页面模块。原则是：先结构解耦，再统一业务功能；一次只拆一个页面，拆分前后做截图与点击验证。

## 已完成

| 任务 | 状态 | 说明 |
|---|---|---|
| ARCH-01｜前端模块化骨架第一轮调整 | done | 建立 `src/features/`、菜单和页面注册从 feature registry 派生。 |
| ARCH-02｜settings 页面拆分试点 | done | `settings` 拆为独立 feature page。 |
| ARCH-03｜旧页面渐进拆分机制与回退规则 | done | 沉淀页面拆分准入、验证和回退规则。 |
| ARCH-04｜roles 页面拆分试点 | done | 前期记录与代码状态不一致，已通过 `TF-TEMP-ROLES-PAGE-SPLIT-FIX-01` 补齐为独立 feature page。 |
| ARCH-05｜运行网关 feature 页面骨架 | done | 新增 `runtime-gateway` 独立页面入口。 |
| ARCH-06｜运行网关页面 v5 监控版实现 | done | 左侧网关列表、右侧关键指标卡与沙箱 / OC 卡片。 |
| ARCH-07｜skills 页面独立拆分 | done | `skills` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过。 |
| ARCH-08｜decisions 页面独立拆分 | done | `decisions` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过，为后续 DecisionPacket 落地做结构准备。 |

## 当前独立 feature page

- `settings`
- `runtime-gateway`
- `roles`
- `skills`
- `decisions`
- `pool`
- `teams`
- `projects`
- `overview`

> 注：以当前代码事实为准，判断标准是对应目录存在 `page.js` 且 `feature.js` 中 `legacy: false`。

## 后续建议

| 任务 | 状态 | 说明 |
|---|---|---|
| ARCH-09｜pool 页面独立拆分 | done | `pool` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过。 |
| ARCH-10｜teams 页面独立拆分 | done | `teams` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过。 |
| ARCH-11｜projects 页面独立拆分 | done | `projects` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过。 |
| ARCH-12｜overview 总览页独立拆分 | done | `overview` 从 legacy DOM 迁出为 `feature.js + page.js`，真实点击验证通过。 |
| ARCH-13｜前端模块化阶段评审与收口 | done | 9 个主导航页面均已独立为 `feature.js + page.js`，阶段收口完成。 |

## 临时修正记录

| 任务 | 状态 | 说明 |
|---|---|---|
| TF-TEMP-ROLES-PAGE-SPLIT-FIX-01｜roles 页面独立拆分漏项补齐 | done | 补齐 `roles/page.js`，`roles/feature.js` 改为 `legacy=false`，真实点击验证通过。 |

## 执行原则

- 页面拆分是正式工作项任务，不归入临时任务。
- 排查、补 README、重打包、纠偏和文档同步可用 `TF-TEMP-*` 临时任务。
- 已落文件的任务清单允许按执行反馈调整，但需要留痕。
- 每次拆分必须保留旧页面导航 key 和回退路径。
- 拆分前后必须做截图、DOM/点击验证；验证失败先修复或回退，不扩大范围。


## 阶段收口结论

- `TF-FACTORY-UI-ARCH-13` 已完成。
- 当前主导航页面均已独立为 `feature.js + page.js`，且 page registry 中 `legacy=false`。
- 仍保留 `apps/web/src/legacy/prototype-runtime.js` 作为旧原型运行时兼容层，后续另立工作项逐步清理。
- 下一阶段建议进入运行态业务逻辑统一：Team 运行资源、数字员工运行绑定、Project 执行态、DecisionPacket 待决策、Overview 聚合。
