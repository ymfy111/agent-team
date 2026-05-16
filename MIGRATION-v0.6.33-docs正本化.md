# v0.6.33 文档正本化迁移说明

> 用途：说明本次替换包的覆盖范围、需要手动删除的旧文件，以及推荐操作步骤。  
> 当前版本：v0.6.33  
> 日期：2026-05-17

---

## 1. 本包覆盖范围

本包包含：

```text
README.md
MIGRATION-v0.6.33-docs正本化.md
docs/
```

本包不再包含 `AGENTS.md`。本项目中的 Agent / 数字员工本身是业务核心概念，根目录 `AGENTS.md` 容易造成混淆。外部设计、编程、评审智能体的工作规则统一放在：

```text
docs/collab/
```

其中 `docs/` 是一套完整的新正本目录。推荐先备份旧 `docs/`，再解压本包。

---

## 2. 推荐替换步骤

在仓库根目录执行：

```bash
# 1. 备份旧 docs
mv docs docs.backup.$(date +%Y%m%d-%H%M%S)

# 2. 解压新包；包内包含 README.md、MIGRATION 文件和 docs/
unzip -o agent-team-v0.6.33-docs-root-update-collab.zip -d .

# 3. 手动删除根目录旧文档残留，见第 3 节
rm -f AGENTS.md
rm -f MANIFEST.md
rm -f MIGRATION-v0.6.32-命名收敛.md

# 4. 如果 tmp/ 只用于历史打包或临时加工，也删除
rm -rf tmp

# 5. 查看变更
git status

# 6. 提交
git add -A
git commit -m "docs: consolidate v0.6.33 canonical docs"
git push origin main
```

---

## 3. 需要手动删除的根目录旧文件 / 目录

建议删除：

```text
AGENTS.md
MANIFEST.md
MIGRATION-v0.6.32-命名收敛.md
tmp/
```

说明：

- `README.md` 会被本包覆盖为 v0.6.33 入口。
- `AGENTS.md` 不再使用；外部智能体协作规则移入 `docs/collab/`。
- `docs/` 建议整体备份后替换，不要把旧文档再拷回当前正本目录。
- `LICENSE`、`.gitignore`、`.git/` 不要删除。

---

## 4. docs 内部如何处理

如果你采用“备份旧 docs → 解压本包”的方式，不需要逐个删除 docs 内旧文件。

旧 `docs/` 中这些内容都会被移出当前正本目录：

```text
- v0.6.29 / v0.6.32 / 无版本原始稿等多版本 PRD 和系统设计
- *-revised.md / *-final.md / *-v2.md / *copy* / *round-N* 文件
- 多轮评审过程报告
- 旧版 docs/README.md
- 子目录 README.md
- 多代 HTML 原型
- pic/ 或临时图片资源目录
```

如需追溯历史，使用 Git 历史，不要放回当前 docs 正本目录。

---

## 5. 本次之后的日常更新规则

本次是一次性过期文档清理，适合整体替换 `docs/`。本次之后恢复日常小步更新：

```text
- 当前任务改到哪些文档，就只更新哪些文档。
- 不再每次都给完整 docs 包。
- 不新增 docs/README.md 或子目录 README.md。
- 不新增 revised / final / copy / round-N 文件。
- 小修改用 Git commit 追踪。
```

---

## 6. 验收标准

替换完成后，仓库入口应满足：

```text
README.md                         = 根项目首页，指向 v0.6.33。
docs/文档导航.md                   = docs 唯一详细导航。
docs/project-memory.md            = 当前项目长期记忆。
docs/collab/                      = 设计/编程/评审智能体协作规则。
docs/specs/                       = 仅保留 v0.6.33 当前正本。
docs/decisions/                   = 仅保留当前有效 ADR。
docs/reports/                     = 仅保留当前瘦身评审报告。
```

不应再出现：

```text
AGENTS.md
docs/README.md
docs/**/README.md
docs/**/*revised*.md
docs/**/*final*.md
docs/**/*copy*.md
docs/**/*round*.md
```
