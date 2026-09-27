import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// 导出带 locale 感知能力的导航 API
// 使用这些封装后的组件/函数，链接会自动带上当前语言前缀（/zh/... 或 /en/...）
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
