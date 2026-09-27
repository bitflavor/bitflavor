import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl 中间件：
// 1. 处理 /zh、/en 前缀路由
// 2. 访问 / 时根据浏览器 Accept-Language 自动跳转到最匹配的语言
export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，但排除 api 路由、Next 内部资源和带扩展名的静态文件
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
