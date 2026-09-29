"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// ── 与 /api/stripe/orders 响应结构对应 ──────────────────────────────
interface MembershipInfo {
  tier: string | null; // "monthly" | "yearly" | "lifetime" | null（price 反查失败）
  status: string; // active | trialing | past_due
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface InvoiceItem {
  id: string;
  number: string | null;
  description: string | null;
  amount: number; // 最小货币单位（美分）
  currency: string;
  created: string;
  status: string | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

interface OrdersData {
  membership: MembershipInfo | null;
  invoices: InvoiceItem[];
}

/** 发票状态 → 展示样式（key 对应 i18n orders.inv_*） */
const INVOICE_STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  open: "bg-amber-50 text-amber-700",
  draft: "bg-ink-50 text-ink-500",
  void: "bg-ink-50 text-ink-500",
  uncollectible: "bg-red-50 text-red-600",
};

/**
 * 我的订单（客户端视图）：会员状态卡片 + 订单/发票表格
 * 数据经 /api/stripe/orders 实时查询 Stripe；页面本身由 middleware auth.protect() 保证已登录。
 */
export default function OrdersView({ locale }: { locale: "zh" | "en" }) {
  const t = useTranslations("orders");
  const [data, setData] = useState<OrdersData | null>(null);
  const [error, setError] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(false);

  const intlLocale = locale === "zh" ? "zh-CN" : "en-US";
  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  const fmtAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/stripe/orders")
      .then(async (res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        setData((await res.json()) as OrdersData);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  /** 跳转 Stripe Customer Portal（取消/改支付方式等自助操作） */
  const openPortal = () => {
    setPortalLoading(true);
    setPortalError(false);
    fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        const { url } = (await res.json()) as { url: string };
        window.location.href = url;
      })
      .catch(() => {
        setPortalLoading(false);
        setPortalError(true);
      });
  };


  // ── 加载中 ────────────────────────────────────────────────────────
  if (!data && !error) {
    return (
      <div className="mt-10 space-y-6" aria-busy="true">
        <div className="h-36 animate-pulse rounded-2xl bg-ink-50" />
        <div className="h-64 animate-pulse rounded-2xl bg-ink-50" />
        <p className="sr-only">{t("loading")}</p>
      </div>
    );
  }

  // ── 加载失败 ──────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-red-200 bg-red-50 p-12 text-center">
        <div className="text-5xl" aria-hidden>⚠️</div>
        <p className="mt-4 font-bold text-ink-800">{t("loadError")}</p>
        <button
          type="button"
          onClick={load}
          className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  const { membership, invoices } = data;
  const tierLabel =
    membership?.tier === "monthly"
      ? t("tierMonthly")
      : membership?.tier === "yearly"
        ? t("tierYearly")
        : membership?.tier === "lifetime"
          ? t("tierLifetime")
          : t("tierUnknown");

  return (
    <div className="mt-10 space-y-10">
      {/* ── 会员状态卡片 ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-ink-900">{t("membershipTitle")}</h2>
        {membership ? (
          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {membership.tier === "lifetime" ? "👑" : "⭐"}
              </span>
              <span className="text-lg font-bold text-ink-900">{tierLabel}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  membership.status === "past_due"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {membership.status === "past_due"
                  ? t("statusPastDue")
                  : membership.status === "trialing"
                    ? t("statusTrialing")
                    : t("statusActive")}
              </span>
            </div>

            <p className="mt-3 text-sm text-ink-600">
              {membership.tier === "lifetime"
                ? t("lifetimeForever")
                : membership.cancelAtPeriodEnd && membership.currentPeriodEnd
                  ? t("cancelScheduled", { date: fmtDate(membership.currentPeriodEnd) })
                  : membership.currentPeriodEnd
                    ? t("renewsAt", { date: fmtDate(membership.currentPeriodEnd) })
                    : ""}
            </p>
            {membership.status === "past_due" && (
              <p className="mt-2 text-sm font-medium text-amber-700">{t("pastDueHint")}</p>
            )}

            {/* 订阅档才有"管理订阅"（取消/改支付方式）；lifetime 一次性无需管理 */}
            {membership.tier !== "lifetime" && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="rounded-full border border-brand-500 px-5 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:opacity-50"
                >
                  {portalLoading ? t("manageLoading") : t("manageSubscription")}
                </button>
                {portalError && (
                  <p className="mt-2 text-xs text-ink-500">{t("portalUnavailable")}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* 无有效会员：开通引导 */
          <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center">
            <div className="text-4xl" aria-hidden>🔓</div>
            <p className="mt-3 font-bold text-ink-800">{t("noMembership")}</p>
            <p className="mt-1 text-sm text-ink-500">{t("noMembershipDesc")}</p>
            <Link
              href="/membership"
              className="mt-5 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t("becomeMember")}
            </Link>
          </div>
        )}
      </section>


      {/* ── 订单与发票 ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-ink-900">{t("invoicesTitle")}</h2>
        {invoices.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center">
            <div className="text-4xl" aria-hidden>🧾</div>
            <p className="mt-3 text-sm text-ink-500">{t("invoicesEmpty")}</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50 text-left text-ink-500">
                  <th className="px-4 py-3 font-medium">{t("colDate")}</th>
                  <th className="px-4 py-3 font-medium">{t("colNumber")}</th>
                  <th className="px-4 py-3 font-medium">{t("colDesc")}</th>
                  <th className="px-4 py-3 font-medium">{t("colAmount")}</th>
                  <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                  <th className="px-4 py-3 font-medium">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                      {fmtDate(inv.created)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-500">
                      {inv.number ?? inv.id.slice(-8)}
                    </td>
                    <td className="max-w-56 truncate px-4 py-3 text-ink-700">
                      {inv.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-ink-900">
                      {fmtAmount(inv.amount, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          INVOICE_STATUS_STYLE[inv.status ?? ""] ??
                          "bg-ink-50 text-ink-500"
                        }`}
                      >
                        {inv.status ? t(`inv_${inv.status}`) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {inv.pdfUrl && (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-3 text-brand-600 hover:underline"
                        >
                          {t("downloadPdf")}
                        </a>
                      )}
                      {inv.hostedUrl && (
                        <a
                          href={inv.hostedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          {t("viewOnline")}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
