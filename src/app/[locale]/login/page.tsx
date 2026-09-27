import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginTitle"),
    description: t("loginDesc"),
    // 登录页不参与 SEO 收录
    robots: { index: false, follow: false },
  };
}

// 登录页：Clerk 托管 UI 组件（含邮箱/验证码、社交登录等，后台可配置）
export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-14">
      <SignIn />
    </div>
  );
}
