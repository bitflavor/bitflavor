# Progress — 项目进度追踪

> 权威源：`projectbrief.md`。本文件为高频更新文件。
> 更新时间：2026-09-28（第二阶段·Stripe 支付主线完成；路线调整说明见第二阶段）

## 已完成功能 ✅
- [x] Next.js 项目初始化
- [x] TypeScript + Tailwind CSS 配置
- [x] next-intl 多语言框架搭建（中英文）
- [x] 路由结构：/[locale]/xxx
- [x] 首页（大洲入口卡片、热门菜谱推荐）
- [x] 大洲列表页（/[locale]/cuisines/[continent]）
- [x] 国家详情页（/[locale]/cuisines/[continent]/[country]）
- [x] 菜谱详情页（/[locale]/recipes/[slug]；完整结构：食材/做法/技巧/失败排查/文化故事 + PremiumLock + 收藏 + 相关推荐）
- [x] 菜谱 JSON 数据结构定义
- [x] 品牌故事模块（比特币买披萨典故）
- [x] 支付方式 UI 展示（PayPal/信用卡/BTC/ETH/USDT/USDC）
- [x] NFT 会员卡 UI 预留
- [x] 贡献者积分 UI 预留
- [x] 搜索功能（/search，菜名/国家/食材双语匹配）— 第一阶段提前完成
- [x] 收藏功能（LocalStorage，/favorites）— 第一阶段提前完成
- [x] 筛选功能（按类别：主食/汤品/甜点/小吃/饮品）— 第一阶段提前完成
- [x] 用户认证（Clerk：登录/注册/账户中心/路由保护）— 阶段 B 前置，2026-09-27
- [x] Stripe 支付集成（托管收银台：订阅/终身买断 + 自动税 + 发票；webhook 回写 Clerk metadata）— 第二阶段，2026-09-28
- [x] 付费内容服务端保护（SSG 外壳 + API 鉴权下发，HTML/JSON-LD 零泄露）— 第二阶段，2026-09-28
- [x] 订单记录页（/account/orders：会员状态卡片 Stripe 实时查询 + 发票列表 + Customer Portal）— 第二阶段，2026-09-28

## 待完成功能 📋

### 第一阶段：内容完善
- [x] 填充亚洲菜谱数据（中国10道、日本5道、韩国5道、泰国5道）— ✅ 2026-09-27 完成
  - 实际：新增 18 道双语菜谱（中+7/韩+5/日+3/泰+3），总数 16 → 34；同步新增韩国国家（taxonomy + messages + 占位图脚本）
  - 验证：构建 exit 0、121 静态页、0 MISSING_MESSAGE；冒烟 13/13 通过（韩国页/新菜谱锁定/搜索索引/sitemap/基线回归）
- [ ] 菜谱封面图上传与引用（用户提供真实图后替换 `public/images/` 下同名 SVG，共 34 菜谱图 + 11 国家图，JSON 无需改动）
- [x] ~~搜索功能实现~~（已提前完成，见上）
- [x] ~~收藏功能实现（LocalStorage）~~（已提前完成，见上）
- [x] ~~筛选功能（按类别）~~（已提前完成，见上）

### 第二阶段：支付系统
> 路线调整（2026-09-28）：原规划 PayPal/Creem，实际落地 **Stripe 全家桶**（Billing + Payments + Tax + Invoicing），覆盖会员订阅/终身买断全部收款需求；Connect（创作者分账）延后。单菜购买基础设施已就绪（payment 模式），SKU 暂缓。
- [x] Stripe 集成（checkout / webhook 幂等回写 / membership 库）— ✅ 2026-09-28
- [x] 付费内容解锁逻辑（`TODO(security)` 已消除：SSG 外壳 + `/api/recipes/[slug]/content` 服务端截断下发）— ✅ 2026-09-28
- [x] 订单记录页（/account/orders：会员卡片 + 发票 PDF + Customer Portal 管理订阅）— ✅ 2026-09-28
- [x] 支付成功页（/membership/success，回跳 + webhook 延迟提示）— ✅ 2026-09-28
- [x] 环境变量配置（.env.local 全部 Stripe 变量就位；.env.example 文档；`stripe:products` 幂等建价）— ✅ 2026-09-28
- [x] ~~结账页（/checkout）开发~~ — 改为 Stripe 托管收银台，无需自建
- [ ] 沙盒端到端实测（待用户 4 项配置：真实 Clerk key / `stripe:listen` 拿 whsec / Tax 沙盒注册 / Customer Portal 激活——README「支付」节有完整步骤；然后 4242 测试卡走全流程）
- [ ] 生产切换（live 密钥 + 重建 live Price ID + Dashboard 正式 webhook 端点）
- [ ] ~~注册 PayPal / Creem~~ — 延后，作为加密通道之外的备选收款方式

### 第三阶段：虚拟币支付
- [ ] 注册 NOWPayments / CoinPayments
- [ ] 虚拟币支付接口对接
- [ ] 实时汇率显示（CoinGecko API，`src/lib/exchangeRates.ts` 的 `TODO(api)`）
- [ ] 收款二维码生成
- [ ] 链上确认自动解锁内容

### 第四阶段：Vercel 部署
- [ ] 推代码到 GitHub（含 git init + 首次提交）
- [ ] 连接 Vercel
- [ ] 配置环境变量
- [ ] 绑定自定义域名（替换 sitemap/robots 的 `bitflavor.example.com`）
- [ ] 开启 Vercel Analytics

### 第五阶段：区块链功能（长期）
- [ ] NFT 会员卡铸造
- [ ] 贡献者积分上链
- [ ] 内容哈希上链
- [ ] DAO 投票功能

## 当前正在进行的任务
- 第二阶段 Stripe 主线代码已完成（2026-09-28）；等待用户完成沙盒 4 项配置后做端到端实测
- 第一阶段菜谱填充已完成（2026-09-27）；等待用户提供真实封面图素材

## 下一步任务
- 用户沙盒配置（Clerk 真 key / whsec / Tax 注册 / Portal 激活）→ 4242 测试卡端到端验证
- 上传真实封面图到 public/images/（同名替换 SVG 占位图即可）
- 生产切换 Stripe live 模式 → 第三阶段：虚拟币支付

## 验证基线
- `npm run build` → exit 0，141 页（139 静态 + 6 API ƒ），无 MISSING_MESSAGE
- `npm run smoke:stripe` → 17/17（页面可达 / 付费内容 HTML+JSON-LD 零泄露 / checkout·webhook·content·orders·portal API 门槛 / 受保护页 307）
- 冒烟测试关键路由：`/zh` `/en` `/zh/about` `/zh/recipes/peking-duck`（付费）`/zh/membership` `/zh/contributors` `/zh/search` `/zh/favorites` `/zh/contact` `/sitemap.xml` `/robots.txt`
- 付费菜谱样本：`peking-duck`（isPremium + featured）；免费对照样本：`kung-pao-chicken`

## 事实修正说明（2026-09-27 核对代码后）
1. 搜索 / 收藏（LocalStorage）/ 类别筛选已在代码中实现并通过验证（SearchClient、useFavorites、FilterableRecipeGrid），从第一阶段待办改为已完成
2. 菜谱详情页为完整结构（非仅基础结构）
3. 韩国不在当前 taxonomy（6 洲 × 10 国）中，新增韩国菜谱前需先扩展国家数据
