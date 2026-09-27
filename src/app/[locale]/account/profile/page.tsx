import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

// UserProfile 为客户端组件（Clerk 托管 UI）；登录拦截由中间件统一负责
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("profileMetaTitle"),
    robots: { index: false, follow: false },
  };
}

// 个人资料页：Clerk 托管 UI（头像/姓名/邮箱/密码/社交绑定/安全设置/删除账户）
export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-14">
      <UserProfile />
    </div>
  );
}
