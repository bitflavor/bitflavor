import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";
import NftMembershipSection from "@/components/web3/NftMembershipSection";

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
  const t = await getTranslations({ locale, namespace: "membership" });
  return {
    title: t("title"),
    description: t("subtitle"),
    keywords: t("keywords"),
    alternates: { languages: { zh: "/zh/membership", en: "/en/membership" } },
  };
}

// 会员计划页：3 档订阅 + NFT 会员区（Web3 占位）
export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "membership" });
  const tWeb3 = await getTranslations({ locale, namespace: "web3" });

  // 三档会员配置（价格为翻译文件中的整串文案，含货币符号）
  const tiers = [
    { key: "monthly", priceKey: "monthlyPrice", periodKey: "perMonth", featured: false },
    { key: "yearly", priceKey: "yearlyPrice", periodKey: "perYear", featured: true },
    { key: "lifetime", priceKey: "lifetimePrice", periodKey: "oneTime", featured: false },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      {/* 页头 */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t("subtitle")}</p>
      </div>

      {/* 会员档位卡片 */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.key}
            className={`relative flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
              tier.featured
                ? "border-brand-400 bg-brand-50 shadow-lg"
                : "border-ink-100 bg-white"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
                ⭐ {t("recommended")}
              </span>
            )}
            <h2 className="text-lg font-bold text-ink-900">{t(tier.key)}</h2>
            <p className="mt-4">
              <span className="text-4xl font-extrabold text-ink-900">
                {t(tier.priceKey)}
              </span>
              <span className="ml-1 text-sm text-ink-400">{t(tier.periodKey)}</span>
            </p>
            {/* TODO(web3): 终身会员将空投 NFT 会员卡（ERC-721），链上确权、可交易 —— 当前仅 UI 预留 */}
            {tier.key === "lifetime" && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  🪪 {t("nftCardNote")}
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  {tWeb3("blockchainWip")}
                </span>
              </div>
            )}
            <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-600">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-500">✓</span>
                  {t(`${tier.key}Benefit${i}`)}
                </li>
              ))}
            </ul>
            {/* TODO(payment): 接入真实支付（Stripe / 加密货币） */}
            <a
              href="#nft"
              className={`mt-8 block rounded-full py-2.5 text-center text-sm font-semibold transition ${
                tier.featured
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "border border-brand-300 text-brand-600 hover:bg-brand-50"
              }`}
            >
              {t("buyNow")}
            </a>
          </div>
        ))}
      </div>

      {/* NFT 会员区（Web3 占位） */}
      <div className="mt-16">
        <NftMembershipSection />
      </div>

      <p className="mt-8 text-center text-xs text-ink-400">{t("paymentNote")}</p>
    </div>
  );
}
