> **文档类型**：子系统设计文档（Sub-System Design Document）
> **文档编号**：SDD-DE-MANAGEMENT-PLATFORM-v0.7
> **版本**：v0.7
> **状态**：草稿（Draft）
> **日期**：2026-06-07
> **基线文档**：SDD-DEOS-ARCHITECTURE-v0.7.md · SDD-DEOS-TECH-ARCHITECTURE-v0.7.md
> **关联文件**：SDD-DE-RUNTIME-PLATFORM-v0.7.md · SDD-DE-OPERATIONS-PLATFORM-v0.7.md · PRD-v0.7.md
> **撰写者**：@designer（架构设计）· @fixer（内容实施）

---

# SDD-DE-MANAGEMENT-PLATFORM-v0.7 — 数字员工管理平台设计文档

---

## §1 元数据与定位

管理平台（DE Management Platform）位于 DEOS 四层架构的 **3F 系统层**，承担**集中编制治理**职能：管「数字员工是谁、归谁、能干啥」——即身份登记、组织归属与权限配置。

管理平台是整个 DEOS 生态的**权威主数据来源**，运行侧与运营侧均消费其输出，不得反向修改编制。

### 1.1 在四层架构中的位置

```text
┌─────────────────────────────────────────────────────────────┐
│  3F 系统层 · 集中管理子系统                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DE Management Platform（本文档）                     │   │
│  │  · 团队 / 岗位 / 数字员工编制 CRUD                    │   │
│  │  · RBAC 权限颁发                                      │   │
│  │  · 运行侧同步推送                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 使用者角色

| 角色 | 英文标识 | 职责范围 |
|------|----------|----------|
| 超级管理员 | super_admin | 全局编制治理：跨团队增删改、权限颁发、系统配置 |
| 团队管理员 | team_admin | 本团队成员 / 岗位 / 配置的维护 |
| 只读审计员 | auditor | 查看编制详情与审计日志，不可修改 |
| 只读观察者 | viewer | 有限查看，仅允许读取公开编制摘要 |

### 1.3 与其他子系统的关系

| 子系统 | 关系 |
|--------|------|
| 运行平台（2F） | 管理平台是上游：写入团队 / 岗位 / 权限，运行侧消费引用副本，不反向修改 |
| 运营平台（3F） | 运营平台读取管理编制数据做人效分析，不修改编制 |
| 业务系统（3F） | 管理平台不直接对接业务系统，通过运行平台间接关联 |

### 1.4 不包含范围

| 不包含 | 原因 | 对应子设计 |
|--------|------|------------|
| 运行调度 / 任务派发 | 属 2F 运行平台 | SDD-DE-RUNTIME-PLATFORM-v0.7.md |
| 运营指标 / 成本分析 | 属 3F 运营平台 | SDD-DE-OPERATIONS-PLATFORM-v0.7.md |
| 业务系统集成 | 属 3F 业务系统 | SDD-BIZ-SYSTEM-INTEGRATION-v0.7.md |
| 能力库高级治理 | 能力库是独立共享组件 | 后续按需独立子设计 |

---

## §2 核心对象模型

本章定义管理平台的 6 个核心实体及其语义边界，是后续 Schema、API、同步协议的依据。

### 2.1 实体概览

| 实体 | 英文标识 | 职责 | 关键字段 |
|------|----------|------|----------|
| 团队 | Team | 数字员工的组织单元 | id, name, owner_user_id, status |
| 岗位 | Position | 团队内的职能定义 | id, team_id, role_key, max_headcount |
| 数字员工编制 | DigitalEmployee | 管理侧权威主记录 | id, de_id, type, team_id, position_id, status |
| 技能绑定 | SkillBinding | 数字员工可用能力 | id, de_id, skill_ref, version, enabled |
| 权限 | Permission | 操作授权（RBAC） | id, subject_type, subject_id, action, resource_type |
| 配置 | DEConfig | 运行时参数配置 | id, de_id, config_key, config_value, priority |

### 2.2 Team（团队）

团队是数字员工的组织归属单元，一个团队包含多个岗位和多个数字员工。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | varchar(128) | 团队名称，全局唯一 |
| description | text | 团队描述 |
| owner_user_id | varchar(64) | 团队负责人（管理系统用户 ID） |
| status | enum | active / archived |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 最后更新时间 |

### 2.3 Position（岗位）

岗位定义团队内的职能边界，`role_key` 是运行侧 `de_instances.role` 的**权威来源**。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| team_id | uuid | 所属团队（FK → teams.id） |
| role_key | varchar(64) | 岗位角色标识（planner / executor / reviewer / coordinator / auditor / …） |
| display_name | varchar(128) | 展示名称 |
| description | text | 岗位描述 |
| max_headcount | int | 最大在编人数，NULL 表示不限 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 最后更新时间 |

**预设 role_key 枚举：**

| role_key | 适用类型 | 职责说明 |
|----------|----------|----------|
| planner | build | 规划岗：任务分解、架构决策 |
| executor | build / app | 执行岗：代码实施、业务处理 |
| reviewer | build | 评审岗：质量校验、合规审查 |
| coordinator | app | 协调岗：多 DE 任务协作调度 |
| auditor | app | 审计岗：合规检查、日志分析 |

### 2.4 DigitalEmployee（数字员工编制）

管理侧权威主记录，`de_id` 是全局业务标识，运行侧通过 `de_id` 引用。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 内部主键 |
| de_id | varchar(64) | 业务标识，全局唯一（对应运行侧 de_instances.de_id） |
| name | varchar(128) | 数字员工名称 |
| type | enum | build / app（对齐 RuntimeTaskEnvelope.type） |
| team_id | uuid | 所属团队（FK → teams.id） |
| position_id | uuid | 所在岗位（FK → positions.id） |
| status | enum | draft / active / suspended / retired |
| engine_type | varchar(64) | 引擎类型（opencode / custom） |
| sandbox_spec | jsonb | 沙箱规格配置 |
| model_config | jsonb | 模型选择与参数配置 |
| quota | jsonb | 配额限制（token / 并发 / 频率等） |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 最后更新时间 |

### 2.5 SkillBinding（技能绑定）

记录数字员工被授权使用的能力，运行时能力调用需先校验此表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| de_id | varchar(64) | 关联数字员工（→ digital_employees.de_id） |
| skill_ref | varchar(256) | 能力引用（如 git-operations / code-review / jira-integration） |
| version | varchar(32) | 能力版本，"*" 表示最新 |
| config | jsonb | 能力级别配置参数 |
| enabled | boolean | 是否启用 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 最后更新时间 |

### 2.6 Permission（权限）

多态关联模型，支持对用户 / 数字员工 / 团队授权。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| subject_type | enum | user / de / team |
| subject_id | varchar(64) | 主体 ID（依 subject_type 解析） |
| action | varchar(64) | 操作类型（read / write / execute / admin） |
| resource_type | varchar(64) | 资源类型（team / de / skill / config / …） |
| resource_scope | jsonb | 资源范围（预留 ABAC 扩展，如 {"team_id":"xxx"}） |
| granted_by | varchar(64) | 授权人用户 ID |
| created_at | timestamptz | 授权时间 |

### 2.7 DEConfig（配置）

三级优先级配置：个体 > 团队 > 全局默认，运行侧拉取时合并生效。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| de_id | varchar(64) | 关联数字员工（NULL 表示团队/全局级） |
| config_key | varchar(128) | 配置键 |
| config_value | jsonb | 配置值 |
| source | enum | default / team / individual |
| priority | int | 数值越大优先级越高（default=0 / team=10 / individual=20） |
| updated_at | timestamptz | 最后更新时间 |

### 2.8 ER 关系图

```text
Team ──1:N──> Position
  │                │
  │ 1:N            │ 1:N
  v                v
DigitalEmployee ──1:N──> SkillBinding
  │
  │ 1:N
  v
DEConfig

Permission（多态关联：subject_type + subject_id，独立表，不建物理外键）
```

---

## §3 两类数字员工编制治理

本章定义构建型（build）与应用型（app）两类数字员工在编制治理层面的差异化管理策略。

### 3.1 构建型（build）数字员工

构建型数字员工围绕软件研发全生命周期运转，以**版本制、慢循环**为主要节奏。

| 维度 | 说明 |
|------|------|
| 运作周期 | 版本制（sprint / release cycle），任务周期长 |
| 主要绑定 | 项目 / 代码仓库 |
| 核心配置 | 构建环境配置、版本发布权限、代码访问范围 |
| 典型岗位 | planner（规划岗）· executor（执行岗）· reviewer（评审岗） |
| 配额重点 | token 配额（高消耗）· 并发任务数 · 构建资源配额 |
| 沙箱规格 | 需完整开发工具链（IDE / 编译器 / 测试框架） |
| 现状 | 已在 v0.6.33 实现基础版，本版（v0.7）增强编制治理 |

**典型 model_config 示例（jsonb）：**
```json
{
  "primary_model": "claude-opus-4",
  "fallback_model": "claude-sonnet-4",
  "context_window": 200000,
  "temperature": 0.2
}
```

### 3.2 应用型（app）数字员工

应用型数字员工嵌入业务系统流程，以**任务制、快循环**为主要节奏，是本版（v0.7）核心增量。

| 维度 | 说明 |
|------|------|
| 运作周期 | 任务制（事件驱动），单次任务周期短 |
| 主要绑定 | 业务系统 / 外部服务 |
| 核心配置 | 任务触发规则、人机协同策略、业务数据访问权限 |
| 典型岗位 | executor（业务执行）· coordinator（协调调度）· auditor（审计） |
| 配额重点 | 并发任务数 · API 调用频率 · 业务系统访问权限 |
| 沙箱规格 | 轻量级（HTTP 客户端 / 数据库连接即可） |
| 现状 | 核心增量，本版（v0.7）新立编制治理框架 |

### 3.3 共同管理维度对比

| 维度 | 构建型 | 应用型 | 说明 |
|------|--------|--------|------|
| 团队归属 | 必选 | 必选 | 同一团队共享上下文与配额池 |
| 岗位分配 | 必选 | 必选 | 决定 target_policy 可选范围 |
| 技能绑定 | 按项目配置 | 按业务场景配置 | 能力库调用的准入依据 |
| 权限粒度 | 项目 / 仓库级 | 业务系统 / 数据级 | 权限策略不同 |
| 配额策略 | token / 构建资源 | 并发 / 频率 / 调用量 | 计量单位不同 |
| 模型选择 | 按任务复杂度优选 | 按成本 / 时效平衡 | 通过 model_config 配置 |
| 沙箱规格 | 需开发工具链 | 轻量级即可 | 通过 sandbox_spec 配置 |

### 3.4 数字员工生命周期状态机

```text
             创建
              │
              v
           [draft]
              │ 激活（管理员操作）
              v
           [active] ◄──── 恢复（管理员操作）
              │                   │
              │ 停用               │
              v                   │
         [suspended] ─────────────┘
              │
              │ 退役（不可逆）
              v
          [retired]（终态）
```

**状态说明：**

| 状态 | 说明 | 运行侧影响 |
|------|------|------------|
| draft | 草稿，编制未生效 | 运行侧不可见 |
| active | 在编激活，正常运作 | 运行侧可调度 |
| suspended | 挂起，临时停用 | 运行侧标记 offline，不派发新任务 |
| retired | 退役（终态），编制注销 | 运行侧永久 offline |

---

## §4 PG 管理侧 Schema

本章提供完整可执行的 PostgreSQL DDL，所有表均含字段注释与关键约束。

### 4.1 Schema 初始化

```sql
-- 管理平台独立 schema，与运行侧 schema 隔离
CREATE SCHEMA IF NOT EXISTS mgmt;
SET search_path = mgmt;
```

### 4.2 teams 表

```sql
-- 团队表：数字员工的组织单元，权威主数据
CREATE TABLE mgmt.teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(128) NOT NULL,
    description     TEXT,
    owner_user_id   VARCHAR(64)  NOT NULL,           -- 管理系统用户 ID
    status          VARCHAR(16)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'archived')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT teams_name_unique UNIQUE (name)
);

COMMENT ON TABLE  mgmt.teams                IS '团队表 — 数字员工的组织单元';
COMMENT ON COLUMN mgmt.teams.name           IS '团队名称，全局唯一';
COMMENT ON COLUMN mgmt.teams.owner_user_id  IS '团队负责人（管理后台用户 ID）';
COMMENT ON COLUMN mgmt.teams.status         IS 'active=正常 | archived=归档';

CREATE INDEX idx_teams_status ON mgmt.teams(status);
```

### 4.3 positions 表

```sql
-- 岗位表：团队内的职能定义，role_key 是运行侧 de_instances.role 的权威来源
CREATE TABLE mgmt.positions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id         UUID         NOT NULL REFERENCES mgmt.teams(id) ON DELETE RESTRICT,
    role_key        VARCHAR(64)  NOT NULL,            -- planner/executor/reviewer/coordinator/auditor
    display_name    VARCHAR(128) NOT NULL,
    description     TEXT,
    max_headcount   INT          CHECK (max_headcount IS NULL OR max_headcount > 0),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT positions_team_role_unique UNIQUE (team_id, role_key)
);

COMMENT ON TABLE  mgmt.positions               IS '岗位表 — 团队职能定义，role_key 权威映射运行侧 role';
COMMENT ON COLUMN mgmt.positions.role_key      IS '角色标识，唯一于团队内，映射运行侧 de_instances.role';
COMMENT ON COLUMN mgmt.positions.max_headcount IS '最大在编人数，NULL 表示不限';

CREATE INDEX idx_positions_team_id ON mgmt.positions(team_id);
```

### 4.4 digital_employees 表

```sql
-- 数字员工编制表：管理侧权威主记录，de_id 全局唯一
CREATE TABLE mgmt.digital_employees (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    de_id           VARCHAR(64)  NOT NULL,            -- 业务标识，对应运行侧 de_instances.de_id
    name            VARCHAR(128) NOT NULL,
    type            VARCHAR(16)  NOT NULL CHECK (type IN ('build', 'app')),
    team_id         UUID         NOT NULL REFERENCES mgmt.teams(id) ON DELETE RESTRICT,
    position_id     UUID         NOT NULL REFERENCES mgmt.positions(id) ON DELETE RESTRICT,
    status          VARCHAR(16)  NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'active', 'suspended', 'retired')),
    engine_type     VARCHAR(64)  NOT NULL DEFAULT 'opencode',
    sandbox_spec    JSONB        NOT NULL DEFAULT '{}',
    model_config    JSONB        NOT NULL DEFAULT '{}',
    quota           JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT digital_employees_de_id_unique UNIQUE (de_id)
);

COMMENT ON TABLE  mgmt.digital_employees             IS '数字员工编制表 — 管理侧权威主数据';
COMMENT ON COLUMN mgmt.digital_employees.de_id       IS '业务标识，全局唯一，对应运行侧 de_instances.de_id';
COMMENT ON COLUMN mgmt.digital_employees.type        IS 'build=构建型 | app=应用型';
COMMENT ON COLUMN mgmt.digital_employees.status      IS 'draft/active/suspended/retired';
COMMENT ON COLUMN mgmt.digital_employees.sandbox_spec IS '沙箱规格 JSON，如工具链列表、资源限制';
COMMENT ON COLUMN mgmt.digital_employees.model_config IS '模型配置 JSON，如 primary_model/temperature';
COMMENT ON COLUMN mgmt.digital_employees.quota        IS '配额 JSON，如 daily_token_limit/max_concurrency';

CREATE INDEX idx_de_team_id     ON mgmt.digital_employees(team_id);
CREATE INDEX idx_de_position_id ON mgmt.digital_employees(position_id);
CREATE INDEX idx_de_status      ON mgmt.digital_employees(status);
CREATE INDEX idx_de_type        ON mgmt.digital_employees(type);
```

### 4.5 skill_bindings 表

```sql
-- 技能绑定表：记录数字员工被授权使用的能力
CREATE TABLE mgmt.skill_bindings (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    de_id       VARCHAR(64)  NOT NULL,                -- → digital_employees.de_id（逻辑关联）
    skill_ref   VARCHAR(256) NOT NULL,                -- 能力引用标识
    version     VARCHAR(32)  NOT NULL DEFAULT '*',    -- * 表示最新版本
    config      JSONB        NOT NULL DEFAULT '{}',
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT skill_bindings_de_skill_unique UNIQUE (de_id, skill_ref)
);

COMMENT ON TABLE  mgmt.skill_bindings           IS '技能绑定表 — 记录 DE 可用能力授权';
COMMENT ON COLUMN mgmt.skill_bindings.skill_ref IS '能力库引用，如 git-operations/code-review';
COMMENT ON COLUMN mgmt.skill_bindings.version   IS '绑定版本，* 表示跟随最新';
COMMENT ON COLUMN mgmt.skill_bindings.config    IS '能力级配置参数，覆盖全局默认值';

CREATE INDEX idx_skill_bindings_de_id ON mgmt.skill_bindings(de_id);
```

### 4.6 permissions 表

```sql
-- 权限表：RBAC 基线，多态关联（user/de/team），预留 ABAC 扩展
CREATE TABLE mgmt.permissions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type    VARCHAR(16)  NOT NULL CHECK (subject_type IN ('user', 'de', 'team')),
    subject_id      VARCHAR(64)  NOT NULL,
    action          VARCHAR(64)  NOT NULL,            -- read/write/execute/admin
    resource_type   VARCHAR(64)  NOT NULL,            -- team/de/skill/config/audit
    resource_scope  JSONB        NOT NULL DEFAULT '{}', -- ABAC 扩展，如 {"team_id":"xxx"}
    granted_by      VARCHAR(64)  NOT NULL,            -- 授权人用户 ID
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT permissions_unique UNIQUE (subject_type, subject_id, action, resource_type)
);

COMMENT ON TABLE  mgmt.permissions                IS '权限表 — RBAC 基线，预留 ABAC 扩展';
COMMENT ON COLUMN mgmt.permissions.subject_type   IS 'user=管理用户 | de=数字员工 | team=团队';
COMMENT ON COLUMN mgmt.permissions.resource_scope IS 'ABAC 扩展字段，存储属性条件（jsonb）';

CREATE INDEX idx_permissions_subject ON mgmt.permissions(subject_type, subject_id);
CREATE INDEX idx_permissions_resource ON mgmt.permissions(resource_type);
```

### 4.7 de_configs 表

```sql
-- 配置表：三级优先级（default < team < individual），运行侧拉取时合并生效
CREATE TABLE mgmt.de_configs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    de_id           VARCHAR(64),                      -- NULL 表示团队级或全局默认
    config_key      VARCHAR(128) NOT NULL,
    config_value    JSONB        NOT NULL,
    source          VARCHAR(16)  NOT NULL DEFAULT 'default'
                        CHECK (source IN ('default', 'team', 'individual')),
    priority        INT          NOT NULL DEFAULT 0,  -- default=0 / team=10 / individual=20
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  mgmt.de_configs            IS '配置表 — 三级优先级，个体>团队>默认';
COMMENT ON COLUMN mgmt.de_configs.de_id      IS 'NULL 表示团队级/全局配置，非 NULL 绑定特定 DE';
COMMENT ON COLUMN mgmt.de_configs.source     IS 'default=全局默认 | team=团队级 | individual=个体覆盖';
COMMENT ON COLUMN mgmt.de_configs.priority   IS '数值越大优先级越高';

CREATE INDEX idx_de_configs_de_id      ON mgmt.de_configs(de_id);
CREATE INDEX idx_de_configs_source     ON mgmt.de_configs(source);
CREATE INDEX idx_de_configs_config_key ON mgmt.de_configs(config_key);
```

### 4.8 与运行侧表的映射关系

> 注意：管理侧与运行侧是跨 schema 的逻辑关联，不建物理外键，通过事件同步或 API 拉取保持一致。

| 管理侧表 | 管理侧字段 | 运行侧表（runtime schema） | 运行侧字段 | 关系 |
|----------|------------|---------------------------|------------|------|
| teams | id | de_instances | team_id | 权威 → 引用副本 |
| positions | role_key | de_instances | role | 权威 → 引用副本 |
| digital_employees | de_id | de_instances | de_id | 权威 → 引用副本 |
| digital_employees | type | de_instances | type | 权威 → 引用副本 |
| digital_employees | status | de_instances | status | 同步（suspended → offline） |
| de_configs | config_value | — | 运行侧缓存 | 拉取合并，非持久化 |

### 4.9 设计决策记录

| 决策 | 说明 |
|------|------|
| 逻辑外键代替物理外键 | teams / positions / digital_employees 与运行侧 de_instances 跨 schema，不建物理外键，通过 NATS 事件 + 拉取兜底保持一致 |
| permissions 多态关联 | 用 subject_type + subject_id 代替独立关联表，M1 阶段简化实现，M2 可按需拆分 |
| de_configs 三级优先级 | default / team / individual 通过 priority 字段排序，运行侧拉取时取最高优先级生效值 |
| de_id 使用业务标识 | 便于跨系统引用，同时保留内部 uuid 主键隔离业务语义与存储语义 |

---

## §5 管理平台 API 契约

本章定义管理平台对外暴露的 RESTful API，按资源分组，列出路径 / 方法 / 核心字段 / 调用方。

### 5.1 团队管理 /api/v1/teams

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /api/v1/teams | 列出所有团队（分页） | page, size, status | super_admin, team_admin |
| POST | /api/v1/teams | 创建团队 | name, description, owner_user_id | super_admin |
| GET | /api/v1/teams/{teamId} | 获取团队详情 | — | super_admin, team_admin, auditor |
| PUT | /api/v1/teams/{teamId} | 更新团队信息 | name, description, owner_user_id | super_admin, team_admin |
| POST | /api/v1/teams/{teamId}/archive | 归档团队 | — | super_admin |
| GET | /api/v1/teams/{teamId}/members | 列出团队数字员工 | status, type | super_admin, team_admin, auditor |

### 5.2 岗位管理 /api/v1/teams/{teamId}/positions

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /positions | 列出团队岗位 | — | team_admin, auditor |
| POST | /positions | 创建岗位 | role_key, display_name, max_headcount | team_admin |
| GET | /positions/{positionId} | 获取岗位详情 | — | team_admin, auditor |
| PUT | /positions/{positionId} | 更新岗位信息 | display_name, description, max_headcount | team_admin |
| DELETE | /positions/{positionId} | 删除岗位（需无在编成员） | — | super_admin |

### 5.3 数字员工编制 /api/v1/digital-employees

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /api/v1/digital-employees | 列出数字员工（分页） | team_id, type, status | super_admin, team_admin |
| POST | /api/v1/digital-employees | 创建数字员工编制 | de_id, name, type, team_id, position_id, engine_type, sandbox_spec, model_config, quota | team_admin |
| GET | /api/v1/digital-employees/{deId} | 获取编制详情 | — | team_admin, auditor |
| PUT | /api/v1/digital-employees/{deId} | 更新编制信息 | name, team_id, position_id, sandbox_spec, model_config, quota | team_admin |
| POST | /api/v1/digital-employees/{deId}/activate | 激活（draft→active） | — | team_admin |
| POST | /api/v1/digital-employees/{deId}/suspend | 停用（active→suspended） | reason | team_admin |
| POST | /api/v1/digital-employees/{deId}/resume | 恢复（suspended→active） | — | team_admin |
| POST | /api/v1/digital-employees/{deId}/retire | 退役（终态，不可逆） | reason | super_admin |

> **关键约束**：创建 / 变更 / 状态转换操作完成后，管理平台须发布 NATS 事件通知运行侧同步。

### 5.4 技能绑定 /api/v1/digital-employees/{deId}/skills

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /skills | 列出该 DE 的技能绑定 | — | team_admin, auditor |
| POST | /skills | 绑定技能 | skill_ref, version, config | team_admin |
| PUT | /skills/{skillId} | 更新技能配置 | version, config, enabled | team_admin |
| DELETE | /skills/{skillId} | 解除技能绑定 | — | team_admin |

### 5.5 权限管理 /api/v1/permissions

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /api/v1/permissions | 查询权限列表 | subject_type, subject_id, resource_type | super_admin, auditor |
| POST | /api/v1/permissions | 授予权限 | subject_type, subject_id, action, resource_type, resource_scope | super_admin |
| DELETE | /api/v1/permissions/{permissionId} | 撤销权限 | — | super_admin |
| POST | /api/v1/permissions/check | 检查权限（点查） | subject_type, subject_id, action, resource_type, resource_scope | 内部服务 |

### 5.6 配置管理 /api/v1/digital-employees/{deId}/configs

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /configs | 查询该 DE 的配置（含继承链） | include_inherited | team_admin, auditor |
| PUT | /configs/{configKey} | 设置个体级配置 | config_value | team_admin |
| DELETE | /configs/{configKey} | 删除个体级配置（回退到上层） | — | team_admin |
| GET | /configs/{configKey}/chain | 查看继承链（default→team→individual） | — | team_admin, auditor |

### 5.7 运行侧同步接口（供运行平台调用）

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| GET | /api/v1/sync/digital-employees/{deId} | 拉取编制快照 | — | 运行平台 API 服务 / Scheduler |
| GET | /api/v1/sync/teams/{teamId}/members | 拉取团队成员列表 | status, type | 运行平台 API 服务 |
| GET | /api/v1/sync/teams/{teamId}/positions | 拉取团队岗位列表 | — | 运行平台 Scheduler |
| GET | /api/v1/sync/digital-employees/{deId}/configs | 拉取合并后的配置（三级合并结果） | — | 运行平台 DE Worker |

**同步快照响应结构示例（GET /sync/digital-employees/{deId}）：**
```json
{
  "de_id": "de-build-001",
  "name": "代码评审员 Alpha",
  "type": "build",
  "team_id": "team-backend-uuid",
  "role": "reviewer",
  "status": "active",
  "model_config": { "primary_model": "claude-opus-4", "temperature": 0.2 },
  "quota": { "daily_token_limit": 500000, "max_concurrency": 3 },
  "skills": ["git-operations", "code-review"],
  "snapshot_at": "2026-06-07T10:00:00Z"
}
```

### 5.8 AuthContext 颁发 /api/v1/auth/context

| 方法 | 路径 | 说明 | 核心字段 | 调用方 |
|------|------|------|----------|--------|
| POST | /api/v1/auth/context | 为 DE 颁发 authContext | de_id, session_id, requested_scopes | 运行平台（DE 启动时调用） |
| POST | /api/v1/auth/context/refresh | 续期 authContext | session_token | 运行平台 |
| DELETE | /api/v1/auth/context/{sessionToken} | 撤销 authContext | — | 运行平台 / 超级管理员 |

**authContext 响应结构：**
```json
{
  "actorId": "de-build-001",
  "teamId": "team-backend-uuid",
  "role": "reviewer",
  "permissions": ["read:repo", "write:comment", "execute:ci-check"],
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-06-07T14:00:00Z"
}
```

---

## §6 权限与安全

本章定义管理平台的 RBAC 权限模型、权限传递机制与安全基线。

### 6.1 RBAC 角色层级

```text
super_admin（全局）
  └── team_admin（团队范围）
        └── auditor（只读审计）
              └── viewer（有限查看）
```

### 6.2 权限集定义矩阵

| action × resource_type | team | de | position | skill | config | permission | audit_log |
|-----------------------|------|----|----------|-------|--------|------------|-----------|
| super_admin | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Read |
| team_admin | ✅ Read/Update（本团队） | ✅ CRUD（本团队） | ✅ CRUD（本团队） | ✅ CRUD（本团队） | ✅ CRUD（本团队） | ❌ | ✅ Read（本团队） |
| auditor | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| viewer | ✅ Read（摘要） | ✅ Read（摘要） | ✅ Read | ❌ | ❌ | ❌ | ❌ |

### 6.3 ABAC 扩展预留

`Permission.resource_scope`（jsonb）存储属性条件，M2 阶段可激活：

```json
// 仅允许访问特定团队的数字员工
{ "team_id": "team-backend-uuid" }

// 仅允许访问特定类型
{ "de_type": "build" }

// 组合条件
{ "team_id": "team-backend-uuid", "de_status": "active" }
```

### 6.4 权限传递：管理平台 → 运行平台

```text
1. DE Worker 启动
      │
      v
2. 运行平台调用 POST /api/v1/auth/context
   （携带 de_id + session_id + requested_scopes）
      │
      v
3. 管理平台查询 digital_employees + permissions 表
   生成 authContext（actorId / teamId / role / permissions / sessionToken / expiresAt）
      │
      v
4. 运行平台 API 校验每次请求携带的 sessionToken
      │
      v
5. authContext 到期前 15 分钟，运行平台调用 /auth/context/refresh 续期
      │
      v
6. DE Worker 退出或超时，运行平台调用 DELETE /auth/context/{sessionToken} 撤销
```

### 6.5 审计日志

```sql
CREATE TABLE mgmt.audit_logs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    who             VARCHAR(64)  NOT NULL,    -- 操作者（user_id 或 de_id）
    who_type        VARCHAR(16)  NOT NULL CHECK (who_type IN ('user', 'de', 'system')),
    action          VARCHAR(128) NOT NULL,    -- 操作动作（如 de.activate / team.create）
    resource_type   VARCHAR(64)  NOT NULL,
    resource_id     VARCHAR(64)  NOT NULL,
    before_state    JSONB,                    -- 变更前快照
    after_state     JSONB,                    -- 变更后快照
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_who         ON mgmt.audit_logs(who, who_type);
CREATE INDEX idx_audit_logs_resource    ON mgmt.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at  ON mgmt.audit_logs(created_at DESC);
```

**审计策略：**

| 策略项 | 规则 |
|--------|------|
| 覆盖范围 | 所有编制变更（team / position / de CRUD 及状态变更）必须记录 |
| 记录时机 | 操作成功后同步写入，失败操作不记录（可选记录 failed 事件） |
| 保留期限 | 默认 180 天，super_admin 可调整 |
| 不可篡改 | audit_logs 不提供 UPDATE / DELETE API，过期数据归档到冷存储 |

### 6.6 安全基线

| 规则 | 说明 |
|------|------|
| 管理平台 API 强制认证 | 所有管理 API 需携带有效管理员 token（JWT / OAuth2） |
| DE 不可修改编制 | 数字员工的 authContext 权限集中不包含任何 mgmt schema 写入权限 |
| 跨团队操作需 super_admin | team_admin 权限范围严格限定在本团队，越权请求返回 403 |
| 敏感配置加密存储 | de_configs 中含 credentials 类 key 的配置值加密存储 |
| 审计日志不可删除 | audit_logs 表不暴露删除 API，防止操作回溯被破坏 |

---

## §7 与运行平台的数据同步

本章定义管理平台到运行平台的数据同步链路、事件契约与一致性保证策略。

### 7.1 同步链路总览

```text
管理平台写入（teams / positions / digital_employees 变更）
  │
  ├─── 主动推送（NATS）
  │       │
  │       v
  │    NATS Subjects: mgmt.employee.* / mgmt.team.* / mgmt.config.*
  │       │
  │       v
  │    运行侧 API 服务订阅 → 更新 de_instances 引用副本
  │
  └─── 兜底拉取
          │
          v
       运行侧 Scheduler 每 5 分钟调用 /api/v1/sync/* 拉取校验
       （NATS 不可用时降级为纯拉取模式）
```

### 7.2 同步事件契约

| 管理侧变更操作 | NATS Subject | Payload 关键字段 | 运行侧影响 |
|----------------|--------------|------------------|------------|
| 新建数字员工（active） | mgmt.employee.created | de_id, type, team_id, role, model_config, quota | 运行侧 de_instances 新增记录 |
| 变更团队 / 岗位分配 | mgmt.employee.updated | de_id, team_id, role | 更新 de_instances.team_id / role |
| 变更配额 / 模型配置 | mgmt.config.updated | de_id, config_key, merged_config | 运行侧 Scheduler 刷新配额缓存 |
| 停用数字员工 | mgmt.employee.suspended | de_id, reason | 运行侧标记 de_instances.status=offline，停止新任务派发 |
| 恢复数字员工 | mgmt.employee.resumed | de_id | 运行侧恢复 de_instances.status=idle |
| 退役数字员工 | mgmt.employee.retired | de_id, reason | 运行侧永久标记 offline，清理相关资源 |
| 新建 / 更新团队 | mgmt.team.updated | team_id, name, status | 运行侧更新 team 引用缓存 |

**NATS 消息结构示例（mgmt.employee.created）：**
```json
{
  "event": "mgmt.employee.created",
  "version": "1",
  "timestamp": "2026-06-07T10:00:00Z",
  "payload": {
    "de_id": "de-app-002",
    "name": "客服协调员 Beta",
    "type": "app",
    "team_id": "team-cs-uuid",
    "role": "coordinator",
    "status": "active",
    "model_config": { "primary_model": "claude-sonnet-4" },
    "quota": { "max_concurrency": 10, "daily_api_calls": 5000 }
  }
}
```

### 7.3 一致性保证

| 策略项 | 规则 |
|--------|------|
| 一致性级别 | 最终一致（eventual consistency）—— 接受毫秒到分钟级延迟 |
| NATS 不可用降级 | 运行侧使用本地缓存继续执行，不阻塞已派发任务 |
| 兜底拉取 | 运行侧 Scheduler 每 5 分钟全量拉取一次，与管理侧 /sync API 校验 |
| 冲突策略 | 管理侧为数据权威，运行侧引用副本以管理侧为准（运行侧被覆盖） |
| 同步幂等 | NATS 消息可重复消费，运行侧按 de_id 做幂等处理（upsert） |
| 强制一致触发 | super_admin 可调用 POST /api/v1/sync/force 触发全量同步 |

---

## §8 设计边界与演进

本章明确管理平台的 M1 范围边界与 M2 扩展方向，以及与运营平台的接口预留。

### 8.1 M1 优先实现范围（本版 v0.7）

| 功能模块 | M1 交付内容 | 说明 |
|----------|------------|------|
| 团队管理 | CRUD + 归档 + 成员列表 | 基础编制治理入口 |
| 岗位管理 | CRUD + 人数管理 | 职能边界定义 |
| 数字员工编制 | CRUD + 生命周期状态机 | 管理侧权威主数据 |
| RBAC 权限基线 | 四级角色 + 权限矩阵 | 安全治理基础 |
| AuthContext 颁发 | 颁发 + 续期 + 撤销 | 运行侧 DE 鉴权 |
| 运行侧同步 | NATS 推送 + 拉取兜底 | 数据一致性保障 |
| 审计日志 | 编制变更全记录 | 合规基础 |

### 8.2 M2 扩展方向

| 扩展模块 | 说明 | 优先级 |
|----------|------|--------|
| 技能市场（Skill Marketplace） | 能力库统一治理、版本管理、发布审批 | 高 |
| 配额策略引擎 | 动态配额、团队配额池、超额报警 | 高 |
| 审计看板 | 编制变更可视化、操作追踪 | 中 |
| ABAC 扩展 | 激活 resource_scope 的属性条件评估 | 中 |
| 批量编制变更 | 批量导入 / 变更 / 迁移 | 低 |
| 数字员工模板 | 标准化编制模板库 | 低 |

### 8.3 与运营平台接口预留

运营平台（SDD-DE-OPERATIONS-PLATFORM-v0.7.md）读取管理编制数据进行人效分析，不修改编制。预留接口如下：

| 接口 | 方法 | 说明 | M1 状态 |
|------|------|------|---------|
| /api/v1/stats/headcount | GET | 按团队 / 类型 / 状态统计在编人数 | 预留，M2 实现 |
| /api/v1/stats/utilization | GET | 编制利用率统计（需结合运行侧数据） | 预留，M2 实现 |
| /api/v1/export/employees | GET | 导出编制数据（供运营平台 ETL） | 预留，M2 实现 |

### 8.4 已知限制（M1）

| 限制项 | 影响 | 计划解决版本 |
|--------|------|-------------|
| 技能绑定 API 已定义但技能市场未就绪 | 能力库校验不完整 | M2 |
| ABAC resource_scope 已预留但评估逻辑未实现 | 精细权限控制不可用 | M2 |
| 审计看板仅提供原始日志查询 | 无可视化趋势分析 | M2 |

---

## 附录 A — 术语映射表

本附录对齐管理平台术语与架构总纲、运行平台、PRD 之间的语义映射。

| 管理平台术语 | 架构总纲（SDD-DEOS） | 运行平台（SDD-DE-RUNTIME） | PRD（PRD-v0.7） |
|-------------|--------------------|-----------------------------|-----------------|
| Team | 团队 | de_instances.team_id | 团队管理 |
| Position | 岗位 | de_instances.role | 岗位管理 |
| DigitalEmployee（编制记录） | 数字员工（逻辑实体） | de_instances（运行实例） | 两类数字员工 |
| role_key | 岗位角色标识 | target_policy.role | 角色定义 |
| de_id | 数字员工业务标识 | de_instances.de_id / target_policy.deId | 数字员工 ID |
| authContext | 运行授权上下文 | authContext（随任务信封传递） | 权限管理 |
| SkillBinding | 能力授权 | 能力库调用准入 | 技能管理 |
| DEConfig | 运行参数配置 | 运行侧配额缓存 | 配置管理 |
| status: active | 在编激活 | de_instances.status: idle / busy | 在线 |
| status: suspended | 挂起停用 | de_instances.status: offline | 离线 |
| status: retired | 退役（终态） | de_instances.status: offline（永久） | 注销 |
| mgmt.employee.created | — | 新建 de_instances 触发事件 | — |
| mgmt.employee.suspended | — | de_instances 下线事件 | — |
| super_admin | 全局管理员 | — | 超级管理员 |
| team_admin | 团队管理员 | — | 团队管理员 |
| authContext.sessionToken | — | DE Worker 鉴权令牌 | — |
