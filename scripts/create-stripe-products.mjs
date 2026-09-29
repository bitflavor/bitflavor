#!/usr/bin/env node
/**
 * create-stripe-products.mjs —— 在 Stripe（沙盒）创建 BitFlavor 会员产品 + 价格
 *
 * 用法：npm run stripe:products
 *
 * 幂等设计（可安全重复执行）：
 *   按 metadata platform=bitflavor + tier 搜索已有产品，
 *   产品存在则复用；其下存在匹配的活跃 Price（同金额/同货币/同计费周期）则复用，
 *   否则仅补齐缺失部分 —— 不会产生重复产品/价格。
 *
 * 安全护栏：检测到 sk_live_/rk_live_ 开头密钥直接拒绝执行（本脚本只用于沙盒）。
 *
 * TODO(connect)：海外创作者分成方案确定后，如需按档位配置 application_fee_percent，
 * 可在 checkout 侧实现（见 src/lib/stripe.ts 头部 TODO(connect)）。
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

// ── 配置区：开发期 USD 定价（单位：美分）；正式上架前如需调价，改这里重跑即可 ──
const TIERS = [
  {
    tier: "monthly",
    name: "BitFlavor Monthly Membership",
    description: "月付会员：解锁全部付费菜谱（按月自动续费，可随时取消）",
    unitAmount: 499, // $4.99/月
    interval: "month", // subscription（recurring）
  },
  {
    tier: "yearly",
    name: "BitFlavor Yearly Membership",
    description: "年付会员：解锁全部付费菜谱（按年自动续费，可随时取消）",
    unitAmount: 3999, // $39.99/年
    interval: "year", // subscription（recurring）
  },
  {
    tier: "lifetime",
    name: "BitFlavor Lifetime Membership",
    description: "终身会员：一次买断，永久解锁全部付费菜谱",
    unitAmount: 9999, // $99.99 一次性
    interval: null, // payment（一次性）
  },
];

const ENV_KEYS = {
  monthly: "STRIPE_PRICE_MONTHLY",
  yearly: "STRIPE_PRICE_YEARLY",
  lifetime: "STRIPE_PRICE_LIFETIME",
};

/** 从 .env.local 读取指定键（Node 原生脚本不经 Next，不会自动加载 env 文件） */
function loadEnv(key) {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, "").trim();
  }
  return "";
}

/** 查找已有产品（按 metadata 约定）；找不到返回 null */
async function findProduct(stripe, tier) {
  const res = await stripe.products.search({
    query: `metadata["platform"]:"bitflavor" AND metadata["tier"]:"${tier}"`,
    limit: 1,
  });
  return res.data[0] ?? null;
}

/** 在产品下查找匹配的活跃 Price（金额+货币+计费周期全等才算匹配） */
function findMatchingPrice(prices, { unitAmount, interval }) {
  return prices.data.find(
    (p) =>
      p.unit_amount === unitAmount &&
      p.currency === "usd" &&
      (interval ? p.recurring?.interval === interval : !p.recurring),
  );
}

async function ensureTier(stripe, def) {
  const actions = [];

  // 1. 产品：存在复用，缺失创建
  let product = await findProduct(stripe, def.tier);
  if (!product) {
    product = await stripe.products.create({
      name: def.name,
      description: def.description,
      metadata: { platform: "bitflavor", tier: def.tier },
    });
    actions.push(`创建产品 ${product.id}`);
  } else {
    actions.push(`复用产品 ${product.id}`);
  }

  // 2. 价格：匹配复用，缺失创建（Price 不可改价，调价=新建+停用旧价）
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 20,
  });
  let price = findMatchingPrice(prices, def);
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: def.unitAmount,
      // subscription 档位带 recurring；lifetime 不带 → Stripe 记为 one_time
      ...(def.interval ? { recurring: { interval: def.interval } } : {}),
      metadata: { platform: "bitflavor", tier: def.tier },
    });
    actions.push(`创建价格 ${price.id}`);
  } else {
    actions.push(`复用价格 ${price.id}`);
  }

  return { def, product, price, actions };
}

async function main() {
  const secretKey = loadEnv("STRIPE_SECRET_KEY");
  if (!secretKey) {
    console.error("❌ .env.local 中未找到 STRIPE_SECRET_KEY");
    process.exit(1);
  }
  if (
    secretKey.startsWith("sk_live_") ||
    secretKey.startsWith("rk_live_")
  ) {
    console.error(
      "❌ 检测到 live 密钥（sk_live_…/rk_live_…），本脚本仅限沙盒使用，已中止",
    );
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  console.log("▶ 开始创建/复用 BitFlavor 会员产品与价格（USD，沙盒）…\n");

  const results = [];
  for (const def of TIERS) {
    const r = await ensureTier(stripe, def);
    results.push(r);
    const priceDesc = def.interval
      ? `$${(def.unitAmount / 100).toFixed(2)}/${def.interval === "month" ? "月" : "年"}（订阅）`
      : `$${(def.unitAmount / 100).toFixed(2)}（一次性）`;
    console.log(`  ✓ ${def.tier.padEnd(8)} ${priceDesc}`);
    for (const a of r.actions) console.log(`      ${a}`);
  }

  console.log("\n✅ 完成。将以下内容粘贴到 .env.local（替换对应空值行）：\n");
  for (const r of results) {
    console.log(`${ENV_KEYS[r.def.tier]}=${r.price.id}`);
  }
  console.log(
    "\n提示：Price ID 与 Stripe 账户/模式（test|live）绑定；将来切换 live 模式需重新运行本脚本生成 live 价格。",
  );
}

main().catch((err) => {
  console.error("❌ 执行失败：", err.message ?? err);
  process.exit(1);
});
