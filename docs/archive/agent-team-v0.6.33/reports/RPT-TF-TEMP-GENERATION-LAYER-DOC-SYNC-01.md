# RPT-TF-TEMP-GENERATION-LAYER-DOC-SYNC-01｜生成层架构资料文档同步报告

> ReportId：`RPT-TF-TEMP-GENERATION-LAYER-DOC-SYNC-01`  
> Status：PASS  
> Time：2026-06-01 00:03:23 +0800  
> Scope：docs only；未修改 `apps/`。

## 1. 本轮同步结论

已把用户补充的两张架构图沉淀为正式 docs 口径：

```text
智能软件工厂 = AI 原生应用平台生成层 / 建层的产品化工作台
```

它通过 AI 动态工作流把业务输入和语义底座转化为应用生成过程：

```text
业务输入 / 业务本体
  → Plan / Stage / WorkItem / Task / Step
    → 数字员工 + Skill + Runtime 执行
      → 应用蓝图 / 页面 / 服务 / 配置 / 测试 / 发布包
        → 决策 / 验收 / 反馈 / 持续演进
```

## 2. 更新文件

| 文件 | 变更 |
|---|---|
| `docs/specs/SDD-GENERATION-LAYER-ARCHITECTURE-v0.6.33.md` | 新增生成层定位与五层架构映射设计。 |
| `docs/specs/SDD-OVERVIEW-DYNAMIC-WORKFLOW-UI-v0.6.33.md` | 补充生成层 / 建层上位依据和数据对象映射。 |
| `docs/specs/PRD-v0.6.33.md` | 补充产品定位：AI 原生应用平台生成层产品化工作台。 |
| `docs/specs/SDD-v0.6.33.md` | 补充五层架构定位和系统边界。 |
| `docs/workitems/TF-FACTORY-UI-RUNTIME.md` | 更新当前焦点、设计依据和后续 TaskFlow。 |
| `docs/project-memory.md` | 记录 2026-06-01 生成层定位结论。 |
| `docs/doc-nav.md` | 增加 ASCII 导航入口。 |
| `docs/文档导航.md` | 增加中文导航入口。 |

## 3. 参考图片

- `docs/prototypes/pic/references/generation-layer-ai-dynamic-workflow-architecture-01.png`
- `docs/prototypes/pic/references/ai-native-platform-five-layer-architecture-01.png`

## 4. 验证

| 检查项 | 结果 |
|---|---|
| 新增 SDD 文件存在 | PASS |
| 两张参考图片存在 | PASS |
| PRD / SDD / overview SDD / project-memory / nav 均包含生成层口径 | PASS |
| `apps/` 未修改 | PASS |

## 5. 下一步建议

下一步可执行 `TF-FACTORY-UI-RUNTIME-01A`，只改 `overview` 页面，把首页从“团队/员工看板”小步增强为“AI 应用生成动态工作流总览”。
