"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { RecipeCardData, RecipeSearchItem } from "@/types/recipe";
import RecipeCard from "@/components/recipes/RecipeCard";

// 搜索索引项 → 卡片数据
function toCardData(it: RecipeSearchItem): RecipeCardData {
  return {
    slug: it.slug,
    title: { zh: it.titleZh, en: it.titleEn },
    summary: { zh: it.summaryZh, en: it.summaryEn },
    country: it.country,
    category: it.category,
    difficulty: it.difficulty,
    time: it.time,
    coverImage: it.coverImage,
    isPremium: it.isPremium,
  };
}

// 搜索页客户端组件：关键词本地过滤（标题/简介/食材，双语均匹配）
export default function SearchClient({ items }: { items: RecipeSearchItem[] }) {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  // 支持从 ?q= 带入初始关键词（如外部跳转）
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (it) =>
        it.titleZh.toLowerCase().includes(q) ||
        it.titleEn.toLowerCase().includes(q) ||
        it.summaryZh.toLowerCase().includes(q) ||
        it.summaryEn.toLowerCase().includes(q) ||
        it.ingredientsText.toLowerCase().includes(q)
    );
  }, [items, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div>
      {/* 搜索输入框 */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("title")}
          className="w-full rounded-full border border-ink-200 py-3 pl-12 pr-4 text-ink-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          autoFocus
        />
      </div>

      {/* 结果区 */}
      <div className="mt-8">
        {!hasQuery ? (
          <p className="py-16 text-center text-ink-400">{t("startTyping")}</p>
        ) : results.length === 0 ? (
          <p className="py-16 text-center text-ink-400">{t("noResults")}</p>
        ) : (
          <>
            <p className="text-sm text-ink-500">
              {t("results", { count: results.length })}
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((it) => (
                <RecipeCard key={it.slug} recipe={toCardData(it)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
