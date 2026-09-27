import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PaymentMethods from "@/components/recipes/PaymentMethods";
import { SINGLE_RECIPE_PRICE_USD, usdToBtc } from "@/lib/exchangeRates";

// 付费内容锁定层：对锁定的内容区域做模糊遮罩，
// 中央显示解锁提示与"解锁完整做法"/"开通会员"按钮
export default function PremiumLock({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("premium");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-100">
      {/* 被锁定的内容：模糊 + 禁止选中（仅为视觉锁定，非安全边界） */}
      <div className="lock-blur max-h-72 overflow-hidden p-6" aria-hidden>
        {children}
      </div>
      {/* 底部渐隐，暗示下方还有内容 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-white/40 to-white" />

      {/* 解锁引导浮层 */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white/95 p-6 text-center shadow-xl">
          <div className="text-3xl" aria-hidden>🔒</div>
          <h3 className="mt-2 text-lg font-bold text-ink-900">
            {t("lockedTitle")}
          </h3>
          <p className="mt-1 text-sm text-ink-500">{t("lockedDesc")}</p>
          {/* 单菜价格 + BTC 等值（汇率来自 lib/exchangeRates，目前为模拟值） */}
          <p className="mt-3 text-sm text-ink-600">
            <span className="font-semibold text-brand-600">
              {t("singlePrice")}
            </span>
            <span className="mx-1 text-ink-300">·</span>
            {t("btcEquivalent", { btc: usdToBtc(SINGLE_RECIPE_PRICE_USD) })}
            <span className="ml-1 text-ink-400">{t("priceNote")}</span>
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/membership"
              className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              {t("unlockButton")}
            </Link>
            <Link
              href="/membership"
              className="rounded-full border border-brand-300 px-6 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              {t("joinButton")}
            </Link>
          </div>
          {/* 支付方式展示（仅 UI，未接真实支付） */}
          <PaymentMethods />
        </div>
      </div>
    </div>
  );
}
