# apps 目录说明

本目录承载智能软件工厂当前阶段的可运行应用与本地 POC 服务。这里的 `apps` 不是单一前端工程，而是多个可独立运行、边界不同的应用/模块集合。

## 目录总览

```text
apps/
├── web/                 # 智能软件工厂网站前端
└── runtime-gateway/     # RuntimeGateway 服务器侧 POC / mock 服务
```

## apps/web

**定位**：智能软件工厂网站前端。

这里放的是用户在浏览器中访问的网站页面，包括总览、团队、项目、岗位、技能、设置，以及运行网关等前端页面。

当前前端采用无构建 ESM 结构，`index.html` 是入口，页面逐步从旧 HTML 原型迁移为独立 feature page。

关键说明：

```text
apps/web/src/features/runtime-gateway/
```

这里的 `runtime-gateway` 是**网站里的“运行网关”前端页面**，和 `apps/runtime-gateway` 不是一回事。

已独立拆分/新增的 feature page 示例：

```text
apps/web/src/features/settings/
apps/web/src/features/roles/
apps/web/src/features/runtime-gateway/
apps/web/src/features/project-execution/
```

运行方式：

```bash
cd apps/web
npm run dev
```

验证方式：

```bash
cd apps/web
npm run qa
```

## apps/runtime-gateway

**定位**：RuntimeGateway 服务器侧 POC / mock 服务。

这里模拟的是部署在某台服务器上的 RuntimeGateway 程序，用于验证平台后台与网关之间的 API 契约和运行状态流。

它不是网站前端页面，也不是左侧菜单里的“运行网关”页面。

它的职责是模拟服务器侧运行网关能力，例如：

```text
register / heartbeat / capabilities
assignment / workspace
execution session / orchestrator session
runtime node / diagnostics
```

当前边界：

```text
- 只做 Gateway API mock 状态流。
- 不真实启动 ORCH。
- 不真实启动 OpenCode。
- 不承担 ORCH 的任务调度逻辑。
```

运行方式：

```bash
cd apps/runtime-gateway
npm start
```

验证方式：

```bash
cd apps/runtime-gateway
npm run smoke
```

## 重要概念区分

### 网站里的“运行网关页面”

路径：

```text
apps/web/src/features/runtime-gateway/
```

用途：

```text
给用户查看已注册网关、网关状态、Team 筛选、沙箱 / OC 卡片等前端监控信息。
```

### 服务器侧 RuntimeGateway POC 服务

路径：

```text
apps/runtime-gateway/
```

用途：

```text
模拟真实服务器上的网关程序，为后续平台后台调用、Gateway mock、ORCH / OpenCode 联调提供服务端边界。
```

## 推荐理解

```text
apps/web
  用户看到的网站。

apps/runtime-gateway
  网站背后未来可能调用的一类服务器侧运行网关服务，目前是 POC/mock。
```

## 后续维护原则

1. 前端页面优先放在 `apps/web/src/features/<feature-name>/`。
2. 服务器侧服务或 POC 才放在 `apps/<service-name>/`。
3. 不要把前端页面放到 `apps/runtime-gateway/`。
4. 不要把 Gateway mock 服务代码放到 `apps/web/`。
5. 页面展示和服务能力可以同名，但目录边界必须清楚。
