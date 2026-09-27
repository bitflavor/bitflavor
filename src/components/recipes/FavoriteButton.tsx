"use client";

import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/favorites";

// 收藏按钮：LocalStorage 实现（暂不接数据库）
export default function FavoriteButton({ slug }: { slug: string }) {
  const t = useTranslations("recipe");
  const { loaded, isFavorite, toggle } = useFavorites();
  // loaded 前统一显示未收藏态，避免水合不一致
  const fav = loaded && isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={fav}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
        fav
          ? "bg-red-50 text-red-600 border border-red-200"
          : "border border-ink-200 text-ink-600 hover:border-red-200 hover:text-red-500"
      }`}
    >
      <span aria-hidden>{fav ? "❤️" : "🤍"}</span>
      {fav ? t("favorited") : t("favorite")}
    </button>
  );
}
