import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe, getTierByPriceId } from "@/lib/stripe";
import {
  getStripeMetadata,
  isMembershipActive,
  updateStripeMetadata,
} from "@/lib/membership";

/**
 * GET /api/stripe/orders —— 当前用户的会员状态 + 订单/发票（Stripe 实时查询）
 *
 * 数据源：
 * - 会员状态：Stripe subscriptions 实时查询（准确反映取消/扣款失败等最新状态）；
 *   lifetime（一次性支付，无订阅对象）回退到 Clerk metadata 快照（webhook 同步）。
 * - 订单：Stripe invoices（lifetime 因 checkout 开启 invoice_creation 也在其中）。
 *
 * 响应：
 *   200 { membership: { tier, status, currentPeriodEnd, cancelAtPeriodEnd } | null,
 *         invoices: [{ id, number, description, amount, currency, created, status, pdfUrl, hostedUrl }] }
 *   401 { error: "unauthorized" }        —— 未登录
 *   500 { error: "orders_fetch_failed" } —— Stripe 查询异常
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let meta;
  try {
    meta = await getStripeMetadata(userId);
  } catch (err) {
    console.error("[orders] 读取 Clerk metadata 失败", err);
    return NextResponse.json({ error: "orders_fetch_failed" }, { status: 500 });
  }

  let customerId = meta.customerId;

  // 惰性自愈（webhook 丢失补偿）：stripe listen 支付时未在线等情况下，webhook
  // 事件永久丢失 → Clerk metadata 缺 customerId。此时按 checkout 写入的
  // metadata.clerk_user_id 锚点反查 Stripe Customer；命中则照常返回实时数据，
  // 并 best-effort 回写 Clerk 补锚（与下方查询并行；失败仅记日志，绝不影响响应）。
  let healPromise: Promise<void> | null = null;
  if (!customerId) {
    try {
      const found = await getStripe().customers.search({
        query: `metadata['clerk_user_id']:'${userId}'`,
        limit: 1,
      });
      customerId = found.data[0]?.id;
    } catch (err) {
      console.error("[orders] Customer 反查失败", err);
    }
    if (customerId) {
      console.log(
        `[orders] 惰性自愈：user=${userId} 补锚 customerId=${customerId}`,
      );
      healPromise = updateStripeMetadata(userId, { customerId }).catch((err) =>
        console.error("[orders] 补锚回写失败（已忽略，不影响响应）", err),
      );
    }
  }

  // 从未产生过支付：无 Customer → 空数据（前端展示空态/开通引导）
  if (!customerId) {
    return NextResponse.json({ membership: null, invoices: [] });
  }

  try {
    const stripe = getStripe();

    const [subs, invs] = await Promise.all([
      // 全部状态取回自行筛选（正常一个用户仅一条订阅；异常时取最新有效的一条）
      stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 }),
      stripe.invoices.list({ customer: customerId, limit: 24 }),
    ]);

    const activeSub = subs.data
      .filter((s) => ["active", "trialing", "past_due"].includes(s.status))
      .sort((a, b) => b.created - a.created)[0];

    let membership: {
      tier: string | null;
      status: string;
      currentPeriodEnd: string | null;
      cancelAtPeriodEnd: boolean;
    } | null = null;

    if (activeSub) {
      const item = activeSub.items.data[0];
      // basil API：current_period_end 位于订阅 item；旧版位于订阅顶层（双读兜底）
      const periodEndUnix =
        (item as unknown as { current_period_end?: number } | undefined)
          ?.current_period_end ??
        (activeSub as unknown as { current_period_end?: number })
          .current_period_end ??
        null;
      membership = {
        tier: item?.price?.id ? getTierByPriceId(item.price.id) : null,
        status: activeSub.status,
        currentPeriodEnd: periodEndUnix
          ? new Date(periodEndUnix * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: activeSub.cancel_at_period_end,
      };
    } else if (meta.membership?.tier === "lifetime" && isMembershipActive(meta)) {
      // lifetime 无订阅对象：以 webhook 同步的 metadata 快照为准
      membership = {
        tier: "lifetime",
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    const invoices = invs.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      description: inv.lines.data[0]?.description ?? null,
      amount: inv.total, // 单位：最小货币单位（美分）
      currency: inv.currency,
      created: new Date(inv.created * 1000).toISOString(),
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    // 补锚回写与上方 Stripe 查询并行执行；此处汇合以确保 serverless 环境下
    // 响应发出前执行完毕（catch 已吞错，await 不会再抛）
    if (healPromise) await healPromise;

    return NextResponse.json(
      { membership, invoices },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[orders] Stripe 查询失败", err);
    if (healPromise) await healPromise; // 同上：尽力完成补锚
    return NextResponse.json({ error: "orders_fetch_failed" }, { status: 500 });
  }
}
