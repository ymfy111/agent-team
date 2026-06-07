# 企业级 AI 编程平台四层架构图生成说明

本文档用于提供给 ChatGPT / GPT-Image-2 生成 16:9 技术架构图。

## 生成目标

生成一张企业级 AI 编程平台技术架构图,用于技术方案 PPT 或汇报材料。

- 图片比例:16:9 横版
- 图片风格:企业级技术架构 PPT
- 画面语言:中文
- 核心结构:四层横向泳道 + 右侧横切能力栏 + 底部代码仓库栏
- 参考风格:`/mnt/d/download/智能体架构.png`

## 参考风格要求

请参考企业架构图的视觉风格:

- 白色背景
- 浅蓝色分区
- 深蓝色大标题
- 左侧编号分层泳道
- 中间模块卡片和连接箭头
- 右侧竖向“横切能力”栏
- 底部深蓝色 Repository 栏
- 圆角卡片
- 细蓝边框
- 扁平线性图标
- 整体清爽、严肃、适合企业技术汇报

不要使用:

- 暗黑背景
- 复杂 3D 效果
- 卡通插画风
- 过度拟物风格
- 过密的小字

## 架构内容说明

### 第一层:使用主体层

包含三个入口主体:

- 普通用户:通过浏览器进行 Web AI 编程
- 管理员用户:管理用户、Device、工作区和模型分配
- 其它智能体:通过 API 调用系统接口

三类主体统一进入第二层的 APISIX 接入网关和 backend REST API。

### 第二层:后台服务与网关层

该层是平台的核心控制层,对应工程里的 `backend`、`gateway` 和 LiteLLM 相关模块。

主要模块:

- APISIX 接入网关:SSL、WAF、限流、WSS 路由
- Yamux Gateway:deviceId 路由表、WSS 反向隧道、双向流复用
- backend REST API:账号、Device、工作区、模型、会话、审计
- LiteLLM Proxy:统一模型入口、账号级路由、配额、Token 计费
- PostgreSQL:用户、Device、工作区、分配关系、会话
- Redis:会话状态、缓存、限流
- MinIO:附件、大消息体、审计归档

关键说明:

- 云端只做路由、控制和审计
- 云端不保存用户项目代码
- daemon 禁止本机直连 LLM,统一走云端 LiteLLM

### 第三层:Device 设备层

包含多种设备:

- 个人电脑 Device
- 服务器 Device
- 更多 Device

每个 Device 内部包含:

- daemon 系统服务
- OpenCode Core
- File / Bash / Git / MCP 工具
- 本机资源

连接关系:

- Device 通过 WSS / Yamux 反向隧道连接 Yamux Gateway
- Device 通过网关向 backend 注册并保持心跳
- Web 编程请求通过网关路由到指定 Device 上的 daemon

### 第四层:工作区 / 沙箱层

工作区从 Device 上由管理员创建。

包含多个工作区:

- Workspace A
- Workspace B
- Workspace C

关键说明:

- 工作区由管理员在 Device 上创建
- 管理员可以创建新用户
- 管理员可以分配用户能使用的具体 Device
- 管理员可以分配用户能使用的具体工作区
- 管理员可以分配用户能使用的具体模型
- 普通用户只能访问被授权的 Device、工作区和模型
- 代码留在设备本地,不上传云端

## 右侧横切能力栏

右侧竖向栏标题为“横切能力”,包含以下能力卡片:

- RBAC 权限控制
- SSO / OIDC
- Device 指纹
- 账号-Device-工作区绑定
- 模型分配
- API Key
- 会话审计
- 限流与配额
- 资产 / 插件分发

## 底部代码仓库栏

底部深蓝色栏标题:

`代码仓库组织 Repository`

包含以下模块:

- backend
- gateway
- daemon
- litellm-config
- web/admin
- deploy
- docs

## 箭头颜色规则

- 蓝色箭头:HTTP / REST API 请求
- 紫色箭头:WSS / Yamux 反向隧道
- 绿色箭头:LLM 调用
- 橙色箭头:管理 / 授权 / 分配关系
- 灰色虚线:审计 / 状态同步

## 推荐 GPT-Image-2 Prompt

```text
生成一张 16:9 横版中文企业级技术架构图,风格参考企业架构 PPT:白底、浅蓝分区、深蓝标题、圆角卡片、细蓝边框、扁平线性图标、清晰中文文字。

标题:
企业级 AI 编程平台 技术架构图

副标题:
Go Backend + LiteLLM + Yamux Gateway + Daemon + PostgreSQL

整体布局:
顶部标题区。
中间为四层横向泳道,左侧有编号 1-4。
右侧为竖向“横切能力”栏。
底部为深蓝色“代码仓库组织 Repository”栏。

第 1 层:使用主体层
放三个卡片:
普通用户
管理员用户
其它智能体
三者通过蓝色箭头进入第二层。

第 2 层:后台服务与网关层
放核心模块卡片:
APISIX 接入网关
Yamux Gateway
backend REST API
LiteLLM Proxy
PostgreSQL
Redis
MinIO

在该层标注:
云端只做路由 + 控制 + 审计,不存代码

连接关系:
APISIX 连接 backend REST API 和 Yamux Gateway。
backend REST API 连接 PostgreSQL / Redis / MinIO。
LiteLLM Proxy 连接外部模型 Claude / GPT / Qwen / DeepSeek。
Yamux Gateway 向下连接 Device。

第 3 层:Device 设备层
放三个设备卡片:
个人电脑 Device
服务器 Device
更多 Device

每个设备卡片内部写:
daemon
OpenCode Core
File / Bash / Git / MCP 工具

从 Device 到 Yamux Gateway 画紫色箭头,标注:
WSS / Yamux 反向隧道
Device 注册与心跳

旁边标注:
daemon 禁止本机直连 LLM,统一走云端 LiteLLM

第 4 层:工作区 / 沙箱层
放三个工作区卡片:
Workspace A
Workspace B
Workspace C

每个 Workspace 与上方 Device 相连。
在该层标注:
工作区由管理员在 Device 上创建
用户按授权访问
代码留在设备本地

从管理员用户画橙色箭头到工作区层,标注:
创建工作区 / 分配用户 / 分配 Device / 分配模型

右侧竖向栏:
标题为“横切能力”
包含以下能力卡片:
RBAC 权限控制
SSO / OIDC
Device 指纹
账号-Device-工作区绑定
模型分配
API Key
会话审计
限流与配额
资产 / 插件分发

底部深蓝仓库栏:
代码仓库组织 Repository
backend | gateway | daemon | litellm-config | web/admin | deploy | docs

箭头颜色:
蓝色表示 HTTP / API 请求
紫色表示 WSS / Yamux 反向隧道
绿色表示 LLM 调用
橙色表示管理 / 授权关系
灰色虚线表示审计 / 状态同步

视觉要求:
整体像严肃的企业级技术架构图,不要像卡通插画。
信息密度适中,卡片留白充足。
所有中文尽量清晰可读。
不要暗黑背景,不要 3D 效果。
```

## 二次修复 Prompt

如果第一次生成的图片布局正确但文字不清晰,可以使用下面的二次编辑提示词:

```text
基于当前图片进行编辑,保持布局、颜色、箭头和模块位置不变,只优化文字和排版。

请修正为以下结构:
标题:企业级 AI 编程平台 技术架构图
四层:使用主体层、后台服务与网关层、Device 设备层、工作区 / 沙箱层
右侧栏:横切能力
底部栏:代码仓库组织 Repository

要求:
中文文字清晰端正。
不要新增无关模块。
不要改变 16:9 横版架构图布局。
保持企业级 PPT 架构图风格。
```

## 使用建议

建议先用推荐 Prompt 生成整体布局。如果中文小字不稳定,再使用二次修复 Prompt 保持布局并优化文字。

推荐输出文件名:

`enterprise-ai-coding-platform-architecture-16x9.png`
