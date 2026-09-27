import { useTranslations } from "next-intl";

// TODO(web3): 内容上链确权入口预留位置
// 未来规划：
// 1. 原创菜谱内容哈希（如 IPFS CID）写入区块链，生成确权凭证
// 2. 贡献者可在此入口为菜谱铸造确权 NFT，保护署名权
// 3. 页面展示该菜谱的链上凭证编号与查询链接（如 Etherscan）
export default function ChainCertifyEntry() {
  const t = useTranslations("web3");

  return (
    <div className="mt-8 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-4 text-sm text-ink-500">
      <div className="flex items-center gap-2 font-medium text-ink-700">
        <span aria-hidden>🔗</span>
        {t("certifyTitle")}
      </div>
      <p className="mt-1">{t("certifyDesc")}</p>
    </div>
  );
}
