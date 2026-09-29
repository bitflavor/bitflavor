import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("successTitle"),
    robots: { index: false, follow: false },
  };
}

// 支付成功页：仅作展示（官方规则：会员履约由 webhook 完成，本页不读写任何支付状态）
export default async function MembershipSuccessPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        ✅
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-ink-900 sm:text-3xl">
        {t("successTitle")}
      </h1>
      <p className="mt-3 text-ink-500">{t("successSubtitle")}</p>
      <p className="mt-2 text-xs text-ink-400">{t("successSyncNote")}</p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/${locale}/recipes`}
          className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {t("browseRecipes")}
        </Link>
        <Link
          href={`/${locale}/account/orders`}
          className="rounded-full border border-brand-300 px-6 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          {t("viewOrders")}
        </Link>
      </div>
      <Link
        href={`/${locale}/membership`}
        className="mt-6 inline-block text-xs text-ink-400 underline-offset-2 hover:underline"
      >
        {t("backToMembership")}
      </Link>
    </div>
  );
}
