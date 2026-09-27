import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { RecipeCardData } from "@/types/recipe";

// 菜谱卡片：服务端/客户端组件通用（不含浏览器 API）
// 用于首页推荐、国家页列表、搜索结果、收藏页等场景
export default function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const locale = useLocale() as "zh" | "en";
  const tCategories = useTranslations("categories");
  const tDifficulty = useTranslations("difficulty");
  const tCountries = useTranslations("countries");
  const tRecipe = useTranslations("recipe");
  const tPremium = useTranslations("premium");

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* 封面图 + 付费角标 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.coverImage}
          alt={recipe.title[locale]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {recipe.isPremium && (
          <span className="absolute right-2 top-2 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-medium text-brand-300">
            👑 {tPremium("badge")}
          </span>
        )}
      </div>

      {/* 文字信息 */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-ink-900 group-hover:text-brand-600">
          {recipe.title[locale]}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-500">
          {recipe.summary[locale]}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
          <span>📍 {tCountries(recipe.country)}</span>
          <span>🍽️ {tCategories(recipe.category)}</span>
          <span>⏱️ {tRecipe("minutes", { count: recipe.time })}</span>
          <span className={
            recipe.difficulty === "easy"
              ? "text-green-600"
              : recipe.difficulty === "medium"
                ? "text-amber-600"
                : "text-red-600"
          }>
            ● {tDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>
    </Link>
  );
}
