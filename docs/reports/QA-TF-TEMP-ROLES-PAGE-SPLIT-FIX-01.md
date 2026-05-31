# QA-TF-TEMP-ROLES-PAGE-SPLIT-FIX-01｜roles 页面独立拆分漏项补齐

## 结果

PASS

## 验证项

| 验证项 | 结果 | 说明 |
|---|---|---|
| `node --check apps/web/src/features/roles/page.js` | PASS | 语法检查通过。 |
| `node --check apps/web/src/features/roles/feature.js` | PASS | 语法检查通过。 |
| `node --check apps/web/src/main.js` | PASS | 语法检查通过。 |
| 真实点击“岗位”菜单 | PASS | `currentPage=roles`，`activeNav=roles`，`activePage=page-roles`。 |
| `featureMounted` | PASS | `featureMounted=roles`。 |
| 页面内容 | PASS | 岗位卡片数量为 3，文案保持 v0.6.33 收口口径。 |

## 已知说明

完整 `npm run qa` 在当前沙箱仍可能出现 Playwright pipe `EPIPE`；本轮采用更小的真实点击脚本验证 roles 链路，并保留截图证据。

## 证据

- `/mnt/data/ui-temp-roles-accepted.png`
- `/mnt/data/ui-temp-roles-before-after-final.png`
- `/mnt/data/roles-after-result.json`
