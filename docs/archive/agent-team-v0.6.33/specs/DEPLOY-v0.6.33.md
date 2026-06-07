# DEPLOY：前端开发与部署运行手册

> 文档类型：GUIDE / 开发部署运行手册  
> 适用范围：智能软件工厂前端新 App、P0a 原型工程化运行壳、后续 Legacy Runtime / Adapter 收口阶段  
> 当前基线：v0.6.33.45 原型与 P0a 结构化无构建 ESM 前端工程  
> 目标：保证我在沙箱里能编码、运行、截图验证；你下载后能在本机继续运行、预览和部署。

---

## 1. 总体原则

前端新 App 需要同时支持两种运行链路：

```text
A. 沙箱链路：不依赖 localhost，不依赖 pnpm/Vite，不依赖联网安装 npm 包。
B. 本机链路：你下载后可以用本地 HTTP Server / Vite / pnpm 逐步升级为标准开发体验。
```

因此，当前阶段前端代码应遵守：

```text
1. 保持多文件前端结构，不强制压成单 HTML。
2. 所有页面资源使用相对工程根的路径，例如 /src/main.js、/src/styles/app.css、/assets/pic/avatar.svg。
3. 沙箱验证使用 Playwright 虚拟资源路由，不通过 localhost。
4. 本机运行可以使用普通静态 HTTP Server 或后续升级为 Vite。
5. 后端、数据库、agent-web-kit、OpenCode Runtime 暂不作为 P0a 前端运行前置条件。
```

---

## 1A. 当前 P0a 技术栈

| 类别 | 当前选择 | 说明 |
|---|---|---|
| 前端语言 | JavaScript | 暂不引入 TypeScript。 |
| 模块系统 | Browser Native ES Module | 使用相对路径 import。 |
| 样式 | 原生 CSS | 不依赖 Tailwind / Sass / Less。 |
| 构建工具 | 无构建 | 当前不需要 Vite / Webpack / Rollup。 |
| 包管理 | 无强依赖 | 当前不要求 pnpm install。 |
| 沙箱验证 | Python Playwright 虚拟 origin | 不走 localhost。 |
| 本机部署 | 静态 HTTP Server / Nginx | 可直接托管 apps/web。 |

后续 Vite / pnpm / TypeScript 只作为工具链增强，不改变 `apps/web/src` 的模块职责。

---

## 2. 推荐目录结构

当前 P0a 前端新 App 推荐先采用以下结构：

```text
agent-team-frontend/
  apps/
    web/
      index.html
      src/
        main.js
        components/
          shell.js
        pages/
          overview.js
          workorders.js
        data/
          mock.js
        styles/
          app.css
      pic/
        avatar-1.svg
        avatar-2.svg
  tools/
    run_sandbox_qa.py
    run-sandbox-qa.mjs          # 可选：Node wrapper
    dev-server.mjs              # 可选：本机零依赖静态服务
  qa/
    screenshots/
    sandbox-qa-result.json
  package.json
```

说明：

```text
apps/web/              前端页面根目录。
apps/web/index.html   浏览器入口。
apps/web/src/         多文件 JS/CSS 源码。
apps/web/assets/      图片、头像、SVG 等静态资源。
tools/                运行、验证、构建工具。
qa/                   自动截图和检查结果。
```

---

## 3. 沙箱运行方式

### 3.1 为什么沙箱不用 localhost

当前沙箱中可以启动本地服务，但 Chromium / Playwright 访问 `localhost` 或 `127.0.0.1` 可能被策略拦截，常见错误是：

```text
net::ERR_BLOCKED_BY_ADMINISTRATOR
```

因此，沙箱验证不走：

```text
node dev-server.mjs
→ page.goto('http://127.0.0.1:5173')
```

而走：

```text
读取 apps/web/index.html
→ page.set_content(html)
→ 注入 <base href="https://agent-team.local/">
→ page.route('https://agent-team.local/**') 从本地文件系统返回 JS/CSS/图片
→ 执行页面 JS
→ DOM 检查 + 截图验证
```

这种方式可以支持：

```text
- 独立 CSS 文件
- 独立 JS 文件
- ES module import
- 图片 / SVG 资源加载
- 页面切换
- DOM 检查
- Playwright 截图
```

---

### 3.2 沙箱验证命令

推荐使用 Python Playwright：

```bash
python tools/run_sandbox_qa.py
```

如果项目里提供了 Node wrapper，也可以使用：

```bash
npm run qa:sandbox
```

但需要注意：当前沙箱里 Node 版 Playwright npm 包不一定存在，因此**可靠默认方案是 Python Playwright**。

---

### 3.3 沙箱验证脚本的核心逻辑

`tools/run_sandbox_qa.py` 的关键逻辑：

```python
VIRTUAL_ORIGIN = 'https://agent-team.local/'
WEB_ROOT = ROOT / 'apps' / 'web'

# 1. 给 index.html 注入 base，让 /src/main.js 等路径有虚拟 origin
html = index_html.replace('<head>', '<head>\n  <base href="https://agent-team.local/">')

# 2. 拦截虚拟域名下的所有资源请求
await page.route('https://agent-team.local/**', handle_route)

# 3. 不 page.goto，不访问 localhost，直接注入页面
await page.set_content(html, wait_until='domcontentloaded')
```

资源路由规则：

```text
https://agent-team.local/src/main.js        → apps/web/src/main.js
https://agent-team.local/src/styles/app.css → apps/web/src/styles/app.css
https://agent-team.local/assets/pic/a.svg   → apps/web/assets/pic/a.svg
```

---

### 3.4 沙箱 QA 输出

运行后输出：

```text
qa/screenshots/01-overview.png
qa/screenshots/02-workorders.png
qa/sandbox-qa-result.json
```

建议每个页面至少检查：

```text
1. 页面 ready 标记是否完成。
2. 关键 DOM 数量是否正确。
3. 图片是否 complete 且 naturalWidth > 0。
4. 是否出现 undefined / null / NaN。
5. 是否有重复状态文案，例如“忙碌忙碌”。
6. 是否存在横向溢出。
7. 截图是否符合预期。
```

示例结果：

```json
{
  "ok": true,
  "overviewMetrics": {
    "ready": true,
    "page": "overview",
    "teamCards": 5
  },
  "workOrderMetrics": {
    "page": "workorders",
    "rows": 4
  },
  "mode": "python-playwright-route-virtual-origin"
}
```

---

## 4. 本机运行方式

你下载 ZIP 后，可以按三种方式运行。

---

### 4.1 方式 A：Python 静态服务，最简单

进入项目根目录：

```bash
cd sandbox-frontend-arch-test
python -m http.server 5173 -d apps/web
```

然后浏览器打开：

```text
http://127.0.0.1:5173
```

适用场景：

```text
- 只想快速打开看效果
- 不想安装 npm 依赖
- 当前页面是原生 ES module + 静态资源
```

---

### 4.2 方式 B：Node 零依赖静态服务

如果项目提供 `tools/dev-server.mjs`，可以运行：

```bash
node tools/dev-server.mjs
```

然后打开：

```text
http://127.0.0.1:5173
```

建议 `tools/dev-server.mjs` 固定以 `apps/web` 为 Web 根目录，保证路径一致：

```text
/src/main.js        → apps/web/src/main.js
/assets/pic/a.svg   → apps/web/assets/pic/a.svg
```

---

### 4.3 方式 C：后续升级为 Vite / pnpm

当项目进入正式前端工程阶段，可以升级为：

```bash
pnpm install
pnpm dev
```

推荐目标命令：

```bash
pnpm --filter @agent-team/web dev
pnpm --filter @agent-team/web build
pnpm --filter @agent-team/web preview
```

但在 P0a 阶段，不要求我这边沙箱能跑 Vite。沙箱验证仍然以 `tools/run_sandbox_qa.py` 为准。

---

## 5. 本机 QA 验证

你本机如果安装了 Python Playwright，也可以运行同一套沙箱验证脚本：

```bash
python tools/run_sandbox_qa.py
```

如果缺少 Playwright：

```bash
pip install playwright
python -m playwright install chromium
python tools/run_sandbox_qa.py
```

这个验证方式和沙箱一致，优点是：

```text
1. 不依赖 dev server。
2. 不受端口占用影响。
3. 能稳定检查多文件模块、CSS 和图片资源。
4. 适合作为 CI / 自动化回归的基础。
```

---

## 6. 部署方式

### 6.1 当前 P0a 静态部署

当前阶段前端是静态页面，可以直接部署 `apps/web`：

```text
部署根目录 = apps/web
入口文件 = apps/web/index.html
```

部署到 Nginx、静态文件服务器、对象存储、GitHub Pages、内网 Web Server 都可以。

需要保证：

```text
/src/**      能被访问
/assets/**   能被访问
index.html   是默认入口
```

---

### 6.2 后续 Vite 构建部署

未来升级 Vite 后，部署目录改为：

```text
apps/web/dist
```

目标命令：

```bash
pnpm --filter @agent-team/web build
```

部署时只发布：

```text
apps/web/dist/
```

---

## 7. 编码规范与注意事项

### 7.1 不要直接使用 localStorage

由于沙箱 `page.set_content()` 场景下页面 origin 可能是 `about:blank`，直接访问 `localStorage` 可能触发：

```text
SecurityError
```

必须统一走安全封装：

```js
export const safeStorage = {
  get(key) {
    try { return window.localStorage.getItem(key) } catch { return memoryStore.get(key) ?? null }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value) } catch { memoryStore.set(key, value) }
  }
}
```

原则：

```text
页面代码不直接读写 localStorage。
所有持久化统一走 storageAdapter / safeStorage。
```

---

### 7.2 不要依赖公网 CDN

沙箱和内网部署都不应依赖：

```html
<script src="https://cdn.xxx.com/vue.js"></script>
<link rel="stylesheet" href="https://cdn.xxx.com/xxx.css">
```

当前阶段应使用本地文件：

```text
apps/web/src/**
apps/web/assets/**
```

---

### 7.3 路径规则

推荐在 `index.html` 中使用绝对路径：

```html
<link rel="stylesheet" href="/src/styles/app.css" />
<script type="module" src="/src/main.js"></script>
```

图片使用：

```html
<img src="/assets/pic/avatar-1.svg" />
```

原因：

```text
1. 本机静态服务以 apps/web 为根目录时可直接访问。
2. 沙箱虚拟路由能稳定映射到 apps/web。
3. 未来 Vite 也容易迁移。
```

---

### 7.4 页面 ready 标记

每个前端入口渲染完成后，应设置：

```js
window.__AGENT_TEAM_APP_READY__ = true
```

沙箱 QA 通过这个标记等待页面稳定：

```python
await page.wait_for_function('window.__AGENT_TEAM_APP_READY__ === true')
```

如果有页面切换测试，可以暴露测试专用导航函数：

```js
window.__AGENT_TEAM_NAVIGATE__ = (page) => {
  currentPage = page
  render()
}
```

注意：这些 `__AGENT_TEAM_*` 函数仅用于 P0a 测试和 QA，不应作为正式业务 API。

---

## 8. 推荐开发流程

### 8.1 我在沙箱中的开发流程

```text
1. 修改 apps/web/src/** 代码。
2. 运行 python tools/run_sandbox_qa.py。
3. 查看 qa/sandbox-qa-result.json。
4. 打开截图自查视觉效果。
5. 修复问题。
6. 打包 ZIP 给你下载。
```

验收标准：

```text
- 自动检查 ok=true。
- 关键截图无明显错位、破图、溢出。
- 本轮冻结项没有回退。
```

---

### 8.2 你下载后的本机流程

```text
1. 解压 ZIP。
2. 进入项目目录。
3. 用 Python 或 Node 静态服务启动 apps/web。
4. 浏览器访问 127.0.0.1:5173。
5. 需要自动验证时运行 python tools/run_sandbox_qa.py。
6. 如需继续正式工程化，再升级 pnpm/Vite。
```

示例：

```bash
unzip sandbox-frontend-arch-test.zip
cd sandbox-frontend-arch-test
python -m http.server 5173 -d apps/web
```

浏览器：

```text
http://127.0.0.1:5173
```

---

## 9. P0a 到正式工程的演进路线

当前 P0a 不追求一次性完成 Vite/Fastify/数据库/agent-web-kit，而是先保证：

```text
1. 前端多文件结构成立。
2. 沙箱可运行和截图验证。
3. 本机可静态预览。
4. 后续可以渐进升级为标准前端工程。
```

推荐演进：

```text
P0a-1：多文件静态 App + 沙箱 Playwright 虚拟路由验证
P0a-2：Legacy 原型页面接入 apps/web
P0b：Data Provider / Event Bus / API Adapter 收口
P0c：Legacy Module 拆分
P1：Vite / pnpm / TypeScript / UI 组件化升级
P2：agent-web-kit 接入
P3：OpenCode Runtime / 后端 / 数据库接入
```

---

## 10. 常见问题

### Q1：为什么沙箱不直接访问 localhost？

因为当前沙箱的 Chromium 访问本地地址可能被策略拦截。服务能启动，不代表浏览器能访问端口。

### Q2：为什么不用 file:// 打开？

`file://` 在沙箱和浏览器安全策略下也容易受限，且 ES module、跨文件资源、localStorage 行为不稳定。

### Q3：为什么使用 https://agent-team.local/？

这是 Playwright 虚拟 origin，不是真实网络请求。所有请求都被 `page.route()` 拦截并映射到本地文件。

### Q4：这算不算真正运行了前端 App？

算。JS、CSS、图片、ES module import 都在 Chromium 中执行和加载，只是不通过真实 HTTP Server。

### Q5：以后能换成 Vite 热更新吗？

可以。当前结构已经为 Vite 准备好了 `apps/web/index.html` 和 `src/main.js` 这种入口形态。后续只需要补充 Vite 配置和 package scripts。

---

## 11. 当前推荐结论

当前阶段最合适的策略是：

```text
沙箱：Playwright 虚拟资源路由 + 截图验证。
本机：静态 HTTP Server 预览，后续升级 Vite。
部署：P0a 直接部署 apps/web，后续 Vite 构建后部署 dist。
```

一句话：

> 前端新 App 可以保持多文件工程结构；我在沙箱里用 Playwright 虚拟 origin 运行和截图验证，你下载后用普通本地 HTTP Server 或后续 Vite 运行。
