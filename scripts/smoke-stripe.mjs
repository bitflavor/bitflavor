#!/usr/bin/env node
/**
 * smoke-stripe.mjs —— Stripe 集成冒烟测试（阶段⑦）
 *
 * 前提：已执行 npm run build（.next 产物存在）
 * 用法：npm run smoke:stripe
 *
 * 检查项：
 *  1. 关键页面可达（membership / success / 免费菜谱 / 付费菜谱）
 *  2. 付费内容零泄露：未登录访问付费菜谱 → HTML 不含步骤文本、JSON-LD 无 recipeInstructions
 *  3. 免费菜谱完整：步骤文本 + recipeInstructions 均在
 *  4. API 安全门槛：checkout 未登录 401 / GET 405；webhook 无签名 400（或 secret 未配置 500）
 *
 * 说明：完整支付链路（Checkout → webhook → 会员开通）依赖真实 Clerk 登录态 +
 * Stripe CLI 转发的 whsec_，需人工 E2E（见 README「沙盒测试」）。
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const PORT = 3199;
const BASE = `http://127.0.0.1:${PORT}`;
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "✓" : "✗"} ${name}${detail ? ` —— ${detail}` : ""}`);
}

async function getText(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, text: await res.text() };
}

/** 等待生产服务器就绪（最长 40s） */
async function waitReady() {
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/zh`, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch {
      /* 尚未就绪 */
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function main() {
  // 从数据源动态取样（避免硬编码漂移）
  const pekingDuck = JSON.parse(
    readFileSync("src/data/recipes/asia/china/peking-duck.json", "utf8"),
  );
  const kungPao = JSON.parse(
    readFileSync("src/data/recipes/asia/china/kung-pao-chicken.json", "utf8"),
  );
  const premiumStep = pekingDuck.steps[0].zh.slice(0, 10); // 付费步骤片段
  const freeStep = kungPao.steps[0].zh.slice(0, 10); // 免费步骤片段

  console.log(`\n▶ 启动生产服务器（next start -p ${PORT}）…`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    shell: true,
    stdio: "ignore",
  });

  try {
    if (!(await waitReady())) {
      check("服务器就绪", false, "40s 超时");
      return summarize();
    }
    console.log("▶ 服务器就绪，开始检查\n");

    // ── 1. 页面可达性 ─────────────────────────────────────────
    const membership = await getText("/zh/membership");
    check("GET /zh/membership → 200", membership.status === 200, `status=${membership.status}`);

    const success = await getText("/zh/membership/success");
    check("GET /zh/membership/success → 200", success.status === 200, `status=${success.status}`);

    // ── 2. 付费内容零泄露（安全断言） ─────────────────────────
    const premium = await getText("/zh/recipes/peking-duck");
    check("GET /zh/recipes/peking-duck → 200", premium.status === 200, `status=${premium.status}`);
    check(
      "付费页 HTML 不含做法步骤文本",
      !premium.text.includes(premiumStep),
      premium.text.includes(premiumStep) ? `泄露片段: "${premiumStep}"` : `已截断（取样 "${premiumStep}…"）`,
    );
    check(
      "付费页 JSON-LD 无 recipeInstructions",
      !premium.text.includes('"recipeInstructions"'),
      "结构化数据已剔除步骤",
    );
    check(
      "付费页展示会员锁",
      premium.text.includes("此内容为会员专享"),
      "lockedTitle 文案存在",
    );

    // ── 3. 免费菜谱完整 ──────────────────────────────────────
    const free = await getText("/zh/recipes/kung-pao-chicken");
    check("GET /zh/recipes/kung-pao-chicken → 200", free.status === 200, `status=${free.status}`);
    check(
      "免费页含完整做法步骤",
      free.text.includes(freeStep),
      `取样 "${freeStep}…"`,
    );
    check(
      "免费页 JSON-LD 含 recipeInstructions",
      free.text.includes('"recipeInstructions"'),
      "",
    );

    // ── 4. API 安全门槛 ──────────────────────────────────────
    const getCheckout = await fetch(`${BASE}/api/stripe/checkout`);
    check("GET /api/stripe/checkout → 405", getCheckout.status === 405, `status=${getCheckout.status}`);

    const postCheckout = await fetch(`${BASE}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: "monthly", locale: "zh" }),
    });
    check("POST /api/stripe/checkout（未登录）→ 401", postCheckout.status === 401, `status=${postCheckout.status}`);

    const postWebhook = await fetch(`${BASE}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    // STRIPE_WEBHOOK_SECRET 未配置 → 500 not_configured；已配置 → 400 missing_signature
    check(
      "POST /api/stripe/webhook（无签名）→ 400/500",
      postWebhook.status === 400 || postWebhook.status === 500,
      `status=${postWebhook.status}（${postWebhook.status === 500 ? "secret 未配置" : "缺签名头"}）`,
    );

    // ── 5. 付费内容 API 门槛 ─────────────────────────────────
    const premiumApi = await fetch(`${BASE}/api/recipes/peking-duck/content`);
    check(
      "GET /api/recipes/peking-duck/content（未登录）→ 401",
      premiumApi.status === 401,
      `status=${premiumApi.status}`,
    );

    const freeApi = await fetch(`${BASE}/api/recipes/kung-pao-chicken/content`);
    check(
      "GET /api/recipes/kung-pao-chicken/content（免费菜谱）→ 400 not_premium",
      freeApi.status === 400,
      `status=${freeApi.status}`,
    );

    // ── 6. 订单 API + 受保护页面 ─────────────────────────────
    const ordersApi = await fetch(`${BASE}/api/stripe/orders`);
    check("GET /api/stripe/orders（未登录）→ 401", ordersApi.status === 401, `status=${ordersApi.status}`);

    const portalApi = await fetch(`${BASE}/api/stripe/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    check("POST /api/stripe/portal（未登录）→ 401", portalApi.status === 401, `status=${portalApi.status}`);

    // 受保护页面：middleware auth.protect() —— 文档请求（Accept: text/html）307 → 登录页；
    // 非文档请求（如 API 抓取）返回 404（Clerk protect 的既定行为，见 middleware.ts 注释）
    const accountPage = await fetch(`${BASE}/zh/account/orders`, {
      redirect: "manual",
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    check(
      "GET /zh/account/orders（未登录·浏览器语义）→ 307 重定向登录",
      accountPage.status === 307,
      `status=${accountPage.status}`,
    );
  } finally {
    // Windows：杀进程树（含 cmd 壳下的 next 子进程）
    spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  }

  summarize();
}

function summarize() {
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${"─".repeat(50)}`);
  console.log(
    failed.length === 0
      ? `✅ 冒烟通过（${results.length}/${results.length}）`
      : `❌ ${failed.length}/${results.length} 项失败`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("冒烟脚本异常：", err);
  process.exit(1);
});
