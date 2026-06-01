# QA-TF-FACTORY-UI-RUNTIME-01B｜总览页工作项详情抽屉增强验证报告

> Task: `TF-FACTORY-UI-RUNTIME-01B`  
> WorkItem: `TF-FACTORY-UI-RUNTIME`  
> Status: PASS  
> VerifiedAt: 2026-06-01 16:43:26 +0800

## 1. 验证范围

- 修改文件：`apps/web/src/features/overview/page.js`
- 新增测试：`apps/web/tests/overview-01b.test.mjs`
- 目标：总览页能查看 WorkItem 详情抽屉式上下文，包含 TaskBatch、Task / Step、执行验收和停止策略。
- 范围外：不接真实 ORCH API，不实现跨页面工作项编辑器，不执行 01C-01E。

## 2. RED / GREEN 记录

| 阶段 | 命令 / 方法 | 结果 |
|---|---|---|
| RED | `node apps/web/tests/overview-01b.test.mjs` | FAIL，缺少 `工作项详情抽屉` |
| GREEN | `node apps/web/tests/overview-01b.test.mjs` | PASS |
| JS 语法 | `node --check apps/web/src/features/overview/page.js` | PASS |
| 本地服务 | `http://127.0.0.1:5173/` | HTTP 200 |
| 浏览器打开 | `agent-browser open http://127.0.0.1:5173/ --json` | PASS |
| DOM 文本 | `agent-browser eval ... --json` | PASS，关键字段均已渲染 |
| 截图 | `agent-browser screenshot tmp/TF-FACTORY-UI-RUNTIME-01B-overview-after.png --json` | PASS |
| 浏览器错误 | `agent-browser errors --json` | PASS，errors=[] |

## 3. 截图证据

- `tmp/TF-FACTORY-UI-RUNTIME-01B-overview-after.png`

## 4. 自查结论

- 页面新增 `工作项详情抽屉 · TF-FACTORY-UI-RUNTIME` 区域。
- 区域内包含 `TaskBatch 批次`、`Task / Step 清单`、`执行与验收`、`停止策略`。
- 停止策略明确展示 `等待决策暂停`、`JS errors 暂停`、`验证不通过暂停`。
- 主布局保持稳定，未发现新增浏览器 JS 错误。

## 5. visibleOutputCompliance

```json
{
  "planShown": true,
  "planCodeBlock": true,
  "userConfirmed": true,
  "summaryShown": true,
  "summaryCodeBlock": true,
  "complianceStatus": "PASS"
}
```

## 6. 下一步

- 建议继续执行 `TF-FACTORY-UI-RUNTIME-01C`，将右侧团队动态增强为 WorkItem / DecisionPacket / QA 事件流。
