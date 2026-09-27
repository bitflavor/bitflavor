import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// 404 页面
export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <div className="text-6xl" aria-hidden>🍽️</div>
      <h1 className="mt-6 text-3xl font-bold text-ink-900">
        404 · {t("notFoundTitle")}
      </h1>
      <p className="mt-3 text-ink-500">{t("notFoundDesc")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-600"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
