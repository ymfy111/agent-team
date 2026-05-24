# TF-P0B-05 Avatar Base64 Fallback 移除与资源路径回归总结

## 结论

通过。原始原型和迁移后的 apps/web 均已移除头像 base64 fallback，头像改为直接引用 `pic/avatars/*.png` 静态图片，默认兜底使用 `pic/avatars/avatar-default.png`。

## 原型 slim 结果

| 指标 | 原始原型 | slim 原型 |
|---|---:|---:|
| HTML 大小 | 4,402,872 bytes | 1,124,952 bytes |
| 减少体积 | - | 3,277,920 bytes |
| data:image 次数 | 43 | 7 |
| base64 次数 | 38 | 1 |

slim 原型路径：

`prototype_slim/prototypes/agent-team-v0.6.33.45-prototype-slim.html`

## apps/web 同步结果

| 指标 | 处理前 | 处理后 |
|---|---:|---:|
| prototype-runtime.js 大小 | 3,998,127 bytes | 720,208 bytes |
| 减少体积 | - | 3,277,919 bytes |
| data:image 次数 | 43 | 7 |
| base64 次数 | 38 | 1 |

## QA 结果

`python tools/sandbox_verify.py`：PASS

关键指标：

- teamCards：5
- masters：5
- workers：17
- brokenImages：0
- pageErrors：0
- httpErrors：0
- 7 个菜单页面切换：PASS

## QA 脚本同步修复

移除 base64 后，离屏 `loading=lazy` 的大头像不会立即加载；旧 QA 把“未进入视口导致尚未加载”的图片误判为 broken。已修正为：仅当图片完成加载且 `naturalWidth === 0` 时判定破图。

## 后续迁移规则建议

1. 迁移流程禁止把 `data:image/base64` 头像 fallback 搬入 `prototype-runtime.js`。
2. 头像统一使用 `pic/avatars/*.png` 静态资源。
3. 默认兜底使用 `pic/avatars/avatar-default.png`。
4. 打包时必须包含 `pic/avatars/`。
5. QA 对懒加载图片要区分“尚未加载”和“加载失败”。

## 风险说明

当前不再支持“单 HTML 文件脱离 pic/ 目录独立打开仍显示头像”的场景；这是有意取舍。当前阶段目标是工程化交付和 Nginx/静态容器部署，静态资源目录应随 HTML 一起交付。
