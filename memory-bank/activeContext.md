# Active Context — 当前工作状态

> 更新时间：2026-09-28（阶段 B·Stripe 支付集成完成，141 页，冒烟 17/17）
> 权威源：`projectbrief.md`。功能编号（F1–F7）与其「核心功能」一一对应。

## 协作约定（用户设定，2026-09-27）
1. **每完成一个阶段的任务后，更新本文件**，记录当前进度（阶段状态 / 最近变更 / 下一步）。
2. **对话变长、出现"遗忘"或响应变慢时**：用 `/smol` 或 `/newtask` 清理上下文。新会话启动时先读本文件 + `progress.md` 恢复状态，再继续执行。

## 当前状态
**projectBrief 定义的 7 项核心功能已全部落地；F3 付费保护、F4 会员订阅已由 UI 级升级为 Stripe 真实实现（沙盒）。**
- 构建 exit 0，141 页（139 静态含 orders 双语外壳 + 6 API ƒ），0 MISSING_MESSAGE
- 冒烟 17/17 通过（页面可达/付费内容零泄露/支付与订单 API 门槛/受保护页重定向）
- memory bank 6 文件已初始化并按 projectBrief 对齐（本文件与 progress.md 为高频更新文件）

## 核心功能现状速览（F1–F7）
- F1 大洲/国家浏览、F2 菜谱详情、F5 多语言、F6 搜索筛选收藏：**完整实现**
- F3 付费锁定：**服务端保护已实现**（SSG 登录中立外壳 + `GET /api/recipes/[slug]/content` 鉴权下发，HTML/JSON-LD 零泄露，`TODO(security)` 已消除）
- F4 会员订阅：**Stripe 已接入**（托管收银台：订阅/终身买断 + 自动税 + 发票；webhook 回写 Clerk metadata；`/account/orders` 实时查询 + Customer Portal；`TODO(payment)` 已消除，剩沙盒 4 项用户配置）
- F7 区块链预留：UI 完整（`TODO(web3)`）

## 最近变更
1. **品牌 + Web3 预留六需求**（已完成）：品牌故事（Hero tagline + about 比特币披萨 4 段卡）、PaymentMethods 六支付方式徽章、exchangeRates 模拟汇率（0.000030 BTC）、终身档 NFT 会员卡徽章、贡献者链上积分文案、全站改名 WorldFlavors（含 favorites 旧 key 迁移；注：后于 item 9 二次改名为 BitFlavor）
2. **memory bank 初始化**：projectbrief 按用户官方信息填写（愿景/核心功能 7 条/技术栈/目标用户），其余 5 文件据此自动对齐
3. **progress.md 重写为五阶段规划**（2026-09-27）：当前进入 **第一阶段·内容完善**；搜索/收藏/筛选经核对已提前完成（见 progress.md 文末事实修正说明）
4. **第一阶段·菜谱扩充完成**（2026-09-27）：新增 18 道双语菜谱（中+7 宫保鸡丁/四川火锅👑/糖醋里脊/酸辣汤/蛋炒饭/月饼👑/春卷；韩+5 石锅拌饭👑/泡菜煎饼/韩式炸鸡👑/大酱汤/辣炒年糕；日+3 天妇罗/味噌汤/铜锣烧；泰+3 绿咖喱鸡👑/芒果糯米饭/泰式奶茶），新增韩国国家（taxonomy + zh/en messages + 占位图脚本映射），总数 16→34（付费 10/34），featured 保持原 6 道不变
5. **展示版部署配置完成**（2026-09-27，用户定路线"先 A 展示版 后 B 商业版"）：新建 `src/lib/site.ts`（`SITE_URL` = `NEXT_PUBLIC_SITE_URL` 环境变量 ?? 占位域名），sitemap/robots 硬编码域名已改为引用；`[locale]/layout.tsx` 补 `metadataBase`（构建警告消除）；新建 `.env.example`（含阶段②支付变量预留）；`.clineignore` 排除扫描噪音；README 增加部署小节；`git init` + 首次提交完成。构建 121 页 0 警告。**待用户**：买域名 → 推 GitHub → Vercel 导入 + 配 `NEXT_PUBLIC_SITE_URL`
6. **法律三页完成**（2026-09-27）：新增 `/privacy`（7 节）、`/terms`（7 节）、`/refund`（6 节）双语静态页（通用模板文案，商用前需法律审核替换）；Footer 新增「法律」列（grid 4→5 列）；sitemap 收录三页；messages 双端 +56 key（221→277，镜像同步）。构建 127 页 0 警告，冒烟 11/11 通过（页面内容/Footer 链接/sitemap/基线回归）
7. **SEO 优化完成**（2026-09-27，详见 git 46ab111）
8. **阶段 B·用户认证（Clerk）集成完成**（2026-09-27）：① 安装 `@clerk/nextjs`（Core 3）+ `@clerk/localizations`；② middleware 合并 clerkMiddleware + next-intl，`createRouteMatcher(["/:locale/account(.*)"])` 保护账户路由（未登录：浏览器 307→登录页 / API 404）；③ layout 包 `<ClerkProvider localization={zhCN/enUS}>`；④ 新页面：`/login`、`/signup`（Clerk 托管 UI，SSG），`/account`（欢迎页+三入口卡片）、`/account/profile`（`<UserProfile/>`）、`/account/orders`（占位 + `TODO(payment)`）；⑤ Navbar 用 Core 3 新 API `<Show when="signed-in/out">`（SignedIn/SignedOut 已被 Core 3 移除会构建报错）+ `<UserButton userProfileUrl={/{locale}/account/profile}>`；⑥ `.env.local` 占位 key（格式合法可构建，真机登录需用户换真 key，README 有步骤）；⑦ messages 双端 +18 key（nav.login/account + auth 7 + account 11 镜像）。**Clerk Core 3 踩坑记录**：`SignedIn/SignedOut/Protect` 已删除（用 `<Show>`）；`auth.protect()` 对非 document 请求返回 404 而非重定向（文档行为）；传 `unauthenticatedUrl` 参数会导致 API 请求 500（勿传）；dev key 下浏览器首次访问任意页面会 307 handshake 到 `*.clerk.accounts.dev`（正常流程）；`export const dynamic = "force-dynamic"` 与 [locale] generateStaticParams 共存会导致运行时 404（勿用，靠 auth() 自然动态化）。构建 137 页 0 警告，冒烟 13/13（保护拦截 4+3 / 登录注册页 4 / 基线 2）
9. **品牌二次改名 WorldFlavors → BitFlavor**（2026-09-27，对齐 GitHub 仓库 bitflavor/bitflavor）：全局 19 文件替换（品牌名/域名 bitflavor.example.com/邮箱/package name/OG SVG）；`favorites.ts` 迁移链升级为数组 `["worldflavors:favorites","worldcuisine:favorites"]` → `bitflavor:favorites`（三代 key 兼容）；项目文件夹同步改名 d:\p2\bitflavor。**踩坑**：① PowerShell `-replace` 不区分大小写——`worldflavors` 被 'WorldFlavors'→'BitFlavor' 规则吃掉，小写语境（域名/邮箱/npm name）误变大写，需逐一修回（npm name 大写会报错）；② **改名后首次构建必须清 .next 缓存**——增量构建复用旧 prerender 产物导致 sitemap.xml/robots.txt 运行时 404（manifest/产物不一致），`Remove-Item -Recurse .next` 全量重建即恢复 200。构建 137 页，冒烟 8/8（品牌 7 项 + 账号保护回归）

10. **阶段 B·Stripe 支付集成完成**（2026-09-28，分两次实施；路线：Billing 订阅 + Payments 一次性 + Tax 自动税 + Invoicing 发票，Connect 延后；**零数据库**——会员状态存 Clerk `publicMetadata.stripe`，订单页走 Stripe API 实时查询）
    - **第一轮（API + 两大根因修复）**：`src/lib/stripe.ts`（pin `2026-02-25.basil`）+ `src/lib/membership.ts`（MembershipState/canViewPremium/isMembershipActive，basil `current_period_end` 双读 item/顶层）；4 API：`checkout`（subscription/payment 双模式 + automatic_tax + tax_id_collection + invoice_creation + 用户级 Customer 复用）、`webhook`（文本体签名验证 → processedSessions 幂等（保 50）→ 6 事件族 → Clerk metadata 回写，sub- 事件回写默认 unknown 态防状态丢失）、`recipes/[slug]/content`（服务端鉴权 401/403）、`orders`+`portal`（第二轮）。**根因①**：middleware matcher 排除 `/api` → checkout route 的 `auth()` 无 Clerk 上下文 500；修复 = matcher 增 API 白名单 + `/api/` 早退跳过 intl。**根因②**：Next 15 禁同路由"部分 slug 静态部分动态"（force-dynamic 全炸）；修复 = **付费菜谱改全 SSG 登录中立外壳**（服务端零 auth）+ `PremiumContent.tsx` 客户端拉 API 按需下发，付费内容物理上不进 HTML（JSON-LD 同步剔除 instructions）
    - **第二轮（Orders 页）**：`orders` API（subscriptions+invoices 实时查，tier 由 price id 反查，lifetime 回退 metadata 快照，`private,no-store`）；`portal` API（Customer Portal 会话，origin 回跳，503 `portal_not_configured` 友好降级）；`account/orders` 页静态外壳 + `OrdersView` 客户端组件（会员卡片：档位/状态徽章/续费日/预约取消/逾期提示/管理订阅按钮；发票表 6 列 + PDF/hosted 链接；加载骨架/错误重试/无会员引导/空态全态）；middleware matcher 补两路由；`orders` 命名空间 38 key 双端镜像（`account` 下 3 个迁移 key 已清理）
    - **工具**：`create-stripe-products.mjs`（幂等建产品/价格、`sk_live_` 护栏、自动回填 .env.local）+ `smoke-stripe.mjs`（17 断言）；npm scripts `stripe:products`/`stripe:listen`/`smoke:stripe`
    - **沙盒联调现状**：产品/价格已建（月 $4.99 `prod_VLKPslKffR71ae` / 年 $39.99 `prod_VLKPIOO8GYPXEI` / 终身 $99.99 `prod_VLKPqdZNrp1bNn`，Price ID 已回填 .env.local）。**待用户 4 项**：① 真实 Clerk key（当前占位 `pk_test_ZmFrZS...` 无法真登录）② `npm run stripe:listen` 拿 `whsec_` 回填 ③ Dashboard Tax 沙盒注册（否则税额静默 0）④ Dashboard Customer Portal 激活（否则管理订阅降级提示）
    - **验证**：构建 141 页 0 警告；冒烟 17/17
    - **踩坑**：① editor 单次写入 >6000 字符失败——大文件需分段 `insert_line`（用当前 EOF 行号追加，不是预估行号）；② read_files 对中文长行视图失真——以 PowerShell `Get-Content -Encoding UTF8` 为准；③ `.next` 缓存损坏致 `uncaughtException …length` 早期崩溃——`Remove-Item -Recurse .next` 全量重建；④ 冒烟脚本 Node fetch 默认 `Accept: */*` 被 `auth.protect()` 判为非文档请求返回 404——断言浏览器 307 需显式带 `Accept: text/html`

## 新增 messages key（双语已同步）
- home: brandStory, brandStoryCta ｜ about: storyTitle, story1-4
- premium: singlePrice, btcEquivalent, priceNote, paymentTitle, paymentComingSoon, paymentCard
- membership: nftCardNote ｜ contributors: pointsChainNote ｜ web3: blockchainWip

## 当前进行中（对齐 progress.md 五阶段规划）
- **路线**：先 A 展示版上线 → 后 B 商业版（用户 2026-09-27 确认）
- **阶段④·部署（展示版部分）**：代码侧 ✅ 完成（site.ts 环境变量化 / metadataBase / .env.example / git 仓库）；**待用户 3 步**：① 买域名 ② push 到 GitHub（仓库已建 https://github.com/bitflavor/bitflavor.git，`origin` 已配好；2026-09-27 尝试推送时当前网络无法直连 GitHub——需用户开代理后重试 `git push -u origin main`）③ Vercel 导入项目 + 配 `NEXT_PUBLIC_SITE_URL`（README「部署」节有步骤）
- **阶段①·内容完善**：菜谱填充 ✅（16 → 34 道 + 韩国）；待用户提供真实封面图素材 → 同名替换 `public/images/` 下 SVG 即可（34 菜谱图 + 11 国家图，JSON 无需改）
- **阶段②·支付系统**：**Stripe 主线 ✅ 代码完成**（checkout/webhook/会员回写/orders 页/portal/README 沙盒指南/冒烟 17/17）。剩余推进：① 用户完成沙盒 4 项配置（Clerk 真 key / whsec / Tax 注册 / Portal 激活）→ 4242 测试卡端到端实测 ② 生产切换（live 密钥 + `stripe:products` 重建 live Price ID + Dashboard 正式 webhook 端点，README「支付」节末有 checklist）→ ③ 虚拟币支付（PayPal/加密通道仍占位）→ ⑤ 区块链功能（长期）
- **遗留杂项**：项目文件夹实际位于 `d:\p2\hanbao-test`（计划改名 bitflavor 待执行）；git push 待用户网络可直连 GitHub
