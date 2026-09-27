// 多语言文本：同一内容的中英文版本
export interface LocalizedText {
  zh: string;
  en: string;
}

// 菜谱分类（展示文案见 messages 中 categories 命名空间）
export type RecipeCategory = "main" | "soup" | "dessert" | "snack" | "drink";

// 难度（展示文案见 messages 中 difficulty 命名空间）
export type RecipeDifficulty = "easy" | "medium" | "hard";

// 菜谱 JSON 文件结构
// 存放路径：src/data/recipes/<continent>/<country>/<slug>.json
export interface Recipe {
  slug: string; // 英文短链接，用于 /recipes/[slug]
  title: LocalizedText;
  country: string; // 国家 slug，展示名对应 messages 中 countries.<country>
  continent: string; // 大洲 slug，展示名对应 messages 中 continents.<continent>
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  time: number; // 预计用时（分钟）
  servings: number; // 几人份
  coverImage: string; // /public 下的封面图路径
  summary: LocalizedText; // 一句话介绍
  ingredients: LocalizedText[];
  steps: LocalizedText[];
  tips: LocalizedText[];
  failChecks: LocalizedText[];
  culturalStory: LocalizedText;
  isPremium: boolean; // 是否付费内容
  featured?: boolean; // 是否进入首页"热门菜谱"推荐
}

// 轻量搜索索引项：由服务端生成后通过 props 传给客户端组件
//（客户端不能直接 import 依赖 node:fs 的 recipes.ts）
export interface RecipeSearchItem {
  slug: string;
  titleZh: string;
  titleEn: string;
  country: string;
  continent: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  time: number;
  coverImage: string;
  summaryZh: string;
  summaryEn: string;
  isPremium: boolean;
  // 合并后的食材文本（双语），用于食材搜索匹配
  ingredientsText: string;
}

// RecipeCard 组件所需的最小字段集合
//（搜索结果等轻量数据可转换为此类型后复用卡片组件）
export type RecipeCardData = Pick<
  Recipe,
  | "slug"
  | "title"
  | "summary"
  | "country"
  | "category"
  | "difficulty"
  | "time"
  | "coverImage"
  | "isPremium"
>;
