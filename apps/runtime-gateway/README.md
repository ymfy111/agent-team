# Runtime Gateway Mock

本目录提供 RuntimeGateway API 最小 mock，用于验证运行网关契约和前端/平台调用边界。

## 启动

```bash
npm start
```

默认监听 `4090`，可通过 `PORT` 环境变量覆盖。

## 验证

```bash
npm run smoke
```

## 边界

- 仅做 register / heartbeat / capabilities / assignment / workspace / execution session / orchestrator session / runtime node / diagnostics 的 mock 状态流。
- 不真实启动 ORCH 或 OpenCode。
- 不承担 ORCH 的任务调度逻辑。
