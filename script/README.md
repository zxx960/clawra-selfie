# 脚本文件

本目录包含 Clawra 自拍技能的脚本实现。

## 文件说明

### `jimeng-edit-send.js`
JavaScript 实现，用于通过既梦4.0 API 编辑图像并发送到 OpenClaw 渠道。

**依赖安装：**
```bash
npm install form-data
```

**运行：**
```bash
node script/jimeng-edit-send.js
```

## 注意事项

- 确保设置了 `JIMENG_API_KEY` 环境变量
- 确保参考图像文件存在于 `./assets/clawra.png`
- 确保 OpenClaw Gateway 正在运行
