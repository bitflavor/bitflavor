import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

// 本页无用户数据（占位），可静态生成；登录拦截由中间件 auth.protect() 统一负责
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("ordersMetaTitle"),
    robots: { index: false, follow: false },
  };
}

// 我的订单：阶段2接入支付后，从数据库读取当前用户订单列表
// TODO(payment): 接 Stripe/PayPal 后替换为真实订单数据（按 Clerk userId 查询）
export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {t("ordersTitle")}
      </h1>

      <div className="mt-10 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-12 text-center">
        <div className="text-5xl" aria-hidden>🧾</div>
        <p className="mt-4 text-lg font-bold text-ink-800">{t("ordersEmpty")}</p>
        <p className="mt-2 text-sm text-ink-500">{t("ordersEmptyDesc")}</p>
        <Link
          href="/cuisines/asia"
          className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {t("browseRecipes")}
        </Link>
      </div>
    </div>
  );
}
