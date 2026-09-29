"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MembershipTier } from "@/lib/stripe";

interface Props {
  tier: MembershipTier;
  locale: string;
  /** 按钮默认文案（membership.buyNow） */
  label: string;
  featured?: boolean;
  /** 已是有效会员：禁用并显示 alreadyMember */
  disabled?: boolean;
}

/**
 * 会员购买按钮：POST /api/stripe/checkout → 302 跳转 Stripe 托管收银台
 * - 401 → 引导登录（带回跳参数）
 * - 409 already_member → 刷新页面让服务端会员状态生效
 * - 仅 type-only import MembershipTier，stripe SDK 不会进入客户端包
 */
export default function CheckoutButton({
  tier,
  locale,
  label,
  featured,
  disabled,
}: Props) {
  const t = useTranslations("checkout");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, locale }),
      });
      if (res.status === 401) {
        window.location.href = `/${locale}/login?redirect_url=/${locale}/membership`;
        return;
      }
      if (res.status === 409) {
        window.location.reload();
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        url?: string;
      } | null;
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(t("failed"));
      setLoading(false);
    } catch {
      setError(t("failed"));
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={`block w-full rounded-full py-2.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          featured
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "border border-brand-300 text-brand-600 hover:bg-brand-50"
        }`}
      >
        {disabled ? t("alreadyMember") : loading ? t("loading") : label}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
