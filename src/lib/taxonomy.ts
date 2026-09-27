// 大洲与国家元数据
// 展示名称不写在这里，统一走 messages（continents.* / countries.* / *Descriptions.*）
// 数组顺序即页面展示顺序

export interface CountryMeta {
  slug: string;
  continent: string;
  coverImage: string; // 国家封面图
}

export interface ContinentMeta {
  slug: string;
  emoji: string; // 大洲卡片图标
  coverImage: string;
  countries: CountryMeta[];
}

export const CONTINENTS: ContinentMeta[] = [
  {
    slug: "asia",
    emoji: "🥟",
    coverImage: "/images/continents/asia.svg",
    countries: [
      { slug: "china", continent: "asia", coverImage: "/images/countries/china.svg" },
      { slug: "japan", continent: "asia", coverImage: "/images/countries/japan.svg" },
      { slug: "korea", continent: "asia", coverImage: "/images/countries/korea.svg" },
    ],
  },
  {
    slug: "southeast-asia",
    emoji: "🌶️",
    coverImage: "/images/continents/southeast-asia.svg",
    countries: [
      { slug: "thailand", continent: "southeast-asia", coverImage: "/images/countries/thailand.svg" },
      { slug: "vietnam", continent: "southeast-asia", coverImage: "/images/countries/vietnam.svg" },
    ],
  },
  {
    slug: "europe",
    emoji: "🥖",
    coverImage: "/images/continents/europe.svg",
    countries: [
      { slug: "italy", continent: "europe", coverImage: "/images/countries/italy.svg" },
      { slug: "france", continent: "europe", coverImage: "/images/countries/france.svg" },
    ],
  },
  {
    slug: "americas",
    emoji: "🌮",
    coverImage: "/images/continents/americas.svg",
    countries: [
      { slug: "mexico", continent: "americas", coverImage: "/images/countries/mexico.svg" },
      { slug: "peru", continent: "americas", coverImage: "/images/countries/peru.svg" },
    ],
  },
  {
    slug: "africa",
    emoji: "🍲",
    coverImage: "/images/continents/africa.svg",
    countries: [
      { slug: "morocco", continent: "africa", coverImage: "/images/countries/morocco.svg" },
    ],
  },
  {
    slug: "oceania",
    emoji: "🥝",
    coverImage: "/images/continents/oceania.svg",
    countries: [
      { slug: "australia", continent: "oceania", coverImage: "/images/countries/australia.svg" },
    ],
  },
];

export const CONTINENT_SLUGS = CONTINENTS.map((c) => c.slug);

// 按 slug 获取大洲元数据
export function getContinent(slug: string): ContinentMeta | undefined {
  return CONTINENTS.find((c) => c.slug === slug);
}

// 按 slug 获取国家元数据（需同时匹配大洲，防止跨大洲撞名）
export function getCountry(
  continentSlug: string,
  countrySlug: string
): CountryMeta | undefined {
  return getContinent(continentSlug)?.countries.find(
    (c) => c.slug === countrySlug
  );
}
