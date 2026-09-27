// 汇率模块：当前为硬编码的模拟汇率，仅用于 UI 演示
// TODO(api): 接入 CoinGecko API 获取实时价格
//   https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
//   建议在服务端（Route Handler 或 Server Component fetch）调用并缓存 60s+，
//   避免触发 CoinGecko 免费额度限流。

/** 模拟 BTC/USD 汇率（2024 年量级参考值） */
export const MOCK_BTC_USD_RATE = 67000;

/**
 * 单份菜谱解锁价格（USD）。
 * 菜谱数据暂无价格字段，先用平台统一单价；后期可迁移到菜谱 JSON 的 price 字段
 */
export const SINGLE_RECIPE_PRICE_USD = 1.99;

/**
 * 美元金额折算为 BTC 字符串，保留 6 位小数（如 0.000030）
 * TODO(api): 接实时汇率后，改为读取服务端缓存的汇率值
 */
export function usdToBtc(
  usd: number,
  btcUsdRate: number = MOCK_BTC_USD_RATE
): string {
  return (usd / btcUsdRate).toFixed(6);
}
