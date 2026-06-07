# TF-POC-MD-01 Agent-led Task List POC 评审报告

> 基线：v0.6.33.45 / taskflow v0.9.18  
> 执行模式：batch-auto-summary  
> 任务性质：真实 POC，非模拟输出格式演练  
> 结论：PASS，可进入下一阶段 Guarded Task Flow 约束设计。

## 1. 本轮目标

验证结构化 Markdown 任务流是否能被最小脚本读取、局部更新、追加事件并生成最终审计摘要，为智能软件工厂后续 Agent-led Task List / Taskflow 产品化提供最低可行实现依据。

## 2. 本轮产物

| 类型 | 路径 | 说明 |
|---|---|---|
| 工具脚本 | `tools/taskflow/taskflow-md.mjs` | 结构化 Markdown 任务流 POC 工具，支持 inspect / validate / start-node / complete-node / summary。 |
| 运行副本 | `docs/tasks/runs/TF-POC-MD-01-RUN-v0.6.33.45.md` | 基于示例任务流复制出的真实运行文件，避免污染模板与原始示例。 |
| 评审报告 | `docs/reports/TF-POC-MD-01-Agent-Led-Task-List-POC-Review-v0.6.33.45.md` | 本文件。 |
| 汇总日志 | `_local/taskflow/TF-POC-MD-01-summary.txt` | 本轮脚本 summary 输出留存。 |

## 3. 验证命令

```bash
node --check tools/taskflow/taskflow-md.mjs
node tools/taskflow/taskflow-md.mjs validate --file docs/tasks/runs/TF-POC-MD-01-RUN-v0.6.33.45.md
node tools/taskflow/taskflow-md.mjs summary --file docs/tasks/runs/TF-POC-MD-01-RUN-v0.6.33.45.md
```

验证结果：

```text
VALID docs/tasks/runs/TF-POC-MD-01-RUN-v0.6.33.45.md nodes=5 events=12 progress=5/5
```

## 4. 节点完成情况

| 节点 | 目标 | 结果 | 验证 | 证据 | 预计耗时 | 实际耗时 |
|---|---|---|---|---|---|---|
| TF-POC-MD-01-N01 | 建立 project-workspace 样例目录 | 样例运行文件已创建，POC 在副本上执行，不污染模板和原始示例。 | PASS；评审：PASS | `docs/tasks/runs/TF-POC-MD-01-RUN-v0.6.33.45.md` | 中复杂度 | 1s |
| TF-POC-MD-01-N02 | 实现最小读取脚本或规则说明 | 已实现 inspect/validate 能力，可读取 flowId、title、mode、status、progress 与节点状态。 | PASS；评审：PASS | `tools/taskflow/taskflow-md.mjs inspect/validate` | 中复杂度 | 1s |
| TF-POC-MD-01-N03 | 验证只更新 Front Matter 和标记区块 | 已验证脚本只更新 Front Matter progress/status、TASKFLOW:STATUS、TASKFLOW:EVENTS 和 TASKFLOW:SUMMARY 标记区块。 | PASS；评审：PASS | `TASKFLOW:*` 标记区块 | 中复杂度 | 1s |
| TF-POC-MD-01-N04 | 追加 TaskEvent JSONL 样例 | 已追加 NODE_STARTED/NODE_COMPLETED JSONL 事件，状态变化、执行反馈和证据引用可追踪。 | PASS；评审：PASS | `TASKFLOW:EVENTS` jsonl | 中复杂度 | 1s |
| TF-POC-MD-01-N05 | 从主智能体维护任务清单角度评审可行性 | POC 可行：结构化 Markdown 可被脚本读取、局部更新、追加事件并生成最终审计；下一阶段可进入 Guarded Task Flow 约束设计。 | PASS；评审：PASS | 本评审报告 | 低复杂度 | 1s |

## 5. 独立评审

### 产品视角

通过。Markdown 任务清单保持人类可读，同时具备基本机器可维护能力，符合 Agent-led Task List 阶段“先轻量、可审计、可回退”的方向。

### 实现视角

通过但需标注 POC 边界。当前脚本使用原生 Node.js 与模板约定解析，不引入依赖，适合最小验证；暂不等同于完整 Markdown/YAML 解析器。

### 数据治理视角

通过。节点状态、开始/完成时间、实际耗时、事件 JSONL 与最终摘要均可追踪；后续若产品化，应将事件拆入独立 TaskEvent 存储。

### 风险视角

未发现 P0/P1。主要 P2 风险是：当前局部更新规则依赖标记区块与表格结构，若人工大幅改动表头或标记，脚本会失败并应停止，而不是尝试全文重写。

## 6. 进入下一阶段条件

建议下一阶段进入 `TF-GUARDED-FLOW-01｜Guarded Task Flow 约束设计`，重点补齐：

1. 标记区块不可缺失时的错误处理与恢复策略；
2. 节点依赖检查与暂停门禁判定；
3. Blocker / DecisionItem 的结构化更新；
4. 与产品对象 WorkPackageNode、TaskTicket、TaskEvent、EvidenceRef 的字段映射；
5. 后续产品 runner / UI 事件流推送的实现边界。

## 7. 结论

`TF-POC-MD-01` 通过。结构化 Markdown 可以作为 Agent-led Task List 的轻量任务清单载体；当前 POC 脚本已证明读取、局部更新、事件追加和最终审计链路可行。
