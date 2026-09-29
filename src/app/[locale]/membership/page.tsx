import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@clerk/nextjs/server";
import { isValidLocale } from "@/i18n/routing";
import NftMembershipSection from "@/components/web3/NftMembershipSection";
import CheckoutButton from "@/components/membership/CheckoutButton";
import { getStripeMetadata, isMembershipActive } from "@/lib/membership";

interface Props {
  params: Promise<{ locale: string }>;
}

// 注：本页读取 auth() 会员状态。Clerk v6+ 的 auth() 兼容静态渲染（构建期返回未登录态），
// 会导致会员状态被固化进静态 HTML —— 必须显式强制动态渲染。
export const dynamic = "force-dynamic";

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
  const tc = await getTranslations({ locale, namespace: "checkout" });

  // 当前登录用户的会员状态（webhook 已同步至 Clerk publicMetadata.stripe）
  const { userId } = await auth();
  const stripeMeta = userId ? await getStripeMetadata(userId) : null;
  const membership = stripeMeta?.membership ?? null;
  const memberActive = isMembershipActive(stripeMeta);

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

      {/* 当前会员状态（已开通时展示） */}
      {memberActive && membership && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-sm font-semibold text-brand-700">
            {tc("currentPlan")}：{t(membership.tier)}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {membership.tier === "lifetime" || !membership.currentPeriodEnd
              ? tc("lifetimeValid")
              : `${tc("expiresAt")}：${new Date(membership.currentPeriodEnd).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}`}
            {membership.cancelAtPeriodEnd
              ? ` · ${tc("cancelAtPeriodEndNote")}`
              : ""}
          </p>
          <p className="mt-1 text-xs text-ink-400">{tc("ordersHint")}</p>
        </div>
      )}

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
            <CheckoutButton
              tier={tier.key}
              locale={locale}
              label={t("buyNow")}
              featured={tier.featured}
              disabled={memberActive}
            />
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
