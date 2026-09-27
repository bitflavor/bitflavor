import { useTranslations } from "next-intl";

// TODO(web3): DAO 投票/共创入口预留位置
// 未来规划：
// 1. 平台重大决策（新增菜系、功能方向、收益分配）由社区 DAO 投票
// 2. 投票权重 = 贡献积分 + NFT 会员等级
// 3. 此处接入 Snapshot 或自建 Governor 合约的前端入口
export default function DaoEntry() {
  const t = useTranslations("contributors");
  const tWeb3 = useTranslations("web3");

  return (
    <section className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-8">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>🗳️</span>
        <h2 className="text-xl font-bold text-ink-900">{t("daoTitle")}</h2>
      </div>
      <p className="mt-3 text-ink-600">{t("daoDesc")}</p>
      <span className="mt-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
        {tWeb3("comingSoon")}
      </span>
    </section>
  );
}
