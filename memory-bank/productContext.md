# Product Context — 产品与用户体验

> 权威源：`projectbrief.md`。功能编号（F1–F7）与 projectBrief「核心功能」一一对应。

## 为什么做（愿景 → 产品化）
- 愿景：收集全世界的美食，**从亚洲开始**，逐步扩展到东南亚、欧美、南美、非洲 → 产品按「大洲 → 国家 → 菜谱」三级组织内容，当前已覆盖 6 大洲 × 10 国家 × 16 菜谱
- 愿景：中英文双语面向全球用户 → 全站 zh/en 双语 SSG，URL 前缀路由 + 浏览器语言自动重定向
- 愿景：从比特币买披萨开始，到用虚拟币解锁全世界的美食 → 品牌叙事贯穿首屏、关于页、付费层；商业模型为会员订阅 + 未来虚拟币支付 + Web3 权益

## 目标用户 → 产品价值
| 目标用户（projectBrief） | 对应产品落点 |
| --- | --- |
| 对全球美食感兴趣的中英文用户 | 免费菜谱 + 文化故事 + 双语切换（F1/F2/F5/F6） |
| 愿意付费的美食爱好者 | Premium 菜谱、三档会员（F3/F4），锁定层显示单菜价格 ¥9.9/$1.99 |
| 加密货币持有者 | 付费层 BTC 等值（0.000030 BTC）、6 种支付方式徽章（含 BTC/ETH/USDT/USDC）、NFT 会员卡与链上积分预留（F7） |

## 核心功能 → 产品形态（F1–F7）
| # | 功能 | 页面 / 组件 | 现状 |
| --- | --- | --- | --- |
| F1 | 大洲/国家浏览 | `/` ContinentGrid、`/cuisines/[continent]`、`/cuisines/[continent]/[country]` | ✅ 完整 |
| F2 | 菜谱详情 | `/recipes/[slug]`（食材/步骤/技巧/失败排查/文化故事 + 相关推荐） | ✅ 完整 |
| F3 | 付费锁定/解锁 | PremiumLock（lock-blur + 价格 + BTC 等值 + PaymentMethods） | ✅ 视觉演示（`TODO(security)` 需服务端截断） |
| F4 | 会员订阅 | `/membership` 三档卡片（¥19月/¥139年/¥499终身） | ✅ UI 完整（`TODO(payment)` 未接支付） |
| F5 | 多语言切换 | middleware + LanguageSwitcher，文案集中 messages | ✅ 完整 |
| F6 | 搜索与筛选 | `/search` SearchClient（双语匹配）；国家页 FilterableRecipeGrid；`/favorites` 收藏 | ✅ 完整 |
| F7 | 区块链预留 | NftMembershipSection / ContributorPoints / ChainCertifyEntry / DaoEntry / WalletConnectButton + 终身档 NFT 徽章 | ✅ UI 预留（`TODO(web3)`） |

辅助页：`/about`（品牌故事 4 段橙色卡 + 使命/愿景/路线图/团队）、`/contact`（ContactForm 演示，biz@worldflavors.example.com / @WorldFlavors）

## 品牌叙事落点
- 首屏 Hero tagline：「从比特币买披萨开始，到用虚拟币解锁全世界的美食」→ 点击进 `/about`
- `/about`：2010-05-22 Laszlo 10,000 BTC 两个披萨 → 史上首次虚拟货币购物 → 本站延续此精神 → 从亚洲扩展到全球
- 付费层用「¥9.9 ≈ 0.000030 BTC」把虚拟币支付心智前置

## 关键产品决策
- **内容模型**：本地化文本统一 `{ zh, en }` 结构；`isPremium` 菜谱仅公开简介+食材；`featured` 进首页热门
- **展示名不重复存储**：大洲/国家/类别/难度展示名在 `messages/*.json`，组件动态取值
- **单菜价格**：统一常量 `SINGLE_RECIPE_PRICE_USD = 1.99`（菜谱 JSON 暂无价格字段）
- **汇率显示**：`usdToBtc()` 6 位小数，硬编码 `MOCK_BTC_USD_RATE = 67000`（`TODO(api)` CoinGecko）
