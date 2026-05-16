# v0.6.32 命名收敛迁移说明

本次只做文件命名收敛，不改变版本号，不改变核心内容。

## 建议在解压本包前先删除旧命名文件

```bash
git rm -f docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32-revised.md || true
git rm -f docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32-revised.md || true
git rm -f docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-p0a-flow.html || true
git rm -f docs/prototypes/Agent-Team-V2-注册中心-v0.6.32-ui-review-task-breakdown.html || true
```

然后解压本包覆盖仓库根目录：

```bash
unzip -o agent-team-v0.6.32-naming-convergence.zip -d .

git add .
git commit -m "docs: normalize v0.6.32 document filenames"
git push origin main
```

## 当前正本

```text
docs/specs/2026-05-13-智能软件工厂产品需求规格-v0.6.32.md
docs/specs/2026-05-13-智能软件工厂系统设计方案-v0.6.32.md
docs/prototypes/Agent-Team-V2-注册中心-v0.6.32.html
```
