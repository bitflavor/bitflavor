import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAllRecipes,
  getRecipeBySlug,
  getRelatedRecipes,
} from "@/lib/recipes";
import { isValidLocale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import RecipeCard from "@/components/recipes/RecipeCard";
import FavoriteButton from "@/components/recipes/FavoriteButton";
import PremiumLock from "@/components/recipes/PremiumLock";
import ChainCertifyEntry from "@/components/web3/ChainCertifyEntry";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// 静态生成：2 语言 × 全部菜谱
export function generateStaticParams() {
  const recipes = getAllRecipes();
  return routing.locales.flatMap((locale) =>
    recipes.map((r) => ({ locale, slug: r.slug }))
  );
}

// SEO：每个菜谱独立的本地化 meta + OpenGraph + hreflang
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};
  const loc = locale as "zh" | "en";
  const tCountries = await getTranslations({ locale, namespace: "countries" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });

  return {
    title: recipe.title[loc],
    description: recipe.summary[loc],
    keywords: [
      recipe.title.zh,
      recipe.title.en,
      tCountries(recipe.country),
      tCategories(recipe.category),
      locale === "zh" ? "菜谱" : "recipe",
      locale === "zh" ? "做法" : "how to cook",
    ],
    openGraph: {
      title: recipe.title[loc],
      description: recipe.summary[loc],
      images: [{ url: recipe.coverImage, alt: recipe.title[loc] }],
      type: "article",
    },
    alternates: {
      languages: {
        zh: `/zh/recipes/${slug}`,
        en: `/en/recipes/${slug}`,
      },
    },
  };
}

// 菜谱详情页
export default async function RecipeDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const recipe = getRecipeBySlug(slug);
  if (!recipe) notFound();

  const loc = locale as "zh" | "en";
  const t = await getTranslations({ locale, namespace: "recipe" });
  const tContinents = await getTranslations({ locale, namespace: "continents" });
  const tCountries = await getTranslations({ locale, namespace: "countries" });
  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const tDifficulty = await getTranslations({ locale, namespace: "difficulty" });
  const tPremium = await getTranslations({ locale, namespace: "premium" });

  const related = getRelatedRecipes(recipe, 3);

  // JSON-LD 结构化数据（Schema.org Recipe）：提升搜索富摘要展示（评分/耗时/配料等）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title[loc],
    description: recipe.summary[loc],
    image: [`${SITE_URL}${recipe.coverImage}`],
    author: { "@type": "Organization", name: "BitFlavor" },
    recipeCuisine: tCountries(recipe.country),
    recipeCategory: tCategories(recipe.category),
    keywords: [recipe.title.zh, recipe.title.en].join(", "),
    recipeYield: `${recipe.servings} ${locale === "zh" ? "人份" : "servings"}`,
    totalTime: `PT${recipe.time}M`,
    recipeIngredient: recipe.ingredients.map((ing) => ing[loc]),
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step[loc],
    })),
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    url: `${SITE_URL}/${locale}/recipes/${recipe.slug}`,
  };


  // 付费菜谱锁定"完整内容"区域（做法/技巧/排查/文化故事）
  // TODO(security): 当前为演示版视觉锁定，内容仍在 HTML 中；
  // 接入真实支付后应在服务端按会员状态截断数据。
  const lockedContent = (
    <>
      {/* 做法步骤 */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span aria-hidden>👨‍🍳</span>
          {t("steps")}
        </h2>
        <ol className="mt-4 space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="leading-relaxed text-ink-700">{step[loc]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 关键技巧 */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span aria-hidden>💡</span>
          {t("tips")}
        </h2>
        <ul className="mt-4 space-y-2">
          {recipe.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed text-ink-700">
              <span className="text-brand-500">✓</span>
              {tip[loc]}
            </li>
          ))}
        </ul>
      </section>

      {/* 失败排查 */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span aria-hidden>🩹</span>
          {t("failChecks")}
        </h2>
        <ul className="mt-4 space-y-2">
          {recipe.failChecks.map((check, i) => (
            <li key={i} className="rounded-lg bg-ink-50 p-3 text-sm leading-relaxed text-ink-600">
              {check[loc]}
            </li>
          ))}
        </ul>
      </section>

      {/* 文化背景故事 */}
      <section className="rounded-2xl bg-brand-50 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span aria-hidden>📜</span>
          {t("culturalStory")}
        </h2>
        <p className="mt-3 leading-loose text-ink-700">
          {recipe.culturalStory[loc]}
        </p>
      </section>
    </>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* JSON-LD 结构化数据（Schema.org Recipe），供搜索引擎富摘要使用 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 面包屑 */}
      <nav className="text-sm text-ink-400">
        <Link href={`/cuisines/${recipe.continent}`} className="hover:text-brand-600">
          {tContinents(recipe.continent)}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/cuisines/${recipe.continent}/${recipe.country}`}
          className="hover:text-brand-600"
        >
          {tCountries(recipe.country)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-600">{recipe.title[loc]}</span>
      </nav>

      {/* 头部：封面 + 基本信息 */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={recipe.coverImage}
            alt={recipe.title[loc]}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {recipe.isPremium && (
            <span className="absolute right-3 top-3 rounded-full bg-ink-950/85 px-3 py-1 text-sm font-medium text-brand-300">
              👑 {tPremium("badge")}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {recipe.title[loc]}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-500">
            {recipe.summary[loc]}
          </p>

          {/* 元信息 */}
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-400">{t("countryLabel")}</dt>
              <dd className="mt-1 font-medium text-ink-800">
                {tCountries(recipe.country)}
              </dd>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-400">{t("categoryLabel")}</dt>
              <dd className="mt-1 font-medium text-ink-800">
                {tCategories(recipe.category)}
              </dd>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-400">{t("difficultyLabel")}</dt>
              <dd className="mt-1 font-medium text-ink-800">
                {tDifficulty(recipe.difficulty)}
              </dd>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-400">{t("timeLabel")}</dt>
              <dd className="mt-1 font-medium text-ink-800">
                {t("minutes", { count: recipe.time })}
              </dd>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-400">🍽️</dt>
              <dd className="mt-1 font-medium text-ink-800">
                {t("servings", { count: recipe.servings })}
              </dd>
            </div>
            <div className="flex items-center">
              <FavoriteButton slug={recipe.slug} />
            </div>
          </dl>
        </div>
      </div>



      {/* 正文内容 */}
      <div className="mt-12 max-w-3xl space-y-10">
        {/* 食材清单：免费与付费均展示（部分信息） */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
            <span aria-hidden>🧺</span>
            {t("ingredients")}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {recipe.ingredients.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-700"
              >
                <span className="text-brand-500">•</span>
                {item[loc]}
              </li>
            ))}
          </ul>
        </section>

        {/* 免费菜谱展示完整内容；付费菜谱锁定 */}
        {recipe.isPremium ? (
          <PremiumLock>{lockedContent}</PremiumLock>
        ) : (
          lockedContent
        )}

        {/* TODO(web3): 内容上链确权入口（占位） */}
        <ChainCertifyEntry />
      </div>

      {/* 相关菜谱 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-ink-900">{t("relatedRecipes")}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <RecipeCard key={r.slug} recipe={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
