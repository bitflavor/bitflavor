# Implementation Plan — 第一阶段·内容完善：亚洲菜谱扩充（16 → 34 道）

## [Overview]

将菜谱数据从 16 道扩充至 34 道：中国 +7、韩国 +5（新国家）、日本 +3、泰国 +3，全部双语、符合现有 `Recipe` JSON 结构，并自动生成配套 SVG 占位图，路由/搜索/筛选/sitemap 零代码改动自动生效。

**背景与依据**：`memory-bank/progress.md` 第一阶段目标为「中国10道、日本5道、韩国5道、泰国5道」；当前实际为 中3/日2/韩0/泰2。本计划补齐缺口共 18 道（菜名清单已与用户确认，见附录 A）。韩国为新增国家，需先行扩展 taxonomy 与 messages 元数据，否则页面会 MISSING_MESSAGE。

**零代码改动的自动生效链路**（已调查确认）：
- 路由：`recipes/[slug]/page.tsx` 的 `generateStaticParams` 由 `getAllRecipes()` 目录扫描驱动
- 搜索：`getSearchIndex()` 自动纳入新菜谱
- 筛选：`FilterableRecipeGrid` 只显示数据中真实存在的类别
- sitemap：`getAllRecipes()` 驱动，自动 +36 URL（18 道 × 2 语言）
- 构建产物预期：83 静态页 → **119 静态页**

**不在本计划范围**：真实封面图上传（用户提供素材后替换 `public/images/` 同名文件即可，JSON 无需改）、第二~五阶段（支付/虚拟币/部署/区块链）。

## [Types]

**无类型变更。** `src/types/recipe.ts` 的 `Recipe` / `RecipeCategory` / `RecipeDifficulty` 已覆盖全部需求（5 类别 × 3 难度）。新增菜谱仅产出符合现有接口的数据。

每道菜谱 JSON 的字段规格（与现有 16 道对齐）：
| 字段 | 规格 |
| --- | --- |
| slug | 英文短链，与文件名一致，全局唯一 |
| title/summary/culturalStory | `{ zh, en }` 双语，均非空 |
| country / continent | 与所在目录 `src/data/recipes/<continent>/<country>/` 一致 |
| category | main / soup / dessert / snack / drink |
| difficulty | easy / medium / hard |
| time / servings | 分钟数 / 人份（正整数） |
| coverImage | `/images/recipes/<slug>.svg`（真实图上线前替换同名文件） |
| ingredients | 7–8 条 `{ zh, en }` |
| steps | 6 条 `{ zh, en }` |
| tips / failChecks | 各 3 条 `{ zh, en }` |
| isPremium | 新增 5 道付费（附录 A 标注），全站付费率维持 ~29% |
| featured | 均不设（保持首页现有 6 道推荐稳定） |

## [Files]

### 新增：18 个菜谱 JSON（内容与文案为主要工作量）
| 路径 | 说明 |
| --- | --- |
| `src/data/recipes/asia/china/kung-pao-chicken.json` | 宫保鸡丁 |
| `src/data/recipes/asia/china/sichuan-hotpot.json` | 四川火锅 👑premium |
| `src/data/recipes/asia/china/sweet-sour-pork.json` | 糖醋里脊 |
| `src/data/recipes/asia/china/hot-sour-soup.json` | 酸辣汤 |
| `src/data/recipes/asia/china/egg-fried-rice.json` | 黄金蛋炒饭 |
| `src/data/recipes/asia/china/mooncake.json` | 广式月饼 👑premium |
| `src/data/recipes/asia/china/spring-rolls.json` | 春卷 |
| `src/data/recipes/asia/korea/bibimbap.json` | 石锅拌饭 👑premium |
| `src/data/recipes/asia/korea/kimchi-pancake.json` | 泡菜煎饼 |
| `src/data/recipes/asia/korea/korean-fried-chicken.json` | 韩式炸鸡 👑premium |
| `src/data/recipes/asia/korea/doenjang-jjigae.json` | 大酱汤 |
| `src/data/recipes/asia/korea/tteokbokki.json` | 辣炒年糕 |
| `src/data/recipes/asia/japan/tempura.json` | 天妇罗 |
| `src/data/recipes/asia/japan/miso-soup.json` | 味噌汤 |
| `src/data/recipes/asia/japan/dorayaki.json` | 铜锣烧 |
| `src/data/recipes/southeast-asia/thailand/green-curry-chicken.json` | 绿咖喱鸡 👑premium |
| `src/data/recipes/southeast-asia/thailand/mango-sticky-rice.json` | 芒果糯米饭 |
| `src/data/recipes/southeast-asia/thailand/thai-milk-tea.json` | 泰式奶茶 |

### 生成（脚本产出，不手写）：19 张 SVG
- `public/images/countries/korea.svg` ×1 + `public/images/recipes/<新slug>.svg` ×18
- 由 `node scripts/generate-placeholders.mjs` 扫描 JSON 自动生成

### 修改：4 个已有文件
1. **`src/lib/taxonomy.ts`** — `asia.countries` 数组在 japan 后插入：
   `{ slug: "korea", continent: "asia", coverImage: "/images/countries/korea.svg" }`
   （数组顺序即展示顺序：中国 → 日本 → 韩国）
2. **`messages/zh.json`** — `countries` 加 `"korea": "韩国"`；`countryDescriptions` 加韩国描述（发酵与辣酱的艺术，泡菜/大酱/烧烤文化）
3. **`messages/en.json`** — `countries` 加 `"korea": "South Korea"`；`countryDescriptions` 加对应英文描述
4. **`scripts/generate-placeholders.mjs`** — `COUNTRY_META` 加 `korea: { emoji: "🍱", label: "Korea 韩国" }`；`RECIPE_EMOJI` 加 18 条新菜谱 emoji 映射（见附录 B）

### 收尾更新
5. **`README.md`** — 数据描述「16 个菜谱 JSON」→ 34；「6 大洲 × 10 国家」→ 11 国家
6. **`memory-bank/progress.md`** — 第一阶段菜谱项打勾；**`memory-bank/activeContext.md`** — 当前进行中收尾

### 临时文件（验证后删除）
7. `check-recipes.mjs`（根目录）— 数据校验脚本，跑完即删
8. `check-smoke.mjs`（根目录）— 冒烟断言脚本，跑完即删

**无文件删除/移动。**

## [Functions]

**无函数新增/修改/删除。** 数据层（`src/lib/recipes.ts` 全部函数）、页面（`generateStaticParams` / `generateMetadata`）、组件（RecipeCard / FilterableRecipeGrid / SearchClient / PremiumLock）均无需改动，新数据自动流入。

## [Classes]

无（项目为函数式 React 组件，无类）。

## [Dependencies]

**无新增依赖、无版本变更。** 数据与脚本均在现有 Next.js 15 / Node 运行时内完成。

## [Testing]

### 1. 数据校验（临时脚本 `check-recipes.mjs`，node 运行后删除）
扫描 `src/data/recipes/**` 全部 JSON 并断言：
- 必需字段齐全、`zh`/`en` 均非空字符串
- `slug` === 文件名（去 .json）、全局唯一
- `country`/`continent` === 所在目录名
- `coverImage` 指向的文件在 `public/images/` 中存在
- 条数规格：ingredients 7–8、steps 6、tips 3、failChecks 3
- 输出统计：总数 34、中国 10 / 韩国 5 / 日本 5 / 泰国 5、premium 10、featured 6

### 2. 构建验证
`npm run build` → 退出码 0；静态页 **83 → 119**（+36）；输出无 `MISSING_MESSAGE` / 无新增警告。

### 3. 冒烟断言（临时脚本 `check-smoke.mjs`，起 dev 服务器验证后清理）
| 断言 | 预期 |
| --- | --- |
| `/zh/cuisines/asia` 200 | 出现「韩国」国家卡片；中国卡片显示「10 道菜谱」 |
| `/zh/cuisines/asia/korea` 200 | 5 道菜；类别筛选出现 主食/汤品/小吃 |
| `/zh/recipes/kung-pao-chicken` 200 | 免费菜谱完整步骤可见 |
| `/zh/recipes/bibimbap` 200 | PremiumLock 付费锁出现（新 premium 样本） |
| `/en/recipes/tteokbokki` 200 | 英文文案正常 |
| `/zh/search` 200 | 搜索索引含新 slug（页面内嵌数据命中 "mooncake"） |
| `/sitemap.xml` 200 | 含 `/cuisines/asia/korea` 与 18 个新菜谱 URL |
| 首页 `/zh` | 热门推荐仍为原 6 道（featured 未动） |

### 4. 既有基线不回归
progress.md 验证基线中的原有路由（`/zh` `/en` `/zh/about` `/zh/recipes/peking-duck` 等）全部保持 200。

## [Implementation Order]（Focus Chain 结构化待办清单）

> 执行时逐项打勾；✅ 标准见各步骤末尾。

1. ☐ **韩国元数据先行**：改 `src/lib/taxonomy.ts`（asia.countries +korea）、`messages/zh.json`、`messages/en.json`（countries.korea + countryDescriptions.korea）。✅ 无新增 MISSING_MESSAGE 风险
2. ☐ **占位图脚本扩展**：`scripts/generate-placeholders.mjs` 加 `COUNTRY_META.korea` + 18 条 `RECIPE_EMOJI`（附录 B）
3. ☐ **中国 7 道 JSON**（当前最高优先，对齐 progress.md「中国菜优先」）
4. ☐ **韩国 5 道 JSON**（依赖步骤 1：SSG 构建时 `tCountries(recipe.country)` 会立即解析 messages）
5. ☐ **日本 3 道 JSON**
6. ☐ **泰国 3 道 JSON**（步骤 3–6 相互独立，可按任意顺序）
7. ☐ **生成占位图**：`node scripts/generate-placeholders.mjs` → 输出新增 1 国家图 + 18 菜谱图
8. ☐ **数据校验**：写 `check-recipes.mjs` 并运行 → 全部断言通过后删除
9. ☐ **构建验证**：`npm run build` → exit 0 / 119 页 / 0 MISSING_MESSAGE
10. ☐ **冒烟断言**：写 `check-smoke.mjs`，起 dev 跑断言表 → 全过后删除脚本、确认无残留进程
11. ☐ **README 数字更新**：16→34、10→11 国家
12. ☐ **memory-bank 收尾**：progress.md 第一阶段菜谱项打勾、activeContext.md 更新当前状态
13. ☐ **交付汇总**：变更清单 + 验证结果报告

**顺序约束**：1 → 4（韩国 JSON 前必须有 messages）；2 → 7（脚本先有映射再生成）；3–6 → 7（图由 JSON 扫描生成）；7 → 8（校验含图片存在性）；8 → 9 → 10。

**实施期注意**（来自 memory-bank 踩坑记录）：
- 每个菜谱 JSON 单独一次 editor 调用创建（约 3–4KB，远低于 6000 字符限制）
- messages JSON 编辑用上下文锚定确保 `old_text` 唯一（`"japan"` 在 countries / countryDescriptions 各出现一次）
- 校验/冒烟一律用临时 `.mjs` 脚本，不用 PowerShell 直接处理 UTF-8 中文

## 附录 A：18 道菜谱明细规格（菜名清单已与用户确认）

### 中国 +7（`asia/china/`）→ 合计 10 道
| slug | 中文 / English | category | difficulty | time | servings | premium | 文化故事方向 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kung-pao-chicken | 宫保鸡丁 / Kung Pao Chicken | main | medium | 30 | 2 | – | 清末丁宝桢「宫保」官衔得名，糊辣荔枝味型 |
| sichuan-hotpot | 四川火锅 / Sichuan Hotpot | main | medium | 90 | 4 | 👑 | 重庆码头船工围炉涮烫，牛油九宫格 |
| sweet-sour-pork | 糖醋里脊 / Sweet and Sour Pork | main | medium | 40 | 3 | – | 糖醋味型源自中原，随移民传遍南北 |
| hot-sour-soup | 酸辣汤 / Hot and Sour Soup | soup | easy | 25 | 4 | – | 北方醒酒汤，酸辣开胃的家常温度 |
| egg-fried-rice | 黄金蛋炒饭 / Golden Egg Fried Rice | main | easy | 15 | 1 | – | 隔夜饭的华丽转身，与扬州炒饭的渊源 |
| mooncake | 广式月饼 / Cantonese Mooncakes | dessert | hard | 180 | 8 | 👑 | 中秋团圆之味，莲蓉蛋黄与元代传说 |
| spring-rolls | 春卷 / Spring Rolls | snack | medium | 45 | 4 | – | 立春「咬春」习俗，从春盘到炸春卷 |

### 韩国 +5（`asia/korea/`，新国家）→ 合计 5 道
| slug | 中文 / English | category | difficulty | time | servings | premium | 文化故事方向 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| bibimbap | 石锅拌饭 / Bibimbap | main | medium | 45 | 2 | 👑 | 全州拌饭，五色食材对应五行哲学 |
| kimchi-pancake | 泡菜煎饼 / Kimchi Pancake | snack | easy | 20 | 2 | – | 雨天煎饼配米酒的市井民俗 |
| korean-fried-chicken | 韩式炸鸡 / Korean Fried Chicken | snack | medium | 60 | 3 | 👑 | 朝鲜战争后炸鸡本土化，「치맥」炸鸡配啤酒文化 |
| doenjang-jjigae | 大酱汤 / Doenjang Jjigae | soup | easy | 30 | 2 | – | 发酵大酱是韩国家庭餐桌的味道底色 |
| tteokbokki | 辣炒年糕 / Tteokbokki | snack | medium | 30 | 2 | – | 从宫廷酱油炒年糕到街头红色国民小吃 |

### 日本 +3（`asia/japan/`）→ 合计 5 道
| slug | 中文 / English | category | difficulty | time | servings | premium | 文化故事方向 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tempura | 天妇罗 / Tempura | snack | medium | 40 | 2 | – | 16 世纪葡萄牙传入，江户时代的快餐 |
| miso-soup | 味噌汤 / Miso Soup | soup | easy | 15 | 2 | – | 「一汁一菜」的日常，出汁是灵魂 |
| dorayaki | 铜锣烧 / Dorayaki | dessert | easy | 30 | 4 | – | 武士传说与哆啦 A 梦的国民点心 |

### 泰国 +3（`southeast-asia/thailand/`）→ 合计 5 道
| slug | 中文 / English | category | difficulty | time | servings | premium | 文化故事方向 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| green-curry-chicken | 绿咖喱鸡 / Green Curry Chicken | main | medium | 40 | 3 | 👑 | 新鲜青辣椒的「甜绿」咖喱，椰浆调和 |
| mango-sticky-rice | 芒果糯米饭 / Mango Sticky Rice | dessert | easy | 50 | 2 | – | 椰浆糯米与雨季芒果的时令之味 |
| thai-milk-tea | 泰式奶茶 / Thai Milk Tea | drink | easy | 15 | 2 | – | 街头橙色茶饮，手标红茶与炼乳 |

**付费分配**：新增 5 道 premium → 全站 10/34 ≈ 29%，与现有 31% 基本持平；`featured` 均不设置，首页推荐保持现有 6 道。
**类别均衡**：新增后四国均有 main/soup/snack，泰国补齐 dessert+drink，日本补齐 dessert，中国补齐 soup/dessert。

## 附录 B：`RECIPE_EMOJI` 新增映射 + 韩国国家元数据

```js
// COUNTRY_META 新增：
korea: { emoji: "🍚", label: "Korea 韩国" },

// RECIPE_EMOJI 新增 18 条：
"kung-pao-chicken": "🐔",
"sichuan-hotpot": "🥘",
"sweet-sour-pork": "🍖",
"hot-sour-soup": "🥣",
"egg-fried-rice": "🍚",
"mooncake": "🥮",
"spring-rolls": "🌯",
"bibimbap": "🍱",
"kimchi-pancake": "🫓",
"korean-fried-chicken": "🍗",
"doenjang-jjigae": "🍲",
"tteokbokki": "🍢",
"tempura": "🍤",
"miso-soup": "🍵",
"dorayaki": "🥞",
"green-curry-chicken": "🍛",
"mango-sticky-rice": "🥭",
"thai-milk-tea": "🧋",
```

## 附录 C：messages 新增文案

```jsonc
// messages/zh.json
"countries": { "korea": "韩国" },
"countryDescriptions": { "korea": "发酵与辣酱的艺术，韩国料理以泡菜、大酱与烧烤文化闻名，讲究五色五味的平衡。" }

// messages/en.json
"countries": { "korea": "South Korea" },
"countryDescriptions": { "korea": "The art of fermentation and chili paste — Korean cuisine is famed for kimchi, doenjang and BBQ culture, balancing five colors and five flavors." }
```



