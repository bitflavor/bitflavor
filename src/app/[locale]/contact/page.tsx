import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";
import ContactForm from "@/components/contact/ContactForm";

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
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    keywords: t("keywords"),
    alternates: { languages: { zh: "/zh/contact", en: "/en/contact" } },
  };
}

// 联系我们：联系方式卡片 + 演示表单
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  const channels = [
    { icon: "📧", label: t("emailLabel"), value: t("emailValue") },
    { icon: "📝", label: t("contributeLabel"), value: t("contributeValue") },
    { icon: "💬", label: t("socialLabel"), value: "@WorldFlavors" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {/* 页头 */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t("subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* 联系方式 */}
        <div className="space-y-4">
          {channels.map((c) => (
            <div
              key={c.label}
              className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5"
            >
              <span className="text-2xl" aria-hidden>{c.icon}</span>
              <div>
                <h2 className="font-bold text-ink-900">{c.label}</h2>
                <p className="mt-1 text-sm text-ink-500">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 留言表单（演示版） */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-ink-900">{t("formTitle")}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
