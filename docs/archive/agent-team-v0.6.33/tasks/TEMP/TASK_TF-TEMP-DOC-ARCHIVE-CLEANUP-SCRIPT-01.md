# TASK_TF-TEMP-DOC-ARCHIVE-CLEANUP-SCRIPT-01｜docs 已完成任务归档清理脚本

## 基本信息

- WorkItem: TF-TEMP
- Status: PASS
- Mode: taskflow v0.10.4
- StartedAt: 2026-05-28 23:24:00 +0800
- FinishedAt: 2026-05-29 00:02:00 +0800
- Actual: 38m00s

## 目标

在 `docs/` 根目录新增可复用的已完成任务归档清理工具，支持先 dry-run 预览、再 archive 归档，后续需要时再 clean 清理活跃项目空间。

## 范围

- 新增 `docs/archive-completed-workitems.mjs`。
- 支持 `--dry-run`、`--archive`、`--clean` 三种模式。
- 本轮仅对 `TF-FACTORY-UI-ARCH` 执行 dry-run 与 archive 验证，不执行 clean。
- 归档目录位于工厂目录外：`/mnt/data/agent-team-archives/`。

## 节点结果

- [PASS] S01｜现状检查｜确认 `TF-FACTORY-UI-ARCH` 已完成阶段收口，WorkItem 主文档与阶段收口报告需要保留。
- [PASS] S02｜脚本实现｜新增 `docs/archive-completed-workitems.mjs`，支持 dry-run / archive / clean。
- [PASS] S03｜dry-run 验证｜输出将归档的已完成 Task、QA、runtime、batch、截图证据清单，不修改文件。
- [PASS] S04｜archive 验证｜已在 `/mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/` 生成归档包和 manifest。
- [PASS] S05｜文档留痕｜生成本任务记录、QA 报告、运行账本，并更新 project-memory / 文档导航。

## 清理门禁

- 本轮未执行 clean。
- clean 模式必须指定 archive manifest。
- WorkItem 总账、阶段收口报告、project-memory、文档导航不会被 clean 删除。
- 未完成任务不会进入归档清理候选。

## 产物

- `docs/archive-completed-workitems.mjs`
- `/mnt/data/tf-factory-ui-arch-archive-dry-run.txt`
- `/mnt/data/tf-factory-ui-arch-archive-output.txt`
- `/mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/TF-FACTORY-UI-ARCH-completed-archive.zip`
- `/mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/TF-FACTORY-UI-ARCH-completed-archive/ARCHIVE-MANIFEST.json`

## 下一步

如需真正减少项目内历史任务明细文件，可先检查归档包和 manifest，再执行：

```bash
node docs/archive-completed-workitems.mjs \
  --workitem TF-FACTORY-UI-ARCH \
  --clean \
  --manifest /mnt/data/agent-team-archives/TF-FACTORY-UI-ARCH/TF-FACTORY-UI-ARCH-completed-archive/ARCHIVE-MANIFEST.json
```
