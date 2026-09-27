import { useTranslations } from "next-intl";

// TODO(web3): 贡献者积分/代币展示预留位置
// 未来规划：
// 1. 贡献行为（提交菜谱、翻译校对）铸造为链上积分或 ERC-20 代币
// 2. 此处展示当前用户的积分余额、排行榜与可兑换权益
// 3. 积分将作为 DAO 投票权重（voting power）
export default function ContributorPoints() {
  const t = useTranslations("contributors");
  const tWeb3 = useTranslations("web3");

  return (
    <section className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-8">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>🪙</span>
        <h2 className="text-xl font-bold text-ink-900">
          {t("pointsSectionTitle")}
        </h2>
      </div>
      <p className="mt-3 text-ink-600">{t("pointsSectionDesc")}</p>
      {/* TODO(web3): 链上积分 / 代币空投说明（仅 UI 预留，未接真实合约） */}
      <p className="mt-3 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-medium text-brand-700">
        🪙 {t("pointsChainNote")}
      </p>
      <span className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700">
        {tWeb3("blockchainWip")}
      </span>
    </section>
  );
}
