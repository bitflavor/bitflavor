import Stripe from "stripe";

/**
 * Stripe 服务端客户端（懒加载单例）
 * - 官方规范：实例化 StripeClient 使用，禁止全局/模块级 setApiKey 模式
 * - 不显式指定 apiVersion：SDK v22 默认绑定其发布时的最新 API 版本（2026-08-26.dahlia）
 * - 懒加载：避免构建期/prerender 期因 env 缺失而抛错（API 路由运行时才真正实例化）
 *
 * TODO(connect) 预留：未来接入 Connect 分账时——
 * 1. Checkout Session 增加 subscription_data.application_fee_percent
 *    或 payment_intent_data.transfer_data.destination（destination charges）；
 * 2. connected account id 存 Clerk publicMetadata.stripe.connect.accountId
 *    （类型已在 lib/membership.ts 预留）；
 * 3. 推荐官方 blessed path：dashboard:"express" + 手续费/负余额归 application
 *    + destination charges（marketplace 场景）。
 */

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY 未配置（见 .env.local）");
  }
  client = new Stripe(secretKey, {
    typescript: true,
    appInfo: { name: "BitFlavor", version: "0.1.0", url: "https://aibos.top" },
  });
  return client;
}

/**
 * 会员档位 → Stripe Price 映射
 * price id 由 scripts/create-stripe-products.mjs 生成后写入 .env.local
 */
export const MEMBERSHIP_TIERS = {
  monthly: { mode: "subscription", priceEnv: "STRIPE_PRICE_MONTHLY" },
  yearly: { mode: "subscription", priceEnv: "STRIPE_PRICE_YEARLY" },
  lifetime: { mode: "payment", priceEnv: "STRIPE_PRICE_LIFETIME" },
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_TIERS;
export type CheckoutMode = (typeof MEMBERSHIP_TIERS)[MembershipTier]["mode"];

export function isMembershipTier(value: unknown): value is MembershipTier {
  return typeof value === "string" && value in MEMBERSHIP_TIERS;
}

export function getTierPriceId(tier: MembershipTier): string {
  const envName = MEMBERSHIP_TIERS[tier].priceEnv;
  const priceId = process.env[envName];
  if (!priceId) {
    throw new Error(
      `${envName} 未配置：先运行 node scripts/create-stripe-products.mjs 生成档位价格`,
    );
  }
  return priceId;
}

/** 由 Stripe price id 反查档位（webhook 订阅事件同步用）；未匹配返回 null */
export function getTierByPriceId(priceId: string): MembershipTier | null {
  if (!priceId) return null;
  for (const tier of Object.keys(MEMBERSHIP_TIERS) as MembershipTier[]) {
    if (process.env[MEMBERSHIP_TIERS[tier].priceEnv] === priceId) return tier;
  }
  return null;
}
