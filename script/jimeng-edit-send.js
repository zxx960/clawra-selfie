const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require('fs');
const FormData = require('form-data');

const execAsync = promisify(exec);

const REFERENCE_IMAGE = "./assets/clawra.png";

function detectMode(userContext) {
  const mirrorKeywords = /outfit|wearing|clothes|dress|suit|fashion|full-body|mirror/i;
  const directKeywords = /cafe|restaurant|beach|park|city|close-up|portrait|face|eyes|smile/i;

  if (directKeywords.test(userContext)) return "direct";
  if (mirrorKeywords.test(userContext)) return "mirror";
  return "mirror"; // default
}

function buildPrompt(userContext, mode) {
  if (mode === "direct") {
    return `a close-up selfie taken by herself at ${userContext}, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible`;
  }
  return `make a pic of this person, but ${userContext}. the person is taking a mirror selfie`;
}

async function editAndSend(
  userContext,
  channel,
  mode = "auto",
  caption
) {
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

  const result = await response.json();
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
