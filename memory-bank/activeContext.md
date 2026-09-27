# Active Context — 当前工作状态

> 更新时间：2026-09-27（阶段 B·Clerk 认证集成完成，137 页，冒烟 13/13）
> 权威源：`projectbrief.md`。功能编号（F1–F7）与其「核心功能」一一对应。

## 协作约定（用户设定，2026-09-27）
1. **每完成一个阶段的任务后，更新本文件**，记录当前进度（阶段状态 / 最近变更 / 下一步）。
2. **对话变长、出现"遗忘"或响应变慢时**：用 `/smol` 或 `/newtask` 清理上下文。新会话启动时先读本文件 + `progress.md` 恢复状态，再继续执行。

## 当前状态
**projectBrief 定义的 7 项核心功能已全部落地（F3/F4/F7 为 UI 级实现），验证通过。**
- 构建 exit 0，121 静态页（34 菜谱 × 2 语言 + 11 国家页 × 2 语言），0 MISSING_MESSAGE
- 冒烟 13/13 通过（韩国页/新菜谱锁定/搜索索引/sitemap/基线回归）
- memory bank 6 文件已初始化并按 projectBrief 对齐（本文件与 progress.md 为高频更新文件）

## 核心功能现状速览（F1–F7）
- F1 大洲/国家浏览、F2 菜谱详情、F5 多语言、F6 搜索筛选收藏：**完整实现**
- F3 付费锁定：视觉演示（`TODO(security)` 服务端截断）
- F4 会员订阅：UI 完整（`TODO(payment)`）
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

## 新增 messages key（双语已同步）
- home: brandStory, brandStoryCta ｜ about: storyTitle, story1-4
- premium: singlePrice, btcEquivalent, priceNote, paymentTitle, paymentComingSoon, paymentCard
- membership: nftCardNote ｜ contributors: pointsChainNote ｜ web3: blockchainWip

## 当前进行中（对齐 progress.md 五阶段规划）
- **路线**：先 A 展示版上线 → 后 B 商业版（用户 2026-09-27 确认）
- **阶段④·部署（展示版部分）**：代码侧 ✅ 完成（site.ts 环境变量化 / metadataBase / .env.example / git 仓库）；**待用户 3 步**：① 买域名 ② push 到 GitHub（仓库已建 https://github.com/bitflavor/bitflavor.git，`origin` 已配好；2026-09-27 尝试推送时当前网络无法直连 GitHub——需用户开代理后重试 `git push -u origin main`）③ Vercel 导入项目 + 配 `NEXT_PUBLIC_SITE_URL`（README「部署」节有步骤）
- **阶段①·内容完善**：菜谱填充 ✅（16 → 34 道 + 韩国）；待用户提供真实封面图素材 → 同名替换 `public/images/` 下 SVG 即可（34 菜谱图 + 11 国家图，JSON 无需改）
- **阶段②·支付系统（B 路线下一步）**：用户系统（认证+数据库，当前为零）→ 支付接入 → `TODO(security)` 服务端截断 → ③ 虚拟币支付 → ⑤ 区块链功能（长期）
