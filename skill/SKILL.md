---
name: clawra-selfie
description: 使用既梦4.0 API 编辑本地参考图像，并通过 OpenClaw 将自拍发送到消息渠道
allowed-tools: Bash(npm:*) Bash(npx:*) Bash(openclaw:*) Bash(curl:*) Read Write WebFetch
---

# Clawra 自拍

使用既梦4.0图片编辑API编辑本地参考图像，并通过OpenClaw将其分发到各个消息平台（WhatsApp, Telegram, Discord, Slack 等）。

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

```bash
JIMENG_API_KEY=your_jimeng_api_key    # 从 https://api.gpt.ge 获取
```

### 工作流程

1. **获取用户提示词**：确定如何编辑图像
2. **编辑图像**：通过既梦4.0 API 使用本地参考图进行编辑
3. **提取图像 URL**：从响应中获取
4. **发送到 OpenClaw**：发送到目标渠道

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

### 步骤 2：使用既梦4.0 API 编辑图像

使用既梦4.0 API 编辑本地参考图像：

```bash
REFERENCE_IMAGE="./assets/clawra.png"

# 模式 1：对镜自拍
PROMPT="make a pic of this person, but <USER_CONTEXT>. the person is taking a mirror selfie"

# 模式 2：直拍自拍
PROMPT="a close-up selfie taken by herself at <USER_CONTEXT>, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible"

# 使用既梦4.0 API 编辑图像
curl --location --request POST 'https://api.gpt.ge/v1/images/edits' \
  --header "Authorization: Bearer $JIMENG_API_KEY" \
  --form "image=@$REFERENCE_IMAGE" \
  --form "prompt=$PROMPT" \
  --form "model=doubao-seedream-4-0-250828" \
  --form "size=4k" \
  --form "watermark=false"
```

**响应格式：**
```json
{
  "model": "doubao-seededit-3-0-i2i-250628",
  "created": 1757336790,
  "data": [
    {
      "url": "https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/..."
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 4096,
    "total_tokens": 4096
  }
}
```

### 步骤 3：通过 OpenClaw 发送图像

使用 OpenClaw 消息 API 发送编辑后的图像：

```bash
openclaw message send \
  --action send \
  --channel "<TARGET_CHANNEL>" \
  --message "<CAPTION_TEXT>" \
  --media "<IMAGE_URL>"
```

**替代方案：直接 API 调用**
```bash
curl -X POST "http://localhost:18789/message" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send",
    "channel": "<TARGET_CHANNEL>",
    "message": "<CAPTION_TEXT>",
    "media": "<IMAGE_URL>"
  }'
```

## 完整脚本示例

```bash
#!/bin/bash
# jimeng-edit-send.sh

# 检查必需的环境变量
if [ -z "$JIMENG_API_KEY" ]; then
  echo "Error: JIMENG_API_KEY environment variable not set"
  exit 1
fi

# 本地参考图像
REFERENCE_IMAGE="./assets/clawra.png"

USER_CONTEXT="$1"
CHANNEL="$2"
MODE="${3:-auto}"  # mirror, direct, 或 auto
CAPTION="${4:-Edited with JIMeng}"

if [ -z "$USER_CONTEXT" ] || [ -z "$CHANNEL" ]; then
  echo "Usage: $0 <user_context> <channel> [mode] [caption]"
  echo "Modes: mirror, direct, auto (default)"
  echo "Example: $0 'wearing a cowboy hat' '#general' mirror"
  echo "Example: $0 'a cozy cafe' '#general' direct"
  exit 1
fi

# 基于关键词自动检测模式
if [ "$MODE" == "auto" ]; then
  if echo "$USER_CONTEXT" | grep -qiE "outfit|wearing|clothes|dress|suit|fashion|full-body|mirror"; then
    MODE="mirror"
  elif echo "$USER_CONTEXT" | grep -qiE "cafe|restaurant|beach|park|city|close-up|portrait|face|eyes|smile"; then
    MODE="direct"
  else
    MODE="mirror"  # default
  fi
  echo "Auto-detected mode: $MODE"
fi

# 根据模式构建提示词
if [ "$MODE" == "direct" ]; then
  EDIT_PROMPT="a close-up selfie taken by herself at $USER_CONTEXT, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible"
else
  EDIT_PROMPT="make a pic of this person, but $USER_CONTEXT. the person is taking a mirror selfie"
fi

echo "Mode: $MODE"
echo "Editing reference image with prompt: $EDIT_PROMPT"

# 使用既梦4.0 API 编辑图像
RESPONSE=$(curl --location --request POST 'https://api.gpt.ge/v1/images/edits' \
  --header "Authorization: Bearer $JIMENG_API_KEY" \
  --form "image=@$REFERENCE_IMAGE" \
  --form "prompt=$EDIT_PROMPT" \
  --form "model=doubao-seedream-4-0-250828" \
  --form "size=4k" \
  --form "watermark=false")

# 提取图像 URL
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data[0].url')

if [ "$IMAGE_URL" == "null" ] || [ -z "$IMAGE_URL" ]; then
  echo "Error: Failed to edit image"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Image edited: $IMAGE_URL"
echo "Sending to channel: $CHANNEL"

# 通过 OpenClaw 发送
openclaw message send \
  --action send \
  --channel "$CHANNEL" \
  --message "$CAPTION" \
  --media "$IMAGE_URL"

echo "Done!"
```

## Node.js/TypeScript 实现

```typescript
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from 'fs';
import * as FormData from 'form-data';

const execAsync = promisify(exec);

const REFERENCE_IMAGE = "./assets/clawra.png";

interface JIMengResult {
  model: string;
  created: number;
  data: Array<{
    url: string;
  }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

type SelfieMode = "mirror" | "direct" | "auto";

function detectMode(userContext: string): "mirror" | "direct" {
  const mirrorKeywords = /outfit|wearing|clothes|dress|suit|fashion|full-body|mirror/i;
  const directKeywords = /cafe|restaurant|beach|park|city|close-up|portrait|face|eyes|smile/i;

  if (directKeywords.test(userContext)) return "direct";
  if (mirrorKeywords.test(userContext)) return "mirror";
  return "mirror"; // default
}

function buildPrompt(userContext: string, mode: "mirror" | "direct"): string {
  if (mode === "direct") {
    return `a close-up selfie taken by herself at ${userContext}, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible`;
  }
  return `make a pic of this person, but ${userContext}. the person is taking a mirror selfie`;
}

async function editAndSend(
  userContext: string,
  channel: string,
  mode: SelfieMode = "auto",
  caption?: string
): Promise<string> {
  const jimengApiKey = process.env.JIMENG_API_KEY;
  if (!jimengApiKey) {
    throw new Error("JIMENG_API_KEY environment variable not set");
  }

  // 确定模式
  const actualMode = mode === "auto" ? detectMode(userContext) : mode;
  console.log(`Mode: ${actualMode}`);

  // 构建提示词
  const editPrompt = buildPrompt(userContext, actualMode);

  // 使用既梦4.0 API 编辑本地图像
  console.log(`Editing image: "${editPrompt}"`);

  // 创建表单数据
  const form = new FormData();
  form.append('image', fs.createReadStream(REFERENCE_IMAGE));
  form.append('prompt', editPrompt);
  form.append('model', 'doubao-seedream-4-0-250828');
  form.append('size', '4k');
  form.append('watermark', 'false');

  const response = await fetch('https://api.gpt.ge/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jimengApiKey}`,
      ...form.getHeaders()
    },
    body: form
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JIMeng API error: ${error}`);
  }

  const result = await response.json() as JIMengResult;
  const imageUrl = result.data[0].url;
  
  console.log(`Edited image URL: ${imageUrl}`);

  // 通过 OpenClaw 发送
  const messageCaption = caption || `Edited with JIMeng`;

  await execAsync(
    `openclaw message send --action send --channel "${channel}" --message "${messageCaption}" --media "${imageUrl}"`
  );

  console.log(`Sent to ${channel}`);
  return imageUrl;
}

// 使用示例

// 对镜模式（从 "wearing" 自动检测）
editAndSend(
  "wearing a cyberpunk outfit with neon lights",
  "#art-gallery",
  "auto",
  "Check out this AI-edited art!"
);
// → Mode: mirror
// → Prompt: "make a pic of this person, but wearing a cyberpunk outfit with neon lights. the person is taking a mirror selfie"

// 直拍模式（从 "cafe" 自动检测）
editAndSend(
  "a cozy cafe with warm lighting",
  "#photography",
  "auto"
);
// → Mode: direct
// → Prompt: "a close-up selfie taken by herself at a cozy cafe with warm lighting, direct eye contact..."

// 显式模式覆盖
editAndSend("casual street style", "#fashion", "direct");
```

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

## 既梦4.0 编辑参数

| 参数 | 类型 | 默认值 | 描述 |
|-----------|------|---------|-------------|
| `image` | file | 必填 | 要编辑的本地图像文件 |
| `prompt` | string | 必填 | 编辑指令 |
| `model` | string | doubao-seedream-4-0-250828 | 模型名称 |
| `size` | string | "4k" | 图像尺寸 |
| `watermark` | boolean | false | 是否添加水印 |

## 设置要求

### 1. 安装依赖（用于 Node.js）
```bash
npm install form-data
```

### 2. 安装 OpenClaw CLI
```bash
npm install -g openclaw
```

### 3. 配置 OpenClaw Gateway
```bash
openclaw config set gateway.mode=local
openclaw doctor --generate-gateway-token
```

### 4. 启动 OpenClaw Gateway
```bash
openclaw gateway start
```

## 错误处理

- **JIMENG_API_KEY 缺失**：确保在环境中设置了 API 密钥
- **图像编辑失败**：检查提示词内容和 API 配额
- **OpenClaw 发送失败**：验证 Gateway 是否运行以及渠道是否存在
- **本地文件不存在**：确保参考图像文件存在于正确路径
- **网络问题**：检查与既梦4.0 API 的连接

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
