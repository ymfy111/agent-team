# DEV-TASKFLOW-NEXT v0.6.33.45

> 文档类型：下一阶段任务流建议  
> 来源任务流：TF-GOV-02  
> 当前基线：v0.6.33.45 / TF-P0B-05  
> 目的：在前端源码暂不完整的情况下，优先选择能推进项目主线的后续工作包。

---

## 1. 推荐顺序总览

| 顺序 | 任务流 | 建议优先级 | 适合现在做 | 依赖 | 主要产物 |
|---|---|---:|---|---|---|
| 1 | TF-DOC-STRUCT-01：结构化 Markdown 模板收口 | P0 | 是 | 当前 docs / SDD 映射设计 | SOW / FLOW / TASK / REVIEW / DECISION 模板 |
| 2 | TF-POC-MD-01：Agent-led Task List Markdown POC | P0 | 是 | TF-DOC-STRUCT-01 | 最小读写样例、任务事件、局部更新规则 |
| 3 | TF-P0B-06：前端 data-uri 残留兼容逻辑清理 | P0 | 暂缓 | 完整 apps/web 源码与可运行 QA | 前端补丁、截图验证、QA 报告 |
| 4 | TF-RUNTIME-DESIGN-01：Runtime 绑定与超时机制设计 | P1 | 是 | 当前 SDD / WBS | RuntimeHost / RuntimeNode / ExecutionLease 设计补充 |

推荐先做 1 → 2，再根据源码是否补齐决定进入 3；4 可以与 1/2 之后并行或作为后续设计任务。

---

## 2. TF-DOC-STRUCT-01：结构化 Markdown 模板收口

任务流：TF-DOC-STRUCT-01｜结构化 Markdown 模板收口  
基线：v0.6.33.45 / TF-GOV-02  
验收模式：委托验收  
冻结项：不引入数据库；不做完整状态机；不改产品版本号。

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 |
|---|---|---|---|---|
| TF-DOC-STRUCT-01-N01 | 模板现状复核 | 检查当前 docs/templates 是否完整存在，确认缺口 | 明确 SOW / FLOW / TASK / REVIEW / DECISION 模板缺失项 | 低复杂度 |
| TF-DOC-STRUCT-01-N02 | SOW / FLOW 模板补齐 | 基于 taskflow 固定节点表格形成 SOW 与 FLOW 模板 | 模板包含 Front Matter、节点表格、暂停门禁、证据字段 | 中复杂度 |
| TF-DOC-STRUCT-01-N03 | TASK / REVIEW / DECISION 模板对齐 | 让任务、审查、待决策模板和 SOW/FLOW 字段可互相引用 | taskId / flowId / nodeId / evidenceRefs / eventRefs 字段一致 | 中复杂度 |
| TF-DOC-STRUCT-01-N04 | 文档导航与评审 | 更新导航并做字段一致性评审 | 文档导航有入口，字段无明显冲突 | 低复杂度 |

暂停门禁：发现现有模板已经在 GitHub 中更新但沙箱缺失时暂停，需重新同步完整 docs。

---

## 3. TF-POC-MD-01：Agent-led Task List Markdown POC

任务流：TF-POC-MD-01｜Agent-led Task List Markdown POC  
基线：结构化模板完成后  
验收模式：委托验收  
冻结项：不接真实多 Runtime；不做复杂 UI；不把聊天记录作为事实源。

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 |
|---|---|---|---|---|
| TF-POC-MD-01-N01 | 样例工作区搭建 | 建立 project-workspace 样例目录 | 包含 plan、tasks、reviews、decisions、events、artifacts | 中复杂度 |
| TF-POC-MD-01-N02 | Front Matter 读取 | 实现最小读取脚本或规则说明 | 能读取 flowId、taskId、status、ownerAgentId、decisionRequired | 中复杂度 |
| TF-POC-MD-01-N03 | 安全局部更新试点 | 验证只更新 Front Matter 和标记区块 | 不重写整篇 Markdown，保留人工正文 | 中复杂度 |
| TF-POC-MD-01-N04 | 任务事件追加 | 追加 TaskEvent JSONL 样例 | 状态变化、执行反馈、审查结果可追踪 | 中复杂度 |
| TF-POC-MD-01-N05 | POC 评审 | 从主智能体维护任务清单角度评审可行性 | 形成 POC 报告与下一步进入 Guarded Task Flow 的条件 | 低复杂度 |

暂停门禁：若需要选择具体技术栈或持久化目录规范，暂停请求用户确认。

---

## 4. TF-P0B-06：前端 data-uri 残留兼容逻辑清理

任务流：TF-P0B-06｜头像 data-uri 残留兼容逻辑清理  
基线：v0.6.33.45 / TF-P0B-05  
验收模式：委托验收 + 前端截图证据  
冻结项：不引入构建工具；不改复杂业务渲染；不回退 base64 fallback；保持 `pic/` 与 `index.html` 同级。

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 |
|---|---|---|---|---|
| TF-P0B-06-N01 | 源码完整性复核 | 确认 apps/web 是否有 index.html、src、CSS、QA 脚本 | 缺失则停止，不做盲改 | 低复杂度 |
| TF-P0B-06-N02 | data-uri 残留定位 | 搜索 runtime、HTML、CSS 中 data:image / avatarData 残留 | 形成清单，区分头像与非头像资源 | 低复杂度 |
| TF-P0B-06-N03 | 最小清理补丁 | 清除头像 data-uri 兼容逻辑，保留 avatar-default 静态兜底 | 不破坏头像映射与页面渲染 | 中复杂度 |
| TF-P0B-06-N04 | 图片与截图回归 | 运行图片完整性检查和 Playwright 截图 | brokenImages=0、pageErrors=0、关键截图通过 | 中复杂度 |
| TF-P0B-06-N05 | 文档同步 | 更新 README / 报告 / 导航 | 明确清理范围、验证结果和未改范围 | 低复杂度 |

暂停门禁：当前沙箱 apps/web 源码不完整，不能立即执行该任务流；需用户上传或重新同步完整 GitHub ZIP。

---

## 5. TF-RUNTIME-DESIGN-01：Runtime 绑定与超时机制设计

任务流：TF-RUNTIME-DESIGN-01｜Runtime 绑定与超时机制设计  
基线：v0.6.33.45 / TF-GOV-02  
验收模式：委托验收  
冻结项：不实现真实 Runtime 调度；只补设计和任务拆解。

| 节点 | 名称 | 目标 | 验收点 | 预计耗时 |
|---|---|---|---|---|
| TF-RUNTIME-DESIGN-01-N01 | 现有 Runtime 模型复核 | 复核 RuntimeHost / RuntimeNode / WorkerRuntimeBinding / SkillSnapshot 设计 | 明确已有字段和缺口 | 低复杂度 |
| TF-RUNTIME-DESIGN-01-N02 | ExecutionLease 与超时模型 | 设计任务执行租约、心跳、超时、重试和中断报告 | 能防止任务长期卡住 | 中复杂度 |
| TF-RUNTIME-DESIGN-01-N03 | TaskEvent 联动 | 将 Runtime 状态与 TaskEvent / Blocker / DecisionItem 联动 | 运行状态能回写项目任务流 | 中复杂度 |
| TF-RUNTIME-DESIGN-01-N04 | 文档与 WBS 同步 | 更新 SDD 子文档和 WBS 后续任务 | 形成可交给开发智能体的任务清单 | 低复杂度 |

暂停门禁：如果需要选择具体 Runtime 接入方案（OpenCode / Codex / Claude Code 等），暂停请求关键决策。

---

## 6. 本轮推荐

在当前沙箱缺完整前端源码的前提下，推荐下一轮优先选择：

```text
首选：TF-DOC-STRUCT-01
原因：直接承接 TF-GOV-02 的 SOW / FLOW / TaskTicket 设计，且不依赖前端源码。

次选：TF-POC-MD-01
原因：开始验证 Agent-led Task List POC，是项目从原型/文档进入真实机制落地的关键一步。

暂缓：TF-P0B-06
原因：需要完整 apps/web 源码和 QA 环境，否则会变成方案级讨论或盲改。
```
