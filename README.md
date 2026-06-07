# agent-team sandbox workspace

这是根据 `HANDOFF-AGENT-TEAM-20260529.md` 初始化的新沙箱工程目录。

## 当前状态

当前目录已创建工程壳、运行账本目录和基线恢复脚本；但实际 `apps/`、`docs/`、`skills/` 内容需要从以下基线包恢复：

- `agent-team-apps-baseline-20260529.zip`
- `agent-team-docs-baseline-20260529.zip`
- `agent-team-skills-baseline-20260529.zip`

## 恢复方式

把上述 ZIP 放到 `/mnt/data` 或本目录 `source/` 下后运行：

```bash
python tools/bootstrap_from_baseline_zips.py
```

脚本会自动解压到项目根目录，并生成 `.runtime/bootstrap/bootstrap-report.json`。

## 下一阶段建议

恢复完整 apps/docs 后，优先读取：

1. `docs/doc-nav.md`
2. `docs/project-memory.md`
3. `docs/workitems/TF-FACTORY-UI-ARCH.md`
4. `docs/reports/RPT-FRONTEND-UI-ARCH-13-CLOSEOUT.md`

然后进入“运行态业务逻辑统一阶段”，优先从 Team 页面运行资源区开始。
