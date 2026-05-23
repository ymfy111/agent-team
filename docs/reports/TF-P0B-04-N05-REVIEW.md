# TF-P0B-04-N05 试点评审与下一步建议

## 结论

PASS。第二个低风险 DOM 模板化试点可保留。

## 试点结果

本轮将 `top-banners-container / networkErrorBanner` 作为第二个低风险模板化试点：

- 新增 `src/templates/top-banner-template.js`
- `index.html` 中保留空容器，由模板模块挂载 DOM
- 保留 `networkErrorBanner` 的 `id / class / text`，避免破坏旧逻辑
- QA 与截图回归通过

## 是否适合继续推广

建议继续推广，但仍然限定在低风险静态/半静态区域，不直接拆复杂业务页面。

推荐下一轮候选：

1. 继续拆分非业务主流程的静态浮层/提示区域；
2. 暂缓拆总览/项目/团队等强业务页面 DOM；
3. 暂缓拆 `prototype-runtime.js` 中复杂渲染函数；
4. 每轮只拆一个候选区域，并保留截图回归。

## 风险判断

- 低风险：静态提示条、loading、空状态、辅助说明区；
- 中风险：抽屉外壳、弹窗外壳、非核心卡片；
- 高风险：协作全景、团队/员工卡片、项目详情、待决策操作区。

## 下一步建议

启动 `TF-P0B-05：第三个低风险 DOM 模板化试点`，或先同步当前 `apps/web` 到本地验证。
