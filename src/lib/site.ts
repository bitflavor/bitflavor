// 站点基础 URL（不含尾部斜杠）。
// 生产环境：在 Vercel 项目环境变量中设置 NEXT_PUBLIC_SITE_URL 为真实域名，无需改代码；
// 本地开发或未设置时回退到占位域名。
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldflavors.example.com";
