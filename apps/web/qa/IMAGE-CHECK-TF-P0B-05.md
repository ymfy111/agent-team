# IMAGE-CHECK-TF-P0B-05

## 结论

PASS。迁移后的 `apps/web` 图片资源验证通过：静态 `pic/` 图片文件可读，关键页面渲染无破图，虚拟 origin 下无图片 404 / 500。

## 验证范围

- `pic/avatars/*.png` 与 `pic/xiaoyun/*.png` 静态资源文件完整性；
- `index.html` + `src/legacy/prototype-runtime.js` 运行后关键页面 DOM 图片；
- 8 个主导航页面：overview / teams / pool / decisions / projects / roles / skills / settings；
- Playwright 虚拟 origin 路由加载；
- lazy-loading 图片误判修正后的 broken image 统计。

## 关键结果

| 指标 | 结果 |
|---|---:|
| pic 静态图片文件数 | 37 |
| 静态图片文件可读性 | PASS |
| QA `brokenImages` | 0 |
| `pageErrors` | 0 |
| `httpErrors` | 0 |
| 主导航页面切换 | PASS |
| 每页 DOM 图片数 | 48 |
| 头像 data:image 元素 | 0 |

## Playwright 页面检查摘要

- overview: imgCount=48, broken=0
- teams: imgCount=48, broken=0
- pool: imgCount=48, broken=0
- decisions: imgCount=48, broken=0
- projects: imgCount=48, broken=0
- roles: imgCount=48, broken=0
- skills: imgCount=48, broken=0
- settings: imgCount=48, broken=0

## 图片请求摘要

- 已捕获图片请求数：29
- `pic/` 静态文件数：37

说明：部分 `pic/avatars` 文件是兜底或后续角色预留资源，未必在当前页面 DOM 中实际请求，但已通过静态文件可读性校验。

## 证据文件

- `qa/sandbox-verify-result.json`
- `qa/image-full-check-result.json`
- `qa/screenshots/01-overview.png`
