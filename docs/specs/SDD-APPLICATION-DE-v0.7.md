# SDD-APPLICATION-DE｜应用型数字员工概述与索引

> 文档类型：SDD / 应用侧概述与索引
> 版本：v0.7.0
> 状态：草案（Draft）
> UpdatedAt：2026-06-07
> 归位：DEOS 2F 运行层 · 应用型数字员工
> 关联：架构总纲 `SDD-DEOS-ARCHITECTURE-v0.7.md`；产品需求 `PRD-v0.7.md` §4；子设计计划 `PLAN-DEOS-SUBDESIGNS-v0.7.md`
> 说明：本文件只保留应用型数字员工的概念心智与索引，不维护状态机、能力调用、人机协同、本体回流等细节。上述细节的权威副本归入 `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 或后续主子设计章节。

---

## 0. 定位

应用型数字员工是 DEOS v0.7 的核心增量：常驻运行、任务制，负责把业务跑起来。

```text
构建型 DE：慢循环 · 版本制 · 产出「应用 + 能力」
应用型 DE：快循环 · 任务制 · 产出「业务执行结果」
```

应用型数字员工不替代业务系统，而是在业务本体与能力库的约束下，调用能力、协同人工、推动业务任务完成。

---

## 1. 与构建型数字员工的区别

| 维度 | 构建型 DE | 应用型 DE |
|---|---|---|
| 目标 | 把业务建起来 | 把业务跑起来 |
| 周期 | 慢循环、版本制 | 快循环、任务制 |
| 触发 | 用户提出研发目标 | 业务事件 / 定时 / 指派 / 上游任务 |
| 主要对象 | `Plan / Stage / WorkItem / Task / Step` | `AppTask / AppSession / Step / Checkpoint` |
| 产出 | 应用 + 能力 | 业务执行结果 + 运行沉淀 |
| 运行底座 | 数字员工运行平台 | 数字员工运行平台 |

---

## 2. 关键设计决策

### 2.1 AppTask 独立建模

应用型数字员工的业务任务对象 `AppTask` **独立建模**，不复用构建侧 `TaskTicket`。

理由：

- 构建侧 `TaskTicket` 面向研发交付，属于版本制 / 项目制任务。
- 应用侧 `AppTask` 面向业务执行，属于短周期 / 常驻任务。
- 两者可以复用运行平台的 `RuntimeTaskEnvelope / RuntimeSession / RuntimeEvent`，但不共享业务对象模型。

### 2.2 App Task Runner 暂不拍板

`App Task Runner` 是复用现有 `task-runner` 扩展，还是新建轻量运行循环，留到运行平台 M1 PoC 验证。

该决策不影响 `AppTask` 独立建模。

---

## 3. 权威设计归属

为避免双写，本文件不维护以下细节：

| 主题 | 权威位置 |
|---|---|
| 应用型任务制状态机 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 的应用型任务制章节 |
| `AppTask → RuntimeTaskEnvelope → RuntimeSession` 转换关系 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md` |
| 人机协同 Checkpoint 协议 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 的人机协同检查点章节 |
| 能力调用契约 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 的能力库调用契约章节 |
| 运行事件与运营指标 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md`；运营侧消费逻辑进入 `SDD-DE-OPERATIONS-PLATFORM-v0.7.md` |
| 本体回流机制 | 先由运行平台输出事件入口；运营平台记录回流指标，复杂后再决定是否独立 |
| 应用侧 UI | 先纳入运营平台的应用侧运营视图章节，复杂后再决定是否独立 |

---

## 4. 相关主子设计索引

| 主子设计 | 文件 | 与应用型 DE 的关系 |
|---|---|---|
| 数字员工运行平台 | `SDD-DE-RUNTIME-PLATFORM-v0.7.md` | 应用型数字员工运行底座，承载任务制运行模型与运行事件。 |
| 数字员工管理平台 | `SDD-DE-MANAGEMENT-PLATFORM-v0.7.md` | 管理应用型数字员工的权限、岗位、技能、团队、配置。 |
| 数字员工运营平台 | `SDD-DE-OPERATIONS-PLATFORM-v0.7.md` | 监控应用型数字员工运行状态、效能、成本，并承载部分应用侧运营视图。 |
| 业务系统集成 | `SDD-BIZ-SYSTEM-INTEGRATION-v0.7.md` | 定义应用型数字员工与业务系统的入站触发、出站调用。 |

---

## 5. 下一步

下一步不在本文件继续展开细节，而是完善 `SDD-DE-RUNTIME-PLATFORM-v0.7.md` 的运行平台对外契约：

1. `RuntimeEvent` 字段与运营指标映射。
2. `AppTask → RuntimeTaskEnvelope → RuntimeSession` 转换图。
3. 应用型任务制状态机与 `RuntimeSession.status` 映射表。
4. Checkpoint 协议。
5. 能力调用契约字段。

上述内容封口后，再进入管理平台和运营平台子设计。
