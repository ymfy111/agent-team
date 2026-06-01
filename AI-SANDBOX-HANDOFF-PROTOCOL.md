# AI-SANDBOX-HANDOFF-PROTOCOL｜AI 沙箱双向交接与同步协议

> 适用范围：ChatGPT 沙箱、OpenCode 本地工作区、后续可接入的其他 AI 执行沙箱。  
> 本文档放在项目根目录，避免 `docs/` 全量更新时被覆盖。  
> 本文档与代码版本无关，不使用版本号命名。  
> Status: active / v1 baseline  
> ProtocolVersion: 1  
> UpdatedAt: 2026-06-01  
> 目标：让多个 AI 环境可以围绕同一项目持续产出 `docs`、`apps`、`skills`，并通过明确交接协议完成同步、验证和发布。

---

## 1. 基本定位

当前推荐采用“双向同步、职责主导”的协作模式：

```text
ChatGPT 沙箱：docs 为主，参与部分前端设计与实现
OpenCode 本地：apps 为主，负责本地集成、验证、提交、推送
```

两边不是互相替代，而是围绕同一个项目基线交替推进：

```text
ChatGPT 沙箱产出 docs / apps / skills / handoff / manifest
  → 放入 agent-team/update/
  → OpenCode 读取交接文档、备份、staging、合入、验证、提交、推送
  → ChatGPT 基于远程新基线继续生产下一轮产物
```

目录约定：

```text
update/    入站目录，放其他沙箱交给 OpenCode 合入或评审的包。
outgoing/  出站目录，放 OpenCode 交给 ChatGPT 或其他沙箱的包。
backup/    本地备份目录，放合入前备份与回滚材料。
```

---

## 2. 职责边界

| 环境 | 主职责 | 可参与范围 | 不应承担 |
|---|---|---|---|
| ChatGPT 沙箱 | 文档、设计、规格、工作项、批量整理 | 前端页面草案、局部 `apps/web` 实现、参考图、交接包 | 直接假设本地 Git 状态、直接发布远程仓库 |
| OpenCode 本地 | `apps` 实现、本地验证、集成、提交、推送 | 文档同步、协议沉淀、规则修正、必要的 `skills` 合入 | 盲目覆盖未验证的包、跳过备份和 smoke/QA |

默认分工：

1. ChatGPT 优先产出 `docs/`、规格、交接说明、批量整理结果。
2. OpenCode 优先推进 `apps/`、脚本、运行网关、本地验证与 Git 发布。
3. ChatGPT 可以参与部分前端开发，但必须通过交接包进入 OpenCode 合入流程。
4. OpenCode 可以修改 docs，但必须同步 `docs/doc-nav.md` 和必要的 `docs/project-memory.md`。

---

## 3. 交接包结构

除 `review-only` 外，任何可合入 update 包必须包含 manifest。缺失 manifest、manifest 解析失败、缺少 `baseCommit` 或包校验失败时，OpenCode 只能执行只读评审，不得自动合入。

推荐每轮放入 `update/`：

```text
update/
├── HANDOFF-OPENCODE-YYYYMMDD.md
├── MANIFEST-YYYYMMDD.json
├── agent-team-docs-current-YYYYMMDD.zip
├── agent-team-apps-current-YYYYMMDD.zip
└── agent-team-skills-current-YYYYMMDD.zip   # 可选
```

其中：

| 文件 | 必需 | 说明 |
|---|---|---|
| `HANDOFF-OPENCODE-YYYYMMDD.md` | 是 | 人类可读交接文档，说明当前阶段、重点、下一步、注意事项。 |
| `MANIFEST-YYYYMMDD.json` | 合入必需 | 机器可读交接清单，说明基线、包范围、替换模式、验证命令、删除策略、保护路径和回滚要求。 |
| `agent-team-docs-current-YYYYMMDD.zip` | 按需 | `docs/` 全量或增量包。 |
| `agent-team-apps-current-YYYYMMDD.zip` | 按需 | `apps/` 全量或增量包。 |
| `agent-team-skills-current-YYYYMMDD.zip` | 按需 | `skills/` 全量或增量包。 |

zip 内部目录必须以项目根为基准，例如：

```text
docs/...
apps/web/...
apps/runtime-gateway/...
skills/task-runner/...
```

不得额外嵌套一层 `agent-team/`，除非 manifest 明确说明。

---

## 4. Manifest 必需格式

```json
{
  "protocolVersion": "1",
  "operationMode": "merge-ready",
  "packageId": "UPD-CG-OC-YYYYMMDD-001",
  "producer": "chatgpt-sandbox",
  "consumer": "opencode-local",
  "targetProject": "agent-team",
  "baseBranch": "main",
  "baseCommit": "<产出包时参考的 Git commit>",
  "expectedHead": "<可选，要求 OpenCode 合入前所在 commit>",
  "createdAt": "YYYY-MM-DD HH:mm:ss +0800",
  "rootInZip": "project-root",
  "packages": [
    {
      "path": "agent-team-docs-current-YYYYMMDD.zip",
      "sha256": "<zip sha256>",
      "fileCount": 123,
      "target": "docs",
      "mode": "full-replace",
      "allowedPaths": ["docs/**"],
      "protectedPaths": [
        "AI-SANDBOX-HANDOFF-PROTOCOL.md",
        "docs/doc-nav.md",
        "docs/文档导航.md",
        "docs/project-memory.md",
        ".gitignore"
      ],
      "localOnlyPaths": [".env", ".env.local", "node_modules/**", "dist/**", "coverage/**", "backup/**", "update/**", "outgoing/**"],
      "deletePolicy": "manifest-only",
      "deletePaths": [],
      "expectedChangedPaths": []
    },
    {
      "path": "agent-team-apps-current-YYYYMMDD.zip",
      "sha256": "<zip sha256>",
      "fileCount": 45,
      "target": "apps",
      "mode": "overlay",
      "allowedPaths": ["apps/web/src/features/overview/**", "apps/web/qa/**"],
      "protectedPaths": ["package.json", "package-lock.json", ".gitignore"],
      "localOnlyPaths": [".env", ".env.local", "node_modules/**", "dist/**", "coverage/**", "backup/**", "update/**", "outgoing/**"],
      "deletePolicy": "manifest-only",
      "deletePaths": [],
      "expectedChangedPaths": ["apps/web/src/features/overview/page.js"],
      "affectedPaths": ["apps/web/src/features/overview/page.js"],
      "changeIntent": "增强 overview 页面动态工作流表达",
      "localVerification": ["npm run qa in apps/web"],
      "screenshotEvidence": ["apps/web/qa/screenshots/overview-after.png"],
      "forbiddenOverwritePaths": ["apps/web/package.json", "apps/web/package-lock.json"]
    }
  ],
  "handoff": "HANDOFF-OPENCODE-YYYYMMDD.md",
  "expectedChecks": [
    {
      "name": "runtime-gateway smoke",
      "cwd": "apps/runtime-gateway",
      "command": "npm run smoke",
      "required": true
    },
    {
      "name": "web qa",
      "cwd": "apps/web",
      "command": "npm run qa",
      "required": true
    }
  ],
  "knownLimitations": [],
  "pushPolicy": {
    "requiredRemotes": ["origin", "github"]
  },
  "rollback": {
    "backupRequired": true,
    "instructions": "restore backup/<packageId>/... before commit; use git revert after commit"
  }
}
```

路径作用域规则：`allowedPaths`、`protectedPaths`、`localOnlyPaths`、`deletePaths`、`expectedChangedPaths` 均使用 project-root 相对路径，不得使用绝对路径。路径匹配以项目根目录为基准，不以 package target 或 zip 内部目录为基准。

`operationMode` 可选值：

| operationMode | 含义 | OpenCode 行为 |
|---|---|---|
| `review-only` | 只评审，不合入 | 只读 handoff / manifest / zip 清单。 |
| `stage-only` | 只 staging 与 diff | 可解压到临时目录并生成审查结论，不覆盖工作区。 |
| `merge-ready` | 可合入 | 满足本协议所有门禁后才可覆盖、验证、提交、推送。 |

`mode` 可选值：

| mode | 含义 | OpenCode 合入方式 |
|---|---|---|
| `full-replace` | 目标目录全量基线 | 先备份旧目录，再用 staging 中目标目录替换工作区目标目录；会删除包中缺失的目标目录文件。 |
| `overlay` | 增量覆盖 | 只复制包中存在且位于 `allowedPaths` 内的文件，不删除缺失文件；同名文件覆盖前必须 diff 审查。 |
| `patch` | 补丁式修改 | 必须提供 patch 文件或 explicitSteps；应用后必须审查 diff 并运行 required checks。 |

删除规则：除 `full-replace` 的目标目录替换语义外，任何删除 tracked 文件都必须列入 `deletePaths`。`overlay` 和 `patch` 默认不允许删除文件。

`mode=full-replace` 时，目标目录内因替换产生的删除不必逐项列入 `deletePaths`。但 OpenCode 必须在 staging diff 中展示 deleted files，并确认删除未触及 `protectedPaths`、`localOnlyPaths` 或 manifest 未授权路径。

`allowedPaths` 表示本包允许触及的最大范围。`expectedChangedPaths` 表示生产者预期本轮实际变化的路径。diff 超出 `allowedPaths` 必须停止；diff 在 `allowedPaths` 内但明显超出 `expectedChangedPaths`，必须标记为 `unexpected diff` 并人工审查后才可继续。

`apps/` 包默认不得使用 `full-replace`。ChatGPT 参与前端开发时，默认只能 `overlay` / `patch` 到 manifest 的 `allowedPaths`；若需要 `full-replace apps/`，必须由用户明确授权。

---

## 5. 默认保护路径

以下路径为默认 `protectedPaths`，任何模式覆盖前必须 diff 审查；意外覆盖必须停止合入：

```text
AI-SANDBOX-HANDOFF-PROTOCOL.md
docs/doc-nav.md
docs/文档导航.md
docs/project-memory.md
.gitignore
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
```

`docs/doc-nav.md` 是 ASCII 主入口。`docs/文档导航.md` 是中文兼容入口，可保留入口引用、长期事实摘要和跳转说明，但不再承载完整长导航。

`docs` full-replace 后必须执行 entry reconciliation：

1. `docs/doc-nav.md` 仍包含 `AI-SANDBOX-HANDOFF-PROTOCOL.md` 入口。
2. `docs/project-memory.md` 仍记录沙箱交接协议和当前 active runner 口径。
3. `docs/文档导航.md` 若存在，仍为中文兼容入口，不得回退为完整长导航。
4. 不允许入口文件回退到不含协议入口的旧版本。

---

## 6. OpenCode 接班流程

OpenCode 收到 `update/` 包后，必须按以下顺序执行：

1. 读取 `HANDOFF-OPENCODE-YYYYMMDD.md`。
2. 读取并解析 `MANIFEST-YYYYMMDD.json`；`review-only` 以外缺失 manifest 时停止。
3. 查看当前工作树，识别非本次目标变更，禁止误提交无关改动。
4. 比较 `manifest.baseCommit` 与当前 `HEAD`。
5. 校验 zip 的 `sha256`、`fileCount`、`rootInZip`、top-level 目录和目标路径。
6. 备份将被替换的目录到 `backup/<packageId>/`。
7. 解压到临时 staging 目录，确认目录结构正确。
8. 按 manifest 的 `mode` 合入。
9. 验证必要路径、`docs/doc-nav.md`、`docs/project-memory.md`、关键 package 文件。
10. 运行 smoke / QA / 语法检查；若环境缺依赖，记录真实失败原因并补充可执行的替代检查。
11. 审查 `git diff` 与 `git status`，确认 diff 不超出 `allowedPaths`，并标记是否超出 `expectedChangedPaths`。
12. 只暂存本轮目标范围。
13. 提交并同时推送到 `origin` 和 `github`。

全量替换 `apps/`、`docs/`、`skills/` 前必须先备份。

基线漂移规则：

1. `baseCommit == HEAD` 时，可继续走正常门禁。
2. `baseCommit != HEAD` 且 diff 仅涉及非重叠路径，可进入 guarded merge，但必须记录原因。
3. `baseCommit != HEAD` 且涉及同一 target 或同一文件，必须暂停并要求用户确认。
4. `baseCommit != HEAD` 时不得执行 `full-replace`。

---

## 7. ChatGPT apps 包门禁

ChatGPT 产出的 `apps` 包必须额外包含：

```text
affectedPaths
changeIntent
localVerification
screenshotEvidence   # 页面类变更必需
expectedChecks
knownLimitations
forbiddenOverwritePaths
```

OpenCode 必须完成本地 QA、截图验证、diff 审查后才能提交。页面类变更缺少截图证据时，不得标记 PASS；本地浏览器依赖缺失时，必须记录缺失依赖并至少完成语法检查和可运行检查。

---

## 8. 停止条件

出现以下任一情况，OpenCode 必须停止合入并回报，不得 commit：

1. manifest 缺失、解析失败或字段不足。
2. `sha256` 不匹配，或 zip 结构不符合 `rootInZip`。
3. `baseCommit` 与 `HEAD` 不一致且触及相同 target / 文件。
4. `full-replace` 请求用于 `apps/` 且没有用户明确授权。
5. diff 超出 `allowedPaths`。
6. diff 在 `allowedPaths` 内但明显超出 `expectedChangedPaths`，且未完成人工审查。
7. required check 失败。
8. `protectedPaths` 被意外覆盖。
9. 删除 tracked 文件但未列入 `deletePaths`，且不是 `full-replace` 目标目录替换产生的已审查删除。

`pushPolicy.requiredRemotes` 中列出的 remote 必须存在。若 remote 缺失，OpenCode 必须在 push 前停止并报告 `REMOTE_MISSING`；不得自动新增、修改或重定向 remote。

若已 commit 但只成功推送一个 remote，状态必须标记为 `PARTIAL_PUSH`，不得标记同步完成。

---

## 9. 回滚规则

每次合入必须创建 `backup/<packageId>/`。

1. 验证失败但尚未 commit：优先从 backup 恢复，或保留 staging 等待用户确认。
2. commit 后发现问题：优先使用 `git revert`，避免重写历史。
3. 未提交但目录已替换：使用 backup 恢复。
4. 回传 handoff 必须记录 backup path、commit hash、rollback method。

---

## 10. OpenCode 回传给 ChatGPT 的信息

每次 OpenCode 合入后，应在回复或后续 handoff 中提供：

```text
合入包：哪些 zip / 哪些目录
备份位置：backup/ 下的文件或目录
验证结果：通过项、失败项、失败原因、替代验证
提交信息：commit hash、commit message
推送状态：origin / github 是否同步
遗留事项：需要 ChatGPT 下轮修正或继续的点
回滚信息：backup path、rollback method
```

ChatGPT 下一轮应以远程最新 commit 为基线继续产出，避免基线漂移。

---

## 11. 冲突与边界规则

1. 若本地存在未提交改动，OpenCode 不得自动覆盖无关文件。
2. 若交接包的 `baseCommit` 与本地 HEAD 不一致，应先判断是否可安全合入；高风险时询问用户。
3. `update/`、`outgoing/` 和 `backup/` 不进入 Git。
4. ChatGPT 参与前端开发时，只能通过 `apps/` 包交接，不直接跳过 OpenCode 本地验证。
5. OpenCode 修改 docs 时，必须保持导航和项目记忆同步。
6. 页面类变更必须执行截图验证；缺少浏览器依赖时，必须记录缺失依赖并至少完成语法检查。
7. skills 更新必须先读对应 `SKILL.md` 和门禁文档，再执行验证脚本。
8. 协议文档本身变更时，必须同步 `docs/doc-nav.md` 和 `docs/project-memory.md` 摘要。

---

## 12. 推荐使用方式

当用户说“按沙箱交接协议合入 update 包”时，默认含义为：

```text
读取 handoff / manifest
备份目标目录
staging 解压
按 mode 合入
运行验证
审查 diff
提交并推送 origin + github
回报证据与遗留事项
```

当用户只要求“先看看”或“评审一下交接包”时，OpenCode 只读取 handoff、manifest 和 zip 清单，不做解压覆盖。

当用户说“先预演合入”或“staging 看看”时，默认按 `stage-only` 执行：只解压到 staging、校验结构、生成 diff / 风险结论，不修改工作区。
