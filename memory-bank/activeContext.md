# Active Context — 当前工作状态

> 更新时间：2026-09-27（新增协作约定）
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
1. **品牌 + Web3 预留六需求**（已完成）：品牌故事（Hero tagline + about 比特币披萨 4 段卡）、PaymentMethods 六支付方式徽章、exchangeRates 模拟汇率（0.000030 BTC）、终身档 NFT 会员卡徽章、贡献者链上积分文案、全站改名 WorldFlavors（含 favorites 旧 key 迁移）
2. **memory bank 初始化**：projectbrief 按用户官方信息填写（愿景/核心功能 7 条/技术栈/目标用户），其余 5 文件据此自动对齐
3. **progress.md 重写为五阶段规划**（2026-09-27）：当前进入 **第一阶段·内容完善**；搜索/收藏/筛选经核对已提前完成（见 progress.md 文末事实修正说明）
4. **第一阶段·菜谱扩充完成**（2026-09-27）：新增 18 道双语菜谱（中+7 宫保鸡丁/四川火锅👑/糖醋里脊/酸辣汤/蛋炒饭/月饼👑/春卷；韩+5 石锅拌饭👑/泡菜煎饼/韩式炸鸡👑/大酱汤/辣炒年糕；日+3 天妇罗/味噌汤/铜锣烧；泰+3 绿咖喱鸡👑/芒果糯米饭/泰式奶茶），新增韩国国家（taxonomy + zh/en messages + 占位图脚本映射），总数 16→34（付费 10/34），featured 保持原 6 道不变

## 新增 messages key（双语已同步）
- home: brandStory, brandStoryCta ｜ about: storyTitle, story1-4
- premium: singlePrice, btcEquivalent, priceNote, paymentTitle, paymentComingSoon, paymentCard
- membership: nftCardNote ｜ contributors: pointsChainNote ｜ web3: blockchainWip

## 当前进行中（对齐 progress.md 五阶段规划）
- **阶段**：第一阶段·内容完善——菜谱填充 ✅ 已完成（2026-09-27，16 → 34 道 + 韩国）
- **待用户**：提供真实封面图素材 → 同名替换 `public/images/` 下 SVG 即可（34 菜谱图 + 11 国家图，JSON 无需改）
- 后续阶段（详见 progress.md）：② 支付系统（PayPal/Creem/Lemon Squeezy + /checkout + 订单页 + 服务端截断 `TODO(security)`）→ ③ 虚拟币支付（NOWPayments/CoinPayments + CoinGecko 汇率）→ ④ Vercel 部署 → ⑤ 区块链功能（长期）
