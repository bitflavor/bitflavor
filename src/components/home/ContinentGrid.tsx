import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTINENTS } from "@/lib/taxonomy";
import { getContinentRecipeCounts } from "@/lib/recipes";

// 首页大洲入口卡片：6 大洲，点击进入大洲列表页
export default function ContinentGrid() {
  const t = useTranslations("home");
  const tContinents = useTranslations("continents");
  const tDescs = useTranslations("continentDescriptions");
  const tCuisines = useTranslations("cuisines");
  const counts = getContinentRecipeCounts();

  return (
    <section id="continents" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
        {t("continentSectionTitle")}
      </h2>
      <p className="mt-2 text-ink-500">{t("continentSectionSubtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTINENTS.map((continent) => (
          <Link
            key={continent.slug}
            href={`/cuisines/${continent.slug}`}
            className="group rounded-2xl border border-ink-100 bg-gradient-to-br from-brand-50 to-white p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl" aria-hidden>{continent.emoji}</span>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                {tCuisines("recipeCount", { count: counts[continent.slug] ?? 0 })}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-bold text-ink-900 group-hover:text-brand-600">
              {tContinents(continent.slug)}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-ink-500">
              {tDescs(continent.slug)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
