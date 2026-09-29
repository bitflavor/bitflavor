"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import PremiumLock from "./PremiumLock";
import type { Recipe } from "@/types/recipe";

// 与 /api/recipes/[slug]/content 的 200 响应结构一致
type PremiumData = Pick<Recipe, "steps" | "tips" | "failChecks" | "culturalStory">;

interface Props {
  slug: string;
  locale: "zh" | "en";
}

/**
 * 付费菜谱内容（客户端按需拉取）
 *
 * 安全设计：付费菜谱页面外壳是登录态中性的 SSG（构建期预渲染），本组件初始渲染
 * 会员锁占位 —— 因此初始 HTML 中绝不含付费内容（curl/view-source 可验证）。
 * 挂载后请求 /api/recipes/[slug]/content：
 *   200（有效会员）→ 替换渲染完整内容
 *   401/403/其他    → 保持会员锁（未登录引导开通，非会员同理）
 *
 * 加载中与未授权同态（均为锁占位），避免向未授权用户暴露"内容存在性"以外的任何信号。
 */
export default function PremiumContent({ slug, locale }: Props) {
  const t = useTranslations("recipe");
  const [content, setContent] = useState<PremiumData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recipes/${slug}/content`)
      .then(async (res) => {
        if (!cancelled && res.ok) {
          setContent((await res.json()) as PremiumData);
        }
      })
      .catch(() => {
        /* 网络异常：保持锁占位，用户可刷新重试 */
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!content) return <PremiumLock />;

  return (
    <>
      {/* 做法步骤 */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <span aria-hidden>👨‍🍳</span>
          {t("steps")}
        </h2>
        <ol className="mt-4 space-y-4">
          {content.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="leading-relaxed text-ink-700">{step[locale]}</p>
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
          {content.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed text-ink-700">
              <span className="text-brand-500">✓</span>
              {tip[locale]}
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
          {content.failChecks.map((check, i) => (
            <li key={i} className="rounded-lg bg-ink-50 p-3 text-sm leading-relaxed text-ink-600">
              {check[locale]}
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
        <p className="mt-3 leading-loose text-ink-700">{content.culturalStory[locale]}</p>
      </section>
    </>
  );
}
