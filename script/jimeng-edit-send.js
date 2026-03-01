const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

const REFERENCE_IMAGE = "./assets/clawra.png";
const OUTPUT_DIR = "./temp";

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

function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function downloadImage(url, filename) {
  ensureOutputDir();
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  
  console.log(`Image downloaded to: ${outputPath}`);
  return outputPath;
}

async function editAndSend(
  userContext,
  channel,
  mode = "auto",
  caption
) {
  const arkApiKey = process.env.ARK_API_KEY;
  if (!arkApiKey) {
    throw new Error("ARK_API_KEY environment variable not set");
  }

  // 确定模式
  const actualMode = mode === "auto" ? detectMode(userContext) : mode;
  console.log(`Mode: ${actualMode}`);

  // 构建提示词
  const editPrompt = buildPrompt(userContext, actualMode);

  // 使用 ARK API 编辑本地图像
  console.log(`Editing image: "${editPrompt}"`);

  // 将图像转换为 base64
  const imageBase64 = imageToBase64(REFERENCE_IMAGE);

  // 调用 ARK API
  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${arkApiKey}`
    },
    body: JSON.stringify({
      model: "doubao-seedream-5-0-260128",
      prompt: editPrompt,
      image: `data:image/png;base64,${imageBase64}`,
      size: "2K",
      output_format: "png",
      watermark: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ARK API error: ${error}`);
  }

  const result = await response.json();
  const imageUrl = result.data[0].url;
  
  console.log(`Generated image URL: ${imageUrl}`);

  // 下载图片到本地
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `clawra-${timestamp}.png`;
  const localImagePath = await downloadImage(imageUrl, filename);

  // 通过 OpenClaw 发送本地图片
  const messageCaption = caption || `Edited with ARK API`;

  await execAsync(
    `openclaw message send --action send --channel "${channel}" --message "${messageCaption}" --media "${localImagePath}"`
  );

  console.log(`Sent to ${channel}`);
  return localImagePath;
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
