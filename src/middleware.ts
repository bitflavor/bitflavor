import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// 受保护路由（需登录）：/{locale}/account 及其所有子路径
// createRouteMatcher 支持 :locale 占位，匹配 /zh/account/* 与 /en/account/*
const isProtectedRoute = createRouteMatcher(["/:locale/account(.*)"]);

// Clerk（认证）+ next-intl（语言路由）合并中间件：
// 1. 命中受保护路由时先校验登录态，未登录自动重定向到登录页（NEXT_PUBLIC_CLERK_SIGN_IN_URL）
// 2. 其余请求走 next-intl：/zh、/en 前缀路由；访问 / 时按 Accept-Language 自动跳转
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 未认证时：浏览器 document 请求 307 → NEXT_PUBLIC_CLERK_SIGN_IN_URL（/login，
    // 随后由 next-intl 按浏览器语言跳转到 /zh|en/login）；API 类非文档请求返回 404。
    // 注意：不要给 protect 传 unauthenticatedUrl —— 实测会导致 API 请求 500
    await auth.protect();
  }
  // API 路由（需 auth() 上下文的）：仅注入 Clerk 上下文，
  // 不做 next-intl 路由处理（避免请求被 locale 重写/重定向破坏）
  if (req.nextUrl.pathname.startsWith("/api/")) return;
  return intlMiddleware(req);
});

export const config = {
  // 页面路由：排除 api、Next 内部资源和带扩展名的静态文件。
  // 例外补充（route handler 内调用 auth()，必须经 clerkMiddleware 注入上下文）：
  //   /api/stripe/checkout —— 支付会话创建
  //   /api/stripe/orders   —— 订单/会员状态查询
  //   /api/stripe/portal   —— Customer Portal 会话
  //   /api/recipes/:path*  —— 付费菜谱内容下发
  //   （webhook 不调用 auth()，保持排除以减少干扰面）
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/api/stripe/checkout",
    "/api/stripe/orders",
    "/api/stripe/portal",
    "/api/recipes/:path*",
  ],
};
