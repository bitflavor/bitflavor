import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getStripe,
  getTierByPriceId,
  type MembershipTier,
} from "@/lib/stripe";
import {
  getStripeMetadata,
  isSessionProcessed,
  updateStripeMetadata,
  type MembershipRecord,
} from "@/lib/membership";

/**
 * POST /api/stripe/webhook —— Stripe 事件回调（会员履约唯一入口）
 *
 * - raw body 验签（route handler 用 req.text()，天然未被解析）
 * - 幂等：checkout.session.id 记入 Clerk publicMetadata.stripe.processedSessions，
 *   Stripe 重试/双事件重复投递时直接跳过（见用户调整点 1）
 * - 履约门控 payment_status === "paid"；异步支付方式经 async_payment_succeeded 到达
 * - handler 抛错返回 500 让 Stripe 重试（幂等保证重试安全）
 * - middleware matcher 已排除 /api，不受 Clerk 登录拦截
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET 未配置");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] 验签失败", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        // 会员状态同步由 customer.subscription.updated（status→past_due）承担；
        // 此处仅记录日志，作为将来「续费失败提醒邮件」的挂点
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[stripe webhook] invoice.payment_failed: ${invoice.id} customer=${String(invoice.customer)}`,
        );
        break;
      }
      default:
        break; // 未订阅的事件类型直接忽略
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error (${event.type})`, err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** checkout 完成 → 写入会员状态（含幂等） */
async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return; // 异步支付未到账，等待 async_payment_succeeded

  const userId = session.client_reference_id ?? session.metadata?.clerk_user_id;
  const tier = session.metadata?.tier as MembershipTier | undefined;
  if (!userId || !tier) {
    console.warn(
      `[stripe webhook] session ${session.id} 缺少 clerk_user_id/tier，跳过`,
    );
    return;
  }

  // 幂等检查（用户调整点 1）：同一 session 已处理则跳过
  const meta = await getStripeMetadata(userId);
  if (isSessionProcessed(meta, session.id)) {
    console.log(`[stripe webhook] session ${session.id} 已处理，幂等跳过`);
    return;
  }

  const stripe = getStripe();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? undefined);
  const record: MembershipRecord = {
    tier,
    status: "active",
    updatedAt: new Date().toISOString(),
  };

  if (session.mode === "subscription" && session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    record.status = sub.status;
    record.stripeSubscriptionId = sub.id;
    record.currentPeriodEnd = toISO(getSubPeriodEnd(sub));
    record.cancelAtPeriodEnd = sub.cancel_at_period_end;
  }

  await updateStripeMetadata(userId, {
    customerId,
    membership: record,
    processedSessionId: session.id,
  });
  console.log(
    `[stripe webhook] 履约完成 user=${userId} tier=${tier} session=${session.id}`,
  );
}

/** 订阅变更/取消 → 同步会员状态 */
async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.clerk_user_id;
  if (!userId) {
    console.warn(
      `[stripe webhook] subscription ${sub.id} 无 clerk_user_id metadata，跳过`,
    );
    return;
  }
  const meta = await getStripeMetadata(userId);
  if (!meta.membership) return; // 非本系统写入的会员记录，忽略

  const tier =
    getTierByPriceId(sub.items?.data?.[0]?.price?.id ?? "") ??
    meta.membership.tier;
  await updateStripeMetadata(userId, {
    membership: {
      ...meta.membership,
      tier,
      status: sub.status,
      currentPeriodEnd: toISO(getSubPeriodEnd(sub)),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date().toISOString(),
    },
  });
  console.log(
    `[stripe webhook] 订阅同步 user=${userId} sub=${sub.id} status=${sub.status}`,
  );
}

/** API 2025+（basil 起）current_period_end 移至 subscription item 级；兼容旧字段兜底 */
function getSubPeriodEnd(sub: Stripe.Subscription): number | undefined {
  return (
    sub.items?.data?.[0]?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end
  );
}

function toISO(unixSec: number | undefined): string | undefined {
  return unixSec ? new Date(unixSec * 1000).toISOString() : undefined;
}
