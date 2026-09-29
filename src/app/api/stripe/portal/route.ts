import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { getStripeMetadata } from "@/lib/membership";
import { SITE_URL } from "@/lib/site";

/**
 * POST /api/stripe/portal —— 创建 Stripe Customer Portal 会话（管理订阅：取消/改支付方式/查发票）
 * Body: { locale?: "zh" | "en" } —— 用于门户操作完成后的回跳地址
 *
 * 响应：
 *   200 { url }                              —— 前端跳转到该地址
 *   401 { error: "unauthorized" }            —— 未登录
 *   404 { error: "no_customer" }             —— 从未产生过支付（无 Stripe Customer）
 *   503 { error: "portal_not_configured" }   —— Stripe Dashboard 未激活 Portal 配置
 *   500 { error: "portal_failed" }           —— 其他异常
 *
 * 注意：沙盒需先在 Dashboard → Settings → Billing → Customer portal 激活一次配置
 * （test mode 与 live mode 的配置互相独立）。
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let locale = "zh";
  try {
    const body = (await request.json()) as { locale?: string };
    if (body.locale === "en" || body.locale === "zh") locale = body.locale;
  } catch {
    /* 空/非法 body 用默认 locale */
  }

  let meta;
  try {
    meta = await getStripeMetadata(userId);
  } catch (err) {
    console.error("[portal] 读取 Clerk metadata 失败", err);
    return NextResponse.json({ error: "portal_failed" }, { status: 500 });
  }

  if (!meta.customerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 404 });
  }

  try {
    // 回跳地址优先取请求来源 origin（本地开发回 localhost，生产回站点域名）
    const origin = request.headers.get("origin") ?? SITE_URL;
    const session = await getStripe().billingPortal.sessions.create({
      customer: meta.customerId,
      return_url: `${origin}/${locale}/account/orders`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Dashboard 未激活 Portal 配置时 Stripe 返回的明确错误
    if (message.includes("No configuration provided") || message.includes("customer portal")) {
      console.error("[portal] Customer Portal 未在 Dashboard 激活", message);
      return NextResponse.json({ error: "portal_not_configured" }, { status: 503 });
    }
    console.error("[portal] 创建会话失败", err);
    return NextResponse.json({ error: "portal_failed" }, { status: 500 });
  }
}
