# ADR-0005：Worker 与 RuntimeBinding 模型

> 状态：Accepted  
> 日期：2026-05-17  
> 版本：v0.6.33

---

## 背景

智能软件工厂中的“数字员工”不是抽象头像。每个数字员工实例最终都要能绑定到一个具体 Agent Runtime。当前实现心智是 OpenCode 工作目录，但系统不能假设所有 runtime 都部署在同一台机器。

---

## 决策

一个 Worker 表示一个数字员工实例；一个 Worker 应绑定一个具体 Agent Runtime。

当前模型：

```text
Worker
→ WorkerRuntimeBinding
→ RuntimeHost
→ workspaceDir
→ initialized Skill snapshot
```

核心字段：

```ts
type WorkerRuntimeBinding = {
  id: string
  workerId: string
  runtimeHostId: string
  runtimeType: 'opencode' | 'mock' | 'custom'
  workspaceDir: string
  skillDir?: string
  initializedSkillVersionIds: string[]
  syncStatus: 'not_initialized' | 'syncing' | 'synced' | 'outdated' | 'failed'
  lastSyncAt?: string
}
```

---

## 规则

1. `SkillVersion` 是技能内容真源。
2. `TemplateSkillMapping` 是岗位技能匹配真源。
3. `workspaceDir/skills` 只是运行时快照。
4. Worker 启用时，根据模板和技能映射初始化 workspace。
5. Worker 停用时，不删除 workspace 和初始化快照。
6. RuntimeHost 可以单机，也可以多机。
7. 不允许在业务逻辑中假设所有 workspace 位于同一个根目录。

---

## P0a 表达

P0a 不真实创建 workspace，但 mock 数据中必须展示：

```text
runtimeHost
workspaceDir
skillDir
initializedSkillVersionIds
syncStatus
lastSyncAt
```

这样 P0a 页面能验证用户心智，P0b 再落地真实本地 runtime-service。
