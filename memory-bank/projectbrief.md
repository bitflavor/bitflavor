# Project Brief — WorldFlavors（世界美食图谱）

## 项目名称
**WorldFlavors（世界美食图谱）**（曾用名 WorldCuisine，已全部替换）

## 项目愿景
- 收集全世界的美食，**从亚洲开始**，逐步扩展到东南亚、欧美、南美、非洲
- 支持**中英文双语**，面向全球用户
- 品牌故事：**从比特币买披萨开始，到用虚拟币解锁全世界的美食**
  - 典故：2010-05-22 Laszlo Hanyecz 用 10,000 BTC 购买两个披萨（比特币披萨日），人类历史上首次用虚拟货币购买商品；本站延续这一精神
  - Slogan（中）：从比特币买披萨开始，到用虚拟币解锁全世界的美食
  - Slogan（英）：From buying pizza with Bitcoin to unlocking the world's flavors with crypto

## 核心功能
1. **按大洲/国家浏览菜谱**（6 大洲 × 10 国家，「大洲 → 国家 → 菜谱」三级结构）
2. **菜谱详情页**（食材、做法、技巧、失败排查、文化故事）
3. **付费内容锁定与解锁**（Premium 菜谱会员专享，PremiumLock 视觉锁定）
4. **会员订阅系统**（月度 / 年度 / 终身三档）
5. **多语言切换**（中 / 英文，URL 前缀路由 + 浏览器语言自动重定向）
6. **搜索与筛选功能**（关键词搜索 + 按类别筛选；LocalStorage 收藏）
7. **区块链预留接口**（NFT 会员卡、贡献者链上积分、内容上链确权、DAO 治理）

## 技术栈
- **Next.js App Router + TypeScript**（Next.js 15 + React 19，全站 SSG）
- **Tailwind CSS**（v4，CSS-first 配置，`brand-*` / `ink-*` 主题色）
- **next-intl**（多语言，v3.26，文案集中 `messages/{zh,en}.json`）
- **本地 JSON/Markdown 数据**（当前为本地 JSON：`src/data/recipes/<continent>/<country>/<slug>.json`；Markdown 为后续内容形态扩展预留）
- **Vercel 部署**（目标平台，尚未部署；sitemap/robots 占位域名 `worldflavors.example.com` 需替换）
- **PayPal + 虚拟币支付（预留）**（UI 已展示 PayPal / 信用卡 / Bitcoin / Ethereum / USDT / USDC，未接真实接口）

## 目标用户
- 对全球美食感兴趣的中英文用户
- 愿意为高质量菜谱付费的美食爱好者
- 加密货币持有者（未来支持虚拟币支付）

## 范围约束（当前实现边界）
- 数据为本地 JSON，无数据库、无用户系统
- 所有区块链 / 支付 / 汇率功能**仅 UI 预留**，不接真实接口（接入点以 `TODO(web3)` / `TODO(payment)` / `TODO(api)` / `TODO(backend)` 标注）
- 付费锁定是视觉演示，被锁内容仍在 HTML 中（`TODO(security)`，接支付后需服务端截断）

## 成功标准
- `npm run build` exit 0，83+ 静态页面（zh/en 双语 SSG），无 MISSING_MESSAGE 报错
- 全站 i18n 文案集中在 `messages/{zh,en}.json`，新增 key 双语同步
