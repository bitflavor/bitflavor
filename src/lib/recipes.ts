import fs from "node:fs";
import path from "node:path";
import type { Recipe, RecipeSearchItem } from "@/types/recipe";

// 菜谱数据目录：src/data/recipes/<continent>/<country>/<slug>.json
const RECIPES_DIR = path.join(process.cwd(), "src", "data", "recipes");

// 构建期/运行期缓存，避免重复读盘（数据为静态 JSON，安全）
let cache: Recipe[] | null = null;

// 读取全部菜谱（按目录递归扫描）
export function getAllRecipes(): Recipe[] {
  if (cache) return cache;

  const recipes: Recipe[] = [];
  if (!fs.existsSync(RECIPES_DIR)) return recipes;

  for (const continent of fs.readdirSync(RECIPES_DIR)) {
    const continentDir = path.join(RECIPES_DIR, continent);
    if (!fs.statSync(continentDir).isDirectory()) continue;

    for (const country of fs.readdirSync(continentDir)) {
      const countryDir = path.join(continentDir, country);
      if (!fs.statSync(countryDir).isDirectory()) continue;

      for (const file of fs.readdirSync(countryDir)) {
        if (!file.endsWith(".json")) continue;
        const raw = fs.readFileSync(path.join(countryDir, file), "utf-8");
        recipes.push(JSON.parse(raw) as Recipe);
      }
    }
  }

  cache = recipes;
  return recipes;
}

// 按 slug 获取单个菜谱
export function getRecipeBySlug(slug: string): Recipe | undefined {
  return getAllRecipes().find((r) => r.slug === slug);
}

// 按大洲获取菜谱
export function getRecipesByContinent(continent: string): Recipe[] {
  return getAllRecipes().filter((r) => r.continent === continent);
}

// 按国家获取菜谱
export function getRecipesByCountry(continent: string, country: string): Recipe[] {
  return getAllRecipes().filter(
    (r) => r.continent === continent && r.country === country
  );
}

// 首页热门推荐：featured 标记优先，不足时按顺序补齐
export function getFeaturedRecipes(limit = 6): Recipe[] {
  const all = getAllRecipes();
  const featured = all.filter((r) => r.featured);
  const rest = all.filter((r) => !r.featured);
  return [...featured, ...rest].slice(0, limit);
}

// 统计某大洲下每个国家的菜谱数量，用于国家卡片展示
export function getCountryRecipeCounts(continent: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of getRecipesByContinent(continent)) {
    counts[r.country] = (counts[r.country] ?? 0) + 1;
  }
  return counts;
}

// 统计每个大洲的菜谱数量
export function getContinentRecipeCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of getAllRecipes()) {
    counts[r.continent] = (counts[r.continent] ?? 0) + 1;
  }
  return counts;
}

// 相关菜谱推荐：同国家优先，其次同大洲，最后全站补齐
export function getRelatedRecipes(recipe: Recipe, limit = 3): Recipe[] {
  const others = getAllRecipes().filter((r) => r.slug !== recipe.slug);
  const sameCountry = others.filter((r) => r.country === recipe.country);
  const sameContinent = others.filter(
    (r) => r.country !== recipe.country && r.continent === recipe.continent
  );
  const rest = others.filter((r) => r.continent !== recipe.continent);
  return [...sameCountry, ...sameContinent, ...rest].slice(0, limit);
}

// 生成客户端搜索索引（仅包含搜索与卡片展示所需字段，减小传输体积）
export function getSearchIndex(): RecipeSearchItem[] {
  return getAllRecipes().map((r) => ({
    slug: r.slug,
    titleZh: r.title.zh,
    titleEn: r.title.en,
    country: r.country,
    continent: r.continent,
    category: r.category,
    difficulty: r.difficulty,
    time: r.time,
    coverImage: r.coverImage,
    summaryZh: r.summary.zh,
    summaryEn: r.summary.en,
    isPremium: r.isPremium,
    ingredientsText: r.ingredients
      .map((i) => `${i.zh} ${i.en}`)
      .join(" ")
      .toLowerCase(),
  }));
}

// 收藏页使用：按 slug 列表批量取菜谱的卡片数据
export function getRecipesBySlugs(slugs: string[]): Recipe[] {
  const all = getAllRecipes();
  return slugs
    .map((slug) => all.find((r) => r.slug === slug))
    .filter((r): r is Recipe => Boolean(r));
}
