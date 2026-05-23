# apps/web 前端工程说明

当前版本：v0.6.33.45 / TF-P0B-04。

## 当前目标

本目录是从高仿 HTML 原型迁移而来的无构建 ESM 前端工程。当前阶段优先保证：

- 沙箱可编码、可运行、可截图验证；
- 下载后可直接用静态 HTTP / Nginx 托管；
- 暂不引入 TypeScript / Vite / pnpm / npm 第三方包；
- 保持 `pic/` 与 `index.html` 同级，避免结构迁移阶段改动资源路径语义。

## 目录结构

```text
apps/web/
  index.html                 # 静态入口，仍承载 legacy DOM 外壳
  pic/                       # 原型图片资源，P0 阶段保持与 index.html 同级
  src/
    main.js                  # ESM 启动入口，挂载环境、Factory API、AppShell
    bootstrap/
      environment.js         # 当前运行环境描述
    styles/
      prototype.css          # 从原型拆出的 CSS
    legacy/
      prototype-runtime.js   # 原型运行时，仍负责页面渲染
    data/
      mock-state.js          # P0b.1：mock 数据入口
    adapters/
      storage-adapter.js     # P0a.1：localStorage/sessionStorage fallback
      asset-path-adapter.js  # P0a.1：资源路径适配，当前 base 为 pic/
      global-adapters.js     # 兼容 legacy runtime 的全局适配器
      data-provider.js       # P0b.1：ESM data provider facade
      prototype-store.js     # P0b.3：legacy state 统一入口
    services/
      factory-api.js         # P0b.2：前端后台接口门面
      mock-factory-api.js    # P0b.2：mock 实现
      http-factory-api.js    # P0b.2：真实 HTTP 实现预留
      api-client.js          # P0b.2：fetch 封装预留
    app/
      menu-config.js         # P0b.4：菜单配置
      page-registry.js       # P0b.4：pageId 与 legacy DOM 映射
      router.js              # P0b.4/P0b.6：兼容接管 switchNav
      app-shell.js           # P0b.4/P0b.6：网站壳初始化
      event-bus.js           # P0b.5：节点动作事件总线
      action-dispatcher.js   # P0b.5：动作分发入口
    pages/
      legacy-page-module.js  # P0b.6：legacy page module 基础抽象
      legacy-page-modules.js # P0b.6：页面模块集合
    templates/
      top-banner-template.js # TF-P0B-04：top banner 低风险 DOM 模板化试点
  tools/
    dev-server.mjs           # 本机零依赖静态服务
    sandbox_verify.py        # 沙箱 Playwright 虚拟 origin 验证
  qa/                        # QA 截图与验证结果
```

## 当前加载链路

```text
index.html
  -> global-adapters.js
  -> mock-state.js
  -> prototype-store.js
  -> prototype-runtime.js
  -> main.js
       -> factoryApi
       -> appShell/router
```

## 数据与状态

当前页面渲染仍由 legacy runtime 负责，但数据和状态入口已经开始收口：

```text
mock-state.js -> dataProvider -> prototypeStore -> currentState -> legacy render functions
```

新模块访问后端能力时走：

```text
factoryApi -> mockFactoryApi -> dataProvider
```

未来切换真实后端时，页面应继续调用 `factoryApi`，由 `httpFactoryApi` 替换 mock 实现。

## 网站框架与页面切换

P0b.4 已引入 `src/app/`：

- `menu-config.js`：菜单配置；
- `page-registry.js`：页面注册表；
- `router.js`：兼容接管 `window.switchNav()`；
- `app-shell.js`：初始化 AppShell，并暴露 `window.__AGENT_TEAM_APP_SHELL__` 与 `window.__AGENT_TEAM_ROUTER__`。

当前没有重写业务页，仍然复用 legacy DOM 和 legacy render functions。

## 本机运行

```bash
cd apps/web
npm run dev
```

然后访问静态服务提示的地址。

## 沙箱验证

```bash
cd apps/web
npm run qa:sandbox
```

该命令不依赖 localhost，而是使用 Python Playwright + 虚拟 origin 加载多文件前端。


## TF-P0B-04 当前同步说明

当前 `apps/web` 包对应 `TF-P0B-04-N05`，重点变化：

```text
1. 新增 src/templates/top-banner-template.js。
2. index.html 中 top-banners-container 改为空容器。
3. main.js 挂载 top banner template，并保留 networkErrorBanner 的 id/class/text 语义。
4. sandbox_verify.py 已按当前真实源码状态更新验证指标。
```

当前仍然保持：

```text
- index.html 是入口；
- prototype-runtime.js 仍负责 legacy 渲染；
- 不引入 TS / Vite / pnpm；
- pic/ 与 index.html 同级；
- 后续复杂页面模板化必须另开任务流。
```
