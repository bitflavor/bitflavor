import { clerkClient } from "@clerk/nextjs/server";
import type { MembershipTier } from "./stripe";

/**
 * 会员状态存储：Clerk publicMetadata.stripe 命名空间（零数据库方案）
 * - customerId：Stripe Customer id（cus_...）
 * - membership：消费者会员订阅状态（本期）
 * - processedSessions：webhook 幂等去重（保留最近 50 个 checkout.session.id，
 *   覆盖 Stripe 重试窗口；同一 session 重复投递时直接跳过）
 * - connect：TODO(connect) 未来 Connect 分账账户（类型预留，本期不写入）
 *
 * 性能说明：读侧经 clerkClient().users.getUser() 实时拉取（无需 Dashboard 配置）。
 * 若生产环境想省这次 API 调用，可在 Clerk Dashboard → Sessions 自定义 session token
 * 注入 public_metadata 后改从 auth().sessionClaims 读取。
 */

export interface MembershipRecord {
  tier: MembershipTier;
  /** Stripe subscription.status；lifetime 一次性支付固定为 "active" */
  status: string;
  stripeSubscriptionId?: string;
  /** ISO 8601；lifetime 无此字段 */
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
}

export interface StripePublicMetadata {
  customerId?: string;
  membership?: MembershipRecord;
  processedSessions?: string[];
  connect?: { accountId: string; payoutsEnabled: boolean };
}

/** 幂等标记保留上限（Stripe 对失败事件的重试集中在数小时内，50 条足够覆盖） */
const MAX_PROCESSED_SESSIONS = 50;

export async function getStripeMetadata(
  userId: string,
): Promise<StripePublicMetadata> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata?.stripe ?? {}) as StripePublicMetadata;
}

/** 会员是否有效（recipes/[slug] 服务端截断的判定依据） */
export function isMembershipActive(
  meta: StripePublicMetadata | null | undefined,
): boolean {
  const m = meta?.membership;
  if (!m) return false;
  if (m.status !== "active" && m.status !== "trialing") return false;
  // lifetime 无 currentPeriodEnd；订阅档校验计费周期未过期
  if (m.currentPeriodEnd && new Date(m.currentPeriodEnd).getTime() < Date.now()) {
    return false;
  }
  return true;
}

/** webhook 幂等：该 checkout.session 是否已处理过 */
export function isSessionProcessed(
  meta: StripePublicMetadata | null | undefined,
  sessionId: string,
): boolean {
  return meta?.processedSessions?.includes(sessionId) ?? false;
}

/**
 * 合并写回 publicMetadata.stripe。
 * 读取全量 → 本地合并 → 整体写回，保留 publicMetadata 下其他顶层 key；
 * processedSessionId 追加进幂等数组（截断至上限）。
 */
export async function updateStripeMetadata(
  userId: string,
  patch: Partial<StripePublicMetadata> & { processedSessionId?: string },
): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const current = (user.publicMetadata?.stripe ?? {}) as StripePublicMetadata;
  const { processedSessionId, ...rest } = patch;
  const next: StripePublicMetadata = {
    ...current,
    ...rest,
    processedSessions: processedSessionId
      ? [...(current.processedSessions ?? []), processedSessionId].slice(
          -MAX_PROCESSED_SESSIONS,
        )
      : current.processedSessions,
  };
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, stripe: next },
  });
}
