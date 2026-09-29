import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";
import OrdersView from "@/components/account/OrdersView";

interface Props {
  params: Promise<{ locale: string }>;
}

// 页面外壳为登录态中性（数据由 OrdersView 客户端拉取），可静态生成；
// 未登录拦截由 middleware auth.protect() 统一负责
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("ordersMetaTitle"),
    robots: { index: false, follow: false },
  };
}

// 我的订单：会员状态卡片（Stripe 实时订阅）+ 订单/发票列表（Stripe invoices）
// 数据流：本页仅渲染静态外壳 → OrdersView 挂载后请求 /api/stripe/orders
export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {t("ordersTitle")}
      </h1>
      <OrdersView locale={locale as "zh" | "en"} />
    </div>
  );
}
