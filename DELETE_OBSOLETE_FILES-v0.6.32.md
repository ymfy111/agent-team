# v0.6.32 全量覆盖后的手动清理清单

本包按“v0.6.32 是当前最新稳定版本”生成。

推荐操作：

```bash
# 仓库根目录执行
rm -rf docs
unzip agent-team-v0.6.32-full-docs-reset.zip -d .
```

如不清空 `docs/`，请手动删除以下过期内容：

```text
README-v0.6.33-xiaoyun-visual-patch.md
MIGRATION-v0.6.33-docs正本化.md
AGENTS.md

docs/**/*v0.6.33*
docs/README.md
docs/*/README.md
```

保留并覆盖：

```text
README.md
docs/
docs/文档导航.md
docs/project-memory.md
```

说明：`v0.6.33` 之前只是过程性试验 / 文档正本化草案，不再作为正式版本口径。下一次里程碑变化时，再从 v0.6.32 递增到新的正式版本。
