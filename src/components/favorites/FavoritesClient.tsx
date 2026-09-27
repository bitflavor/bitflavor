"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Recipe } from "@/types/recipe";
import { useFavorites } from "@/lib/favorites";
import RecipeCard from "@/components/recipes/RecipeCard";

// 收藏页客户端组件：从 LocalStorage 读取收藏 slug，过滤服务端传入的全部菜谱
export default function FavoritesClient({ recipes }: { recipes: Recipe[] }) {
  const t = useTranslations("favorites");
  const { loaded, favorites } = useFavorites();

  // LocalStorage 读取完成前显示加载占位，避免闪烁
  if (!loaded) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-2xl bg-ink-100"
          />
        ))}
      </div>
    );
  }

  const favs = recipes.filter((r) => favorites.includes(r.slug));

  if (favs.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-5xl" aria-hidden>🍽️</div>
        <p className="mt-4 text-ink-500">{t("empty")}</p>
        <Link
          href="/#continents"
          className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {t("explore")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-ink-400">{t("storedLocally")}</p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favs.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
