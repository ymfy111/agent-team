# TF-P0B-04 前端工程迁移总结

> 基线版本：v0.6.33.45  
> 任务流：TF-P0B-04 第二个低风险 DOM 模板化试点  
> 状态：已完成，作为当前 apps/web 同步基线  
> 生成时间：2026-05-23T15:11:21+00:00

## 1. 本轮目标

本轮在前端结构化迁移基础上，继续验证 `index.html` 静态 DOM 的低风险模板化方式，目标是：

```text
1. 不引入 TypeScript / Vite / pnpm / npm 第三方包。
2. 不重写复杂业务页和 legacy runtime。
3. 保持 index.html 仍为静态入口。
4. 只选择低风险静态 DOM 区域做模板化试点。
5. 保持沙箱 Playwright 虚拟 origin 可截图验证。
```

## 2. 当前 apps/web 已包含的主要迁移成果

```text
P0a：单 HTML 原型拆成无构建 ESM 前端工程。
P0a.1：storage / asset path / sandbox QA 收口。
P0b.1：mock-state / dataProvider 抽离。
P0b.2：factoryApi / mockFactoryApi / httpFactoryApi 抽象。
P0b.3：prototypeStore 收口。
P0b.4：AppShell / Router / MenuConfig 收口。
P0b.5：EventBus / ActionDispatcher 收口。
P0b.6：Legacy Page Module 初步拆分。
TF-P0B-04：top banner 低风险 DOM 模板化试点。
```

## 3. TF-P0B-04 代码变化

新增 / 接入：

```text
apps/web/src/templates/top-banner-template.js
apps/web/src/main.js               # 接入 mountTopBannerTemplate()
apps/web/index.html                # top-banners-container 改为空容器
apps/web/tools/sandbox_verify.py   # 更新 QA 判断，匹配当前真实源码状态
```

保留：

```text
networkErrorBanner 的 id/class/text 语义不变；
pic/ 继续与 index.html 同级；
index.html 仍是入口；
prototype-runtime.js 仍承载 legacy 渲染逻辑。
```

## 4. 当前运行与验证方式

```bash
cd apps/web
npm run dev        # 本地静态服务
npm run qa:sandbox # 沙箱 Playwright 虚拟 origin 验证
```

QA 摘要：

```text
ok: True
teamCards: 5
masters: 5
workers: 17
brokenImages: 0
pageErrors: 0
httpErrors: 0
appShell: p0b.6
routerDataset: p0b.6
topBannerMounted: p0b.4
networkErrorBannerExists: True
```

## 5. 注意事项

```text
1. 当前仍是无构建 ESM 前端，不要误认为已经进入 Vite/TS 工程。
2. index.html 已被局部瘦身，但仍保留大量 legacy DOM。
3. prototype-runtime.js 仍是最大 legacy 运行时文件，不建议一次性重写。
4. 后续模板化只适合低风险静态/半静态区域；总览、项目、团队、员工等复杂业务页应单独任务流推进。
5. 当前 apps 包是 TF-P0B-04 同步基线；后续若继续瘦身，应从本包继续。
```
