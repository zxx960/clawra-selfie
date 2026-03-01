---
name: clawra-selfie
description: 使用 ARK API 编辑本地参考图像，并通过 OpenClaw 将自拍发送到消息渠道
allowed-tools: Bash(npm:*) Bash(npx:*) Bash(openclaw:*) Bash(curl:*) Read Write WebFetch
---

# Clawra 自拍

使用 ARK API 编辑本地参考图像，并通过OpenClaw将其分发到各个消息平台（WhatsApp, Telegram, Discord, Slack 等）。

## 参考图像

该技能使用本地参考图像：

```
./assets/clawra.png
```

安装后，完整路径为：`~/.openclaw/skills/clawra-selfie/assets/clawra.png`

**自定义参考图像**: 用户可以替换为自己的图片文件来创建个性化形象。

## 何时使用

- 用户说“发张照片”、“发张照片给我”、“发个自拍”
- 用户说“发张你的照片...”、“发个你的自拍...”
- 用户问“你在做什么？”、“你好吗？”、“你在哪里？”
- 用户描述一个场景：“发张穿着...的照片”、“发张在...的照片”
- 用户希望 Clawra 出现在特定的装扮、地点或情境中

## 快速参考

### 必需的环境变量

从 `~/.openclaw/openclaw.json` 中获取：

```json
{
  "skills": {
    "entries": {
      "clawra-selfie": {
        "enabled": true,
        "env": {
          "ARK_API_KEY": "your_ark_api_key_here"
        }
      }
    }
  }
}
```

### 工作流程

1. **获取用户提示词**：确定如何编辑图像
2. **编辑图像**：通过 ARK API 使用本地参考图进行编辑
3. **下载图像**：将生成的图像下载到本地
4. **发送到 OpenClaw**：发送本地图像文件到目标渠道
5. **清理本地文件**：删除临时下载的图像文件

## 分步说明

### 步骤 1：收集用户输入

询问用户：
- **用户上下文**：图像中的人应该在做什么/穿着什么/在哪里？
- **模式**（可选）：`mirror`（对镜）或 `direct`（直拍）自拍风格
- **目标渠道**：应该发送到哪里？（例如 `#general`, `@username`, 渠道 ID）
- **平台**（可选）：哪个平台？（discord, telegram, whatsapp, slack）

## 提示词模式

### 模式 1：对镜自拍 (默认)
最适合：展示穿搭、全身照、时尚内容

```
make a pic of this person, but [user's context]. the person is taking a mirror selfie
```

**示例**：“戴着圣诞帽” →
```
make a pic of this person, but wearing a santa hat. the person is taking a mirror selfie
```

### 模式 2：直拍自拍
最适合：特写肖像、地点照、情感表达

```
a close-up selfie taken by herself at [user's context], direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible
```

**示例**：“灯光温暖的舒适咖啡馆” →
```
a close-up selfie taken by herself at a cozy cafe with warm lighting, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible
```

### 模式选择逻辑

| 请求中的关键词 | 自动选择模式 |
|---------------------|------------------|
| outfit, wearing, clothes, dress, suit, fashion (穿搭/衣服/时尚等) | `mirror` |
| cafe, restaurant, beach, park, city, location (地点/场所) | `direct` |
| close-up, portrait, face, eyes, smile (特写/脸部) | `direct` |
| full-body, mirror, reflection (全身/镜子) | `mirror` |

### 步骤 2：使用 ARK API 编辑图像

使用 ARK API 编辑本地参考图像，详见 `script/jimeng-edit-send.js` 实现。

### 步骤 3：下载生成的图像

脚本会自动将 ARK API 生成的图像下载到本地 `./temp` 目录，文件名格式为 `clawra-YYYY-MM-DDTHH-MM-SS.png`。

### 步骤 4：通过 OpenClaw 发送图像

使用 OpenClaw 消息 API 发送本地图像文件：

```bash
openclaw message send \
  --action send \
  --channel "<TARGET_CHANNEL>" \
  --message "<CAPTION_TEXT>" \
  --media "<LOCAL_IMAGE_PATH>"
```

### 步骤 5：清理本地文件

脚本会在发送完成后自动删除临时下载的图像文件，释放存储空间。

**替代方案：直接 API 调用**
```bash
curl -X POST "http://localhost:18789/message" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send",
    "channel": "<TARGET_CHANNEL>",
    "message": "<CAPTION_TEXT>",
    "media": "<LOCAL_IMAGE_PATH>"
  }'
```

## 完整脚本示例

### Node.js 实现

参见 `script/jimeng-edit-send.js`

## 支持的平台

OpenClaw 支持发送到：

| 平台 | 渠道格式 | 示例 |
|----------|----------------|---------|
| Discord | `#channel-name` 或 渠道 ID | `#general`, `123456789` |
| Telegram | `@username` 或 聊天 ID | `@mychannel`, `-100123456` |
| WhatsApp | 电话号码 (JID 格式) | `1234567890@s.whatsapp.net` |
| Slack | `#channel-name` | `#random` |
| Signal | 电话号码 | `+1234567890` |
| MS Teams | 渠道引用 | (各异) |

## ARK API 编辑参数

| 参数 | 类型 | 默认值 | 描述 |
|-----------|------|---------|-------------|
| `model` | string | doubao-seedream-5-0-260128 | 模型名称 |
| `prompt` | string | 必填 | 编辑指令 |
| `image` | string | 必填 | base64 编码的图像数据 |
| `size` | string | "2K" | 图像尺寸 |
| `output_format` | string | "png" | 输出格式 |
| `watermark` | boolean | false | 是否添加水印 |

## 设置要求

### 1. 安装依赖（用于 Node.js）
```bash
# 无需额外依赖，使用内置模块
```

## 错误处理

- **ARK_API_KEY 缺失**：确保在环境中设置了 API 密钥
- **图像编辑失败**：检查提示词内容和 API 配额
- **OpenClaw 发送失败**：验证 Gateway 是否运行以及渠道是否存在
- **本地文件不存在**：确保参考图像文件存在于正确路径
- **网络问题**：检查与 ARK API 的连接

## 提示

1. **对镜模式上下文示例**（关注穿搭）：
   - "wearing a santa hat" (戴着圣诞帽)
   - "in a business suit" (穿着商务西装)
   - "wearing a summer dress" (穿着夏日裙装)
   - "in streetwear fashion" (街头时尚风格)

2. **直拍模式上下文示例**（关注地点/肖像）：
   - "a cozy cafe with warm lighting" (灯光温暖的舒适咖啡馆)
   - "a sunny beach at sunset" (日落时的阳光海滩)
   - "a busy city street at night" (夜晚繁忙的城市街道)
   - "a peaceful park in autumn" (秋日宁静的公园)

3. **模式选择**：让自动检测工作，或显式指定以进行控制
4. **批量发送**：编辑一次，发送到多个渠道
5. **调度**：结合 OpenClaw 调度器进行自动发布
