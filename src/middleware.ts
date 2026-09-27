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
  return intlMiddleware(req);
});

export const config = {
  // 匹配所有路径，但排除 api 路由、Next 内部资源和带扩展名的静态文件
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
