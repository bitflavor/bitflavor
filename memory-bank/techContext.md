# Tech Context — 技术栈与环境

> 权威源：`projectbrief.md`「技术栈」一节，此处补充版本与工程细节。

## 技术栈（对齐 projectBrief）
| projectBrief 项 | 实际版本 / 细节 |
| --- | --- |
| Next.js App Router + TypeScript | Next.js 15 + React 19，全站 SSG（83 页） |
| Tailwind CSS | v4，CSS-first 配置，`brand-*` / `ink-*` 主题色 |
| next-intl（多语言） | v3.26，zh / en，URL 前缀路由，文案集中 `messages/{zh,en}.json` |
| 本地 JSON/Markdown 数据 | 当前 JSON：`src/data/recipes/<continent>/<country>/<slug>.json`（16 个菜谱）；构建期 `node:fs` 读取 + 缓存；Markdown 未使用（扩展预留） |
| Vercel 部署（目标） | 尚未部署；`sitemap.ts` / `robots.ts` 占位域名 `bitflavor.example.com` 需替换 |
| PayPal + 虚拟币支付（预留） | 仅 UI：PaymentMethods 六徽章（PayPal/信用卡/BTC/ETH/USDT/USDC）；`TODO(payment)` |

补充：收藏 = LocalStorage（useFavorites，无登录）；SEO = 每页本地化 metadata + OG + hreflang，sitemap/robots 静态生成。

## 开发环境
- OS：Windows（win32），Shell：PowerShell
- 工作目录：`d:\p2\hanbao-test`
- 未初始化 git（无 .git）

## 常用命令
```bash
npm run dev     # 开发 http://localhost:3000（/ 自动 307 → /zh 或 /en）
npm run build   # 生产构建（全量 SSG，当前 83 页）
npm start       # 生产服务器
node scripts/generate-placeholders.mjs   # 重新生成 SVG 占位图
```

## 重要文件
- `messages/{zh,en}.json` — 全部文案（新增 key 必须双语同步）
- `src/i18n/` — routing / navigation / request 配置
- `src/types/recipe.ts` — Recipe / RecipeSearchItem / RecipeCardData
- `src/lib/exchangeRates.ts` — 模拟汇率（`TODO(api)`: CoinGecko，建议服务端缓存 60s+）
- `src/app/sitemap.ts` / `robots.ts` — 占位域名，部署时替换
- `memory-bank/` — 项目记忆（本目录，6 文件，权威源为 projectbrief.md）

## 约束与依赖纪律
- 仅使用已安装的依赖，新增库需先确认 package.json
- 图片为 SVG 占位图（`public/images/`），上线前替换真实图
- 环境无特殊 env 变量；无数据库、无 API 密钥

## 已知陷阱（踩过坑）
1. PowerShell 内联 node fetch/JSON 断言乱码 → 写临时 `.mjs` 脚本执行
2. editor `new_text` > ~6000 字符会超时 → 分块插入
3. 同文件多处相同文本时 editor 替换失败 → old_text 带足上下文保证唯一
4. `useSearchParams` 需 Suspense 边界
5. NextIntlClientProvider 必须显式传 messages
