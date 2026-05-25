# TF-GOV-14｜完成时间输出与 OpenCode Todo 风格参考

## 结论

本轮做最小修复：节点完成输出增加完成时间/结束时间，并参考 OpenCode todo 风格补充简洁状态清单建议。

## 验证点

- `node --check tools/taskflow/taskflow-md.mjs` 通过。
- `complete-node` 控制台输出包含 `completedAt=` 与 `actual=`。
- SKILL/README/治理指南/CHANGELOG 已同步 v0.9.22。

## 说明

OpenCode todo 风格只作为展示层参考：`[✓]` 表示完成、`[!]` 表示当前/需关注、`[ ]` 表示未开始。完整审计表仍然保留。
