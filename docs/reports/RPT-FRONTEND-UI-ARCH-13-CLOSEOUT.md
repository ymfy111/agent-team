# RPT-FRONTEND-UI-ARCH-13-CLOSEOUT｜前端模块化阶段评审与收口报告

## 1. 评审结论

前端业务模块化架构调整阶段可以收口。当前主导航页面已经全部具备独立 `feature.js + page.js` 结构，并在 feature registry 中标记为 `legacy=false`。

## 2. 已独立页面

- `overview`
- `teams`
- `projects`
- `decisions`
- `runtime-gateway`
- `roles`
- `pool`
- `skills`
- `settings`

## 3. 阶段价值

本阶段完成了从旧原型式大页面向独立 feature page 的结构解耦。后续可以在单个页面内进行业务逻辑改造，降低页面之间互相影响的风险。

## 4. legacy 剩余职责

`apps/web/src/legacy/prototype-runtime.js` 仍保留以下职责：

- 旧原型运行时兼容逻辑。
- 部分全局状态和旧数据初始化。
- 旧 `switchNav` 兼容路径。
- 部分历史演示 / mock 行为。

建议下一阶段不要马上清理 legacy，而是在 Team / Pool / Projects / Decisions 业务逻辑统一后，再进行 legacy runtime 清理工作项。

## 5. 下一阶段建议

建议进入“运行态业务逻辑统一”阶段，优先顺序：

1. Team 页面：绑定 Gateway、成员初始化、沙箱 / OC 状态。
2. Pool / 数字员工页面：员工运行绑定、换沙箱、同步 Skill/MCP/Rules/Memory。
3. Projects 页面：项目执行状态、WorkItem / Task、ORCH 调度摘要。
4. Decisions 页面：DecisionPacket 待决策处理与恢复执行。
5. Overview 页面：聚合运行网关、团队、任务、待决策和异常状态。

## 6. 风险与建议

- QA runner 仍存在 Playwright pipe `EPIPE` 偶发风险，建议后续单独稳定验证脚本。
- 页面已拆分不等于业务模型完成；运行网关、Team、员工、项目、待决策的业务边界仍需逐页落地。
- 后续每次业务逻辑改造仍需真实点击验证、截图证据和独立评审。
