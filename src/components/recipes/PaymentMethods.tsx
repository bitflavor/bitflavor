import { useTranslations } from "next-intl";

// 支付方式图标展示（PremiumLock 内嵌）
// 现状：会员订阅已接 Stripe Checkout（/membership 三档），银行卡支付经 Stripe 托管收银台完成
// TODO(payment) 预留：
// 1. 单菜谱一次性购买（$1.99，lib/exchangeRates.SINGLE_RECIPE_PRICE_USD）
// 2. PayPal / 加密货币链上支付（Bitcoin、Ethereum、USDT、USDC）
export default function PaymentMethods() {
  const t = useTranslations("premium");

  const methods = [
    { icon: "🅿️", name: "PayPal" },
    { icon: "💳", name: t("paymentCard") },
    { icon: "₿", name: "Bitcoin" },
    { icon: "Ξ", name: "Ethereum" },
    { icon: "₮", name: "USDT" },
    { icon: "💵", name: "USDC" },
  ];

  return (
    <div className="mt-5 border-t border-ink-100 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
        {t("paymentTitle")}
      </p>
      <ul className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
        {methods.map((m) => (
          <li
            key={m.name}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-700"
          >
            <span aria-hidden>{m.icon}</span>
            {m.name}
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              {t("paymentComingSoon")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
