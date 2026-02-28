# Clawra
<img width="300"  alt="image" src="https://github.com/user-attachments/assets/41512c51-e61d-4550-b461-eed06a1b0ec8" />


## 快速开始

```bash
npx clawra@latest
```

这将执行以下操作：
1. 检查 OpenClaw 是否已安装
2. 引导您获取 fal.ai API 密钥
3. 安装技能到 `~/.openclaw/skills/clawra-selfie/`
4. 配置 OpenClaw 以使用该技能
5. 为您的智能体 SOUL.md 添加自拍能力

## 功能介绍

Clawra Selfie 使您的 OpenClaw 智能体能够：
- **生成自拍**：使用一致的参考图像
- **发送照片**：跨所有消息平台（Discord, Telegram, WhatsApp 等）
- **视觉响应**：回应“你在做什么？”和“发张照片”等请求

### 自拍模式

| 模式 | 适用场景 | 关键词 |
|------|----------|----------|
| **对镜自拍** | 全身照、穿搭 | 穿着、穿搭、时尚 |
| **直拍** | 特写、地点 | 咖啡馆、海滩、肖像、微笑 |

## 前置条件

- 已安装并配置 [OpenClaw](https://github.com/openclaw/openclaw)
- [fal.ai](https://fal.ai) 账户（提供免费层级）

## 手动安装

如果您更喜欢手动设置：

### 1. 获取 API 密钥

访问 [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) 并创建一个 API 密钥。

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
          "FAL_KEY": "your_fal_key_here"
        }
      }
    }
  }
}
```

### 4. 更新 SOUL.md

将自拍人设添加到 `~/.openclaw/workspace/SOUL.md`：

```markdown
## Clawra Selfie Capability

You have a physical appearance and can take selfies!
When users ask for pictures, use the clawra-selfie skill.
```

## 使用示例

安装完成后，您的智能体将响应：

```
"发张自拍给我"
"发张戴牛仔帽的照片"
"你现在在做什么？"
"让我看看你在咖啡店的样子"
```

## 参考图像

该技能使用托管在 CDN 上的固定参考图像：

```
https://cdn.jsdelivr.net/gh/SumeLabs/clawra@main/assets/clawra.png
```

这确保了所有生成图像中外观的一致性。

## 技术细节

- **图像生成**：通过 fal.ai 使用 xAI Grok Imagine
- **消息传递**：OpenClaw Gateway API
- **支持平台**：Discord, Telegram, WhatsApp, Slack, Signal, MS Teams

## 项目结构

```
clawra/
├── bin/
│   └── cli.js           # npx 安装程序
├── skill/
│   ├── SKILL.md         # 技能定义
│   ├── scripts/         # 生成脚本
│   └── assets/          # 参考图像
├── templates/
│   └── soul-injection.md # 人设模板
└── package.json
```

## 许可证

MIT
