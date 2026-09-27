import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getFeaturedRecipes } from "@/lib/recipes";
import RecipeCard from "@/components/recipes/RecipeCard";

// 首页热门菜谱推荐
export default function FeaturedRecipes() {
  const t = useTranslations("home");
  const featured = getFeaturedRecipes(6);

  return (
    <section className="bg-ink-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
              {t("featuredSectionTitle")}
            </h2>
            <p className="mt-2 text-ink-500">{t("featuredSectionSubtitle")}</p>
          </div>
          <Link
            href="/search"
            className="hidden shrink-0 rounded-full border border-brand-300 px-4 py-1.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 sm:inline-block"
          >
            {t("viewAll")} →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/search"
            className="inline-block rounded-full border border-brand-300 px-6 py-2 text-sm font-medium text-brand-600"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
