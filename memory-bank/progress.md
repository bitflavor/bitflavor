# Progress — 项目进度追踪

> 权威源：`projectbrief.md`。本文件为高频更新文件。
> 更新时间：2026-09-27（按五阶段规划重写；与代码实际状态核对后做了事实修正，见文末说明）

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
- [ ] 注册 PayPal 开发者账号
- [ ] 注册 Creem / Lemon Squeezy
- [ ] 结账页（/checkout）开发
- [ ] 支付成功页 / 取消页开发
- [ ] 订单记录页（/account/orders）
- [ ] 付费内容解锁逻辑实现（含服务端截断，`TODO(security)`）
- [ ] 环境变量配置（API 密钥）

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
- 第一阶段菜谱填充已完成（2026-09-27）；等待用户提供真实封面图素材

## 下一步任务
- 上传真实封面图到 public/images/（同名替换 SVG 占位图即可）
- 之后进入第二阶段：支付系统（PayPal/Creem + /checkout）

## 验证基线
- `npm run build` → exit 0，83 静态页，无 MISSING_MESSAGE
- 冒烟测试关键路由：`/zh` `/en` `/zh/about` `/zh/recipes/peking-duck`（付费）`/zh/membership` `/zh/contributors` `/zh/search` `/zh/favorites` `/zh/contact` `/sitemap.xml` `/robots.txt`
- 付费菜谱样本：`peking-duck`（isPremium + featured）

## 事实修正说明（2026-09-27 核对代码后）
1. 搜索 / 收藏（LocalStorage）/ 类别筛选已在代码中实现并通过验证（SearchClient、useFavorites、FilterableRecipeGrid），从第一阶段待办改为已完成
2. 菜谱详情页为完整结构（非仅基础结构）
3. 韩国不在当前 taxonomy（6 洲 × 10 国）中，新增韩国菜谱前需先扩展国家数据
