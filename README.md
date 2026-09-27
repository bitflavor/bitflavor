# BitFlavor 世界美食图谱

> **Slogan**：从比特币买披萨开始，到用虚拟币解锁全世界的美食。
> From buying pizza with Bitcoin to unlocking the world's flavors with crypto.

一个双语（中文 / English）的全球美食文化网站，按「大洲 → 国家 → 菜谱」组织内容，内置付费内容锁定、搜索、收藏等能力，并预留 Web3（NFT 会员 / 创作者积分 / 链上确权 / DAO 治理）与支付（PayPal / 信用卡 / 加密货币）扩展位。

品牌故事致敬 2010 年 5 月 22 日的「比特币披萨日」：Laszlo Hanyecz 用 10,000 BTC 购买两个披萨，是人类历史上首次用虚拟货币购买商品。本站延续这一精神——让全世界的美食都能用虚拟币购买，从亚洲开始，逐步扩展到全球。

## 技术栈

- **框架**：Next.js 15（App Router）+ React 19 + TypeScript
- **样式**：Tailwind CSS v4（CSS-first 配置，`brand-*` / `ink-*` 主题色）
- **国际化**：next-intl v3（`zh` / `en`，URL 前缀路由 `/zh/...`、`/en/...`，按浏览器语言自动重定向）
- **数据**：本地 JSON 文件（`src/data/recipes/<continent>/<country>/<slug>.json`），构建期经 `node:fs` 读取并缓存
- **收藏**：LocalStorage（`useFavorites` Hook），无需登录
- **SEO**：每页独立本地化 metadata + OpenGraph + hreflang 互链，`sitemap.ts` / `robots.ts` 全静态生成（SSG）

## 快速开始

```bash
npm install
npm run dev        # 开发：http://localhost:3000（自动重定向到 /zh 或 /en）
npm run build      # 生产构建（全部页面静态预渲染）
npm start          # 启动生产服务器
```

### 重新生成占位图

`public/images/` 下的 SVG 占位图由脚本生成（真实项目请替换为实拍图）：

```bash
node scripts/generate-placeholders.mjs
```

### 用户认证（Clerk，已集成）

登录 / 注册 / 账户中心由 [Clerk](https://clerk.com) 托管（免费额度 1 万 MAU）：

1. 打开 <https://dashboard.clerk.com> 免费创建应用（勾选 Email，可加 Google / GitHub 社交登录）
2. API Keys 页复制 `pk_test_...` / `sk_test_...`，替换 `.env.local` 中的占位 key（格式见 `.env.example`）
3. 无需改代码，重启即生效：`/{locale}/login`、`/{locale}/signup` 开放访问，`/{locale}/account/*` 未登录自动重定向到登录页
4. 上线时：Clerk 后台创建 Production 实例得到 `pk_live_...`，配置到 Vercel 环境变量

> 仓库不带真实密钥；`.env.local`（已 gitignore）中的占位 key 仅保证构建通过，真机登录需替换真实 key。

### 部署（Vercel）

1. `git init` 并推送到 GitHub/GitLab 仓库
2. Vercel → Add New Project → 导入仓库（Next.js 自动识别，零配置构建）
3. Project Settings → Environment Variables 设置 `NEXT_PUBLIC_SITE_URL` 为真实域名（参考 `.env.example`）
4. 绑定自定义域名后重新部署，`sitemap.xml` / `robots.txt` / OG 分享卡片自动使用真实域名

## 目录结构

```
├── messages/                  # 翻译文件（zh.json / en.json，所有文案集中于此）
├── public/images/             # 大洲 / 国家 / 菜谱占位图
├── scripts/generate-placeholders.mjs
└── src/
    ├── middleware.ts          # Clerk 认证（/account 保护）+ next-intl 语言中间件
    ├── i18n/                  # routing / navigation / request 配置
    ├── types/recipe.ts        # Recipe、RecipeSearchItem、RecipeCardData 类型
    ├── lib/
    │   ├── taxonomy.ts        # 6 大洲 × 11 国家基础数据
    │   ├── recipes.ts         # 菜谱加载 / 搜索索引 / 推荐 / 相关（node:fs，仅服务端）
    │   ├── favorites.ts       # useFavorites（LocalStorage，含旧品牌 key 自动迁移）
    │   └── exchangeRates.ts   # 汇率（模拟数据，TODO(api): 接 CoinGecko 实时价格）
    ├── data/recipes/          # 34 个菜谱 JSON（含中英文案、步骤、技巧、文化故事）
    ├── components/
    │   ├── layout/            # Navbar / Footer / LanguageSwitcher
    │   ├── home/              # Hero / ContinentGrid / FeaturedRecipes / MembershipTeaser
    │   ├── recipes/           # RecipeCard / FilterableRecipeGrid / PremiumLock / FavoriteButton
    │   │                      #   / PaymentMethods（支付方式 UI，未接接口）
    │   ├── search/            # SearchClient（客户端关键词过滤）
    │   ├── favorites/         # FavoritesClient
    │   ├── contact/           # ContactForm（演示版，不接后端）
    │   └── web3/              # 全部为占位组件：WalletConnectButton / NftMembershipSection /
    │                          #   ContributorPoints / ChainCertifyEntry / DaoEntry
    └── app/
        ├── sitemap.ts / robots.ts / not-found.tsx（根级兜底 404）
        └── [locale]/
            ├── layout.tsx / page.tsx / not-found.tsx
            ├── cuisines/[continent]/page.tsx              # 大洲页：国家卡片 + 菜谱
            ├── cuisines/[continent]/[country]/page.tsx    # 国家页：文化介绍 + 类别筛选
            ├── recipes/[slug]/page.tsx                    # 菜谱详情（付费锁定 / 收藏 / 相关推荐）
            ├── search / favorites / membership / contributors / about / contact
```

## 内容模型

菜谱 JSON 字段（见 `src/types/recipe.ts`）：

- 本地化文本统一为 `{ zh, en }` 结构（标题、简介、食材、步骤、技巧、失败排查、文化故事）
- `category`：`main / soup / dessert / snack / drink`；`difficulty`：`easy / medium / hard`
- `isPremium`：付费菜谱 —— 仅展示简介 + 食材，做法/技巧/文化故事由 `PremiumLock` 模糊锁定
- `featured`：进入首页「热门菜谱」

大洲 / 国家 / 类别 / 难度的展示名不在 JSON 中，而在 `messages/*.json`（`continents`、`countries`、`categories`、`difficulty` 命名空间），组件通过 `useTranslations` 动态取值。

新增菜谱只需在对应目录添加 JSON 并重新构建，路由、搜索、sitemap 自动生效。

## 重要说明与待办

- **付费锁定是视觉演示**：被锁内容仍存在于 HTML 中。接入真实支付后应在服务端按会员状态截断数据（见 `recipes/[slug]/page.tsx` 中 `TODO(security)`）。
- **Web3 均为占位**：搜索 `TODO(web3)` 查看接入点（钱包连接 wagmi/RainbowKit、NFT 会员合约、积分系统、链上确权、Snapshot/Governor DAO）。
- **支付未接入**：会员页按钮、菜谱锁定层的支付方式图标（PayPal / 信用卡 / Bitcoin / Ethereum / USDT / USDC）均为纯 UI 展示（`TODO(payment)`，建议 Stripe + 加密货币双通道）。
- **汇率为模拟数据**：菜谱价格旁的 BTC 等值使用 `src/lib/exchangeRates.ts` 中的硬编码汇率（`TODO(api)`，后期接 CoinGecko API，建议服务端缓存 60s+）。
- **联系表单不接后端**：`TODO(backend)`，仅前端演示。
- **图片为 SVG 占位图**：上线前替换为真实美食图片（保持路径或更新 JSON 中 `coverImage`）。
- 站点域名为占位值 `bitflavor.example.com`（`src/lib/site.ts` 回退值）：部署时设置环境变量 `NEXT_PUBLIC_SITE_URL` 即可，无需改代码（见「部署（Vercel）」）。

## 页面清单（每页均 zh/en 双语静态生成）

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：Hero（含品牌故事条）/ 大洲导览 / 热门菜谱 / 会员预览 |
| `/cuisines/[continent]` | 大洲页：国家卡片（菜谱数）+ 该洲全部菜谱 |
| `/cuisines/[continent]/[country]` | 国家页：美食文化介绍 + 按类别筛选菜谱 |
| `/recipes/[slug]` | 菜谱详情：食材 / 步骤 / 技巧 / 失败排查 / 文化故事 / 收藏 / 付费锁（含单菜价格 + BTC 汇率 + 支付方式 UI） |
| `/search` | 搜索（菜名 / 国家 / 食材，双语匹配，客户端过滤） |
| `/favorites` | 我的收藏（LocalStorage） |
| `/membership` | 会员三档订阅 + 终身档 NFT 会员卡标签（占位）+ NFT 会员区（占位） |
| `/contributors` | 创作者计划 + 链上积分文案（占位）/ DAO（占位） |
| `/about` `/contact` | 关于我们（含比特币披萨品牌故事）/ 联系我们 |
