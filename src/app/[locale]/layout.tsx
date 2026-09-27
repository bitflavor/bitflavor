import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "../globals.css";

// 静态生成两种语言的页面
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 全站默认 SEO 元数据（各页面可通过 generateMetadata 覆盖）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    // 解析 OG/Twitter 卡片等社交分享图相对 URL 的基准（消除构建期 metadataBase 警告）
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"), // 子页面标题格式：xxx | 世界美食图谱
    },
    description: t("defaultDescription"),
    // hreflang 互链，告诉搜索引擎本页存在中英两个版本
    alternates: {
      languages: { zh: "/zh", en: "/en" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 非法 locale 直接 404
  if (!isValidLocale(locale)) {
    notFound();
  }
  // 启用静态渲染
  setRequestLocale(locale);
  // 显式获取全部翻译消息传给客户端 Provider，
  // 保证客户端组件（Navbar 等）的 useTranslations 在静态渲染时可用
  const messages = await getMessages();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink-800 antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
