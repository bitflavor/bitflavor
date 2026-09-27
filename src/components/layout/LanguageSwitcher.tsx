"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// 语言切换按钮：保持当前路径，仅替换 URL 中的 locale 前缀
export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const nextLocale = locale === "zh" ? "en" : "zh";

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-600 transition hover:border-brand-400 hover:text-brand-600"
    >
      <span aria-hidden>🌐</span>
      {t("switchLanguage")}
    </Link>
  );
}
