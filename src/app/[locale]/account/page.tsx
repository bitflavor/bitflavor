import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

// 本页调用 auth()/currentUser()（依赖请求头），Next 会自动将其标记为动态渲染；
// 登录拦截由中间件 auth.protect() 统一负责
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("accountTitle"),
    // 账户中心不参与 SEO 收录
    robots: { index: false, follow: false },
  };
}

// 账户中心首页：欢迎语 + 资料/订单/会员 快捷入口
export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  // 中间件已做登录保护，这里再兜底一次（防御纵深）。
  // 注意：auth() 必须在 notFound 校验之后调用，确保其只在真实请求时执行
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/login`);

  const t = await getTranslations({ locale, namespace: "account" });
  const user = await currentUser();
  const displayName =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "";

  const cards = [
    { href: "/account/profile", icon: "👤", title: t("profileTitle"), desc: t("profileDesc") },
    { href: "/account/orders", icon: "📦", title: t("ordersTitle"), desc: t("ordersDesc") },
    { href: "/membership", icon: "⭐", title: t("membershipTitle"), desc: t("membershipDesc") },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
        {t("welcome")}
        {displayName ? `，${displayName}` : ""}
      </h1>
      <p className="mt-3 text-ink-600">{t("welcomeDesc")}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-ink-100 p-6 transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="text-3xl" aria-hidden>{card.icon}</div>
            <h2 className="mt-3 text-lg font-bold text-ink-900">{card.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
