import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

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
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: { languages: { zh: "/zh/privacy", en: "/en/privacy" } },
  };
}

// 隐私政策（通用模板，正式商用前请替换为经法律审核的文本）
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "privacy" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const sections = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-ink-400">{t("lastUpdated")}</p>
      <p className="mt-6 leading-relaxed text-ink-600">{t("intro")}</p>

      {sections.map((i) => (
        <section key={i} className="mt-10">
          <h2 className="text-xl font-bold text-ink-900">{t(`s${i}Title`)}</h2>
          <p className="mt-3 leading-relaxed text-ink-600">{t(`s${i}Body`)}</p>
        </section>
      ))}

      <p className="mt-12 rounded-xl bg-brand-50 p-4 text-sm text-ink-700">
        {t("contactNote")}
        <Link
          href="/contact"
          className="ml-1 font-semibold text-brand-600 hover:underline"
        >
          {tNav("contact")}
        </Link>
      </p>
    </div>
  );
}
