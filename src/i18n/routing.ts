import { defineRouting } from "next-intl/routing";

// 站点支持的语言与默认语言
// localePrefix 使用 "always"：/ 会按浏览器语言自动 307 到 /zh 或 /en
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

// 校验字符串是否为合法 locale（替代 next-intl v4 才有的 hasLocale）
export function isValidLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale);
}
