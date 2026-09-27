"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Recipe, RecipeCategory } from "@/types/recipe";
import RecipeCard from "./RecipeCard";

// 类别筛选 + 菜谱网格（客户端组件，筛选无需刷新页面）
const CATEGORY_ORDER: (RecipeCategory | "all")[] = [
  "all",
  "main",
  "soup",
  "dessert",
  "snack",
  "drink",
];

export default function FilterableRecipeGrid({
  recipes,
}: {
  recipes: Recipe[];
}) {
  const tCategories = useTranslations("categories");
  const tCuisines = useTranslations("cuisines");
  const [active, setActive] = useState<RecipeCategory | "all">("all");

  // 只展示当前数据中真实存在的类别（"全部"始终显示）
  const available = useMemo(() => {
    const set = new Set(recipes.map((r) => r.category));
    return CATEGORY_ORDER.filter(
      (c) => c === "all" || set.has(c as RecipeCategory)
    );
  }, [recipes]);

  const filtered =
    active === "all" ? recipes : recipes.filter((r) => r.category === active);

  return (
    <div>
      {/* 类别筛选按钮组 */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {available.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === c
                ? "bg-brand-500 text-white"
                : "border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {tCategories(c)}
          </button>
        ))}
      </div>

      {/* 菜谱网格 */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-ink-400">{tCuisines("noRecipes")}</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
