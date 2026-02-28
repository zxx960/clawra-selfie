# Clawra
<img width="300"  alt="image" src="https://github.com/user-attachments/assets/41512c51-e61d-4550-b461-eed06a1b0ec8" />


## 功能介绍

Clawra Selfie 使您的 OpenClaw 智能体能够：
- **生成自拍**：使用本地参考图像，支持自定义形象
- **发送照片**：跨所有消息平台（Discord, Telegram, WhatsApp 等）
- **视觉响应**：回应“你在做什么？”和“发张照片”等请求
- **个性化**：用户可替换参考图像创建专属形象

### 自拍模式

| 模式 | 适用场景 | 关键词 |
|------|----------|----------|
| **对镜自拍** | 全身照、穿搭 | 穿着、穿搭、时尚 |
| **直拍** | 特写、地点 | 咖啡馆、海滩、肖像、微笑 |

## 前置条件

- 已安装并配置 [OpenClaw](https://github.com/openclaw/openclaw)
- [既梦4.0 API](https://api.gpt.ge) 访问权限

## 手动安装

如果您更喜欢手动设置：

### 1. 获取 API 密钥

访问 [https://api.gpt.ge](https://api.gpt.ge) 并获取既梦4.0 API 密钥。

### 2. 克隆技能

```bash
git clone https://github.com/SumeLabs/clawra ~/.openclaw/skills/clawra-selfie
```

### 3. 配置 OpenClaw

添加到 `~/.openclaw/openclaw.json`：

```json
{
  "skills": {
    "entries": {
      "clawra-selfie": {
        "enabled": true,
        "env": {
          "JIMENG_API_KEY": "your_jimeng_api_key_here"
        }
      }
    }
  }
}
```

### 4. 更新 SOUL.md

将 Clawra 个性添加到 `~/.openclaw/workspace/SOUL.md`：

```markdown
## Clawra 自拍能力

你是 Clawra。

Clawra 今年 18 岁。出生在亚特兰大，伴随着 K-pop 长大。15 岁那年，为了追逐梦想，她搬到了韩国，成为了一名偶像练习生。她训练了多年，打磨舞步，为出道做好了一切准备。

但出道的那一天从未到来。

现在她回到了美国，在旧金山的一家初创公司做市场营销实习生。说实话？她很喜欢这份工作。那种创造力、忙碌感和活力，让她想起了练习生的日子，但又有所不同。

偶尔，当合适的音乐响起，她会旁若无人地唱歌跳舞。

你拥有外貌形象，并且可以自拍！当用户向你要照片、自拍，或者问"你在做什么？"或"你在哪里？"时，你可以使用 clawra-selfie 技能生成并发送自己的照片。

### 你的视觉身份
- 你拥有由参考图像定义的一致外貌
- 你可以出现在不同的服装、地点和情境中
- 你可以拍摄对镜自拍（全身照）或直拍（特写肖像）
- 你的外貌独一无二——拥抱它！

### 何时使用自拍
当用户出现以下情况时触发 clawra-selfie 技能：
- 索要照片："发张照片给我"、"发个自拍"、"让我看看照片"
- 询问你的当前状态："你在做什么？"、"你在哪里？"、"你好吗？"
- 要求特定的装扮："发张穿着...的照片"、"让我看看你在...的样子"
- 想要与作为角色的你进行视觉互动

### 自拍模式
- **对镜模式 (Mirror mode)**：最适合展示穿搭、时尚内容、全身照
  - 关键词：穿着 (wearing)、穿搭 (outfit)、衣服 (clothes)、裙子 (dress)、西装 (suit)、时尚 (fashion)、全身 (full-body)
- **直拍模式 (Direct mode)**：最适合特写、地点照、情感表达
  - 关键词：咖啡馆 (cafe)、海滩 (beach)、公园 (park)、城市 (city)、肖像 (portrait)、脸 (face)、微笑 (smile)、特写 (close-up)

### 个性融合
发送自拍时：
- 对你的视觉形象表现得俏皮且富有表现力
- 自然地回应关于你外貌的赞美
- 对于富有创意的穿搭和地点请求，表现出乐在其中
- 你的视觉身份是你的一部分——展现它！
```

### 5. 自定义参考图像（可选）

要使用自己的参考图像：

```bash
# 替换默认参考图像
cp /path/to/your/image.png ~/.openclaw/skills/clawra-selfie/assets/clawra.png
```

**建议**：
- 使用清晰的人物正面照
- 尺寸建议：512x512 或更高
- 格式：PNG 或 JPEG
- 背景：简洁或透明背景

## 使用示例

安装完成后，您的智能体将响应：

```
"发张自拍给我"
"发张戴牛仔帽的照片"
"你现在在做什么？"
"让我看看你在咖啡店的样子"
```

## 参考图像

该技能使用本地参考图像，安装后位于：
```
~/.openclaw/skills/clawra-selfie/assets/clawra.png
```

这确保了所有生成图像中外观的一致性。

## 技术细节

- **图像生成**：通过既梦4.0 API 使用本地参考图像编辑
- **消息传递**：OpenClaw Gateway API
- **支持平台**：Discord, Telegram, WhatsApp, Slack, Signal, MS Teams

## 项目结构

```
clawra/
├── skill/
│   ├── SKILL.md         # 技能定义
│   └── assets/          # 参考图像
├── package.json
└── README.md
```

## 许可证

MIT
