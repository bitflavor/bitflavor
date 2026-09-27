"use client";

import { useTranslations } from "next-intl";

// TODO(web3): 钱包连接预留位置
// 未来在此接入 wagmi / RainbowKit（或 AppKit），连接成功后：
// 1. 获取 address / chainId 存入全局状态
// 2. 校验用户是否持有 NFT 会员卡，解锁付费内容
// 3. 显示贡献者积分余额
export default function WalletConnectButton() {
  const t = useTranslations("web3");

  return (
    <button
      type="button"
      disabled
      title={t("comingSoon")}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-400 opacity-70 cursor-not-allowed"
    >
      <span aria-hidden>👛</span>
      {t("connectWallet")} · {t("comingSoon")}
    </button>
  );
}
