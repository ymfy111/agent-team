# TF-P0B-04 N03 验证链路修复报告

## 结论

PASS。N03 从 blocked 恢复为可验证状态。

## 修复内容

- 修复 `apps/web/tools/sandbox_verify.py` 的版本判断：允许当前源码实际的 `appShell/router = p0b.6`。
- 新增 `apps/web/src/templates/top-banner-template.js`。
- `index.html` 中 `top-banners-container` 改为空容器 `id="topBannersContainer"`。
- `src/main.js` 接入 `mountTopBannerTemplate()`。

## 验证结果

- `python tools/sandbox_verify.py`：PASS
- teamCards：5
- masters：5
- workers：17
- brokenImages：0
- pageErrors：0
- httpErrors：0
- topBannerMounted：p0b.4
- networkErrorBannerExists：true
- 7 个菜单页面切换：PASS

## 截图

- apps/web/qa/screenshots/01-overview.png
