import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getStripe,
  getTierPriceId,
  isMembershipTier,
  MEMBERSHIP_TIERS,
} from "@/lib/stripe";
import { getStripeMetadata, isMembershipActive } from "@/lib/membership";

/**
 * POST /api/stripe/checkout
 * body: { tier: "monthly" | "yearly" | "lifetime", locale?: "zh" | "en" }
 * → 创建 Stripe Checkout Session（托管收银台），返回 { url } 供前端 302 跳转
 *
 * 官方纪律：
 * - 不传 payment_method_types（动态支付方式，Dashboard 可配）
 * - automatic_tax 开启（⚠️ 需沙盒/正式税务注册，否则 Stripe 静默收 0 税）
 * - integration_identifier 标记集成来源（API 2026-03-25.dahlia+，8 位随机后缀）
 * - 履约只在 webhook 完成，本路由不写任何会员状态
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let tier: unknown;
  let locale: unknown;
  try {
    const body = await req.json();
    tier = body?.tier;
    locale = body?.locale;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!isMembershipTier(tier)) {
    return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
  }
  const safeLocale = locale === "en" ? "en" : "zh";

  // 防重复购买：已拥有有效会员时拒绝新建 Checkout
  const stripeMeta = await getStripeMetadata(userId);
  if (isMembershipActive(stripeMeta)) {
    return NextResponse.json({ error: "already_member" }, { status: 409 });
  }

  const stripe = getStripe();
  try {
    // 1) 复用或创建 Stripe Customer（clerk_user_id 双向锚定）
    let customerId = stripeMeta.customerId;
    if (!customerId) {
      const found = await stripe.customers.search({
        query: `metadata['clerk_user_id']:'${userId}'`,
        limit: 1,
      });
      customerId = found.data[0]?.id;
    }
    if (!customerId) {
      const user = await currentUser();
      const customer = await stripe.customers.create({
        email: user?.emailAddresses?.[0]?.emailAddress,
        name:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          undefined,
        metadata: { clerk_user_id: userId },
      });
      customerId = customer.id;
    }

    // 2) 创建 Checkout Session
    const origin = new URL(req.url).origin;
    const mode = MEMBERSHIP_TIERS[tier].mode;
    const suffix = Math.random().toString(36).slice(2, 10); // 8 位随机字母数字
    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: [{ price: getTierPriceId(tier), quantity: 1 }],
      success_url: `${origin}/${safeLocale}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${safeLocale}/membership`,
      locale: "auto",
      automatic_tax: { enabled: true },
      customer_update: { address: "auto" },
      client_reference_id: userId,
      integration_identifier: `bitflavor-membership-${suffix}`,
      metadata: { clerk_user_id: userId, tier },
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { clerk_user_id: userId, tier } } }
        : {
            payment_intent_data: { metadata: { clerk_user_id: userId, tier } },
            // lifetime 一次性支付同样开具发票（Invoicing）
            invoice_creation: { enabled: true },
          }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe checkout] 创建会话失败", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
