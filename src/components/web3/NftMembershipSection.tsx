import { useTranslations } from "next-intl";

// TODO(web3): NFT 会员权益展示预留位置
// 未来规划：
// 1. 会员开通后铸造 NFT 会员卡（ERC-721 / ERC-1155）
// 2. 此处展示用户持有的 NFT 卡片、等级与权益
// 3. 付费内容解锁改为链上校验 hasNFT(address)
export default function NftMembershipSection() {
  const t = useTranslations("membership");
  const tWeb3 = useTranslations("web3");

  return (
    <section className="mt-12 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-8 text-center">
      <div className="text-4xl" aria-hidden>🪪</div>
      <h2 className="mt-3 text-xl font-bold text-ink-900">
        {t("nftSectionTitle")}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-ink-600">
        {t("nftSectionDesc")}
      </p>
      <span className="mt-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
        {tWeb3("comingSoon")}
      </span>
    </section>
  );
}
