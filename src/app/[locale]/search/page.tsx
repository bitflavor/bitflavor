import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSearchIndex } from "@/lib/recipes";
import { isValidLocale, routing } from "@/i18n/routing";
import SearchClient from "@/components/search/SearchClient";

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
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: t("title"),
    alternates: { languages: { zh: "/zh/search", en: "/en/search" } },
  };
}

// 搜索页：服务端生成搜索索引，客户端组件本地过滤
export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const index = getSearchIndex();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">{t("title")}</h1>
      <div className="mt-6">
        {/* useSearchParams 需要 Suspense 边界（Next.js 静态渲染要求） */}
        <Suspense fallback={null}>
          <SearchClient items={index} />
        </Suspense>
      </div>
    </div>
  );
}
