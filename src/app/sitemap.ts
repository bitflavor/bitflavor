import type { MetadataRoute } from "next";
import { CONTINENTS } from "@/lib/taxonomy";
import { getAllRecipes } from "@/lib/recipes";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// sitemap.xml：双语全部页面 + hreflang 互链
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/search",
    "/favorites",
    "/membership",
    "/contributors",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
  ];
  const continentPaths = CONTINENTS.map((c) => `/cuisines/${c.slug}`);
  const countryPaths = CONTINENTS.flatMap((c) =>
    c.countries.map((co) => `/cuisines/${c.slug}/${co.slug}`)
  );
  const recipePaths = getAllRecipes().map((r) => `/recipes/${r.slug}`);
  const allPaths = [
    ...staticPaths,
    ...continentPaths,
    ...countryPaths,
    ...recipePaths,
  ];

  return routing.locales.flatMap((locale) =>
    allPaths.map((p) => ({
      url: `${SITE_URL}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: p === "" ? ("daily" as const) : ("weekly" as const),
      priority: p === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${p}`])
        ),
      },
    }))
  );
}
