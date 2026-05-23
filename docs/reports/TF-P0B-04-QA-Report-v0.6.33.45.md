# TF-P0B-04 QA 报告

> 基线版本：v0.6.33.45  
> 任务流：TF-P0B-04  
> 验证方式：Python Playwright 虚拟 origin，不依赖 localhost  
> 生成时间：2026-05-23T15:11:21+00:00

## 1. 验证命令

```bash
cd apps/web
npm run qa:sandbox
```

## 2. 验证结论

```text
QA 结论：PASS
```

## 3. 关键指标

| 指标 | 结果 |
|---|---:|
| teamCards | 5 |
| masters | 5 |
| workers | 17 |
| brokenImages | 0 |
| pageErrors | 0 |
| httpErrors | 0 |
| factoryApi.status | ready |
| prototypeStore.version | p0b.3 |
| appShell | p0b.6 |
| routerDataset | p0b.6 |
| topBannerMounted | p0b.4 |
| networkErrorBannerExists | True |

## 4. 页面切换验证

| 页面 | activeNav | activePage | 结果 |
|---|---|---|---|
| teams | teams | page-teams | PASS |
| pool | pool | page-pool | PASS |
| decisions | decisions | page-decisions | PASS |
| projects | projects | page-projects | PASS |
| roles | roles | page-roles | PASS |
| skills | skills | page-skills | PASS |
| settings | settings | page-settings | PASS |

## 5. 截图产物

```text
apps/web/qa/screenshots/01-overview.png
apps/web/qa/screenshots/02-teams.png
apps/web/qa/screenshots/03-workers.png
apps/web/qa/screenshots/04-decisions.png
apps/web/qa/screenshots/05-projects.png
apps/web/qa/screenshots/06-roles.png
apps/web/qa/screenshots/07-skills.png
apps/web/qa/screenshots/08-settings.png
apps/web/qa/screenshots/tf-p0b-04-n04-contact-sheet.png
```

## 6. 结论

TF-P0B-04 的 top banner 模板化试点通过沙箱回归。当前结果可作为下一轮 `apps/web` 本地同步基线。
