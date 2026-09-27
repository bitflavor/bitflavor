import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isValidLocale, routing } from "@/i18n/routing";
import ContributorPoints from "@/components/web3/ContributorPoints";
import DaoEntry from "@/components/web3/DaoEntry";

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
  const t = await getTranslations({ locale, namespace: "contributors" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { languages: { zh: "/zh/contributors", en: "/en/contributors" } },
  };
}

// 创作者计划页：参与步骤 + 贡献奖励 + 积分/DAO（Web3 占位）
export default async function ContributorsPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contributors" });

  const steps = [1, 2, 3] as const;
  const rewards = [1, 2, 3] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      {/* 页头 */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t("subtitle")}</p>
      </div>

      {/* 参与步骤 */}
      <h2 className="mt-14 text-center text-2xl font-bold text-ink-900">
        {t("howTitle")}
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {steps.map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-100 bg-white p-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-600">
              {i}
            </div>
            <h3 className="mt-4 font-bold text-ink-900">{t(`step${i}Title`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {t(`step${i}Desc`)}
            </p>
          </div>
        ))}
      </div>

      {/* 贡献奖励 */}
      <h2 className="mt-14 text-center text-2xl font-bold text-ink-900">
        {t("rewardsTitle")}
      </h2>
      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {rewards.map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-brand-50 p-4"
          >
            <span className="text-2xl" aria-hidden>🎁</span>
            <p className="text-ink-700">{t(`reward${i}`)}</p>
          </div>
        ))}
      </div>

      {/* 积分系统 + DAO 治理（Web3 占位） */}
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <ContributorPoints />
        <DaoEntry />
      </div>

      {/* 行动号召 */}
      <div className="mt-14 text-center">
        <Link
          href="/contact"
          className="inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
