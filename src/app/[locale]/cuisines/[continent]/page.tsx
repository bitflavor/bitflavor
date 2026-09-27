import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CONTINENTS, getContinent } from "@/lib/taxonomy";
import { getCountryRecipeCounts, getRecipesByContinent } from "@/lib/recipes";
import { isValidLocale, routing } from "@/i18n/routing";
import RecipeCard from "@/components/recipes/RecipeCard";

interface Props {
  params: Promise<{ locale: string; continent: string }>;
}

// 静态生成：2 语言 × 6 大洲
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CONTINENTS.map((c) => ({ locale, continent: c.slug }))
  );
}

// SEO：每个大洲页独立 meta
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, continent } = await params;
  if (!isValidLocale(locale) || !getContinent(continent)) return {};
  const tContinents = await getTranslations({ locale, namespace: "continents" });
  const tDescs = await getTranslations({ locale, namespace: "continentDescriptions" });
  return {
    title: tContinents(continent),
    description: tDescs(continent),
    alternates: {
      languages: {
        zh: `/zh/cuisines/${continent}`,
        en: `/en/cuisines/${continent}`,
      },
    },
  };
}

// 大洲列表页：展示该大洲下所有国家/地区卡片 + 该大洲全部菜谱
export default async function ContinentPage({ params }: Props) {
  const { locale, continent } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const continentMeta = getContinent(continent);
  if (!continentMeta) notFound();

  const t = await getTranslations({ locale, namespace: "cuisines" });
  const tContinents = await getTranslations({ locale, namespace: "continents" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });
  const tCountryDescs = await getTranslations({ locale, namespace: "countryDescriptions" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const counts = getCountryRecipeCounts(continent);
  const recipes = getRecipesByContinent(continent);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* 页头 */}
      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden>{continentMeta.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold text-ink-900">
            {tContinents(continent)}
          </h1>
          <p className="mt-1 text-ink-500">
            {t("countryCount", { count: continentMeta.countries.length })} ·{" "}
            {t("recipeCount", { count: recipes.length })}
          </p>
        </div>
      </div>

      {/* 国家/地区卡片 */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {continentMeta.countries.map((country) => (
          <Link
            key={country.slug}
            href={`/cuisines/${continent}/${country.slug}`}
            className="group overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={country.coverImage}
                alt={tCountries(country.slug)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink-900 group-hover:text-brand-600">
                  {tCountries(country.slug)}
                </h2>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {t("recipeCount", { count: counts[country.slug] ?? 0 })}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink-500">
                {tCountryDescs(country.slug)}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-brand-600">
                {t("exploreCountry")} →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 该大洲全部菜谱 */}
      <h2 className="mt-14 text-2xl font-bold text-ink-900">
        {tContinents(continent)} · {tCommon("viewRecipe")}
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
