import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";
import { isValidLocale, routing } from "@/i18n/routing";
import FavoritesClient from "@/components/favorites/FavoritesClient";

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
  const t = await getTranslations({ locale, namespace: "favorites" });
  return {
    title: t("title"),
    alternates: { languages: { zh: "/zh/favorites", en: "/en/favorites" } },
  };
}

// 收藏页：服务端传入全部菜谱，客户端按 LocalStorage 收藏过滤
export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "favorites" });
  const recipes = getAllRecipes();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">{t("title")}</h1>
      <div className="mt-8">
        <FavoritesClient recipes={recipes} />
      </div>
    </div>
  );
}
