import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// 全站页脚：导航链接 + Web3 规划预留栏目
export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-950 text-ink-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* 品牌 */}
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-2xl" aria-hidden>🍜</span>
            WorldFlavors
          </div>
          <p className="mt-3 text-sm text-ink-300">{t("slogan")}</p>
        </div>

        {/* 探索 */}
        <div>
          <h3 className="font-semibold text-white">{t("exploreTitle")}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-brand-300" href="/#continents">{tNav("cuisines")}</Link></li>
            <li><Link className="hover:text-brand-300" href="/search">{tNav("searchPlaceholder")}</Link></li>
            <li><Link className="hover:text-brand-300" href="/favorites">{tNav("favorites")}</Link></li>
          </ul>
        </div>

        {/* 关于 */}
        <div>
          <h3 className="font-semibold text-white">{t("aboutTitle")}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-brand-300" href="/about">{tNav("about")}</Link></li>
            <li><Link className="hover:text-brand-300" href="/contributors">{tNav("contributors")}</Link></li>
            <li><Link className="hover:text-brand-300" href="/membership">{tNav("membership")}</Link></li>
            <li><Link className="hover:text-brand-300" href="/contact">{tNav("contact")}</Link></li>
          </ul>
        </div>

        {/* Web3 规划栏目（占位，暂无实际链接） */}
        <div>
          <h3 className="font-semibold text-white">{t("web3Title")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li>🪪 {t("web3Nft")}</li>
            <li>🪙 {t("web3Points")}</li>
            <li>🗳️ {t("web3Dao")}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-400">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
