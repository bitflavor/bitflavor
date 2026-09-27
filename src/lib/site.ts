// 站点基础 URL（不含尾部斜杠）。
// 生产环境：在 Vercel 项目环境变量中设置 NEXT_PUBLIC_SITE_URL 为真实域名，无需改代码；
// 本地开发或未设置时回退到占位域名。
// TODO(deploy): 购买真实域名后，在 Vercel 环境变量设置 NEXT_PUBLIC_SITE_URL（如 https://www.worldflavors.com）。
//   注：回退值使用 RFC 2606 保留占位域名（example.com 永不解析），刻意不用 localhost——
//   防止生产构建漏配变量时把 localhost 写进线上 sitemap/robots/OG 污染 SEO。
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldflavors.example.com";
