# System Patterns — 架构与关键模式

> 权威源：`projectbrief.md`。功能编号（F1–F7）与 projectBrief「核心功能」一一对应。

## 总体架构
Next.js 15 App Router，全站 SSG 静态预渲染（83 页）。无服务端运行时依赖（本地 JSON 构建期经 `node:fs` 读取）。

```
请求 → middleware.ts（next-intl：locale 前缀 + 浏览器语言重定向 / → /zh|/en）
     → [locale]/layout.tsx（getMessages → NextIntlClientProvider → Navbar/children/Footer）
     → 各页面（服务端组件，generateStaticParams 生成 zh/en 两份）
```

## 核心功能 → 实现模式映射（F1–F7）
| # | 功能 | 实现模式 |
| --- | --- | --- |
| F1 | 大洲/国家浏览 | `lib/taxonomy.ts` 静态数据 + `generateStaticParams` 全量预渲染 |
| F2 | 菜谱详情 | `lib/recipes.ts`（node:fs + 模块级缓存，`getRecipeBySlug`/相关推荐） |
| F3 | 付费锁定 | `isPremium` 字段 → PremiumLock 视觉锁定（非安全边界，`TODO(security)`） |
| F4 | 会员订阅 | 静态三档卡片，价格文案在 messages（`membership.*Price`），`TODO(payment)` |
| F5 | 多语言 | next-intl v3：middleware 前缀路由 + messages 命名空间 + setRequestLocale |
| F6 | 搜索/筛选 | 构建期生成 RecipeSearchItem 索引 → SearchClient 客户端过滤；FilterableRecipeGrid；useFavorites（LocalStorage） |
| F7 | 区块链预留 | 占位组件模式：虚线卡片 + 徽章 + 文件头 `TODO(web3)` 规划注释 |

## 关键模式

### i18n（next-intl v3）— 三条铁律
1. `[locale]/layout.tsx` 必须 `getMessages()` 显式传给 `<NextIntlClientProvider messages={...}>`，否则客户端组件静态渲染 MISSING_MESSAGE
2. 每个页面组件必须 `setRequestLocale(locale)` 启用静态渲染
3. 服务端组件用 `getTranslations`（async），客户端组件用 `useTranslations`

- 命名空间：metadata / nav / home / continents / countries / categories / difficulty / cuisines / recipe / premium / membership / contributors / about / contact / search / favorites / footer / web3 / common
- 404：非法 locale `notFound()`；`/zh/unknown` 由 `[locale]/[...rest]/page.tsx` catch-all 触发本地化 404；根 `src/app/not-found.tsx` 兜底
- 每页 `generateMetadata`：本地化 title/description + `alternates.languages` hreflang

### 数据层与组件复用
- RecipeCard 接受 `RecipeCardData`（Pick of Recipe），搜索/收藏/列表三处复用
- 展示名（大洲/国家/类别/难度）只存 messages，不进菜谱 JSON

### 收藏（`src/lib/favorites.ts`）
- LocalStorage key `worldflavors:favorites`，旧 key `worldcuisine:favorites` 自动迁移
- `loaded` 标记避免 SSR/CSR 水合不一致（骨架屏）

### 客户端组件陷阱
- `useSearchParams` 必须包 `<Suspense>`，否则静态生成失败（见 search/page.tsx）

### 汇率（`src/lib/exchangeRates.ts`）
- 纯函数 `usdToBtc(usd, rate)` 6 位小数；常量 MOCK_BTC_USD_RATE / SINGLE_RECIPE_PRICE_USD；`TODO(api)` 接 CoinGecko 时改服务端缓存读取

## 编辑/构建注意（工具链经验）
- editor 工具 `new_text` 上限约 6000 字符 → 大文件分块 insert；old_text 需全文唯一（重复会失败，带足上下文）
- PowerShell 处理 UTF-8/JSON 内联断言易乱码 → 内容断言用临时 `.mjs` 脚本 + `node script.mjs`，验证后删除
- 构建日志：`cmd /c "npm run build > build.log 2>&1"` 后 Select-String 提取
- 起 prod 验证：`Start-Process -PassThru node node_modules/next/dist/bin/next start`，用完 `Stop-Process`
