import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

// 静态生成：2 语言
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("missionDesc"),
    alternates: { languages: { zh: "/zh/about", en: "/en/about" } },
  };
}

// 关于我们：品牌故事 / 使命 / 愿景 / 路线图 / 团队
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const roadmap = [1, 2, 3] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-center text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {t("title")}
      </h1>

      {/* 品牌故事：2010 年比特币披萨典故（比特币橙主题卡片） */}
      <section className="mt-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>🍕</span>
          <h2 className="text-2xl font-bold">{t("storyTitle")}</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {([1, 2, 3, 4] as const).map((i) => (
            <p
              key={i}
              className="rounded-xl bg-white/10 p-4 leading-relaxed text-white/95"
            >
              {t(`story${i}`)}
            </p>
          ))}
        </div>
        <p className="mt-6 text-center text-4xl" aria-hidden>
          🍕 ₿ 🌍
        </p>
      </section>

      {/* 使命与愿景 */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl bg-brand-50 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
            <span aria-hidden>🎯</span>
            {t("missionTitle")}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-600">{t("missionDesc")}</p>
        </section>
        <section className="rounded-2xl bg-ink-950 p-6 text-white">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <span aria-hidden>🔭</span>
            {t("visionTitle")}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-200">{t("visionDesc")}</p>
        </section>
      </div>

      {/* 路线图 */}
      <section className="mt-14">
        <h2 className="text-center text-2xl font-bold text-ink-900">
          {t("roadmapTitle")}
        </h2>
        <ol className="mt-8 space-y-0">
          {roadmap.map((i, idx) => (
            <li key={i} className="relative flex gap-4 pb-8 last:pb-0">
              {/* 时间轴竖线 */}
              {idx < roadmap.length - 1 && (
                <span className="absolute left-[15px] top-8 h-full w-0.5 bg-brand-200" aria-hidden />
              )}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                {i}
              </span>
              <p className="pt-1 leading-relaxed text-ink-700">{t(`roadmap${i}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 团队 */}
      <section className="mt-14 rounded-2xl border border-ink-100 bg-white p-6 text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-ink-900">
          <span aria-hidden>👥</span>
          {t("teamTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-ink-600">
          {t("teamDesc")}
        </p>
      </section>
    </div>
  );
}
