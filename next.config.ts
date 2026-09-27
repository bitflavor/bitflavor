import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl 插件：指定服务端请求配置文件位置
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // 菜谱封面目前为本地 SVG 占位图，无需配置远程图片域名
  // 显式指定工作区根目录，避免上层目录存在 lockfile 时 Next.js 误判
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
