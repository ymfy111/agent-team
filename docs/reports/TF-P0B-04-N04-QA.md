# TF-P0B-04-N04 界面截图回归报告

## 结论

PASS。

## 验证范围

- top banner 模板化后的总览页截图回归
- 关键页面截图抽查
- 7 个菜单页面切换
- brokenImages / pageErrors / httpErrors

## 结果摘要

- `python tools/sandbox_verify.py`：PASS
- `teamCards`：5
- `masters`：5
- `workers`：17
- `brokenImages`：0
- `pageErrors`：0
- `httpErrors`：0
- `networkErrorBannerExists`：true
- `topBannerMounted`：p0b.4

## 证据

- `apps/web/qa/screenshots/01-overview.png`
- `apps/web/qa/screenshots/tf-p0b-04-n04-contact-sheet.png`
