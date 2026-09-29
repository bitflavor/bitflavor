import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRecipeBySlug } from "@/lib/recipes";
import { getStripeMetadata, isMembershipActive } from "@/lib/membership";

// TODO(connect)：海外创作者分成方案确定后，此处可扩展创作者内容分成鉴权。

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/recipes/[slug]/content —— 付费菜谱内容按需下发（服务端鉴权，关闭防线 fail closed）
 *
 * 为什么走 API 而非页面 SSR：
 * Next 15 不允许同一路由"部分 slug 静态、部分 slug 动态"——构建期被判定为静态的路由，
 * 运行时 fallback 渲染中使用 headers()/auth() 会触发 static-to-dynamic 错误（500）。
 * 因此付费菜谱页面外壳走 SSG（零泄露），真正的付费内容（做法步骤/技巧/排查/文化故事）
 * 由客户端组件 PremiumContent 在挂载后经本接口拉取：
 *   未登录 401 / 非会员 403 → 客户端保持会员锁占位
 *   会员 200 → 返回内容 JSON，客户端替换渲染
 *
 * 安全模型：付费内容永远不在初始 HTML/JSON-LD 中，连 SSR 缓存配置都不必信任。
 *
 * 响应：
 *   200 { steps, tips, failChecks, culturalStory }（双语结构，由客户端按 locale 取用）
 *   400 { error: "not_premium" }         —— 免费菜谱不由此接口服务（内容已 SSG 内联）
 *   401 { error: "unauthorized" }        —— 未登录
 *   403 { error: "membership_required" } —— 已登录但无有效会员
 *   404 { error: "not_found" }           —— slug 不存在
 *   500 { error: "internal" }            —— 鉴权异常（fail closed，不泄露内容）
 */
export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;

  const recipe = getRecipeBySlug(slug);
  if (!recipe) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!recipe.isPremium) {
    return NextResponse.json({ error: "not_premium" }, { status: 400 });
  }

  // 依赖 middleware 注入的 Clerk 上下文（middleware matcher 已覆盖 /api/recipes/:path*）
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const meta = await getStripeMetadata(userId);
    if (!isMembershipActive(meta)) {
      return NextResponse.json({ error: "membership_required" }, { status: 403 });
    }
  } catch (err) {
    // Clerk API 不可达等异常：关闭防线，宁锁勿泄
    console.error(`[recipes/content] 会员鉴权失败 slug=${slug}`, err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }

  return NextResponse.json(
    {
      steps: recipe.steps,
      tips: recipe.tips,
      failChecks: recipe.failChecks,
      culturalStory: recipe.culturalStory,
    },
    // 按用户鉴权的内容：禁止任何共享缓存
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
