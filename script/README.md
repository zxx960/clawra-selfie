# 脚本文件

本目录包含 Clawra 自拍技能的脚本实现。

## 文件说明

### `jimeng-edit-send.js`
JavaScript 实现，用于通过 ARK API 编辑图像，下载到本地后发送到 OpenClaw 渠道。

**依赖安装：**
```bash
# 无需额外依赖，使用内置模块
```

**运行：**
```bash
node script/jimeng-edit-send.js
```

## 注意事项

- 确保设置了 `ARK_API_KEY` 环境变量
- 确保参考图像文件存在于 `./assets/clawra.png`
- 确保 OpenClaw Gateway 正在运行
- 脚本会自动创建 `./temp` 目录用于存储下载的图片
- 生成的图片文件名格式：`clawra-YYYY-MM-DDTHH-MM-SS.png`
