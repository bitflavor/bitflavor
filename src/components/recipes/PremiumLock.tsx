import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PaymentMethods from "@/components/recipes/PaymentMethods";
import { SINGLE_RECIPE_PRICE_USD, usdToBtc } from "@/lib/exchangeRates";

// 付费内容锁定层：中央显示解锁提示与"解锁完整做法"/"开通会员"按钮。
// 使用场景：付费菜谱的默认占位（PremiumContent 初始态 / 未登录 / 非会员）——
// 付费内容经 /api/recipes/[slug]/content 服务端鉴权后按需下发，永不进入初始 HTML。
// children 可选：
// - 不传（默认·安全模式）：渲染骨架占位条（纯装饰，无真实文本）
// - 传入（仅限非敏感的视觉预览）：内容模糊 + 禁止选中 —— 注意这不是安全边界
export default function PremiumLock({
  children,
}: {
  children?: React.ReactNode;
}) {
  const t = useTranslations("premium");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-100">
      {children ? (
        /* 兼容路径：真实内容模糊展示（仅用于非敏感预览场景，非安全边界） */
        <div className="lock-blur max-h-72 overflow-hidden p-6" aria-hidden>
          {children}
        </div>
      ) : (
        /* 骨架占位：模拟被截断的步骤内容（纯装饰条，无真实文本） */
        <div className="max-h-72 space-y-5 overflow-hidden p-6" aria-hidden>
          {[92, 78, 88, 64].map((w, i) => (
            <div key={i} className="space-y-2">
              <div
                className="h-4 rounded bg-ink-100"
                style={{ width: `${w}%` }}
              />
              <div className="h-3 w-3/5 rounded bg-ink-50" />
            </div>
          ))}
        </div>
      )}
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
