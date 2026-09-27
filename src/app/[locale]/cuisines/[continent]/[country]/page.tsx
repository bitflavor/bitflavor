import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTINENTS, getContinent, getCountry } from "@/lib/taxonomy";
import { getRecipesByCountry } from "@/lib/recipes";
import { isValidLocale, routing } from "@/i18n/routing";
import FilterableRecipeGrid from "@/components/recipes/FilterableRecipeGrid";

interface Props {
  params: Promise<{ locale: string; continent: string; country: string }>;
}

// 静态生成：2 语言 × 全部国家
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CONTINENTS.flatMap((c) =>
      c.countries.map((co) => ({
        locale,
        continent: c.slug,
        country: co.slug,
      }))
    )
  );
}

// SEO：每个国家页独立 meta
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, continent, country } = await params;
  if (!isValidLocale(locale) || !getCountry(continent, country)) return {};
  const tCountries = await getTranslations({ locale, namespace: "countries" });
  const tDescs = await getTranslations({ locale, namespace: "countryDescriptions" });
  return {
    title: tCountries(country),
    description: tDescs(country),
    alternates: {
      languages: {
        zh: `/zh/cuisines/${continent}/${country}`,
        en: `/en/cuisines/${continent}/${country}`,
      },
    },
  };
}

// 国家详情页：美食文化介绍 + 菜谱列表（按类别筛选）
export default async function CountryPage({ params }: Props) {
  const { locale, continent, country } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const countryMeta = getCountry(continent, country);
  if (!countryMeta) notFound();

  const t = await getTranslations({ locale, namespace: "cuisines" });
  const tContinents = await getTranslations({ locale, namespace: "continents" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });
  const tCountryDescs = await getTranslations({ locale, namespace: "countryDescriptions" });

  const recipes = getRecipesByCountry(continent, country);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* 面包屑 */}
      <nav className="text-sm text-ink-400">
        <Link href={`/cuisines/${continent}`} className="hover:text-brand-600">
          {tContinents(continent)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-600">{tCountries(country)}</span>
      </nav>

      {/* 页头 */}
      <h1 className="mt-4 text-3xl font-bold text-ink-900">
        {tCountries(country)}
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        {t("recipeCount", { count: recipes.length })}
      </p>

      {/* 美食文化介绍 */}
      <section className="mt-6 rounded-2xl bg-brand-50 p-6">
        <h2 className="flex items-center gap-2 font-bold text-ink-900">
          <span aria-hidden>📖</span>
          {t("cultureTitle")}
        </h2>
        <p className="mt-2 leading-relaxed text-ink-600">
          {tCountryDescs(country)}
        </p>
      </section>

      {/* 菜谱列表（类别筛选） */}
      <h2 className="mt-10 text-xl font-bold text-ink-900">
        {t("filterByCategory")}
      </h2>
      <div className="mt-4">
        <FilterableRecipeGrid recipes={recipes} />
      </div>
    </div>
  );
}
