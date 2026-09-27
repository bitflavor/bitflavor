/**
 * 占位图生成脚本
 * 扫描 src/data/recipes 下所有菜谱 JSON 的 coverImage 字段，
 * 结合大洲/国家元数据，生成带渐变色 + Emoji 的 SVG 占位图到 public/images/。
 * 后续接入真实摄影图时，直接替换 public/images 下文件即可。
 *
 * 用法：node scripts/generate-placeholders.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RECIPES_DIR = path.join(ROOT, "src", "data", "recipes");
const IMAGES_DIR = path.join(ROOT, "public", "images");

// 每个大洲的渐变配色（与 globals.css 品牌暖色系呼应）
const CONTINENT_META = {
  asia: { emoji: "🥟", from: "#fd7d11", to: "#c54a08", label: "Asia 亚洲" },
  "southeast-asia": { emoji: "🌶️", from: "#ff9b38", to: "#ee6207", label: "Southeast Asia 东南亚" },
  europe: { emoji: "🥖", from: "#ffc071", to: "#9c3a0f", label: "Europe 欧洲" },
  americas: { emoji: "🌮", from: "#ff9b38", to: "#7e3210", label: "Americas 美洲" },
  africa: { emoji: "🍲", from: "#fd7d11", to: "#441806", label: "Africa 非洲" },
  oceania: { emoji: "🥝", from: "#ffdba8", to: "#ee6207", label: "Oceania 大洋洲" },
};

const COUNTRY_META = {
  china: { emoji: "🥢", label: "China 中国" },
  japan: { emoji: "🍣", label: "Japan 日本" },
  korea: { emoji: "🍚", label: "Korea 韩国" },
  thailand: { emoji: "🦐", label: "Thailand 泰国" },
  vietnam: { emoji: "🍜", label: "Vietnam 越南" },
  italy: { emoji: "🍕", label: "Italy 意大利" },
  france: { emoji: "🥐", label: "France 法国" },
  mexico: { emoji: "🌮", label: "Mexico 墨西哥" },
  peru: { emoji: "🐟", label: "Peru 秘鲁" },
  morocco: { emoji: "🫕", label: "Morocco 摩洛哥" },
  australia: { emoji: "🦘", label: "Australia 澳大利亚" },
};

// 每个菜谱的封面 Emoji
const RECIPE_EMOJI = {
  "mapo-tofu": "🌶️",
  "peking-duck": "🦆",
  xiaolongbao: "🥟",
  "tonkotsu-ramen": "🍜",
  "salmon-sushi": "🍣",
  "tom-yum-goong": "🍤",
  "pad-thai": "🍝",
  "pho-bo": "🍲",
  "margherita-pizza": "🍕",
  "french-onion-soup": "🧅",
  macaron: "🍬",
  "tacos-al-pastor": "🌮",
  ceviche: "🐟",
  "chicken-tagine": "🫕",
  pavlova: "🍰",
  "flat-white": "☕",
  "kung-pao-chicken": "🐔",
  "sichuan-hotpot": "🥘",
  "sweet-sour-pork": "🍖",
  "hot-sour-soup": "🥣",
  "egg-fried-rice": "🍚",
  mooncake: "🥮",
  "spring-rolls": "🌯",
  bibimbap: "🍱",
  "kimchi-pancake": "🫓",
  "korean-fried-chicken": "🍗",
  "doenjang-jjigae": "🍲",
  tteokbokki: "🍢",
  tempura: "🍤",
  "miso-soup": "🍵",
  dorayaki: "🥞",
  "green-curry-chicken": "🍛",
  "mango-sticky-rice": "🥭",
  "thai-milk-tea": "🧋",
};

/** 生成一张 SVG 占位图 */
function buildSvg({ emoji, label, from, to }) {
  // 转义 XML 特殊字符
  const safeLabel = label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="400" cy="260" r="150" fill="rgba(255,255,255,0.18)"/>
  <text x="400" y="310" font-size="140" text-anchor="middle">${emoji}</text>
  <text x="400" y="510" font-size="44" font-weight="bold" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif">${safeLabel}</text>
</svg>
`;
}

/** 写入文件（自动建目录） */
function writeImage(relPath, svg) {
  const abs = path.join(IMAGES_DIR, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, svg, "utf-8");
  console.log("生成:", relPath);
}

// 1. 大洲卡片图
for (const [slug, meta] of Object.entries(CONTINENT_META)) {
  writeImage(
    path.join("continents", `${slug}.svg`),
    buildSvg({ emoji: meta.emoji, label: meta.label, from: meta.from, to: meta.to })
  );
}

// 2. 扫描菜谱目录：国家图 + 菜谱图
let recipeCount = 0;
for (const continent of fs.readdirSync(RECIPES_DIR)) {
  const continentDir = path.join(RECIPES_DIR, continent);
  if (!fs.statSync(continentDir).isDirectory()) continue;
  const cMeta = CONTINENT_META[continent];

  for (const country of fs.readdirSync(continentDir)) {
    const countryDir = path.join(continentDir, country);
    if (!fs.statSync(countryDir).isDirectory()) continue;

    // 国家封面图
    const coMeta = COUNTRY_META[country];
    if (coMeta) {
      writeImage(
        path.join("countries", `${country}.svg`),
        buildSvg({ emoji: coMeta.emoji, label: coMeta.label, from: cMeta.from, to: cMeta.to })
      );
    }

    // 菜谱封面图（读取 JSON 中的 coverImage 与标题）
    for (const file of fs.readdirSync(countryDir)) {
      if (!file.endsWith(".json")) continue;
      const recipe = JSON.parse(fs.readFileSync(path.join(countryDir, file), "utf-8"));
      const rel = recipe.coverImage.replace(/^\/images\//, "");
      const emoji = RECIPE_EMOJI[recipe.slug] ?? "🍽️";
      writeImage(
        rel,
        buildSvg({ emoji, label: recipe.title.en, from: cMeta.from, to: cMeta.to })
      );
      recipeCount++;
    }
  }
}

console.log(`\n完成：6 张大洲图、${Object.keys(COUNTRY_META).length} 张国家图、${recipeCount} 张菜谱图`);
