import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// 首页首屏：大标题 + 副标题 + CTA
export default function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white">
      {/* 背景装饰圆 */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
          🌍 {t("heroBadge")}
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          {t("heroSubtitle")}
        </p>
        {/* 品牌故事：比特币披萨 → 点击跳转关于我们页完整典故 */}
        <Link
          href="/about"
          className="mx-auto mt-6 inline-flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white/90 backdrop-blur transition hover:bg-white/20"
        >
          <span aria-hidden>🍕₿</span>
          <span>{t("brandStory")}</span>
          <span className="shrink-0 font-semibold underline underline-offset-2">
            {t("brandStoryCta")} →
          </span>
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/#continents"
            className="w-full rounded-full bg-white px-8 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 sm:w-auto"
          >
            {t("heroCtaExplore")}
          </Link>
          <Link
            href="/membership"
            className="w-full rounded-full border-2 border-white/70 px-8 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            {t("heroCtaMembership")}
          </Link>
        </div>
      </div>
    </section>
  );
}
